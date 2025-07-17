from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from .database import Base
Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
    ID_Usuario = Column(Integer, primary_key=True, index=True)
    Nombre_Usuario_Discord = Column(String, unique=True, index=True)
    Puntuacion_Total = Column(Integer, default=0)
    Win_Streak_Consecutivos = Column(Integer, default=0)
    Ultima_Jornada_Acertada_1X2 = Column(Integer, nullable=True)

class Partido(Base):
    __tablename__ = "partidos"
    ID_Partido = Column(Integer, primary_key=True, index=True)
    Equipo_Local = Column(String)
    Equipo_Visitante = Column(String)
    Fecha_Hora_Partido = Column(DateTime)
    Goles_Local = Column(Integer, nullable=True)
    Goles_Visitante = Column(Integer, nullable=True)
    Estado = Column(String, default='Por jugar') # 'Por jugar', 'Finalizado'
    Jornada_Numero = Column(Integer)
    Competicion = Column(String)
    Es_Partidazo = Column(Boolean, default=False)
    Goleador_Real = Column(String, nullable=True)
    MVP_Real = Column(String, nullable=True)

class Prediccion(Base):
    __tablename__ = "predicciones"
    ID_Prediccion = Column(Integer, primary_key=True, index=True)
    ID_Usuario = Column(Integer, ForeignKey("usuarios.ID_Usuario"))
    ID_Partido = Column(Integer, ForeignKey("partidos.ID_Partido"))
    Prediccion_Goles_Local = Column(Integer)
    Prediccion_Goles_Visitante = Column(Integer)
    Prediccion_Goleador = Column(String, nullable=True)
    Prediccion_MVP = Column(String, nullable=True)
    Booster_Activado = Column(Boolean, default=False)
    Puntos_Obtenidos = Column(Integer, default=0)
    Acertado_1X2 = Column(Boolean, default=False)
    Fecha_Prediccion = Column(DateTime)

class Meme(Base):
    __tablename__ = "memes"
    ID_Meme = Column(Integer, primary_key=True, index=True)
    URL_Imagen = Column(String, nullable=False)
    Descripcion = Column(String, nullable=True)