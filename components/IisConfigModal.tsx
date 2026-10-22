'use client';

import React, { useState } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  FileJson,
} from 'lucide-react';

export function IisConfigModal() {
  const { data, isIisModalOpen, setIsIisModalOpen, resetToDefault, restoreBackupData } = useInventory();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isIisModalOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setFeedback('Copia de seguridad descargada correctamente.');
    setTimeout(() => setFeedback(null), 3000);
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
            setFeedback('Copia de seguridad restaurada correctamente en el sistema.');
          } else {
            setFeedback('Error: el archivo no tiene la estructura de inventario esperada.');
          }
        } catch {
          setFeedback('Error al procesar el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = async () => {
    if (confirm('¿Restablecer todo el inventario a los datos iniciales?')) {
      await resetToDefault();
      setFeedback('Inventario restablecido a los valores iniciales.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-300 w-full max-w-xl flex flex-col shadow-2xl rounded-none animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#d8fa18] text-black p-1.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Copia de Seguridad y Datos (JSON)</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Gestión de respaldos y restauración del archivo local de inventario.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-zinc-700">
          {feedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 rounded-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{feedback}</span>
            </div>
          )}

          {/* Current Status Box */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-zinc-600" />
                Estado del Archivo Local en Servidor
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#d8fa18] text-black font-bold">
                Sin Base de Datos
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-zinc-700">
              <div className="bg-white p-2 border border-zinc-200">
                <span className="text-[9px] text-zinc-400 block font-sans">PORTÁTILES</span>
                <span className="font-bold text-black">{data.portatiles.length}</span>
              </div>
              <div className="bg-white p-2 border border-zinc-200">
                <span className="text-[9px] text-zinc-400 block font-sans">SOBREMESAS</span>
                <span className="font-bold text-black">{data.sobremesas.length}</span>
              </div>
              <div className="bg-white p-2 border border-zinc-200">
                <span className="text-[9px] text-zinc-400 block font-sans">PERIFÉRICOS</span>
                <span className="font-bold text-black">{data.perifericos.length}</span>
              </div>
              <div className="bg-white p-2 border border-zinc-200">
                <span className="text-[9px] text-zinc-400 block font-sans">MOVIMIENTOS</span>
                <span className="font-bold text-black">{data.movements.length}</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="border border-zinc-200 p-4 bg-white flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-black text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-black" />
                  Descargar Copia de Seguridad
                </h4>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  Descarga un archivo JSON completo con todos los equipos, periféricos y registros de auditoría.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 bg-black text-[#d8fa18] font-bold text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar JSON
              </button>
            </div>

            {/* Restore Backup */}
            <div className="border border-zinc-200 p-4 bg-white flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-black text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-black" />
                  Restaurar desde JSON
                </h4>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  Carga un archivo de respaldo previo para restaurar el estado del inventario en el servidor.
                </p>
              </div>
              <label className="w-full py-2 bg-white border border-zinc-300 text-zinc-800 font-bold text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Cargar Archivo .json
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
              <div className="font-bold text-black">Restablecer datos de inicio</div>
              <div className="text-zinc-500 text-[11px]">
                Restaura el estado original del inventario.
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-100 px-6 py-3 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono">
            HCP+ INVENTARIO IT · PERSISTENCIA EN ARCHIVO LOCAL
          </span>
          <button
            onClick={() => setIsIisModalOpen(false)}
            className="px-4 py-1.5 bg-black text-white text-xs font-semibold hover:bg-zinc-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
