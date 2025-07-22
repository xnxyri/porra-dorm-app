from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..services import scoring

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)

@router.get("/", response_model=List[schemas.Partido])
def get_matches(estado: Optional[str] = None, sort_order: str = "desc", db: Session = Depends(get_db)):
    query = db.query(models.Partido)
    if estado:
        query = query.filter(models.Partido.Estado == estado)

    # Lógica de ordenación
    if sort_order == "asc":
        # Orden ascendente (del más antiguo/próximo al más lejano)
        matches = query.order_by(models.Partido.Fecha_Hora_Partido.asc()).all()
    else:
        # Orden descendente (del más reciente al más antiguo)
        matches = query.order_by(models.Partido.Fecha_Hora_Partido.desc()).all()

    return matches

@router.post("/", response_model=schemas.Partido)
def create_match(match: schemas.PartidoCreate, db: Session = Depends(get_db)):
    db_match = models.Partido(
        Equipo_Local=match.Equipo_Local,
        Equipo_Visitante=match.Equipo_Visitante,
        Jornada_Numero=match.Jornada_Numero,
        Competicion=match.Competicion,
        Fecha_Hora_Partido=match.Fecha_Hora_Partido,
        Es_Partidazo=match.Es_Partidazo,
        Estado="Por jugar"
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/{match_id}", response_model=schemas.Partido)
def get_match(match_id: int, db: Session = Depends(get_db)):
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return db_match

# --- ESTA ES LA FUNCIÓN QUE FALTABA ---
@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(match_id: int, db: Session = Depends(get_db)):
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    has_predictions = db.query(models.Prediccion).filter(models.Prediccion.ID_Partido == match_id).first()
    if has_predictions:
        raise HTTPException(
            status_code=400,
            detail="No se puede borrar el partido porque ya tiene predicciones asociadas."
        )

    db.delete(db_match)
    db.commit()
    return {"ok": True}
# -----------------------------------------

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
        puntos_base, acierto_1x2 = scoring.calcular_puntos(pred, db_match)
        pred.Puntos_Obtenidos = puntos_base
        pred.Acertado_1X2 = acierto_1x2

        usuario = db.query(models.Usuario).filter(models.Usuario.ID_Usuario == pred.ID_Usuario).first()
        puntos_racha = scoring.actualizar_racha_y_bonus(usuario, acierto_1x2, db_match.Jornada_Numero)
        pred.Puntos_Obtenidos += puntos_racha

        usuario.Puntuacion_Total += pred.Puntos_Obtenidos

    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/{match_id}/predictions", response_model=List[schemas.Prediccion])
def get_predictions_for_match(match_id: int, db: Session = Depends(get_db)):
    results_from_db = (
        db.query(models.Prediccion, models.Usuario.Alias, models.Usuario.Nombre_Usuario_Discord)
        .join(models.Usuario, models.Prediccion.ID_Usuario == models.Usuario.ID_Usuario)
        .filter(models.Prediccion.ID_Partido == match_id)
        .all()
    )

    # Unimos los datos para que coincidan con el esquema
    results = []
    for pred, alias, discord_name in results_from_db:
        # Creamos un diccionario a partir del objeto de predicción
        pred_data = {c.name: getattr(pred, c.name) for c in pred.__table__.columns}
        # Añadimos los datos del usuario que faltaban
        pred_data["Alias"] = alias
        pred_data["Nombre_Usuario_Discord"] = discord_name
        results.append(pred_data)

    return results

# --- FUNCIÓN NUEVA PARA CERRAR PREDICCIONES ---
@router.post("/{match_id}/close", response_model=schemas.Partido)
def close_predictions_for_match(match_id: int, db: Session = Depends(get_db)):
    db_match = db.query(models.Partido).filter(models.Partido.ID_Partido == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    if db_match.Estado != "Por jugar":
        raise HTTPException(status_code=400, detail="Solo se pueden cerrar partidos que están 'Por jugar'")

    db_match.Estado = "Cerrado"
    db.commit()
    db.refresh(db_match)
    return db_match