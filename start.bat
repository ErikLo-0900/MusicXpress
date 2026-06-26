@echo off
title Arrancando MusicXpress...
echo ====================================================
echo           INICIANDO SERVIDOR MUSICXPRESS
echo ====================================================
echo.

:: Verificar si node_modules existe
if not exist node_modules (
    echo [INFO] La carpeta node_modules no existe. Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Hubo un error al instalar las dependencias. Asegurate de tener Node.js instalado.
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Iniciando el servidor de desarrollo y abriendo el navegador...
echo [INFO] Presiona Ctrl+C en esta ventana para apagar el servidor cuando termines.
echo.

:: Iniciar Vite y abrir el navegador automáticamente
call npm run dev -- --open

if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al iniciar el servidor de desarrollo.
    pause
)
