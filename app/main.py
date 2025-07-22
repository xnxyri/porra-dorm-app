from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .db import models
from .db.database import engine
from .routers import users, matches, predictions, admin, memes, leaderboard, season_predictions

# Crea todas las tablas en la base de datos al arrancar
models.Base.metadata.create_all(bind=engine)

# Inicia la aplicación FastAPI
app = FastAPI()

# Monta la carpeta 'static' para servir archivos CSS, JS, etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

# ========================================================================
# RUTAS QUE SIRVEN LAS PÁGINAS HTML
# ========================================================================

@app.get("/", response_class=FileResponse)
async def read_index():
    return FileResponse('static/index.html')

@app.get("/predicciones", response_class=FileResponse)
async def read_predictions_page():
    return FileResponse('static/predicciones.html')

@app.get("/resultados", response_class=FileResponse)
async def read_results_page():
    return FileResponse('static/resultados.html')

@app.get("/normas", response_class=FileResponse)
async def read_rules_page():
    return FileResponse('static/normas.html')
    
@app.get("/liga", response_class=FileResponse)
async def read_liga_page():
    return FileResponse('static/liga.html')

@app.get("/gestion-temporada", response_class=FileResponse)
async def read_season_management_page():
    return FileResponse('static/gestion-temporada.html')

@app.get("/admin", response_class=FileResponse)
async def read_admin_page():
    return FileResponse('static/admin.html')

# ========================================================================
# RUTAS DE LA API (los "routers")
# ========================================================================
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(admin.router)
app.include_router(memes.router)
app.include_router(leaderboard.router)
app.include_router(season_predictions.router)