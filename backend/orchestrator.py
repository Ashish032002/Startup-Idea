from sqlalchemy.orm import Session
from datetime import datetime
from .database import SessionLocal, engine
from .models import Product, PriceHistory, ReviewInsight
from .scraper import scrape_product
from .ai_engine import generate_insights
import traceback

def monitor_product(db: Session, product: Product):
    print(f"Monitoring Product {product.id}: {product.name}...")
    try:
        data = scrape_product(product.url)
        
        if data and data["price"] > 0:
            # Update price
            new_price = PriceHistory(
                product_id=product.id,
                price=data["price"],
                is_in_stock=data["is_in_stock"],
                timestamp=datetime.utcnow()
            )
            db.add(new_price)
            
            # Update AI Insights if reviews exist
            if data["reviews"]:
                print(f"Generating AI insights for {product.name}...")
                ai_output = generate_insights(data["name"], data["reviews"])
                
                sentiment = "Neutral"
                if "Sentiment: Positive" in ai_output: sentiment = "Positive"
                elif "Sentiment: Negative" in ai_output: sentiment = "Negative"
                
                new_insight = ReviewInsight(
                    product_id=product.id,
                    review_text="; ".join(data["reviews"]),
                    sentiment=sentiment,
                    insight_text=ai_output,
                    timestamp=datetime.utcnow()
                )
                db.add(new_insight)
                print(f"AI Update successful.")
            
            db.commit()
            print(f"Success: {product.name} updated with price ₹{data['price']}.")
        else:
            print(f"Skipping DB update for {product.name}: No data or price 0 found.")
            
    except Exception as e:
        print(f"Error in monitor_product for {product.name}: {e}")
        traceback.print_exc()

def run_all_monitors():
    print("--- Starting Bulk Refresh ---")
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        for p in products:
            monitor_product(db, p)
    finally:
        db.close()
    print("--- Bulk Refresh Complete ---")

if __name__ == "__main__":
    run_all_monitors()
