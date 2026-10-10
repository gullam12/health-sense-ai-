"""
HealthSense AI — Standalone Database Seeding Script
Executes relational schema initialization and baseline clinical data seeding.
"""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.init_db import init_database


if __name__ == "__main__":
    print("[*] Running standalone clinical database seed script...")
    asyncio.run(init_database())
    print("[OK] Standalone seeding completed successfully.")
