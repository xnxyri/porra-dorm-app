from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .db import models
from .db.database import engine
from .routers import users, matches, predictions, admin, memes, leaderboard 

# Crea las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

# Inicia la aplicación FastAPI
app = FastAPI()

# Monta la carpeta 'static' para servir archivos CSS, JS, etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- RUTAS DE PÁGINAS HTML ---

# Ruta para la página principal
@app.get("/", response_class=FileResponse)
async def read_index():
    return FileResponse('static/index.html')

# Ruta para la nueva página de predicciones
@app.get("/predicciones", response_class=FileResponse)
async def read_predictions_page():
    return FileResponse('static/predicciones.html')

@app.get("/resultados", response_class=FileResponse)
async def read_results_page():
    return FileResponse('static/resultados.html')

@app.get("/normas", response_class=FileResponse)
async def read_rules_page():
    return FileResponse('static/normas.html')

# Ruta para la página de admin (la creamos pero no la hemos enlazado aún)
@app.get("/admin", response_class=FileResponse)
async def read_admin_page():
    return FileResponse('static/admin.html')


# --- RUTAS DE LA API ---
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(admin.router)
app.include_router(memes.router)
app.include_router(leaderboard.router)