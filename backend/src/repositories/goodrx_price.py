from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from sqlalchemy.orm import Session
from src.models.goodrx_price import GoodRxPrice


class AbstractGoodRxPriceRepository(ABC):
    @abstractmethod
    def get_by_medication_id(self, medication_id: str) -> dict | None:
        """Fetch cached GoodRx price for a medication (only if not expired)"""
        pass

    @abstractmethod
    def upsert(self, price_data: dict) -> dict:
        """Insert or update GoodRx price with 7-day expiration"""
        pass


def _to_dict(price: GoodRxPrice) -> dict:
    """Convert GoodRxPrice model to dictionary"""
    return {c.name: getattr(price, c.name) for c in price.__table__.columns}


class PostgresGoodRxPriceRepository(AbstractGoodRxPriceRepository):
    def __init__(self, session: Session):
        self._session = session

    def get_by_medication_id(self, medication_id: str) -> dict | None:
        """
        Fetch cached GoodRx price for a medication.
        Only returns prices that haven't expired.

        Returns None if:
        - No price exists for this medication
        - Price has expired
        """
        price = self._session.query(GoodRxPrice).filter(
            GoodRxPrice.medication_id == medication_id,
            GoodRxPrice.expires_at > datetime.utcnow()  # Only return non-expired prices
        ).first()

        return _to_dict(price) if price else None

    def upsert(self, price_data: dict) -> dict:
        """
        Insert or update GoodRx price with 7-day expiration.

        Expected price_data keys:
        - id: str
        - medication_id: str
        - cash_price_low_usd: float
        - cash_price_high_usd: float
        - coupon_price_usd: float | None
        - zip_code: str | None
        - pharmacy_type: str | None
        - source_url: str | None
        - expires_at: datetime
        """
        # Check if price already exists
        existing = self._session.query(GoodRxPrice).filter(
            GoodRxPrice.medication_id == price_data['medication_id']
        ).first()

        if existing:
            # Update existing price
            for key, value in price_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            price = existing
        else:
            # Create new price
            price = GoodRxPrice(**price_data)
            self._session.add(price)

        self._session.commit()
        self._session.refresh(price)

        return _to_dict(price)
