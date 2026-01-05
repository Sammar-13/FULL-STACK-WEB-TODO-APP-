"""Vercel serverless entry point for FastAPI application.

This module serves as the handler for Vercel's serverless functions.
Vercel automatically calls this handler for all incoming requests.
"""

# Add the parent directory to Python path so we can import src.app
import sys
from pathlib import Path

# Get the backend directory (parent of api/)
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import the FastAPI app from src.app.main
from src.app.main import app

# Vercel automatically wraps this as an ASGI application
# When you deploy, Vercel calls this `app` object with incoming requests
