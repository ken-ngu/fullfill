"""
Replenishment service for 340B order generation and management.

This service handles the business logic for:
- Generating daily replenishment orders from dispensing records
- Calculating par levels and reorder quantities
- Verifying 340B contract coverage
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from src.models.dispensing_record import DispensingRecord
from src.models.contract_340b import Contract340B
from src.models.medication import Medication
from src.models.organization import Organization
from src.models.replenishment_order import OrderStatus
import logging
import uuid

logger = logging.getLogger(__name__)


class ReplenishmentService:
    """Service for generating and managing 340B replenishment orders."""

    def __init__(self, session: Session):
        self._session = session

    def generate_daily_order(
        self,
        organization_id: str,
        order_date: date
    ) -> dict:
        """
        Generate automatic replenishment order based on dispensing records.

        This is typically called by the scheduled job at 6am daily.

        Args:
            organization_id: The organization to generate order for
            order_date: The date to generate order for (typically today)

        Returns:
            Dictionary containing order data ready to be inserted
        """
        logger.info(f"Generating daily order for {organization_id} on {order_date}")

        # Get organization settings
        org = self._session.query(Organization).filter(
            Organization.id == organization_id
        ).first()

        if not org or not org.is_340b_eligible:
            logger.warning(f"Organization {organization_id} not found or not 340B eligible")
            return None

        # Get dispensing records from the last 7 days to calculate needs
        lookback_start = order_date - timedelta(days=7)
        lookback_end = order_date - timedelta(days=1)

        dispensing_records = (
            self._session.query(DispensingRecord)
            .filter(
                and_(
                    DispensingRecord.organization_id == organization_id,
                    DispensingRecord.is_340b_eligible == True,
                    DispensingRecord.dispensed_at >= lookback_start,
                    DispensingRecord.dispensed_at <= lookback_end
                )
            )
            .all()
        )

        logger.info(f"Found {len(dispensing_records)} dispensing records for lookback period")

        # Group by NDC and sum quantities
        ndc_quantities = {}
        for record in dispensing_records:
            ndc = record.ndc_code
            if ndc not in ndc_quantities:
                ndc_quantities[ndc] = {
                    "total_dispensed": 0,
                    "medication_id": record.medication_id,
                    "contract_340b_id": record.contract_340b_id,
                    "acquisition_cost": record.acquisition_cost,
                }
            ndc_quantities[ndc]["total_dispensed"] += record.quantity_dispensed

        # Calculate reorder quantities for each NDC
        line_items = []
        total_cost = 0.0
        total_savings = 0.0

        for ndc_code, data in ndc_quantities.items():
            # Calculate par level (simplified: use average daily usage)
            avg_daily_usage = data["total_dispensed"] / 7.0
            reorder_qty = self.calculate_par_levels(
                medication_id=data["medication_id"],
                org_id=organization_id,
                avg_daily_usage=avg_daily_usage
            )

            if reorder_qty <= 0:
                continue

            # Get medication details
            med = self._session.query(Medication).filter(
                Medication.id == data["medication_id"]
            ).first()

            medication_name = med.name if med else ndc_code

            # Verify 340B contract coverage
            is_covered = self.verify_340b_contract(ndc_code, organization_id)

            if not is_covered:
                logger.warning(f"NDC {ndc_code} not covered by 340B contract for {organization_id}")
                # Still include in order but flag for review
                medication_name = f"{medication_name} [NOT COVERED]"

            # Calculate costs (use acquisition cost if available)
            unit_cost = data.get("acquisition_cost") or 0.0
            total_item_cost = unit_cost * reorder_qty

            # Estimate 340B savings (typically 25-50% discount from WAC)
            estimated_wac_cost = unit_cost / 0.75  # Assume 25% discount
            item_savings = estimated_wac_cost - unit_cost

            total_cost += total_item_cost
            total_savings += item_savings * reorder_qty

            line_items.append({
                "ndc_code": ndc_code,
                "medication_name": medication_name,
                "quantity": reorder_qty,
                "unit_cost_usd": unit_cost,
                "total_cost_usd": total_item_cost,
                "contract_340b_id": data.get("contract_340b_id"),
                "dispensed_count": data["total_dispensed"],
                "notes": None,
            })

        # Get cutoff time from org settings (default 2pm)
        cutoff_hour = org.settings.get("order_cutoff_hour", 14) if org.settings else 14
        cutoff_time = datetime.combine(order_date, datetime.min.time().replace(hour=cutoff_hour))

        # Create order data
        order_id = f"order-{order_date.isoformat()}-{organization_id[:8]}-{uuid.uuid4().hex[:6]}"

        order_data = {
            "id": order_id,
            "organization_id": organization_id,
            "order_date": order_date,
            "status": OrderStatus.PENDING_REVIEW,
            "cutoff_time": cutoff_time,
            "line_items": line_items,
            "total_items": len(line_items),
            "estimated_cost_usd": total_cost,
            "estimated_340b_savings_usd": total_savings,
            "created_by": "system",
            "admin_notes": f"Auto-generated from {len(dispensing_records)} dispensing records",
            "modification_history": [],
        }

        logger.info(
            f"Generated order {order_id} with {len(line_items)} items, "
            f"estimated cost ${total_cost:.2f}, savings ${total_savings:.2f}"
        )

        return order_data

    def calculate_par_levels(
        self,
        medication_id: str,
        org_id: str,
        avg_daily_usage: float
    ) -> int:
        """
        Calculate recommended reorder quantity based on par levels.

        This uses a simple formula:
        - Par level = average daily usage * days_supply_target
        - Reorder quantity = par_level

        In a real implementation, this would consider:
        - Current inventory levels
        - Lead time from vendor
        - Safety stock requirements
        - Seasonal variations

        Args:
            medication_id: The medication to calculate par level for
            org_id: The organization
            avg_daily_usage: Average daily dispensing volume

        Returns:
            Recommended reorder quantity (integer)
        """
        # Default to 7 days supply
        days_supply_target = 7

        # Get org-specific settings if available
        org = self._session.query(Organization).filter(
            Organization.id == org_id
        ).first()

        if org and org.settings:
            days_supply_target = org.settings.get("par_level_days", 7)

        # Calculate par level
        par_level = avg_daily_usage * days_supply_target

        # Round up to nearest whole unit
        reorder_qty = int(par_level) + (1 if par_level % 1 > 0 else 0)

        logger.debug(
            f"Calculated par level for {medication_id}: "
            f"{avg_daily_usage:.2f} daily × {days_supply_target} days = {reorder_qty} units"
        )

        return reorder_qty

    def verify_340b_contract(self, ndc_code: str, org_id: str) -> bool:
        """
        Ensure medication is covered under active 340B contract.

        Args:
            ndc_code: The NDC code to verify
            org_id: The organization ID

        Returns:
            True if covered by an active contract, False otherwise
        """
        # Find active contracts for this organization
        contracts = (
            self._session.query(Contract340B)
            .filter(
                and_(
                    Contract340B.organization_id == org_id,
                    Contract340B.is_active == True,
                    # Check if contract is within date range
                    Contract340B.start_date <= date.today(),
                    (Contract340B.end_date == None) | (Contract340B.end_date >= date.today())
                )
            )
            .all()
        )

        # Check if NDC is covered by any active contract
        for contract in contracts:
            if ndc_code in contract.covered_medication_ndcs:
                logger.debug(f"NDC {ndc_code} covered by contract {contract.contract_number}")
                return True

        logger.warning(f"NDC {ndc_code} not covered by any active 340B contract for {org_id}")
        return False

    def get_organization_settings(self, organization_id: str) -> dict:
        """
        Get organization-specific replenishment settings.

        Returns settings like:
        - order_cutoff_hour: Hour of day (0-23) for vendor cutoff
        - par_level_days: Days of supply to maintain
        - auto_submit_enabled: Whether to auto-submit approved orders

        Args:
            organization_id: The organization ID

        Returns:
            Dictionary of settings
        """
        org = self._session.query(Organization).filter(
            Organization.id == organization_id
        ).first()

        if not org:
            return {}

        # Return settings with defaults
        return {
            "order_cutoff_hour": org.settings.get("order_cutoff_hour", 14) if org.settings else 14,
            "par_level_days": org.settings.get("par_level_days", 7) if org.settings else 7,
            "auto_submit_enabled": org.settings.get("auto_submit_enabled", True) if org.settings else True,
            "vendor_name": org.settings.get("vendor_name", "Cardinal Health") if org.settings else "Cardinal Health",
        }

    def send_order_notification(
        self,
        order_id: str,
        notification_type: str,
        recipient_emails: list[str]
    ) -> None:
        """
        Send email notification about an order.

        STUB IMPLEMENTATION - Just logs for now.

        In production, this would:
        - Use SendGrid/AWS SES to send email
        - Include order summary and link to dashboard
        - Support different notification types (created, approved, submitted, etc.)

        Args:
            order_id: The order ID
            notification_type: Type of notification ("created", "approved", "submitted", etc.)
            recipient_emails: List of email addresses to notify
        """
        logger.info(
            f"[EMAIL STUB] Would send {notification_type} notification for order {order_id} "
            f"to {', '.join(recipient_emails)}"
        )
        # TODO: Implement actual email sending in production
