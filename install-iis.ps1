# ==============================================================================
# Script de Despliegue Automatizado para Windows Server e IIS
# Aplicación: HCP+ Inventario IT
# Subruta en IIS: http://<tu-servidor>/Inventario IT/
# ==============================================================================

param(
    [string]$SiteName = "Default Web Site",
    [string]$AppName = "Inventario IT",
    [string]$AppPoolName = "InventarioITPool",
    [string]$InstallPath = "C:\inetpub\wwwroot\Inventario IT",
    [int]$NodePort = 3000
)

# 1. Comprobación de privilegios de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Por favor ejecute PowerShell como Administrador para configurar IIS."
    Exit
}

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   Instalación de HCP+ Inventario IT en IIS (Subruta: /$AppName)" -ForegroundColor Cyan
Write-Host "   Arquitectura: Sin Base de Datos Externa (Flat-File JSON)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# 2. Verificar e instalar rol Web-Server (IIS) si no está instalado
Write-Host "`n[1/6] Verificando rol de IIS en Windows Server..." -ForegroundColor Yellow
if (-not (Get-WindowsFeature -Name Web-Server).Installed) {
    Write-Host "Instalando IIS..." -ForegroundColor Yellow
    Install-WindowsFeature -Name Web-Server, Web-Mgmt-Tools, Web-Scripting-Tools -IncludeManagementTools | Out-Null
    Write-Host "IIS instalado correctamente." -ForegroundColor Green
} else {
    Write-Host "IIS ya está presente en el servidor." -ForegroundColor Green
}

# 3. Preparar directorios físicos
Write-Host "`n[2/6] Creando directorios en disco..." -ForegroundColor Yellow
$DataPath = Join-Path $InstallPath "data"
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
Write-Host "Directorio de la app: $InstallPath" -ForegroundColor White
Write-Host "Directorio de base de datos JSON: $DataPath" -ForegroundColor White

# 4. Crear o configurar Application Pool dedicado en IIS
Write-Host "`n[3/6] Configurando Application Pool ($AppPoolName)..." -ForegroundColor Yellow
Import-Module WebAdministration
if (-not (Test-Path "IIS:\AppPools\$AppPoolName")) {
    $pool = New-Item "IIS:\AppPools\$AppPoolName"
    $pool.managedRuntimeVersion = "" # Sin código administrado (.NET no requerido para Node.js)
    $pool.autoStart = $true
    $pool | Set-Item
    Write-Host "Application Pool '$AppPoolName' creado (No Managed Code)." -ForegroundColor Green
} else {
    Write-Host "Application Pool '$AppPoolName' ya existía." -ForegroundColor White
}

# 5. Crear la aplicación bajo Default Web Site (Subruta /Inventario IT)
Write-Host "`n[4/6] Registrando aplicación en IIS como subruta '/$AppName'..." -ForegroundColor Yellow
$appPath = "IIS:\Sites\$SiteName\$AppName"
if (-not (Test-Path $appPath)) {
    New-WebApplication -Site $SiteName -Name $AppName -PhysicalPath $InstallPath -ApplicationPool $AppPoolName | Out-Null
    Write-Host "Subruta '/$AppName' creada exitosamente bajo '$SiteName'." -ForegroundColor Green
} else {
    Set-ItemProperty $appPath -name physicalPath -value $InstallPath
    Set-ItemProperty $appPath -name applicationPool -value $AppPoolName
    Write-Host "Subruta '/$AppName' actualizada con la ruta física y pool correctos." -ForegroundColor Green
}

# 6. Asignar permisos NTFS de escritura (Crucial para guardar sin base de datos)
Write-Host "`n[5/6] Asignando permisos NTFS de escritura a la carpeta 'data'..." -ForegroundColor Yellow
$Acl = Get-Acl $DataPath
$Rule1 = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("IUSR", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Rule3 = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS AppPool\$AppPoolName", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Acl.SetAccessRule($Rule1)
$Acl.SetAccessRule($Rule2)
$Acl.SetAccessRule($Rule3)
Set-Acl $DataPath $Acl
Write-Host "Permisos de escritura asignados a IIS_IUSRS, IUSR y $AppPoolName." -ForegroundColor Green

# 7. Habilitar Proxy en Application Request Routing (ARR) si está instalado
Write-Host "`n[6/6] Verificando Application Request Routing (ARR)..." -ForegroundColor Yellow
try {
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True" -ErrorAction SilentlyContinue
    Write-Host "Proxy ARR habilitado para permitir reescritura hacia Node.js." -ForegroundColor Green
} catch {
    Write-Host "Nota: Si utiliza proxy inverso, asegúrese de tener instalado el módulo 'Application Request Routing (ARR)' en IIS y habilitar el Proxy en IIS Manager." -ForegroundColor Yellow
}

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host "   ¡Configuración de IIS completada con éxito!" -ForegroundColor Green
Write-Host "   Acceso URL: http://localhost/$AppName/" -ForegroundColor Green
Write-Host "   Persistencia: $DataPath\inventario-data.json" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
