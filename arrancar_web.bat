@echo off
echo =======================================================
echo Iniciando el Servidor de ClinicAI Growth...
echo =======================================================
echo.
echo 1. Abriendo tu navegador en http://localhost:8000
start http://localhost:8000
echo.
echo 2. Manteniendo el servidor activo. (No cierres esta ventana negra)
echo.
python -m http.server 8000
if %errorlevel% neq 0 (
    echo.
    echo Python fallo. Intentando con Node (http-server)...
    npx --yes http-server ./ -p 8000 -c-1
)
echo.
pause
