import sys
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re
import time
import json

SELECTOR_CONFIG = {
    "default": {
        "title": "h1",
        "price_selectors": [".price", ".product-price", "[data-price]", ".a-price-whole"],
        "stock": ".inventory",
        "reviews": ".review-text"
    },
    "amazon.in": {
        "title": "#productTitle, h1#title, span#productTitle",
        "price_selectors": [
            "#corePrice_desktop .a-price-whole", 
            "#corePrice_feature_div .a-price-whole",
            ".a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen",
            "span.a-price-whole",
            "span.a-offscreen",
            "#priceblock_ourprice",
            "#priceblock_dealprice"
        ],
        "stock": "#availability",
        "reviews": ".review-text-content"
    }
}

def scrape_product(url: str):
    print(f"--- Scraping {url} ---")
    with sync_playwright() as p:
        browser = None
        try:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(4) # Allow JS to render prices
            
            content = page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # 1. Try to find price in script tags (Amazon JSON-LD or Data)
            price = 0.0
            scripts = soup.find_all("script", type="application/ld+json")
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and "offers" in data:
                        off = data["offers"]
                        if isinstance(off, list): off = off[0]
                        price = float(off.get("price", 0))
                        if price > 0: break
                except: continue

            # 2. Fallback to selectors if JSON-LD failed
            if price == 0:
                config = SELECTOR_CONFIG["amazon.in"] if "amazon.in" in url else SELECTOR_CONFIG["default"]
                for selector in config["price_selectors"]:
                    elem = soup.select_one(selector)
                    if elem:
                        text = elem.get_text(strip=True)
                        match = re.search(r'[\d,.]+', text)
                        if match:
                            val = float(match.group().replace(',', ''))
                            if val > 10:
                                price = val
                                break

            # Title & Stock
            title_elem = soup.select_one("#productTitle") or soup.select_one("h1")
            title = title_elem.get_text(strip=True) if title_elem else "Unknown"
            
            stock_elem = soup.select_one("#availability")
            is_in_stock = "out of stock" not in (stock_elem.get_text().lower() if stock_elem else "")
            
            # Reviews
            review_elems = soup.select(".review-text-content") or soup.select(".review-text")
            reviews = [r.get_text(strip=True) for r in review_elems[:5]]
            
            return {
                "name": title,
                "url": url,
                "price": price,
                "is_in_stock": is_in_stock,
                "reviews": reviews
            }
        except Exception as e:
            print(f"Scrape Error: {e}")
            return None
        finally:
            if browser: browser.close()

if __name__ == "__main__":
    print(scrape_product("https://www.amazon.in/dp/B0CXM7FMB7"))
