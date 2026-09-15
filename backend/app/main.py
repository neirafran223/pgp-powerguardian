from app.schemas.usuario import UsuarioResponse
from fastapi import FastAPI, Depends
from app.routers import auth
from app.core.security import get_current_user
from app.schemas.usuario import UsuarioResponse
from app.routers import equipos
from app.routers import parametros


app = FastAPI(
    title="PowerGuardian Pro API",
    version="0.1.0",
    description="Sistema de monitoreo y diagnostico de calidad de energia electrica"
)

app.include_router(auth.router)
app.include_router(equipos.router)
app.include_router(parametros.router)


@app.get("/health")
def health_check():
    return{"status": "ok", "version": "0.1.0"}


@app.get("/me", response_model=UsuarioResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user
