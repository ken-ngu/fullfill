# 340B Replenishment Scheduled Jobs

This directory contains scheduled jobs for automated 340B replenishment order management.

## Jobs

### 1. Daily Replenishment Order Generation (`daily_replenishment.py`)

**Schedule:** Daily at 6:00 AM

**Purpose:** Automatically generate replenishment orders for all 340B-eligible organizations based on their dispensing records from the past 7 days.

**What it does:**
- Queries all organizations with `is_340b_eligible=True`
- Analyzes dispensing records from the last 7 days
- Calculates par levels based on average daily usage
- Verifies 340B contract coverage for each medication
- Creates replenishment orders with status `PENDING_REVIEW`
- Sets cutoff time based on organization settings (default 2pm)
- Sends email notifications to pharmacy admins (stub)

### 2. Auto-Submit Orders (`auto_submit_orders.py`)

**Schedule:** Every 15 minutes

**Purpose:** Automatically submit approved orders that have passed their vendor cutoff time.

**What it does:**
- Queries orders with status `APPROVED` and `cutoff_time <= now()`
- Verifies organization has `auto_submit_enabled=True`
- Changes order status to `SUBMITTED`
- Logs submission in modification history
- Sends confirmation emails (stub)

## Setup Instructions

### Option 1: APScheduler (Recommended for single-server deployments)

Add to your FastAPI application startup:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.jobs.daily_replenishment import run_daily_order_generation
from src.jobs.auto_submit_orders import run_auto_submit

scheduler = AsyncIOScheduler()

# Daily order generation at 6am
scheduler.add_job(
    run_daily_order_generation,
    'cron',
    hour=6,
    minute=0,
    id='daily_order_generation'
)

# Auto-submit orders every 15 minutes
scheduler.add_job(
    run_auto_submit,
    'interval',
    minutes=15,
    id='auto_submit_orders'
)

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
```

Install dependencies:
```bash
pip install apscheduler
```

### Option 2: Celery (Recommended for distributed deployments)

Create a `tasks.py` file:

```python
from celery import Celery
from celery.schedules import crontab
from src.jobs.daily_replenishment import run_daily_order_generation
from src.jobs.auto_submit_orders import run_auto_submit

celery_app = Celery('fullfill', broker='redis://localhost:6379')

@celery_app.task
def generate_daily_orders():
    return run_daily_order_generation()

@celery_app.task
def auto_submit_orders():
    return run_auto_submit()

# Configure beat schedule
celery_app.conf.beat_schedule = {
    'generate-daily-orders': {
        'task': 'tasks.generate_daily_orders',
        'schedule': crontab(hour=6, minute=0),
    },
    'auto-submit-orders': {
        'task': 'tasks.auto_submit_orders',
        'schedule': 900.0,  # 15 minutes in seconds
    },
}
```

Start Celery worker and beat:
```bash
# Install dependencies
pip install celery redis

# Start Redis
redis-server

# Start Celery worker
celery -A tasks worker --loglevel=info

# Start Celery beat (scheduler)
celery -A tasks beat --loglevel=info
```

### Option 3: Cron Jobs (Simplest, works anywhere)

Add to your crontab:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Daily order generation at 6am
0 6 * * * cd /path/to/fullfill/backend && python -m src.jobs.daily_replenishment

# Auto-submit orders every 15 minutes
*/15 * * * * cd /path/to/fullfill/backend && python -m src.jobs.auto_submit_orders
```

## Manual Testing

You can run the jobs manually for testing:

```bash
cd /path/to/fullfill/backend

# Run daily order generation
python -m src.jobs.daily_replenishment

# Run auto-submit
python -m src.jobs.auto_submit_orders
```

## Configuration

Jobs read organization settings from the `organizations.settings` JSON column:

```json
{
  "order_cutoff_hour": 14,        // Hour of day (0-23) for vendor cutoff
  "par_level_days": 7,            // Days of supply to maintain
  "auto_submit_enabled": true,    // Enable auto-submission at cutoff
  "vendor_name": "Cardinal Health" // Preferred vendor
}
```

## Monitoring

Both jobs log to the application logger. Set up log monitoring to track:

- Job execution times
- Number of orders generated/submitted
- Errors and failures
- Organizations skipped (no dispensing records)

Example log messages:
```
INFO - Starting daily order generation job
INFO - Found 5 340B-eligible organizations
INFO - Generated order order-2026-03-01-001 for childrens-hospital-seattle with 45 items
INFO - Daily order generation complete. Success: 5, Failed: 0, Skipped: 0
```

## Email Notifications (TODO)

Currently, email notifications are stubbed and only logged. To implement:

1. Add email service (SendGrid, AWS SES, etc.)
2. Update `ReplenishmentService.send_order_notification()`
3. Configure email templates for different notification types
4. Add recipient management (who receives which notifications)

## Future Enhancements

- [ ] Implement actual email notifications
- [ ] Add Slack/Teams webhook notifications
- [ ] Support multiple vendor cutoff times per day
- [ ] Add job execution dashboard/metrics
- [ ] Implement retry logic for failed jobs
- [ ] Add circuit breaker for external vendor APIs
