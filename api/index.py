import os
import sys

# Set DATABASE_URL for Vercel (read-only file system workaround)
os.environ["DATABASE_URL"] = "sqlite:////tmp/followup.db"

# Add backend directory to sys.path so imports work
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from fastapi import FastAPI
from app.main import app as original_app

# Create a top-level app and mount the original app under /api
app = FastAPI()
app.mount("/api", original_app)
