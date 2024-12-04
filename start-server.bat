@echo off
chcp 65001 >nul

:: Установить задержку в 5 секунд
timeout /t 5 /nobreak >nul

:: Перейти в директорию с сервером
cd /d "C:\web\chat-bot-telegram"

:: Автоматический запуск сервера, если он ещё не запущен
tasklist /FI "IMAGENAME eq node.exe" | find "node.exe" >nul && (
    echo Сервер уже работает.
) || (
    echo Запуск сервера...
    start "" "C:\Program Files\nodejs\node.exe" src/server.js
    echo Сервер запущен.
    timeout /t 2 >nul
)

:menu
cls
echo ============================
echo Управление сервером
echo ============================
echo 1. Запустить сервер
echo 2. Проверить статус сервера
echo 3. Перезапустить сервер
echo 4. Остановить сервер
echo 5. Выйти
echo ============================
set /p choice=Введите номер действия:

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto check_status
if "%choice%"=="3" goto restart_server
if "%choice%"=="4" goto stop_server
if "%choice%"=="5" goto exit

:: Если введённое значение некорректное, вернуться в меню
echo Некорректный ввод. Попробуйте снова.
pause
goto menu

:start_server
:: Проверка, работает ли сервер
tasklist /FI "IMAGENAME eq node.exe" | find "node.exe" >nul && (
    echo Сервер уже запущен. Запуск невозможен.
    pause
    goto menu
) || (
    echo Запуск сервера...
    start "" "C:\Program Files\nodejs\node.exe" src/server.js
    echo Сервер запущен.
    pause
    goto menu
)

:check_status
echo Проверка статуса сервера...
tasklist /FI "IMAGENAME eq node.exe" | find "node.exe" >nul && (
    echo Сервер работает.
) || (
    echo Сервер не запущен.
)
pause
goto menu

:restart_server
echo Перезапуск сервера...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul
start "" "C:\Program Files\nodejs\node.exe" src/server.js
echo Сервер перезапущен.
pause
goto menu

:stop_server
echo Остановка сервера...
taskkill /IM node.exe /F >nul 2>&1
echo Сервер остановлен.
pause
goto menu

:exit
exit
