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
    "Champions League": True
}

# ========================================================================
# ENDPOINT PARA ENVIAR PREDICCIONES DE LALIGA
# ========================================================================
@router.post("/liga", status_code=status.HTTP_201_CREATED)
def create_liga_prediction(prediction: schemas.PrediccionTemporadaCreate, db: Session = Depends(get_db)):
    if not PREDICCIONES_ABIERTAS.get("LaLiga", False):
        raise HTTPException(status_code=400, detail="Las predicciones para LaLiga están cerradas.")
    
    user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == prediction.Nombre_Usuario_Discord).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    existing = db.query(models.PrediccionTemporada).filter_by(ID_Usuario=user.ID_Usuario, Competicion="LaLiga").first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya has enviado una predicción para LaLiga.")

    db_prediction = models.PrediccionTemporada(
        ID_Usuario=user.ID_Usuario,
        Competicion="LaLiga",
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
    db.add(db_prediction)
    db.commit()
    return {"detail": "Predicción de LaLiga guardada con éxito."}


# ========================================================================
# ENDPOINT PARA FINALIZAR LALIGA
# ========================================================================
@router.post("/liga/finalize", status_code=status.HTTP_200_OK)
def finalize_liga_season(resultados: schemas.ResultadoTemporada, db: Session = Depends(get_db)):
    predicciones = db.query(models.PrediccionTemporada).filter_by(Competicion="LaLiga").all()
    if not predicciones:
        raise HTTPException(status_code=404, detail="No se encontraron predicciones para LaLiga.")

    for pred in predicciones:
        puntos_ganados = scoring.calcular_puntos_temporada(pred, resultados)
        usuario = db.query(models.Usuario).filter_by(ID_Usuario=pred.ID_Usuario).first()
        if usuario:
            usuario.Puntuacion_Total += puntos_ganados
    
    db.commit()
    return {"detail": "Puntos de LaLiga calculados y añadidos con éxito."}


# ========================================================================
# ENDPOINT PARA ENVIAR PREDICCIONES DE CHAMPIONS
# ========================================================================
@router.post("/champions", status_code=status.HTTP_201_CREATED)
def create_champions_prediction(prediction: schemas.PrediccionChampionsCreate, db: Session = Depends(get_db)):
    if not PREDICCIONES_ABIERTAS.get("Champions League", False):
        raise HTTPException(status_code=400, detail="Las predicciones para la Champions League están cerradas.")
    
    user = db.query(models.Usuario).filter(models.Usuario.Nombre_Usuario_Discord == prediction.Nombre_Usuario_Discord).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    existing = db.query(models.PrediccionTemporada).filter_by(ID_Usuario=user.ID_Usuario, Competicion="Champions League").first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya has enviado una predicción para la Champions League.")

    db_prediction = models.PrediccionTemporada(
        ID_Usuario=user.ID_Usuario,
        Competicion="Champions League",
        Campeon=prediction.Campeon,
        Pichichi=prediction.Pichichi,
        Max_Asistente=prediction.Max_Asistente,
        MVP=prediction.MVP
    )
    db.add(db_prediction)
    db.commit()
    return {"detail": "Predicción de Champions guardada con éxito."}


# ========================================================================
# ENDPOINT PARA FINALIZAR CHAMPIONS
# ========================================================================
@router.post("/champions/finalize", status_code=status.HTTP_200_OK)
def finalize_champions_season(resultados: schemas.ResultadoChampions, db: Session = Depends(get_db)):
    predicciones = db.query(models.PrediccionTemporada).filter_by(Competicion="Champions League").all()
    if not predicciones:
        raise HTTPException(status_code=404, detail="No se encontraron predicciones para la Champions.")

    for pred in predicciones:
        puntos_ganados = scoring.calcular_puntos_champions(pred, resultados)
        usuario = db.query(models.Usuario).filter_by(ID_Usuario=pred.ID_Usuario).first()
        if usuario:
            usuario.Puntuacion_Total += puntos_ganados
    
    db.commit()
    return {"detail": "Puntos de la Champions League calculados y añadidos con éxito."}


# ========================================================================
# ENDPOINT DE CONSULTA (PARA EL PANEL DE ADMIN)
# ========================================================================
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
        pred_data = {c.name: getattr(pred, c.name) for c in pred.__table__.columns}
        pred_data["Alias"] = alias

        # --- LÓGICA CORREGIDA ---
        # Si un campo de lista está vacío, lo convertimos en una lista vacía
        pred_data["Clasificados_UCL"] = pred.Clasificados_UCL.split(',') if pred.Clasificados_UCL else []
        pred_data["Clasificados_EL"] = pred.Clasificados_EL.split(',') if pred.Clasificados_EL else []
        pred_data["Descensos"] = pred.Descensos.split(',') if pred.Descensos else []

        # Si un campo de texto está vacío, lo convertimos en un string vacío
        pred_data["Clasificado_Conference"] = pred.Clasificado_Conference or ""
        pred_data["Zamora"] = pred.Zamora or ""
        pred_data["Zarra"] = pred.Zarra or ""
        # --------------------------

        results.append(pred_data)

    return results