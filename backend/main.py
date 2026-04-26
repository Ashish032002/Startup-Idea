import asyncio
import sys
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Product, PriceHistory, ReviewInsight, Base
from .orchestrator import run_all_monitors
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# CRITICAL FIX FOR WINDOWS: Playwright requires ProactorEventLoop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProductCreate(BaseModel):
    name: str
    url: str
    competitor_brand: str

class ProductOut(ProductCreate):
    id: int
    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {"message": "MarketIntel AI Backend is running."}

@app.post("/products", response_model=ProductOut)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Check if URL already exists
    existing = db.query(Product).filter(Product.url == product.url).first()
    if existing:
        raise HTTPException(status_code=400, detail="This product URL is already being tracked.")
        
    db_product = Product(name=product.name, url=product.url, competitor_brand=product.competitor_brand)
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    dashboard_data = []
    
    for p in products:
        latest_price = db.query(PriceHistory).filter(PriceHistory.product_id == p.id).order_by(PriceHistory.timestamp.desc()).first()
        latest_insight = db.query(ReviewInsight).filter(ReviewInsight.product_id == p.id).order_by(ReviewInsight.timestamp.desc()).first()
        
        dashboard_data.append({
            "id": p.id,
            "name": p.name,
            "brand": p.competitor_brand,
            "url": p.url,
            "current_price": latest_price.price if latest_price else 0,
            "is_in_stock": latest_price.is_in_stock if latest_price else True,
            "sentiment": latest_insight.sentiment if latest_insight else "N/A",
            "insight": latest_insight.insight_text if latest_insight else "No insight generated yet."
        })
    
    return dashboard_data

import threading

@app.post("/refresh")
async def refresh_all():
    # Use a real thread instead of BackgroundTasks to ensure Proactor loop isn't inherited incorrectly
    thread = threading.Thread(target=run_all_monitors)
    thread.start()
    return {"message": "Refresh started in background."}
