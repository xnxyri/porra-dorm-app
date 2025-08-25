from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel # <-- FALTABA ESTA IMPORTACIÓN
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# --- FALTABA ESTA CLASE ---
class ScoreAdjustment(BaseModel):
    puntos: int
# -----------------------------

@router.post("/", response_model=schemas.Usuario)
def create_user(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = models.Usuario(
        Alias=user.Alias, 
        Nombre_Usuario_Discord=user.Nombre_Usuario_Discord
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[schemas.Usuario])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.Usuario).order_by(models.Usuario.Puntuacion_Total.desc()).all()
    return users
    
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.ID_Usuario == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    has_predictions = db.query(models.Prediccion).filter(models.Prediccion.ID_Usuario == user_id).first()
    if has_predictions:
        raise HTTPException(status_code=400, detail="No se puede borrar un usuario que ya tiene predicciones.")
    
    db.delete(db_user)
    db.commit()
    return {"ok": True}

@router.post("/{user_id}/adjust-score", response_model=schemas.Usuario)
def adjust_user_score(user_id: int, adjustment: ScoreAdjustment, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.ID_Usuario == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db_user.Puntuacion_Total += adjustment.puntos
    db.commit()
    db.refresh(db_user)
    return db_user