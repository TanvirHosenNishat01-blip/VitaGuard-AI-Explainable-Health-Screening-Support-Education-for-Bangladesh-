import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_db_override = os.environ.get("VITAGUARD_DB_PATH", "").strip()
DB_PATH = os.path.abspath(_db_override).replace("\\", "/") if _db_override else os.path.join(BACKEND_DIR, "vitaguard.db").replace("\\", "/")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create the SQLAlchemy engine for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a local session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative database models (tables)
Base = declarative_base()

# FastAPI route-e database session provide korar dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_columns():
    """
    Automatically checks and adds missing columns (user_id and feature_importance)
    to pre-existing SQLite prediction tables on startup without wiping user data.
    """
    with engine.begin() as conn:
        for table in ("diabetes_predictions", "cardio_predictions"):
            try:
                rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
                if not rows:
                    continue
                col_names = {row[1] for row in rows}

                # Ensure user_id column exists
                if "user_id" not in col_names:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER;"))
                    print(f"Added 'user_id' column to {table}")

                # Ensure feature_importance column exists for SHAP explanations
                if "feature_importance" not in col_names:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN feature_importance TEXT;"))
                    print(f"Added 'feature_importance' column to {table}")

            except Exception as e:
                print(f"Migration note for {table}: {e}")


def ensure_user_and_blood_columns():
    user_columns = {
        "donor_share_contact": "INTEGER DEFAULT 0",
        "bmdc_number": "VARCHAR(40)",
        "specialty": "VARCHAR(80)",
        "workplace": "VARCHAR(150)",
        "verification_status": "VARCHAR(20) DEFAULT 'not_required'",
        "date_of_birth": "VARCHAR(10)",
        "sex": "VARCHAR(10)",
        "auth_provider": "VARCHAR(20) DEFAULT 'password'",
        "google_sub": "VARCHAR(255)",
    }
    with engine.begin() as conn:
        rows = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        if rows:
            existing = {row[1] for row in rows}
            for name, ddl in user_columns.items():
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {name} {ddl}"))
            conn.execute(text(
                "UPDATE users SET verification_status = 'approved' "
                "WHERE lower(role) = 'doctor' AND (verification_status IS NULL OR verification_status = 'not_required')"
            ))
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_sub ON users (google_sub)"
            ))

        notice_rows = conn.execute(text("PRAGMA table_info(health_notices)")).fetchall()
        if notice_rows and "is_hidden" not in {row[1] for row in notice_rows}:
            conn.execute(text("ALTER TABLE health_notices ADD COLUMN is_hidden INTEGER DEFAULT 0"))

        blood_rows = conn.execute(text("PRAGMA table_info(blood_requests)")).fetchall()
        if not blood_rows:
            return
        extra_blood = {
            "requester_name": "VARCHAR(120)",
            "is_demo": "INTEGER DEFAULT 1",
            "duplicate_of_id": "INTEGER",
            "moderation_note": "TEXT",
            "closed_at": "DATETIME",
        }
        blood_existing = {row[1] for row in blood_rows}
        patient_meta = next(row for row in blood_rows if row[1] == "patient_id")
        if patient_meta[3] == 1:
            conn.execute(text("ALTER TABLE blood_requests RENAME TO blood_requests_old"))
            conn.execute(text(
                """
                CREATE TABLE blood_requests (
                    id INTEGER PRIMARY KEY,
                    patient_id INTEGER,
                    requester_name VARCHAR(120),
                    blood_group VARCHAR(10) NOT NULL,
                    units_needed INTEGER,
                    hospital_name VARCHAR(150) NOT NULL,
                    district VARCHAR(50) NOT NULL,
                    contact_number VARCHAR(20) NOT NULL,
                    urgency VARCHAR(20),
                    status VARCHAR(20),
                    created_at DATETIME,
                    FOREIGN KEY(patient_id) REFERENCES users (id)
                )
                """
            ))
            conn.execute(text(
                """
                INSERT INTO blood_requests (
                    id, patient_id, requester_name, blood_group, units_needed,
                    hospital_name, district, contact_number, urgency, status, created_at
                )
                SELECT id, patient_id, requester_name, blood_group, units_needed,
                       hospital_name, district, contact_number, urgency, status, created_at
                FROM blood_requests_old
                """
            ))
            conn.execute(text("DROP TABLE blood_requests_old"))

        blood_rows = conn.execute(text("PRAGMA table_info(blood_requests)")).fetchall()
        blood_existing = {row[1] for row in blood_rows}
        for name, ddl in extra_blood.items():
            if name not in blood_existing:
                conn.execute(text(f"ALTER TABLE blood_requests ADD COLUMN {name} {ddl}"))


ensure_sqlite_columns()
ensure_user_and_blood_columns()