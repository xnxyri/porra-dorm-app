from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..services import scoring # <-- LÍNEA CORREGIDA

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)

@router.post("/", response_model=schemas.Partido)
def create_match(match: schemas.PartidoCreate, db: Session = Depends(get_db)):
    db_match = models.Partido(
        Equipo_Local=match.Equipo_Local,
        Equipo_Visitante=match.Equipo_Visitante,
        Jornada_Numero=match.Jornada_Numero,
        Competicion=match.Competicion, # <-- LÍNEA NUEVA
        Fecha_Hora_Partido=match.Fecha_Hora_Partido, # <-- LÍNEA MODIFICADA
        Es_Partidazo=match.Es_Partidazo # <-- LÍNEA NUEVA
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/", response_model=List[schemas.Partido])
def get_matches(db: Session = Depends(get_db)):
    matches = db.query(models.Partido).all()
    return matches

@router.post("/{match_id}/finalize", response_model=schemas.Partido)
def finalize_match(match_id: int, resultados: schemas.PartidoFinalizar, db: Session = Depends(get_db)):
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    db_match.Goles_Local = resultados.Goles_Local
    db_match.Goles_Visitante = resultados.Goles_Visitante
    db_match.Goleador_Real = resultados.Goleador_Real
    db_match.MVP_Real = resultados.MVP_Real
    db_match.Estado = "Finalizado"

    predicciones = db.query(models.Prediccion).filter(models.Prediccion.ID_Partido == match_id).all()

    for pred in predicciones:
        # Llama a nuestra calculadora de puntos (línea corregida)
        puntos_base, acierto_1x2 = scoring.calcular_puntos(pred, db_match)
        pred.Puntos_Obtenidos = puntos_base
        pred.Acertado_1X2 = acierto_1x2

        usuario = db.query(models.Usuario).filter(models.Usuario.ID_Usuario == pred.ID_Usuario).first()

        # Llama a nuestra calculadora de racha (línea corregida)
        puntos_racha = scoring.actualizar_racha_y_bonus(usuario, acierto_1x2, db_match.Jornada_Numero)
        pred.Puntos_Obtenidos += puntos_racha

        usuario.Puntuacion_Total += pred.Puntos_Obtenidos

    db.commit()
    db.refresh(db_match)
    return db_match