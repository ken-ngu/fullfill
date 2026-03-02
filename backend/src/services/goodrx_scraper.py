"""
GoodRx Price Scraper Service

⚠️ LEGAL WARNING: This implementation uses web scraping (Option C)
- May violate GoodRx Terms of Service
- For internal testing and research purposes only
- For production, pursue Option B: Official GoodRx API partnership

Three implementation options:

Option A: Static data (see /backend/src/data/goodrx_seed.py)
- Manually populated, updated quarterly
- Legal, safe, no ToS concerns

Option B (RECOMMENDED for production): Official GoodRx API partnership
- Requires business agreement with GoodRx
- Most reliable, real-time data
- May have licensing fees

Option C (CURRENT IMPLEMENTATION): Web scraping
- Implemented below for testing/research
- Use at your own legal risk
- Brittle (breaks when HTML changes)
"""

from datetime import datetime, timedelta
import re
import httpx
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)


class GoodRxScraperService:
    """
    Web scraping service for fetching real-time GoodRx prices.

    ⚠️ WARNING: This scraper may violate GoodRx Terms of Service.
    Use for testing/research only. Pursue official API partnership for production.
    """

    def __init__(self):
        self.base_url = "https://www.goodrx.com"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

    async def fetch_price(
        self,
        medication_name: str,
        ndc_code: str | None = None,
        zip_code: str = "90210"
    ) -> dict | None:
        """
        Fetch GoodRx price for a medication by scraping their website.

        Args:
            medication_name: Generic or brand name (e.g., "tretinoin", "amoxicillin")
            ndc_code: NDC code for specific formulation (optional, not used yet)
            zip_code: ZIP code for location-based pricing (default: 90210)

        Returns:
            dict with pricing data, or None if scraping fails
        """
        try:
            # Normalize medication name for URL (lowercase, replace spaces with hyphens)
            medication_slug = medication_name.lower().strip()
            medication_slug = re.sub(r'[^\w\s-]', '', medication_slug)  # Remove special chars
            medication_slug = re.sub(r'[-\s]+', '-', medication_slug)   # Replace spaces with hyphens

            url = f"{self.base_url}/{medication_slug}"
            logger.info(f"Fetching GoodRx prices from: {url}")

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=self.headers)

                if response.status_code == 404:
                    logger.warning(f"GoodRx page not found for: {medication_name}")
                    return None

                if response.status_code != 200:
                    logger.error(f"GoodRx returned status {response.status_code}")
                    return None

                # Parse HTML
                soup = BeautifulSoup(response.text, 'html.parser')

                # Extract prices using common GoodRx HTML patterns
                prices = self._extract_prices_from_html(soup)

                if not prices:
                    logger.warning(f"Could not extract prices from GoodRx page: {medication_name}")
                    return None

                return {
                    "cash_price_low_usd": prices['low'],
                    "cash_price_high_usd": prices['high'],
                    "coupon_price_usd": prices.get('coupon'),
                    "zip_code": zip_code,
                    "pharmacy_type": "retail_pharmacy",
                    "source_url": url,
                    "expires_at": datetime.utcnow() + timedelta(days=7)
                }

        except httpx.TimeoutException:
            logger.error(f"Timeout fetching GoodRx data for: {medication_name}")
            return None
        except Exception as e:
            logger.error(f"Error scraping GoodRx for {medication_name}: {e}")
            return None

    def _extract_prices_from_html(self, soup: BeautifulSoup) -> dict | None:
        """
        Extract price data from GoodRx HTML.

        GoodRx typically shows:
        - Lowest price (with GoodRx coupon)
        - Price range across different pharmacies

        This is brittle and will break when GoodRx updates their HTML structure.
        """
        prices = {}

        try:
            # Strategy 1: Look for price elements (common patterns)
            # GoodRx often uses data attributes or specific classes
            price_elements = soup.find_all(text=re.compile(r'\$\d+\.?\d*'))

            extracted_prices = []
            for elem in price_elements:
                # Extract numeric values from strings like "$12.34"
                match = re.search(r'\$(\d+\.?\d*)', elem)
                if match:
                    extracted_prices.append(float(match.group(1)))

            if extracted_prices:
                extracted_prices.sort()
                prices['low'] = extracted_prices[0]
                prices['high'] = extracted_prices[-1] if len(extracted_prices) > 1 else extracted_prices[0]

                # Assume first price is coupon price (lowest)
                prices['coupon'] = extracted_prices[0] if extracted_prices else None

                return prices

            # Strategy 2: Look for JSON-LD structured data (many sites include this)
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                import json
                try:
                    data = json.loads(json_ld.string)
                    # Look for price information in structured data
                    if isinstance(data, dict) and 'offers' in data:
                        offers = data['offers']
                        if isinstance(offers, list) and offers:
                            offer_prices = [float(o.get('price', 0)) for o in offers if 'price' in o]
                            if offer_prices:
                                offer_prices.sort()
                                return {
                                    'low': offer_prices[0],
                                    'high': offer_prices[-1],
                                    'coupon': offer_prices[0]
                                }
                except:
                    pass

            return None

        except Exception as e:
            logger.error(f"Error parsing GoodRx HTML: {e}")
            return None

    def is_available(self) -> bool:
        """
        Check if GoodRx scraping is available.

        Returns True since scraping is implemented (though may fail at runtime).
        """
        return True
