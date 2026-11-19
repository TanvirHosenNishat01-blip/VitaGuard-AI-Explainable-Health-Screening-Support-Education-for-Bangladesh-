import argparse
import os
import sys
import pyotp
from sqlalchemy import create_engine, text
from app.auth import get_password_hash

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BACKEND_DIR, 'vitaguard.db').replace(os.sep, '/')}"

def create_admin(full_name: str, username: str, password: str, email: str = None):
    engine = create_engine(DATABASE_URL)
    totp_secret = pyotp.random_base32()
    hashed_pwd = get_password_hash(password)
    admin_email = email or f"{username}@vitaguard.ai"

    try:
        with engine.connect() as connection:
            # Check if user already exists
            check_query = text("SELECT id FROM users WHERE username = :uname")
            result = connection.execute(check_query, {"uname": username}).fetchone()
            
            if result:
                print(f"\n[ERROR] User '{username}' already exists in database.")
                sys.exit(1)

            # Insert admin record with totp_secret
            insert_query = text("""
                INSERT INTO users (full_name, name, username, email, password_hash, role, totp_secret, is_active)
                VALUES (:name, :name, :uname, :email, :pwd, 'admin', :secret, 1)
            """)
            
            connection.execute(insert_query, {
                "name": full_name,
                "uname": username,
                "email": admin_email,
                "pwd": hashed_pwd,
                "secret": totp_secret
            })
            connection.commit()

        print("\n" + "=" * 55)
        print("       ADMIN ACCOUNT SUCCESSFULLY CREATED")
        print("=" * 55)
        print(f" Full Name   : {full_name}")
        print(f" Username    : {username}")
        print(f" Email       : {admin_email}")
        print(f" TOTP Secret : {totp_secret}")
        print("=" * 55)
        print(" Google Authenticator Setup:")
        print(f" 1. Account Name : VitaGuard AI ({username})")
        print(f" 2. Secret Key   : {totp_secret}")
        print(f" 3. Type of Key  : Time-based")
        print("=" * 55 + "\n")

    except Exception as e:
        print(f"\n[ERROR] Failed to create admin: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a VitaGuard AI Administrator Account")
    parser.add_argument("--name", type=str, required=True, help="Full Name")
    parser.add_argument("--username", type=str, required=True, help="Username")
    parser.add_argument("--password", type=str, required=True, help="Password")
    parser.add_argument("--email", type=str, required=False, help="Email")
    args = parser.parse_args()

    create_admin(args.name, args.username, args.password, args.email)
