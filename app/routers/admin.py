from fastapi import APIRouter, Request, Form, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from ..core.config import ADMIN_PASSWORD
import secrets # Para generar un token seguro

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

templates = Jinja2Templates(directory="static")

@router.get("/", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# --- NUEVA FUNCIÓN ---
@router.post("/token")
async def login_for_token(password: str = Form(...)):
    if not secrets.compare_digest(password, ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta",
        )
    # Si la contraseña es correcta, generamos un token simple
    # En el futuro, este token nos dará acceso al panel
    session_token = secrets.token_hex(16)
    return {"access_token": session_token, "token_type": "bearer"}