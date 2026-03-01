#!/usr/bin/env python3
"""
Quick script to seed the Railway database with medication data.
Run this in Railway: python seed_database.py
"""

import sys
import os

# Add src to path so we can import
sys.path.insert(0, os.path.dirname(__file__))

try:
    from src.data.seed import seed_db

    print("🌱 Starting database seed...")
    print("")

    seed_db()

    print("")
    print("✅ Database seeded successfully!")
    print("   - 39 medications added")
    print("   - Try the website now!")

except Exception as e:
    print(f"❌ Error seeding database: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
