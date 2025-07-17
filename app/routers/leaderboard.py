from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

@router.get("/monthly", response_model=List[schemas.Usuario])
def get_monthly_leaderboard(year: int, month: int, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Usuario,
            func.sum(models.Prediccion.Puntos_Obtenidos).label("monthly_score")
        )
        .join(models.Prediccion, models.Usuario.ID_Usuario == models.Prediccion.ID_Usuario)
        .join(models.Partido, models.Prediccion.ID_Partido == models.Partido.ID_Partido)
        .filter(extract('year', models.Partido.Fecha_Hora_Partido) == year)
        .filter(extract('month', models.Partido.Fecha_Hora_Partido) == month)
        .group_by(models.Usuario.ID_Usuario)
        .order_by(func.sum(models.Prediccion.Puntos_Obtenidos).desc())
        .all()
    )

    monthly_leaderboard = []
    for usuario, score in results:
        usuario.Puntuacion_Total = score if score is not None else 0
        monthly_leaderboard.append(usuario)

    return monthly_leaderboard