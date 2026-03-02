"""
Repository for replenishment order data access.

Handles CRUD operations for 340B replenishment orders.
"""
from typing import Optional

from abc import ABC, abstractmethod
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from src.models.replenishment_order import ReplenishmentOrder, OrderStatus
import logging

logger = logging.getLogger(__name__)


class AbstractReplenishmentRepository(ABC):
    """Abstract base class for replenishment order repository."""

    @abstractmethod
    def get_pending_orders(self, organization_id: str) -> list[dict]:
        """Get orders awaiting review for an organization."""
        pass

    @abstractmethod
    def get_orders_by_status(
        self,
        organization_id: str,
        status: OrderStatus,
        limit: int = 50
    ) -> list[dict]:
        """Get orders by status for an organization."""
        pass

    @abstractmethod
    def get_order_by_id(self, order_id: str) -> Optional[dict]:
        """Get single order with all details including line items."""
        pass

    @abstractmethod
    def create_order(self, order_data: dict) -> dict:
        """Create a new replenishment order."""
        pass

    @abstractmethod
    def update_order_line_items(
        self,
        order_id: str,
        line_items: list[dict],
        user_id: str,
        admin_notes: Optional[str] = None
    ) -> Optional[dict]:
        """Update line items for an order."""
        pass

    @abstractmethod
    def approve_order(self, order_id: str, user_id: str, admin_notes: Optional[str] = None) -> Optional[dict]:
        """Approve an order for submission."""
        pass

    @abstractmethod
    def submit_order(self, order_id: str) -> Optional[dict]:
        """Mark an order as submitted to vendor."""
        pass

    @abstractmethod
    def cancel_order(self, order_id: str, reason: str) -> Optional[dict]:
        """Cancel an order."""
        pass

    @abstractmethod
    def get_orders_past_cutoff(self) -> list[dict]:
        """Get approved orders that have passed their cutoff time."""
        pass

    @abstractmethod
    def get_dashboard_summary(self, organization_id: str) -> dict:
        """Get dashboard summary statistics for an organization."""
        pass


def _to_dict(order: ReplenishmentOrder) -> dict:
    """Convert ReplenishmentOrder model to dictionary."""
    return {c.name: getattr(order, c.name) for c in order.__table__.columns}


class PostgresReplenishmentRepository(AbstractReplenishmentRepository):
    """PostgreSQL implementation of replenishment repository."""

    def __init__(self, session: Session):
        self._session = session

    def get_pending_orders(self, organization_id: str) -> list[dict]:
        """Get orders awaiting review for an organization."""
        orders = (
            self._session.query(ReplenishmentOrder)
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status == OrderStatus.PENDING_REVIEW
                )
            )
            .order_by(ReplenishmentOrder.order_date.desc())
            .all()
        )
        return [_to_dict(o) for o in orders]

    def get_orders_by_status(
        self,
        organization_id: str,
        status: OrderStatus,
        limit: int = 50
    ) -> list[dict]:
        """Get orders by status for an organization."""
        orders = (
            self._session.query(ReplenishmentOrder)
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status == status
                )
            )
            .order_by(ReplenishmentOrder.order_date.desc())
            .limit(limit)
            .all()
        )
        return [_to_dict(o) for o in orders]

    def get_order_by_id(self, order_id: str) -> Optional[dict]:
        """Get single order with all details including line items."""
        order = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.id == order_id)
            .first()
        )
        return _to_dict(order) if order else None

    def create_order(self, order_data: dict) -> dict:
        """Create a new replenishment order."""
        order = ReplenishmentOrder(**order_data)
        self._session.add(order)
        self._session.commit()
        self._session.refresh(order)
        logger.info(f"Created order {order.id} for {order.organization_id}")
        return _to_dict(order)

    def update_order_line_items(
        self,
        order_id: str,
        line_items: list[dict],
        user_id: str,
        admin_notes: Optional[str] = None
    ) -> Optional[dict]:
        """
        Update line items for an order.

        This tracks the modification history and recalculates totals.
        """
        order = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        # Track modification in history
        modification = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": "line_items_updated",
            "previous_total_items": order.total_items,
            "new_total_items": len(line_items),
        }

        # Update line items
        order.line_items = line_items
        order.total_items = len(line_items)

        # Recalculate estimated cost
        total_cost = sum(item.get("total_cost_usd", 0) for item in line_items)
        order.estimated_cost_usd = total_cost

        # Update admin notes if provided
        if admin_notes:
            order.admin_notes = admin_notes

        # Append to modification history
        if order.modification_history is None:
            order.modification_history = []
        order.modification_history.append(modification)

        self._session.commit()
        self._session.refresh(order)
        logger.info(f"Updated line items for order {order_id} by user {user_id}")
        return _to_dict(order)

    def approve_order(self, order_id: str, user_id: str, admin_notes: Optional[str] = None) -> Optional[dict]:
        """Approve an order for submission."""
        order = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        # Update status
        order.status = OrderStatus.APPROVED
        order.reviewed_at = datetime.utcnow()
        order.reviewed_by = user_id

        if admin_notes:
            order.admin_notes = admin_notes

        # Track in modification history
        modification = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": "approved",
            "notes": admin_notes,
        }

        if order.modification_history is None:
            order.modification_history = []
        order.modification_history.append(modification)

        self._session.commit()
        self._session.refresh(order)
        logger.info(f"Approved order {order_id} by user {user_id}")
        return _to_dict(order)

    def submit_order(self, order_id: str) -> Optional[dict]:
        """Mark an order as submitted to vendor."""
        order = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        order.status = OrderStatus.SUBMITTED
        order.submitted_at = datetime.utcnow()

        # Track in modification history
        modification = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": "submitted",
        }

        if order.modification_history is None:
            order.modification_history = []
        order.modification_history.append(modification)

        self._session.commit()
        self._session.refresh(order)
        logger.info(f"Submitted order {order_id}")
        return _to_dict(order)

    def cancel_order(self, order_id: str, reason: str) -> Optional[dict]:
        """Cancel an order."""
        order = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        order.status = OrderStatus.CANCELLED

        # Track in modification history
        modification = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": "cancelled",
            "reason": reason,
        }

        if order.modification_history is None:
            order.modification_history = []
        order.modification_history.append(modification)

        self._session.commit()
        self._session.refresh(order)
        logger.info(f"Cancelled order {order_id}: {reason}")
        return _to_dict(order)

    def get_orders_past_cutoff(self) -> list[dict]:
        """
        Get approved orders that have passed their cutoff time.

        Used by the auto-submit scheduled job.
        """
        now = datetime.utcnow()
        orders = (
            self._session.query(ReplenishmentOrder)
            .filter(
                and_(
                    ReplenishmentOrder.status == OrderStatus.APPROVED,
                    ReplenishmentOrder.cutoff_time <= now
                )
            )
            .all()
        )
        return [_to_dict(o) for o in orders]

    def get_dashboard_summary(self, organization_id: str) -> dict:
        """Get dashboard summary statistics for an organization."""
        from sqlalchemy import func

        # Count orders by status for today
        today = date.today()

        pending_count = (
            self._session.query(func.count(ReplenishmentOrder.id))
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status == OrderStatus.PENDING_REVIEW,
                    ReplenishmentOrder.order_date == today
                )
            )
            .scalar() or 0
        )

        approved_count = (
            self._session.query(func.count(ReplenishmentOrder.id))
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status == OrderStatus.APPROVED,
                    ReplenishmentOrder.order_date == today
                )
            )
            .scalar() or 0
        )

        submitted_count = (
            self._session.query(func.count(ReplenishmentOrder.id))
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status == OrderStatus.SUBMITTED,
                    ReplenishmentOrder.order_date == today
                )
            )
            .scalar() or 0
        )

        # Sum estimated costs and savings for today's orders
        cost_result = (
            self._session.query(
                func.sum(ReplenishmentOrder.estimated_cost_usd),
                func.sum(ReplenishmentOrder.estimated_340b_savings_usd)
            )
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.order_date == today,
                    ReplenishmentOrder.status != OrderStatus.CANCELLED
                )
            )
            .first()
        )

        total_cost = cost_result[0] or 0.0
        total_savings = cost_result[1] or 0.0

        # Get next cutoff time (from pending or approved orders)
        next_order = (
            self._session.query(ReplenishmentOrder)
            .filter(
                and_(
                    ReplenishmentOrder.organization_id == organization_id,
                    ReplenishmentOrder.status.in_([OrderStatus.PENDING_REVIEW, OrderStatus.APPROVED]),
                    ReplenishmentOrder.cutoff_time > datetime.utcnow()
                )
            )
            .order_by(ReplenishmentOrder.cutoff_time.asc())
            .first()
        )

        next_cutoff = next_order.cutoff_time if next_order else None

        # Get recent orders (last 5)
        recent_orders = (
            self._session.query(ReplenishmentOrder)
            .filter(ReplenishmentOrder.organization_id == organization_id)
            .order_by(ReplenishmentOrder.created_at.desc())
            .limit(5)
            .all()
        )

        return {
            "pending_review_count": pending_count,
            "approved_count": approved_count,
            "submitted_today_count": submitted_count,
            "total_estimated_cost_usd": total_cost,
            "total_estimated_savings_usd": total_savings,
            "next_cutoff_time": next_cutoff,
            "recent_orders": [_to_dict(o) for o in recent_orders],
        }
