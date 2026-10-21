# ==============================================================================
# Script de Despliegue Automatizado para Windows Server e IIS
# App: HCP+ Inventario IT (Sin Base de Datos)
# ==============================================================================

param(
    [string]$SitePath = "C:\inetpub\wwwroot\inventario-it",
    [int]$Port = 80,
    [string]$SiteName = "HCP_InventarioIT"
)

# 1. Asegurar elevación de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Por favor ejecute PowerShell como Administrador para configurar IIS."
    Exit
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Instalación y Configuración de HCP+ Inventario IT en IIS" -ForegroundColor Cyan
Write-Host "   Modo: Sin Base de Datos Externa (Flat-File JSON)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 2. Instalar rol IIS si no estuviese presente
Write-Host "`n[1/4] Verificando rol Web-Server (IIS)..." -ForegroundColor Yellow
if (-not (Get-WindowsFeature -Name Web-Server).Installed) {
    Install-WindowsFeature -name Web-Server -IncludeManagementTools
    Write-Host "Rol IIS instalado." -ForegroundColor Green
} else {
    Write-Host "Rol IIS ya instalado." -ForegroundColor Green
}

# 3. Crear directorios
Write-Host "`n[2/4] Preparando directorios en disco..." -ForegroundColor Yellow
$DataPath = Join-Path $SitePath "data"
New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
Write-Host "Directorio raíz: $SitePath" -ForegroundColor White
Write-Host "Directorio datos: $DataPath" -ForegroundColor White

# 4. Asignar permisos NTFS a IIS_IUSRS (imprescindible para persistencia JSON sin base de datos)
Write-Host "`n[3/4] Asignando permisos NTFS de escritura a IIS_IUSRS sobre $DataPath..." -ForegroundColor Yellow
$Acl = Get-Acl $DataPath
$Rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Acl.SetAccessRule($Rule)
Set-Acl $DataPath $Acl
Write-Host "Permisos de escritura otorgados correctamente a IIS_IUSRS." -ForegroundColor Green

# 5. Crear sitio en IIS
Write-Host "`n[4/4] Configurando Sitio Web en IIS..." -ForegroundColor Yellow
Import-Module WebAdministration
if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
    New-Website -Name $SiteName -Port $Port -PhysicalPath $SitePath -ApplicationPool "DefaultAppPool"
    Write-Host "Sitio Web '$SiteName' creado en el puerto $Port." -ForegroundColor Green
} else {
    Write-Host "El sitio '$SiteName' ya existe en IIS." -ForegroundColor White
}

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "   ¡Despliegue configurado con éxito!" -ForegroundColor Green
Write-Host "   Los datos se almacenan en: $DataPath\inventario-data.json" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
