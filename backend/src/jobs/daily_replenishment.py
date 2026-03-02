"""
Daily replenishment order generation job.

This job runs daily at 6am to generate replenishment orders for all
340B-eligible organizations.

SETUP INSTRUCTIONS:
--------------------
To integrate with APScheduler, add to your FastAPI app:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.jobs.daily_replenishment import run_daily_order_generation

scheduler = AsyncIOScheduler()
scheduler.add_job(
    run_daily_order_generation,
    'cron',
    hour=6,
    minute=0,
    id='daily_order_generation'
)
scheduler.start()
```

Alternatively, use Celery for distributed task processing:

```python
from celery import Celery

celery_app = Celery('fullfill', broker='redis://localhost:6379')

@celery_app.task
def generate_daily_orders():
    run_daily_order_generation()

# In celery beat schedule:
celery_app.conf.beat_schedule = {
    'generate-daily-orders': {
        'task': 'tasks.generate_daily_orders',
        'schedule': crontab(hour=6, minute=0),
    },
}
```
"""

from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.config import settings
from src.models.organization import Organization
from src.services.replenishment import ReplenishmentService
from src.repositories.replenishment import PostgresReplenishmentRepository
import logging

logger = logging.getLogger(__name__)

# Create engine and session factory for job
_engine = create_engine(settings.database_url)
_SessionLocal = sessionmaker(bind=_engine)


def run_daily_order_generation() -> dict:
    """
    Generate daily replenishment orders for all 340B-eligible organizations.

    This is the main entry point called by the scheduler.

    Returns:
        Dictionary with summary of job execution
    """
    logger.info("Starting daily order generation job")

    session = _SessionLocal()
    results = {
        "success": [],
        "failed": [],
        "skipped": [],
    }

    try:
        # Get all 340B-eligible organizations
        organizations = session.query(Organization).filter(
            Organization.is_340b_eligible == True
        ).all()

        logger.info(f"Found {len(organizations)} 340B-eligible organizations")

        today = date.today()
        replenishment_service = ReplenishmentService(session)
        replenishment_repo = PostgresReplenishmentRepository(session)

        for org in organizations:
            try:
                logger.info(f"Generating order for {org.name} ({org.id})")

                # Generate order data
                order_data = replenishment_service.generate_daily_order(
                    organization_id=org.id,
                    order_date=today
                )

                if not order_data:
                    logger.warning(f"No order data generated for {org.id}")
                    results["skipped"].append({
                        "org_id": org.id,
                        "org_name": org.name,
                        "reason": "No dispensing records found"
                    })
                    continue

                # Save order to database
                order = replenishment_repo.create_order(order_data)

                logger.info(
                    f"Successfully created order {order['id']} for {org.name} "
                    f"with {order['total_items']} items"
                )

                results["success"].append({
                    "org_id": org.id,
                    "org_name": org.name,
                    "order_id": order["id"],
                    "total_items": order["total_items"],
                    "estimated_cost_usd": order["estimated_cost_usd"],
                })

                # Send notification email to admins (stub)
                if org.primary_contact_email:
                    replenishment_service.send_order_notification(
                        order_id=order["id"],
                        notification_type="created",
                        recipient_emails=[org.primary_contact_email]
                    )

            except Exception as e:
                logger.error(f"Failed to generate order for {org.id}: {e}", exc_info=True)
                results["failed"].append({
                    "org_id": org.id,
                    "org_name": org.name,
                    "error": str(e)
                })

        logger.info(
            f"Daily order generation complete. "
            f"Success: {len(results['success'])}, "
            f"Failed: {len(results['failed'])}, "
            f"Skipped: {len(results['skipped'])}"
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
    results = run_daily_order_generation()
    print(f"\nJob Results:")
    print(f"Success: {len(results['success'])}")
    print(f"Failed: {len(results['failed'])}")
    print(f"Skipped: {len(results['skipped'])}")
