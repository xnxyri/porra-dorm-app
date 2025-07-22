from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..services import scoring

router = APIRouter(
    prefix="/season-predictions",
    tags=["Season Predictions"]
)

# Un simple control para saber qué competiciones están abiertas
# En el futuro, esto podría gestionarse desde el panel de admin
PREDICCIONES_ABIERTAS = {
    "LaLiga": True,
    "Copa del Rey": False,
    "Champions League": False
}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..services import scoring

router = APIRouter(
    prefix="/season-predictions",
    tags=["Season Predictions"]
)

# Control para saber qué competiciones están abiertas
PREDICCIONES_ABIERTAS = {
    "LaLiga": True,
    "Copa del Rey": False,
    "Champions League": False
}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_season_prediction(prediction: schemas.PrediccionTemporadaCreate, db: Session = Depends(get_db)):
    # 1. Validar que la competición existe y está abierta
    if not PREDICCIONES_ABIERTAS.get(prediction.Competicion, False):
        raise HTTPException(status_code=400, detail=f"Las predicciones para '{prediction.Competicion}' están cerradas.")

    # 2. Validar que el usuario existe
    user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == prediction.Nombre_Usuario_Discord).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # 3. Validar que el usuario no haya enviado ya una predicción para esta competición
    existing = db.query(models.PrediccionTemporada).filter(
        models.PrediccionTemporada.ID_Usuario == user.ID_Usuario,
        models.PrediccionTemporada.Competicion == prediction.Competicion
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Ya has enviado una predicción para '{prediction.Competicion}'.")

    # Convertimos las listas de equipos a texto separado por comas para guardarlo
    db_prediction = models.PrediccionTemporada(
        ID_Usuario=user.ID_Usuario,
        Competicion=prediction.Competicion,
        Campeon=prediction.Campeon,
        Clasificados_UCL=",".join(prediction.Clasificados_UCL),
        Clasificados_EL=",".join(prediction.Clasificados_EL),
        Clasificado_Conference=prediction.Clasificado_Conference,
        Descensos=",".join(prediction.Descensos),
        Pichichi=prediction.Pichichi,
        Max_Asistente=prediction.Max_Asistente,
        Zamora=prediction.Zamora,
        Zarra=prediction.Zarra,
        MVP=prediction.MVP
    )
    
    # --- ESTAS LÍNEAS ESTABAN MAL COLOCADAS ---
    db.add(db_prediction)
    db.commit()
    # -------------------------------------------
    
    return {"detail": "Predicción de temporada guardada con éxito."}


@router.post("/finalize", status_code=status.HTTP_200_OK)
def finalize_season(resultados: schemas.ResultadoTemporada, db: Session = Depends(get_db)):
    # 1. Busca todas las predicciones para esa competición
    predicciones = db.query(models.PrediccionTemporada).filter(
        models.PrediccionTemporada.Competicion == resultados.Competicion
    ).all()

    if not predicciones:
        raise HTTPException(status_code=404, detail="No se encontraron predicciones para esta competición.")

    # 2. Itera sobre cada predicción, calcula los puntos y los suma al total del usuario
    for pred in predicciones:
        puntos_ganados = scoring.calcular_puntos_temporada(pred, resultados)
        
        usuario = db.query(models.Usuario).filter(models.Usuario.ID_Usuario == pred.ID_Usuario).first()
        if usuario:
            usuario.Puntuacion_Total += puntos_ganados
    
    db.commit()
    
    return {"detail": f"Puntos de la temporada para '{resultados.Competicion}' calculados y añadidos con éxito."}

@router.get("/{competition}", response_model=List[schemas.PrediccionTemporada])
def get_season_predictions(competition: str, db: Session = Depends(get_db)):
    results_from_db = (
        db.query(models.PrediccionTemporada, models.Usuario.Alias)
        .join(models.Usuario, models.PrediccionTemporada.ID_Usuario == models.Usuario.ID_Usuario)
        .filter(models.PrediccionTemporada.Competicion == competition)
        .all()
    )

    results = []
    for pred, alias in results_from_db:
        # Creamos un diccionario a partir del objeto de predicción
        pred_data = {c.name: getattr(pred, c.name) for c in pred.__table__.columns}
        pred_data["Alias"] = alias
        # Convertimos las cadenas de texto de vuelta a listas para la respuesta
        pred_data["Clasificados_UCL"] = pred.Clasificados_UCL.split(',')
        pred_data["Clasificados_EL"] = pred.Clasificados_EL.split(',')
        pred_data["Descensos"] = pred.Descensos.split(',')
        results.append(pred_data)

    return results