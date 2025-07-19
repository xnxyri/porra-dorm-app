from pydantic import BaseModel
from datetime import datetime

# --- ESQUEMAS DE USUARIO (sin cambios) ---
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

# --- ESQUEMAS DE PARTIDO (sin cambios) ---
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

# --- ESQUEMAS DE PREDICCIÓN (CON CAMBIOS) ---
# Este es el esquema para ENVIAR una predicción (sin cambios)
class PrediccionBase(BaseModel):
    ID_Partido: int
    Nombre_Usuario_Discord: str
    Prediccion_Goles_Local: int
    Prediccion_Goles_Visitante: int
    Prediccion_Goleador: str
    Prediccion_MVP: str
    Booster_Activado: bool = False

class PrediccionCreate(PrediccionBase):
    pass

# Este es el esquema para la RESPUESTA (CON CAMBIOS)
class Prediccion(BaseModel):
    ID_Prediccion: int
    ID_Partido: int
    ID_Usuario: int
    Nombre_Usuario_Discord: str
    Prediccion_Goles_Local: int
    Prediccion_Goles_Visitante: int
    Prediccion_Goleador: str
    Prediccion_MVP: str
    Booster_Activado: bool
    Puntos_Obtenidos: int

    class Config:
        from_attributes = True

class PartidoFinalizar(BaseModel):
    Goles_Local: int
    Goles_Visitante: int
    Goleador_Real: str
    MVP_Real: str

# --- ESQUEMAS PARA MEMES ---
class MemeBase(BaseModel):
    URL_Imagen: str
    Descripcion: str | None = None

class MemeCreate(MemeBase):
    pass

class Meme(MemeBase):
    ID_Meme: int

    class Config:
        from_attributes = True

class PrediccionUpdate(BaseModel):
    Prediccion_Goles_Local: int
    Prediccion_Goles_Visitante: int
    Prediccion_Goleador: str
    Prediccion_MVP: str