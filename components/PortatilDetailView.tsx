'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  Laptop,
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  AlertTriangle,
  RotateCcw,
  User,
  Calendar,
  Cpu,
  HardDrive,
  Layers,
  Battery,
  ShieldCheck,
} from 'lucide-react';

export function PortatilDetailView() {
  const {
    data,
    selectedPortatilId,
    setActiveTab,
    reassignLaptop,
    returnLaptop,
    markLaptopDamaged,
    markLaptopRepaired,
    replacePdf,
    openPdfModal,
    allKnownPersons,
  } = useInventory();

  const [reassignName, setReassignName] = useState('');
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Find the selected laptop, fallback to HCP-PT-031 from mockup if not selected
  const laptop =
    data.portatiles.find((p) => p.id === selectedPortatilId) ||
    data.portatiles.find((p) => p.id === 'HCP-PT-031') ||
    data.portatiles[0];

  if (!laptop) {
    return (
      <div className="p-8">
        <button
          onClick={() => setActiveTab('portatiles')}
          className="text-xs font-semibold text-zinc-600 hover:text-black flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel de portátiles
        </button>
        <p className="mt-4 text-zinc-500">Equipo no encontrado.</p>
      </div>
    );
  }

  const isOcupado = laptop.status === 'ocupado';
  const isDisponible = laptop.status === 'disponible';
  const isAveriado = laptop.status === 'averiado';

  const handleReassign = () => {
    if (!reassignName.trim()) return;
    reassignLaptop(laptop.id, reassignName.trim());
    setSuccessFeedback(`Equipo reasignado con éxito a ${reassignName.trim()}`);
    setReassignName('');
    setTimeout(() => setSuccessFeedback(null), 3500);
  };

  const handleReturn = () => {
    returnLaptop(laptop.id);
    setSuccessFeedback(`Devolución registrada. El equipo ${laptop.id} pasa a estar disponible.`);
    setTimeout(() => setSuccessFeedback(null), 3500);
  };

  const handleDamaged = () => {
    markLaptopDamaged(laptop.id, 'En reparación técnica');
    setSuccessFeedback(`El equipo ${laptop.id} ha sido marcado como averiado.`);
    setTimeout(() => setSuccessFeedback(null), 3500);
  };

  const handleRepaired = () => {
    markLaptopRepaired(laptop.id);
    setSuccessFeedback(`El equipo ${laptop.id} ha sido marcado como reparado y pasa a estar disponible.`);
    setTimeout(() => setSuccessFeedback(null), 3500);
  };

  const hasPdf = Boolean(laptop.pdfFileName && laptop.pdfFileName.trim() !== '');

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      replacePdf(laptop.id, 'Portátil', file.name);

      // Trigger automatic extraction of PDF specs
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || '';
          fetch('/api/extract-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64Data: base64, mimeType: file.type }),
          });
        };
        reader.readAsDataURL(file);
      } catch {}

      setSuccessFeedback(`Fichero PDF adjuntado y vinculado: ${file.name}`);
      setTimeout(() => setSuccessFeedback(null), 3500);
    }
  };

  const handleDownloadPdf = () => {
    // Generate text/pdf simulation download
    const content = `HCP+ INVENTARIO IT - FICHA TECNICA DE COMPONENTES
==================================================
Identificador: ${laptop.id}
Tipo: Portátil Corporativo
Fecha de alta: ${laptop.history[laptop.history.length - 1]?.date || '15/01/2026'}
Estado actual: ${laptop.status.toUpperCase()}
${laptop.assignedTo ? `Asignado a: ${laptop.assignedTo} (desde ${laptop.assignedDate})` : ''}

ESPECIFICACIONES DEL HARDWARE:
------------------------------
Modelo: ${laptop.specs.model}
Procesador: ${laptop.specs.processor}
Memoria RAM: ${laptop.specs.ram}
Almacenamiento: ${laptop.specs.storage}
Pantalla: ${laptop.specs.display}
Número de Serie: ${laptop.specs.serial}
Batería / Estado: ${laptop.specs.batteryHealth}

HISTORIAL DE ASIGNACIONES:
--------------------------
${laptop.history.map((h) => `${h.date}: ${h.action} (${h.detail})`).join('\n')}

Documento generado y archivado en servidor Windows IIS.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = laptop.pdfFileName.replace('.pdf', '') + '_especificaciones.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Bar matching Page 6 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('portatiles')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            2.0 Portátiles
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 border border-zinc-200">
            Datos de ejemplo
          </span>
        </div>

        <div>
          {isOcupado && (
            <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-3 py-1 border border-zinc-300">
              Ocupado
            </span>
          )}
          {isDisponible && (
            <span className="bg-[#d8fa18] text-black text-xs font-bold px-3 py-1">
              Disponible
            </span>
          )}
          {isAveriado && (
            <span className="bg-zinc-800 text-white text-xs font-bold px-3 py-1">
              Averiado
            </span>
          )}
        </div>
      </div>

      {/* Main Title with Laptop Icon matching Page 6 */}
      <div className="flex items-center gap-4">
        <div className="border border-zinc-900 p-2">
          <Laptop className="w-8 h-8 text-black" strokeWidth={1.7} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-black font-mono">
          {laptop.id}
        </h1>
      </div>

      {successFeedback && (
        <div className="p-3 bg-[#d8fa18]/20 border border-[#d8fa18] text-black text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{successFeedback}</span>
        </div>
      )}

      {/* Two-Column Split Layout matching Page 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (col-span-7): Componentes del equipo (PDF) */}
        <div className="lg:col-span-7 bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-bold text-black">
              Componentes del equipo (PDF)
            </h2>

            <div className="flex items-center gap-2">
              <input
                ref={replaceFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleReplaceFile}
                className="hidden"
              />
              <button
                onClick={() => replaceFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                {hasPdf ? 'Sustituir PDF' : 'Adjuntar PDF'}
              </button>
              {hasPdf && (
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-colors"
                >
                  Descargar
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            {hasPdf
              ? `${laptop.pdfFileName} · ${laptop.pdfPages || 2} páginas · adjuntado al crear la ficha`
              : 'Sin PDF adjunto (Opcional) · Especificaciones registradas en sistema'}
          </div>

          {/* Realistic PDF Sheet Preview replica from Page 6 */}
          <div
            onClick={() =>
              openPdfModal({
                title: `Ficha Técnica ${laptop.id}`,
                equipmentId: laptop.id,
                fileName: laptop.pdfFileName,
                specs: laptop.specs,
                type: 'Portátil',
                pages: 2,
              })
            }
            className="border border-zinc-300 bg-zinc-50/70 p-6 shadow-inner cursor-pointer hover:border-zinc-400 transition-colors relative group"
          >
            <div className="absolute top-3 right-3 bg-white/90 text-zinc-700 text-[10px] font-bold px-2 py-1 border border-zinc-200 opacity-80 group-hover:opacity-100 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Clic para ampliar PDF
            </div>

            {/* Document sheet representation */}
            <div className="bg-white p-6 border border-zinc-200 shadow-sm max-w-lg mx-auto space-y-4 font-sans text-xs">
              {/* Header bar */}
              <div className="border-b-2 border-black pb-3 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-black">{laptop.id}</div>
                  <div className="text-[10px] text-zinc-500">FICHA TÉCNICA DE HARDWARE HOMOLOGADO</div>
                </div>
                <div className="font-mono text-[10px] font-bold text-zinc-400">HCP+ IT SYSTEMS</div>
              </div>

              {/* Specs lines */}
              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Modelo:</span>
                  <span className="font-semibold text-black">{laptop.specs.model}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Procesador:</span>
                  <span className="font-mono font-medium text-black">{laptop.specs.processor}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Memoria RAM:</span>
                  <span className="font-mono font-semibold text-black">{laptop.specs.ram}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Almacenamiento:</span>
                  <span className="font-mono font-semibold text-black">{laptop.specs.storage}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Pantalla:</span>
                  <span className="text-black">{laptop.specs.display}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Número de Serie:</span>
                  <span className="font-mono text-zinc-800">{laptop.specs.serial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Salud de Batería:</span>
                  <span className="font-medium text-emerald-700">{laptop.specs.batteryHealth}</span>
                </div>
              </div>

              {/* Graphic bars simulating pdf page */}
              <div className="pt-4 space-y-1.5 opacity-40">
                <div className="h-2 bg-zinc-800 w-1/3 rounded-xs"></div>
                <div className="h-1.5 bg-zinc-300 w-full rounded-xs"></div>
                <div className="h-1.5 bg-zinc-300 w-5/6 rounded-xs"></div>
                <div className="h-2 bg-zinc-800 w-1/4 rounded-xs mt-3"></div>
                <div className="h-1.5 bg-zinc-300 w-4/5 rounded-xs"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5): Asignación actual + Historial de movimientos */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Asignación actual */}
          <div className="bg-black text-white p-6 shadow-sm space-y-5">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white">Asignación actual</h2>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                EMPLEADO
              </div>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {laptop.assignedTo || 'Sin asignar (Disponible)'}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {laptop.assignedDate ? `Desde ${laptop.assignedDate}` : `Libre desde ${laptop.freeSince || '—'}`}
              </div>
            </div>

            {/* Reasignar a otra persona */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Reasignar a otra persona
              </label>
              <input
                type="text"
                value={reassignName}
                onChange={(e) => setReassignName(e.target.value)}
                placeholder="Escribe un nombre..."
                list="laptop-detail-persons"
                className="w-full px-3 py-2 bg-white text-black text-xs focus:outline-none focus:ring-1 focus:ring-[#d8fa18] rounded-none"
              />
              <datalist id="laptop-detail-persons">
                {allKnownPersons.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              <div className="text-[11px] text-zinc-400">
                El campo sugiere nombres ya usados antes.
              </div>

              {/* Action Buttons: Reasignar + Registrar devolución */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleReassign}
                  disabled={!reassignName.trim()}
                  className="flex-1 py-2 bg-[#d8fa18] text-black text-xs font-bold hover:bg-[#c6e810] disabled:opacity-40 transition-colors"
                >
                  Reasignar
                </button>
                {isOcupado && (
                  <button
                    onClick={handleReturn}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Registrar devolución
                  </button>
                )}
              </div>
            </div>

            {/* Mark as damaged button */}
            <div className="pt-2 border-t border-zinc-800">
              {isAveriado ? (
                <button
                  onClick={handleRepaired}
                  className="w-full py-2 bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  Marcar como reparado
                </button>
              ) : (
                <button
                  onClick={handleDamaged}
                  className="w-full py-2 bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  Marcar como averiado
                </button>
              )}
            </div>
          </div>

          {/* Card: Historial de movimientos matching Page 6 */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-black border-b border-zinc-100 pb-3">
              Historial de movimientos
            </h2>

            <div className="space-y-4 divide-y divide-zinc-100">
              {laptop.history.map((entry, idx) => (
                <div key={entry.id || idx} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <span className="w-2.5 h-2.5 bg-black inline-block shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-black">{entry.action}</div>
                    <div className="text-zinc-500 font-mono text-[11px] mt-0.5">{entry.date}</div>
                    {entry.detail && (
                      <div className="text-zinc-600 text-[11px] mt-0.5">{entry.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
