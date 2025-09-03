from pydantic import BaseModel
from typing import List
from datetime import datetime

# ========================================================================
# ESQUEMAS PARA USUARIOS
# ========================================================================
class UsuarioBase(BaseModel):
    Alias: str
    Nombre_Usuario_Discord: str

class UsuarioCreate(UsuarioBase):
    pass

class Usuario(UsuarioBase):
    ID_Usuario: int
    Puntuacion_Total: int
    Win_Streak_Consecutivos: int

    class Config:
        from_attributes = True

# ========================================================================
# ESQUEMAS PARA PARTIDOS
# ========================================================================
class PartidoBase(BaseModel):
    Equipo_Local: str
    Equipo_Visitante: str
    Jornada_Numero: int
    Competicion: str
    Fecha_Hora_Partido: datetime

class PartidoCreate(PartidoBase):
    Es_Partidazo: bool = False

class Partido(PartidoBase):
    ID_Partido: int
    Estado: str
    Es_Partidazo: bool

    class Config:
        from_attributes = True
        
class PartidoFinalizar(BaseModel):
    Goles_Local: int
    Goles_Visitante: int
    Goleador_Real: str
    MVP_Real: str

# ========================================================================
# ESQUEMAS PARA PREDICCIONES POR PARTIDO
# ========================================================================
class PrediccionBase(BaseModel):
    ID_Partido: int
    Prediccion_Goles_Local: int
    Prediccion_Goles_Visitante: int
    Prediccion_Goleador: str
    Prediccion_MVP: str
    Booster_Activado: bool = False

class PrediccionCreate(PrediccionBase):
    Nombre_Usuario_Discord: str

class Prediccion(PrediccionBase):
    ID_Prediccion: int
    ID_Usuario: int
    Puntos_Obtenidos: int
    Alias: str
    Nombre_Usuario_Discord: str
    
    class Config:
        from_attributes = True
        
class PrediccionUpdate(BaseModel):
    Prediccion_Goles_Local: int
    Prediccion_Goles_Visitante: int
    Prediccion_Goleador: str
    Prediccion_MVP: str

# ========================================================================
# ESQUEMAS PARA MEMES
# ========================================================================
class MemeBase(BaseModel):
    URL_Imagen: str
    Descripcion: str | None = None

class MemeCreate(MemeBase):
    pass

class Meme(MemeBase):
    ID_Meme: int

    class Config:
        from_attributes = True

# ========================================================================
# ESQUEMAS PARA PREDICCIONES DE TEMPORADA
# ========================================================================
class PrediccionTemporadaBase(BaseModel):
    Competicion: str
    Campeon: str
    Clasificados_UCL: List[str]
    Clasificados_EL: List[str]
    Clasificado_Conference: str
    Descensos: List[str]
    Pichichi: str
    Max_Asistente: str
    Zamora: str
    Zarra: str
    MVP: str | None = None

class PrediccionTemporadaCreate(PrediccionTemporadaBase):
    Nombre_Usuario_Discord: str

class PrediccionTemporada(PrediccionTemporadaBase):
    ID_Prediccion_Temporada: int
    ID_Usuario: int
    Alias: str

    class Config:
        from_attributes = True

class ResultadoTemporada(BaseModel):
    Competicion: str
    Campeon: str
    Clasificados_UCL: List[str]
    Clasificados_EL: List[str]
    Clasificado_Conference: str
    Descensos: List[str]
    Pichichi: str
    Max_Asistente: str
    Zamora: str
    Zarra: str
    MVP: str | None = None

# --- ESQUEMAS PARA PREDICCIONES DE CHAMPIONS ---
class PrediccionChampionsBase(BaseModel):
    Competicion: str = "Champions League"
    Campeon: str
    Pichichi: str
    Max_Asistente: str
    MVP: str

class PrediccionChampionsCreate(PrediccionChampionsBase):
    Nombre_Usuario_Discord: str

# Reutilizamos el esquema de ResultadoTemporada pero lo usaremos para Champions
class ResultadoChampions(BaseModel):
    Competicion: str
    Campeon: str
    Pichichi: str
    Max_Asistente: str
    MVP: str