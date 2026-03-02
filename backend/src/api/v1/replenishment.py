"""
340B Replenishment Order API endpoints.

These endpoints provide CRUD operations for managing replenishment orders
in the admin dashboard.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from src.dependencies import get_db, get_replenishment_repo, require_340b_role
from src.repositories.replenishment import AbstractReplenishmentRepository
from src.services.replenishment import ReplenishmentService
from src.schemas.replenishment import (
    ReplenishmentOrderSummary,
    ReplenishmentOrderDetail,
    OrderItemUpdates,
    OrderApproval,
    OrderCancellation,
    DashboardSummary,
    OrderStatus,
)
from src.models.replenishment_order import OrderStatus as ModelOrderStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/replenishment", tags=["340B Replenishment"])


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(
    organization_id: str = Query(..., description="Organization ID"),
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> DashboardSummary:
    """
    Get dashboard summary for 340B admin.

    Returns statistics and recent orders for the organization.
    """
    # Verify user has access to this organization
    if current_user["organization_id"] != organization_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this organization"
        )

    summary = repo.get_dashboard_summary(organization_id)
    return DashboardSummary(**summary)


@router.get("/orders", response_model=list[ReplenishmentOrderSummary])
def list_orders(
    organization_id: str = Query(..., description="Organization ID"),
    status: Optional[OrderStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of orders to return"),
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> list[ReplenishmentOrderSummary]:
    """
    List replenishment orders for an organization.

    Supports filtering by status and pagination.
    """
    # Verify user has access to this organization
    if current_user["organization_id"] != organization_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this organization"
        )

    if status:
        # Convert to model enum
        model_status = ModelOrderStatus[status.value]
        orders = repo.get_orders_by_status(organization_id, model_status, limit)
    else:
        # Get pending orders by default
        orders = repo.get_pending_orders(organization_id)

    return [ReplenishmentOrderSummary(**order) for order in orders]


@router.get("/orders/{order_id}", response_model=ReplenishmentOrderDetail)
def get_order(
    order_id: str = Path(..., description="Order ID"),
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> ReplenishmentOrderDetail:
    """
    Get detailed information about a specific order.

    Returns all line items and modification history.
    """
    order = repo.get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user has access to this organization
    if current_user["organization_id"] != order["organization_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this order"
        )

    return ReplenishmentOrderDetail(**order)


@router.patch("/orders/{order_id}/items", response_model=ReplenishmentOrderDetail)
def update_order_items(
    order_id: str = Path(..., description="Order ID"),
    updates: OrderItemUpdates = ...,
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> ReplenishmentOrderDetail:
    """
    Update line items in an order.

    Admin can modify quantities, add notes, or remove items (by setting quantity to 0).
    Only orders in PENDING_REVIEW or DRAFT status can be modified.
    """
    # Get order to verify access and status
    order = repo.get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user has access to this organization
    if current_user["organization_id"] != order["organization_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this order"
        )

    # Verify order is in modifiable state
    order_status = order["status"]
    if order_status not in [ModelOrderStatus.PENDING_REVIEW, ModelOrderStatus.DRAFT]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot modify order in {order_status.value} status"
        )

    # Build updated line items list
    current_items = {item["ndc_code"]: item for item in order["line_items"]}
    updated_items = []

    for update in updates.items:
        if update.quantity > 0:
            # Update existing item or add new one
            if update.ndc_code in current_items:
                item = current_items[update.ndc_code].copy()
                item["quantity"] = update.quantity
                if update.notes:
                    item["notes"] = update.notes
                # Recalculate total cost
                if item.get("unit_cost_usd"):
                    item["total_cost_usd"] = item["unit_cost_usd"] * update.quantity
            else:
                # New item - basic info only
                item = {
                    "ndc_code": update.ndc_code,
                    "medication_name": f"NDC {update.ndc_code}",  # Would need to look up in prod
                    "quantity": update.quantity,
                    "notes": update.notes,
                }
            updated_items.append(item)
        # else: quantity is 0, so remove the item (don't add to updated_items)

    # Update order
    updated_order = repo.update_order_line_items(
        order_id=order_id,
        line_items=updated_items,
        user_id=current_user["user_id"],
        admin_notes=updates.admin_notes
    )

    if not updated_order:
        raise HTTPException(status_code=500, detail="Failed to update order")

    logger.info(
        f"Order {order_id} updated by user {current_user['user_id']}: "
        f"{len(updated_items)} items"
    )

    return ReplenishmentOrderDetail(**updated_order)


@router.post("/orders/{order_id}/approve", response_model=ReplenishmentOrderDetail)
def approve_order(
    order_id: str = Path(..., description="Order ID"),
    approval: OrderApproval = ...,
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> ReplenishmentOrderDetail:
    """
    Approve an order for submission.

    Changes status to APPROVED and marks it ready for auto-submission at cutoff time.
    Only hospital_admin or pharmacy_staff can approve orders.
    """
    # Get order to verify access and status
    order = repo.get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user has access to this organization
    if current_user["organization_id"] != order["organization_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this order"
        )

    # Verify order is in approvable state
    order_status = order["status"]
    if order_status != ModelOrderStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot approve order in {order_status.value} status"
        )

    # Approve the order
    approved_order = repo.approve_order(
        order_id=order_id,
        user_id=current_user["user_id"],
        admin_notes=approval.admin_notes
    )

    if not approved_order:
        raise HTTPException(status_code=500, detail="Failed to approve order")

    logger.info(f"Order {order_id} approved by user {current_user['user_id']}")

    return ReplenishmentOrderDetail(**approved_order)


@router.post("/orders/{order_id}/cancel", response_model=ReplenishmentOrderDetail)
def cancel_order(
    order_id: str = Path(..., description="Order ID"),
    cancellation: OrderCancellation = ...,
    current_user: dict = Depends(require_340b_role),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> ReplenishmentOrderDetail:
    """
    Cancel an order.

    Orders can be cancelled at any time before submission is complete.
    Requires a reason for audit purposes.
    """
    # Get order to verify access
    order = repo.get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify user has access to this organization
    if current_user["organization_id"] != order["organization_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this order"
        )

    # Verify order is not already cancelled or submitted
    order_status = order["status"]
    if order_status == ModelOrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Order is already cancelled")
    if order_status == ModelOrderStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel order that has already been submitted"
        )

    # Cancel the order
    cancelled_order = repo.cancel_order(order_id=order_id, reason=cancellation.reason)

    if not cancelled_order:
        raise HTTPException(status_code=500, detail="Failed to cancel order")

    logger.info(
        f"Order {order_id} cancelled by user {current_user['user_id']}: "
        f"{cancellation.reason}"
    )

    return ReplenishmentOrderDetail(**cancelled_order)


@router.post("/orders/generate", response_model=ReplenishmentOrderDetail)
def generate_order_manual(
    organization_id: str = Query(..., description="Organization ID"),
    order_date: date = Query(..., description="Date to generate order for"),
    current_user: dict = Depends(require_340b_role),
    db: Session = Depends(get_db),
    repo: AbstractReplenishmentRepository = Depends(get_replenishment_repo),
) -> ReplenishmentOrderDetail:
    """
    Manually trigger order generation for a specific date.

    This is typically done automatically by the scheduled job, but admins
    can manually generate orders if needed (e.g., if the job failed).
    """
    # Verify user has access to this organization
    if current_user["organization_id"] != organization_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this organization"
        )

    # Only hospital_admin can manually generate orders
    if current_user["role"] != "hospital_admin":
        raise HTTPException(
            status_code=403,
            detail="Only hospital admins can manually generate orders"
        )

    logger.info(
        f"Manually generating order for {organization_id} on {order_date} "
        f"by user {current_user['user_id']}"
    )

    # Generate order
    service = ReplenishmentService(db)
    order_data = service.generate_daily_order(organization_id, order_date)

    if not order_data:
        raise HTTPException(
            status_code=400,
            detail="Failed to generate order. Check if there are dispensing records."
        )

    # Save to database
    order = repo.create_order(order_data)

    logger.info(f"Manually created order {order['id']} with {order['total_items']} items")

    return ReplenishmentOrderDetail(**order)
