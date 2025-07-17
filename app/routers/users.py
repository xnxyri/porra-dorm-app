from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List # <-- LÍNEA NUEVA
from ..schemas import Usuario, UsuarioCreate
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Esta es la función que ya tenías para crear un usuario
@router.post("/", response_model=Usuario)
def create_user(user: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = models.Usuario(Nombre_Usuario_Discord=user.Nombre_Usuario_Discord)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- ESTA ES LA FUNCIÓN NUEVA ---
@router.get("/", response_model=List[Usuario])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.Usuario).all()
    return users