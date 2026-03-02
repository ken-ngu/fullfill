"""
Auto-submit orders that have passed their cutoff time.

This job runs every 15 minutes to check if any approved orders have passed
their vendor cutoff time and automatically submit them.

SETUP INSTRUCTIONS:
--------------------
To integrate with APScheduler:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.jobs.auto_submit_orders import run_auto_submit

scheduler = AsyncIOScheduler()
scheduler.add_job(
    run_auto_submit,
    'interval',
    minutes=15,
    id='auto_submit_orders'
)
scheduler.start()
```

With Celery:

```python
@celery_app.task
def auto_submit_orders():
    run_auto_submit()

celery_app.conf.beat_schedule = {
    'auto-submit-orders': {
        'task': 'tasks.auto_submit_orders',
        'schedule': 900.0,  # 15 minutes in seconds
    },
}
```
"""

from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.config import settings
from src.services.replenishment import ReplenishmentService
from src.repositories.replenishment import PostgresReplenishmentRepository
from src.models.organization import Organization
import logging

logger = logging.getLogger(__name__)

# Create engine and session factory for job
_engine = create_engine(settings.database_url)
_SessionLocal = sessionmaker(bind=_engine)


def run_auto_submit() -> dict:
    """
    Check for approved orders past cutoff time and auto-submit them.

    This is the main entry point called by the scheduler.

    Returns:
        Dictionary with summary of job execution
    """
    logger.info("Starting auto-submit orders job")

    session = _SessionLocal()
    results = {
        "submitted": [],
        "failed": [],
    }

    try:
        replenishment_repo = PostgresReplenishmentRepository(session)
        replenishment_service = ReplenishmentService(session)

        # Get all approved orders that have passed cutoff time
        orders = replenishment_repo.get_orders_past_cutoff()

        logger.info(f"Found {len(orders)} orders past cutoff time")

        for order in orders:
            try:
                # Check if organization has auto-submit enabled
                org_settings = replenishment_service.get_organization_settings(
                    order["organization_id"]
                )

                if not org_settings.get("auto_submit_enabled", True):
                    logger.info(
                        f"Skipping auto-submit for order {order['id']} - "
                        f"auto-submit disabled for org {order['organization_id']}"
                    )
                    continue

                logger.info(
                    f"Auto-submitting order {order['id']} for org {order['organization_id']}"
                )

                # Submit the order
                submitted_order = replenishment_repo.submit_order(order["id"])

                if submitted_order:
                    logger.info(f"Successfully submitted order {order['id']}")

                    results["submitted"].append({
                        "order_id": order["id"],
                        "organization_id": order["organization_id"],
                        "total_items": order["total_items"],
                        "estimated_cost_usd": order.get("estimated_cost_usd"),
                    })

                    # Send confirmation email (stub)
                    org = session.query(Organization).filter(
                        Organization.id == order["organization_id"]
                    ).first()

                    if org and org.primary_contact_email:
                        replenishment_service.send_order_notification(
                            order_id=order["id"],
                            notification_type="submitted",
                            recipient_emails=[org.primary_contact_email]
                        )
                else:
                    logger.error(f"Failed to submit order {order['id']} - order not found")
                    results["failed"].append({
                        "order_id": order["id"],
                        "error": "Order not found"
                    })

            except Exception as e:
                logger.error(f"Failed to submit order {order['id']}: {e}", exc_info=True)
                results["failed"].append({
                    "order_id": order["id"],
                    "error": str(e)
                })

        logger.info(
            f"Auto-submit complete. "
            f"Submitted: {len(results['submitted'])}, "
            f"Failed: {len(results['failed'])}"
        )

    finally:
        session.close()

    return results


if __name__ == "__main__":
    # Allow running manually for testing
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s"
    )
    results = run_auto_submit()
    print(f"\nJob Results:")
    print(f"Submitted: {len(results['submitted'])}")
    print(f"Failed: {len(results['failed'])}")
