import sys
import os
from pathlib import Path

# Add the 'backend' directory to sys.path
# This allows 'from src.app.main import app' to work
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

try:
    from src.app.main import app
except Exception as e:
    print(f"Error importing FastAPI app: {e}")
    raise e
