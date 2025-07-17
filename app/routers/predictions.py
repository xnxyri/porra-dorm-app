from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)

@router.post("/", response_model=schemas.Prediccion)
def create_prediction(prediction: schemas.PrediccionCreate, db: Session = Depends(get_db)):
    # Primero, buscamos si el usuario existe
    db_user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == prediction.Nombre_Usuario_Discord).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Segundo, buscamos si el partido existe
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == prediction.ID_Partido).first()
    if db_match is None:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    # Aquí podríamos añadir lógica para no dejar predecir dos veces, pero lo haremos más adelante

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