from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def create_bulk_predictions(predictions: List[schemas.PrediccionCreate], db: Session = Depends(get_db)):
    for pred_data in predictions:
        user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == pred_data.Nombre_Usuario_Discord).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"Usuario '{pred_data.Nombre_Usuario_Discord}' no encontrado.")

        match = db.query(models.Partido).filter(models.Partido.ID_Partido == pred_data.ID_Partido).first()
        if not match:
            raise HTTPException(status_code=404, detail=f"Partido ID {pred_data.ID_Partido} no encontrado.")
        
        if match.Estado != "Por jugar":
            raise HTTPException(status_code=400, detail=f"Las predicciones para el partido '{match.Equipo_Local} vs {match.Equipo_Visitante}' ya están cerradas.")

        existing = db.query(models.Prediccion).filter(
            models.Prediccion.ID_Usuario == user.ID_Usuario,
            models.Prediccion.ID_Partido == match.ID_Partido
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Ya tienes una predicción para el partido '{match.Equipo_Local} vs {match.Equipo_Visitante}'.")

    for pred_data in predictions:
        user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == pred_data.Nombre_Usuario_Discord).first()
        db_prediction = models.Prediccion(
            ID_Partido=pred_data.ID_Partido,
            ID_Usuario=user.ID_Usuario,
            Prediccion_Goles_Local=pred_data.Prediccion_Goles_Local,
            Prediccion_Goles_Visitante=pred_data.Prediccion_Goles_Visitante,
            Prediccion_Goleador=pred_data.Prediccion_Goleador,
            Prediccion_MVP=pred_data.Prediccion_MVP,
            Booster_Activado=pred_data.Booster_Activado,
            Fecha_Prediccion=datetime.utcnow()
        )
        db.add(db_prediction)
    
    db.commit()
    return {"detail": "Todas las predicciones han sido guardadas con éxito."}

@router.get("/{prediction_id}", response_model=schemas.Prediccion)
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(models.Prediccion, models.Usuario.Alias, models.Usuario.Nombre_Usuario_Discord)
        .join(models.Usuario, models.Prediccion.ID_Usuario == models.Usuario.ID_Usuario)
        .filter(models.Prediccion.ID_Prediccion == prediction_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")
    pred, alias, discord_name = result
    pred.Alias = alias
    pred.Nombre_Usuario_Discord = discord_name
    return pred

@router.put("/{prediction_id}", response_model=schemas.Prediccion)
def update_prediction(prediction_id: int, prediction_update: schemas.PrediccionUpdate, db: Session = Depends(get_db)):
    db_prediction = db.query(models.Prediccion).filter(models.Prediccion.ID_Prediccion == prediction_id).first()
    if not db_prediction:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")
    db_prediction.Prediccion_Goles_Local = prediction_update.Prediccion_Goles_Local
    db_prediction.Prediccion_Goles_Visitante = prediction_update.Prediccion_Goles_Visitante
    db_prediction.Prediccion_Goleador = prediction_update.Prediccion_Goleador
    db_prediction.Prediccion_MVP = prediction_update.Prediccion_MVP
    db.commit()
    db.refresh(db_prediction)
    # Volvemos a cargar los datos del usuario para la respuesta
    return get_prediction(prediction_id, db)

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    db_prediction = db.query(models.Prediccion).filter(models.Prediccion.ID_Prediccion == prediction_id).first()
    if not db_prediction:
        raise HTTPException(status_code=404, detail="Predicción no encontrada")
    db.delete(db_prediction)
    db.commit()
    return {"ok": True}