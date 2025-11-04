#!/usr/bin/env python
"""
Helper script to inspect the PostgreSQL database tables.
Run this to see what tables exist and their structure.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import Django settings
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "qchat.settings")

import django
django.setup()

from django.db import connection


def inspect_tables():
    """List all tables in the database and their column information."""
    with connection.cursor() as cursor:
        # Get all tables in the public schema
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database.")
            return
        
        print(f"\nFound {len(tables)} table(s):\n")
        print("=" * 80)
        
        for (table_name,) in tables:
            print(f"\n📋 Table: {table_name}")
            print("-" * 80)
            
            # Get column information
            cursor.execute("""
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position;
            """, [table_name])
            
            columns = cursor.fetchall()
            
            print(f"{'Column Name':<30} {'Type':<20} {'Nullable':<10} {'Default'}")
            print("-" * 80)
            
            for col_name, data_type, max_length, nullable, default in columns:
                type_str = data_type
                if max_length:
                    type_str = f"{data_type}({max_length})"
                nullable_str = "YES" if nullable == "YES" else "NO"
                default_str = str(default) if default else "-"
                print(f"{col_name:<30} {type_str:<20} {nullable_str:<10} {default_str}")
            
            # Get row count
            cursor.execute(f'SELECT COUNT(*) FROM "{table_name}";')
            count = cursor.fetchone()[0]
            print(f"\nRow count: {count}")
            print("=" * 80)


if __name__ == "__main__":
    try:
        inspect_tables()
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running and accessible at 172.17.0.1:5432")
        print("2. DATABASE_URL is set correctly in your .env file")
        print("3. The database 'qshakti-db' exists")
        print("4. Your network can reach the database server at 172.17.0.1")
        print("5. If using Docker/WSL, ensure the IP is accessible from your host")
        sys.exit(1)
