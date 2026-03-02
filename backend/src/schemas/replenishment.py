"""
Pydantic schemas for 340B replenishment orders.

These schemas define the API request/response models for the admin dashboard.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class OrderStatus(str, Enum):
    """Status values for replenishment orders."""
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    SUBMITTED = "SUBMITTED"
    CANCELLED = "CANCELLED"


class ReplenishmentOrderLineItem(BaseModel):
    """Individual line item in a replenishment order."""
    ndc_code: str
    medication_name: str
    quantity: int
    unit_cost_usd: Optional[float] = None
    total_cost_usd: Optional[float] = None
    contract_340b_id: Optional[str] = None
    dispensed_count: int = 0  # How many were dispensed (for tracking)
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "ndc_code": "00054-0101-30",
                "medication_name": "Humira 40mg/0.8mL Pen",
                "quantity": 12,
                "unit_cost_usd": 1250.00,
                "total_cost_usd": 15000.00,
                "contract_340b_id": "contract-cardinal-001",
                "dispensed_count": 10,
                "notes": "Increase from usual par level due to high demand"
            }
        }


class ReplenishmentOrderSummary(BaseModel):
    """Summary view of a replenishment order for list display."""
    id: str
    organization_id: str
    order_date: date
    status: OrderStatus
    total_items: int
    estimated_cost_usd: Optional[float] = None
    estimated_340b_savings_usd: Optional[float] = None
    cutoff_time: Optional[datetime] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "order-2026-03-01-001",
                "organization_id": "childrens-hospital-seattle",
                "order_date": "2026-03-01",
                "status": "PENDING_REVIEW",
                "total_items": 45,
                "estimated_cost_usd": 125000.00,
                "estimated_340b_savings_usd": 35000.00,
                "cutoff_time": "2026-03-01T14:00:00",
                "created_at": "2026-03-01T06:00:00",
                "reviewed_at": None,
                "submitted_at": None
            }
        }


class ReplenishmentOrderDetail(ReplenishmentOrderSummary):
    """Detailed view of a replenishment order with all line items."""
    line_items: list[ReplenishmentOrderLineItem]
    admin_notes: Optional[str] = None
    modification_history: list[dict] = []
    created_by: Optional[str] = None
    reviewed_by: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "order-2026-03-01-001",
                "organization_id": "childrens-hospital-seattle",
                "order_date": "2026-03-01",
                "status": "PENDING_REVIEW",
                "total_items": 2,
                "estimated_cost_usd": 16250.00,
                "estimated_340b_savings_usd": 4500.00,
                "cutoff_time": "2026-03-01T14:00:00",
                "created_at": "2026-03-01T06:00:00",
                "reviewed_at": None,
                "submitted_at": None,
                "line_items": [
                    {
                        "ndc_code": "00054-0101-30",
                        "medication_name": "Humira 40mg/0.8mL Pen",
                        "quantity": 12,
                        "unit_cost_usd": 1250.00,
                        "total_cost_usd": 15000.00,
                        "contract_340b_id": "contract-cardinal-001",
                        "dispensed_count": 10,
                        "notes": None
                    }
                ],
                "admin_notes": "Reviewed and approved for submission",
                "modification_history": [],
                "created_by": "system",
                "reviewed_by": None
            }
        }


class OrderItemUpdate(BaseModel):
    """Update for a single line item in an order."""
    ndc_code: str
    quantity: int = Field(..., ge=0, description="Quantity to order (0 to remove item)")
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "ndc_code": "00054-0101-30",
                "quantity": 15,
                "notes": "Increased due to expected surge in demand"
            }
        }


class OrderItemUpdates(BaseModel):
    """Batch update for multiple line items."""
    items: list[OrderItemUpdate]
    admin_notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "ndc_code": "00054-0101-30",
                        "quantity": 15,
                        "notes": "Increased quantity"
                    },
                    {
                        "ndc_code": "00074-3799-02",
                        "quantity": 0,
                        "notes": "Remove - overstocked"
                    }
                ],
                "admin_notes": "Adjusted quantities based on current inventory levels"
            }
        }


class OrderApproval(BaseModel):
    """Request to approve an order for submission."""
    admin_notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "admin_notes": "All quantities verified against inventory. Approved for 2pm submission."
            }
        }


class OrderCancellation(BaseModel):
    """Request to cancel an order."""
    reason: str = Field(..., min_length=10, description="Reason for cancellation")

    class Config:
        json_schema_extra = {
            "example": {
                "reason": "Vendor portal is down. Will resubmit tomorrow."
            }
        }


class DashboardSummary(BaseModel):
    """Summary statistics for the 340B admin dashboard."""
    pending_review_count: int
    approved_count: int
    submitted_today_count: int
    total_estimated_cost_usd: float
    total_estimated_savings_usd: float
    next_cutoff_time: Optional[datetime] = None
    recent_orders: list[ReplenishmentOrderSummary] = []

    class Config:
        json_schema_extra = {
            "example": {
                "pending_review_count": 3,
                "approved_count": 1,
                "submitted_today_count": 2,
                "total_estimated_cost_usd": 250000.00,
                "total_estimated_savings_usd": 75000.00,
                "next_cutoff_time": "2026-03-01T14:00:00",
                "recent_orders": []
            }
        }
