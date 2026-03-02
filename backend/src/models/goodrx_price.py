from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from src.models.medication import Base


class GoodRxPrice(Base):
    __tablename__ = "goodrx_prices"

    id = Column(String, primary_key=True)
    medication_id = Column(String, ForeignKey('medications.id'), nullable=False)
    cash_price_low_usd = Column(Float, nullable=False)
    cash_price_high_usd = Column(Float, nullable=False)
    coupon_price_usd = Column(Float, nullable=True)
    zip_code = Column(String, nullable=True)
    pharmacy_type = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    fetched_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)  # 7-day cache
