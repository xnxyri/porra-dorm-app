import os
from dotenv import load_dotenv

# Esta línea es para que funcione en tu ordenador local (lee el archivo .env)
load_dotenv()

# Render usará la variable de entorno que acabamos de crear.
# Si no la encuentra, usará "admin" como contraseña por defecto para tu PC.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")