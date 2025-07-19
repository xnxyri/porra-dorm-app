from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import schemas
from ..db import models
from ..db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)

@router.post("/", response_model=schemas.Prediccion)
def create_prediction(prediction: schemas.PrediccionCreate, db: Session = Depends(get_db)):
    # 1. Buscamos si el usuario existe
    db_user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == prediction.Nombre_Usuario_Discord).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado. Revisa el nombre.")

    # 2. Buscamos si el partido existe
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == prediction.ID_Partido).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")

    # 3. Comprobamos si ya existe una predicción para este usuario y partido
    existing_prediction = db.query(models.Prediccion).filter(
        models.Prediccion.ID_Usuario == db_user.ID_Usuario,
        models.Prediccion.ID_Partido == db_match.ID_Partido
    ).first()

    if existing_prediction:
        raise HTTPException(status_code=400, detail="Ya has enviado una predicción para este partido. Pide a un admin que la edite si es necesario.")

    # Si todo es correcto, creamos la predicción
    db_prediction = models.Prediccion(
        ID_Partido=prediction.ID_Partido,
        ID_Usuario=db_user.ID_Usuario,
        Prediccion_Goles_Local=prediction.Prediccion_Goles_Local,
        Prediccion_Goles_Visitante=prediction.Prediccion_Goles_Visitante,
        Prediccion_Goleador=prediction.Prediccion_Goleador,
        Prediccion_MVP=prediction.Prediccion_MVP,
        Booster_Activado=prediction.Booster_Activado,
        Fecha_Prediccion=datetime.utcnow()
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

# --- FUNCIÓN NUEVA PARA EDITAR ---
@router.put("/{prediction_id}", response_model=schemas.Prediccion)
def update_prediction(
    prediction_id: int,
    prediction_update: schemas.PrediccionUpdate,
    db: Session = Depends(get_db)
):
    db_prediction = db.query(models.Prediccion).filter(models.Prediccion.ID_Prediccion == prediction_id).first()
    if not db_prediction:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")

    # Actualizamos los campos
    db_prediction.Prediccion_Goles_Local = prediction_update.Prediccion_Goles_Local
    db_prediction.Prediccion_Goles_Visitante = prediction_update.Prediccion_Goles_Visitante
    db_prediction.Prediccion_Goleador = prediction_update.Prediccion_Goleador
    db_prediction.Prediccion_MVP = prediction_update.Prediccion_MVP

    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@router.get("/{prediction_id}", response_model=schemas.Prediccion)
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    # Hacemos un JOIN para poder devolver también el nombre de usuario
    result = (
        db.query(models.Prediccion, models.Usuario.Nombre_Usuario_Discord)
        .join(models.Usuario, models.Prediccion.ID_Usuario == models.Usuario.ID_Usuario)
        .filter(models.Prediccion.ID_Prediccion == prediction_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")

    pred, discord_name = result
    pred.Nombre_Usuario_Discord = discord_name
    return pred

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    db_prediction = db.query(models.Prediccion).filter(models.Prediccion.ID_Prediccion == prediction_id).first()
    if not db_prediction:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")

    db.delete(db_prediction)
    db.commit()
    return {"ok": True}