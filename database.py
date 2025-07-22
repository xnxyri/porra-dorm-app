import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Render nos dará esta URL de forma segura
# Si no la encuentra, usará nuestra base de datos local sqlite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./porra_dorm.db")

# --- LÓGICA DE CONEXIÓN CORREGIDA ---
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True, # Comprueba si la conexión está viva antes de usarla
    pool_recycle=300    # Recicla conexiones que lleven más de 5 minutos inactivas
)
# ------------------------------------

# En PostgreSQL, no necesitamos el argumento 'check_same_thread'
# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
# )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()