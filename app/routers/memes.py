from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/memes",
    tags=["Memes"]
)

@router.post("/", response_model=schemas.Meme)
def create_meme(meme: schemas.MemeCreate, db: Session = Depends(get_db)):
    db_meme = models.Meme(**meme.model_dump())
    db.add(db_meme)
    db.commit()
    db.refresh(db_meme)
    return db_meme

@router.get("/", response_model=List[schemas.Meme])
def get_memes(db: Session = Depends(get_db)):
    memes = db.query(models.Meme).all()
    return memes

# --- FUNCIÓN NUEVA ---
@router.delete("/{meme_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meme(meme_id: int, db: Session = Depends(get_db)):
    db_meme = db.query(models.Meme).filter(models.Meme.ID_Meme == meme_id).first()
    if not db_meme:
        raise HTTPException(status_code=404, detail="Meme no encontrado")
    db.delete(db_meme)
    db.commit()
    return {"ok": True}