import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the directory of the current file (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Put the database in the backend folder consistently
DATABASE_PATH = os.path.join(BASE_DIR, "marketintel.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
