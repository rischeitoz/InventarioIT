'use client';

import React, { useState } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  X,
  Server,
  FileCode,
  Terminal,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

export function IisConfigModal() {
  const { data, isIisModalOpen, setIsIisModalOpen, resetToDefault, restoreBackupData } = useInventory();
  const [activeTab, setActiveTab] = useState<'arquitectura' | 'webconfig' | 'powershell' | 'backup'>('arquitectura');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isIisModalOpen) return null;

  const webConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  HCP+ Inventario IT - Configuración para IIS en Windows Server
  Colocar este archivo en la raíz del sitio web: C:\\inetpub\\wwwroot\\inventario-it\\web.config
  Requiere: Módulo IIS URL Rewrite (o iisnode si se ejecuta en modo proceso)
-->
<configuration>
  <system.webServer>
    <!-- Configuración para Reverse Proxy / IIS Node hacia Next.js en puerto 3000 -->
    <rewrite>
      <rules>
        <rule name="NextJS Reverse Proxy" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <!-- No redirigir si el archivo estático existe físicamente en el disco -->
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>

    <!-- Seguridad y tipos MIME para archivos JSON y PDF -->
    <staticContent>
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".pdf" />
      <mimeMap fileExtension=".pdf" mimeType="application/pdf" />
    </staticContent>

    <!-- Cabeceras de seguridad HTTP estándar -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>`;

  const powershellScript = `# ==============================================================================
# Script de Despliegue Automatizado para Windows Server e IIS
# App: HCP+ Inventario IT (Sin Base de Datos)
# ==============================================================================

# 1. Asegurar ejecución como Administrador
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Por favor ejecute PowerShell como Administrador."
    Exit
}

Write-Host "=== Instalando rol de IIS en Windows Server ===" -ForegroundColor Cyan
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# 2. Definir ruta de instalación
$SitePath = "C:\\inetpub\\wwwroot\\inventario-it"
$DataPath = "$SitePath\\data"

if (-not (Test-Path $SitePath)) {
    New-Item -ItemType Directory -Path $SitePath -Force
}
if (-not (Test-Path $DataPath)) {
    New-Item -ItemType Directory -Path $DataPath -Force
}

# 3. Otorgar permisos NTFS a IIS_IUSRS sobre la carpeta data (vital para guardar sin BD)
Write-Host "=== Asignando permisos NTFS a IIS_IUSRS sobre $DataPath ===" -ForegroundColor Cyan
$Acl = Get-Acl $DataPath
$Rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Acl.SetAccessRule($Rule)
Set-Acl $DataPath $Acl

# 4. Crear sitio en IIS o enlace
Write-Host "=== Creando aplicación en IIS ===" -ForegroundColor Cyan
Import-Module WebAdministration
if (-not (Get-Website -Name "HCP_InventarioIT" -ErrorAction SilentlyContinue)) {
    New-Website -Name "HCP_InventarioIT" -Port 80 -PhysicalPath $SitePath -ApplicationPool "DefaultAppPool"
    Write-Host "Sitio 'HCP_InventarioIT' creado en puerto 80" -ForegroundColor Green
} else {
    Write-Host "El sitio ya existe en IIS." -ForegroundColor Yellow
}

Write-Host "=== Despliegue completado con éxito. Sin dependencia de SQL Server ===" -ForegroundColor Green
`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(webConfigXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWebConfig = () => {
    const blob = new Blob([webConfigXml], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web.config';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPowerShell = () => {
    const blob = new Blob([powershellScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install-iis.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_backup_hcp_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const ok = await restoreBackupData(parsed);
          if (ok) {
            setFeedback('Copia de seguridad restaurada correctamente.');
          } else {
            setFeedback('Error: el archivo no tiene la estructura de inventario esperada.');
          }
        } catch (err) {
          setFeedback('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = async () => {
    if (confirm('¿Restablecer todo el inventario a los datos de ejemplo del PDF?')) {
      await resetToDefault();
      setFeedback('Datos restablecidos a los valores originales del PDF.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-zinc-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-none animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#d8fa18] text-black p-1.5">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Entorno Windows Server & Servidor IIS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-[#d8fa18] border border-zinc-700">
                  Sin Base de Datos
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Guía técnica, archivos de configuración web.config y gestión de persistencia en disco local.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsIisModalOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('arquitectura')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'arquitectura'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Arquitectura Sin BD
          </button>
          <button
            onClick={() => setActiveTab('webconfig')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'webconfig'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Archivo web.config
          </button>
          <button
            onClick={() => setActiveTab('powershell')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'powershell'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Script PowerShell
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Copia de Seguridad & Restauración
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-zinc-700">
          {feedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 rounded-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{feedback}</span>
            </div>
          )}

          {activeTab === 'arquitectura' && (
            <div className="space-y-4">
              <div className="bg-[#d8fa18]/15 border border-[#d8fa18] p-4 text-black">
                <h3 className="font-bold text-sm mb-1">
                  ¿Cómo funciona esta app en Windows Server e IIS sin base de datos?
                </h3>
                <p className="leading-relaxed">
                  A diferencia de aplicaciones que obligan a instalar SQL Server, MySQL o PostgreSQL, esta aplicación está especialmente diseñada para funcionar en <strong>sistemas de archivos locales (flat-file)</strong>. Toda la persistencia de datos (portátiles, sobremesas, periféricos e historial) se almacena en el archivo:
                </p>
                <div className="font-mono bg-white p-2 border border-black/20 mt-2 font-bold text-xs">
                  C:\inetpub\wwwroot\inventario-it\data\inventario-data.json
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="border border-zinc-200 p-4 bg-zinc-50">
                  <div className="font-bold text-black mb-1 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-black" />
                    1. Permisos NTFS
                  </div>
                  <p className="text-zinc-600">
                    Solo es necesario dar permisos de lectura/escritura al grupo <strong className="font-mono text-black">IIS_IUSRS</strong> sobre la carpeta <code className="font-mono">/data</code>.
                  </p>
                </div>

                <div className="border border-zinc-200 p-4 bg-zinc-50">
                  <div className="font-bold text-black mb-1 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-black" />
                    2. Despliegue en IIS
                  </div>
                  <p className="text-zinc-600">
                    Puede servirse mediante <strong>IIS URL Rewrite</strong> como proxy inverso a Node.js (modo standalone) o mediante <strong>iisnode</strong>.
                  </p>
                </div>

                <div className="border border-zinc-200 p-4 bg-zinc-50">
                  <div className="font-bold text-black mb-1 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-black" />
                    3. Copia de Seguridad Fácil
                  </div>
                  <p className="text-zinc-600">
                    Para hacer un backup, simplemente basta con copiar el archivo JSON o usar la herramienta de exportación en un clic.
                  </p>
                </div>
              </div>

              <div className="border border-zinc-200 p-4">
                <h4 className="font-bold text-black mb-2">Comprobación de Estado Actual:</h4>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>• Total Portátiles en memoria/disco: <span className="font-bold">{data.portatiles.length}</span></div>
                  <div>• Total Sobremesas en memoria/disco: <span className="font-bold">{data.sobremesas.length}</span></div>
                  <div>• Total Periféricos registrados: <span className="font-bold">{data.perifericos.length}</span></div>
                  <div>• Registro de movimientos auditados: <span className="font-bold">{data.movements.length} eventos</span></div>
                  <div>• Última sincronización: <span className="font-bold text-zinc-500">{data.lastUpdated}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webconfig' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-zinc-600">
                  Archivo <span className="font-mono font-bold text-black">web.config</span> preconfigurado para IIS con reglas de redirección limpia y soporte para archivos JSON y PDF.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyConfig}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold border border-zinc-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar XML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadWebConfig}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar web.config</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto border border-zinc-800 leading-relaxed max-h-[350px]">
                {webConfigXml}
              </pre>
            </div>
          )}

          {activeTab === 'powershell' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-zinc-600">
                  Script de PowerShell para configurar automáticamente el sitio web en IIS y aplicar los permisos de escritura en la carpeta de datos.
                </p>

                <button
                  onClick={handleDownloadPowerShell}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar install-iis.ps1</span>
                </button>
              </div>

              <pre className="p-4 bg-zinc-900 text-[#d8fa18] font-mono text-[11px] overflow-x-auto border border-zinc-800 leading-relaxed max-h-[350px]">
                {powershellScript}
              </pre>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Download Backup */}
                <div className="border border-zinc-200 p-5 bg-zinc-50 space-y-3">
                  <h4 className="font-bold text-black text-sm flex items-center gap-2">
                    <Download className="w-4 h-4 text-black" />
                    Exportar Copia de Seguridad JSON
                  </h4>
                  <p className="text-zinc-600 text-xs">
                    Descarga un archivo JSON con todos los portátiles, sobremesas, periféricos y el historial completo.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 bg-black text-[#d8fa18] font-bold text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar inventario_backup.json
                  </button>
                </div>

                {/* Restore Backup */}
                <div className="border border-zinc-200 p-5 bg-zinc-50 space-y-3">
                  <h4 className="font-bold text-black text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-black" />
                    Restaurar desde archivo JSON
                  </h4>
                  <p className="text-zinc-600 text-xs">
                    Carga un archivo de respaldo previo para restaurar el estado del inventario en Windows Server.
                  </p>
                  <label className="w-full py-2.5 bg-white border border-zinc-400 text-zinc-800 font-bold text-xs hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Seleccionar archivo .json
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileRestore}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="border-t border-zinc-200 pt-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">Restablecer datos iniciales del PDF</div>
                  <div className="text-zinc-500">
                    Vuelve a cargar los datos exactos del informe (48 portátiles, 12 sobremesas, 100 periféricos).
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restablecer Demo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-100 px-6 py-3 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono">
            HCP+ IT INVENTORY · WINDOWS SERVER IIS COMPLIANT
          </span>
          <button
            onClick={() => setIsIisModalOpen(false)}
            className="px-5 py-1.5 bg-black text-white text-xs font-semibold hover:bg-zinc-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
