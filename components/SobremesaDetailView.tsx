'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  Monitor,
  ArrowLeft,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';

export function SobremesaDetailView() {
  const {
    data,
    selectedSobremesaId,
    setActiveTab,
    deliverDesktop,
    returnDesktopToStock,
    replacePdf,
    openPdfModal,
    allKnownPersons,
  } = useInventory();

  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Fallback to HCP-SM-005 from Page 7 mockup
  const desktop =
    data.sobremesas.find((s) => s.id === selectedSobremesaId) ||
    data.sobremesas.find((s) => s.id === 'HCP-SM-005') ||
    data.sobremesas[0];

  if (!desktop) {
    return (
      <div className="p-8">
        <button
          onClick={() => setActiveTab('sobremesas')}
          className="text-xs font-semibold text-zinc-600 hover:text-black flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel de sobremesas
        </button>
        <p className="mt-4 text-zinc-500">Equipo sobremesa no encontrado.</p>
      </div>
    );
  }

  const isDisponible = desktop.status === 'disponible';

  const handleOpenDeliver = () => {
    setDeliverModalOpen(true);
    setRecipient('');
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDeliveryDate(`${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`);
  };

  const handleConfirmDeliver = () => {
    if (!recipient.trim()) return;
    deliverDesktop(desktop.id, recipient.trim(), deliveryDate);
    setDeliverModalOpen(false);
    setFeedback(`Equipo sobremesa ${desktop.id} entregado a ${recipient.trim()}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleReturnToStock = () => {
    returnDesktopToStock(desktop.id);
    setFeedback(`Equipo sobremesa ${desktop.id} reintegrado al almacén de repuesto.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const hasPdf = Boolean(desktop.pdfFileName && desktop.pdfFileName.trim() !== '');

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      replacePdf(desktop.id, 'Sobremesa', file.name);

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

      setFeedback(`PDF adjuntado y vinculado: ${file.name}`);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleDownloadPdf = () => {
    const fileName = desktop.pdfFileName || `componentes-${desktop.id}.pdf`;
    const content = `HCP+ INVENTARIO IT - FICHA DE COMPONENTES SOBREMESA
======================================================
Identificador: ${desktop.id}
Tipo: Sobremesa de Repuesto
Entrada al almacén: ${desktop.entryDate}
Estado actual: ${desktop.status.toUpperCase()}
${desktop.deliveredTo ? `Entregado a: ${desktop.deliveredTo} (Fecha: ${desktop.deliveryDate})` : ''}

ESPECIFICACIONES DEL HARDWARE:
------------------------------
Modelo: ${desktop.specs.model}
Procesador: ${desktop.specs.processor}
Memoria RAM: ${desktop.specs.ram}
Almacenamiento: ${desktop.specs.storage}
Tarjeta Gráfica: ${desktop.specs.gpu}
Formato de Caja: ${desktop.specs.formFactor}
Número de Serie: ${desktop.specs.serial}

DOCUMENTACIÓN HOMOLOGADA
Archivo adjunto: ${fileName}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '') + '_especificaciones.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Bar matching Page 7 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('sobremesas')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            3.0 Sobremesas
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 border border-zinc-200">
            Datos de ejemplo
          </span>
        </div>

        <div>
          {isDisponible ? (
            <span className="bg-[#d8fa18] text-black text-xs font-bold px-3 py-1">
              Disponible
            </span>
          ) : (
            <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-3 py-1">
              Entregado
            </span>
          )}
        </div>
      </div>

      {/* Main Title with Monitor Icon matching Page 7 */}
      <div className="flex items-center gap-4">
        <div className="border border-zinc-900 p-2">
          <Monitor className="w-8 h-8 text-black" strokeWidth={1.7} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-black font-mono">
          {desktop.id}
        </h1>
      </div>

      {feedback && (
        <div className="p-3 bg-[#d8fa18]/20 border border-[#d8fa18] text-black text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Two-Column Layout from Page 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (col-span-7): Datos del equipo + PDF */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Datos del equipo matching Page 7 */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-black border-b border-zinc-100 pb-3">
              Datos del equipo
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  NOMBRE DEL EQUIPO
                </div>
                <div className="text-base font-bold font-mono text-black mt-1">
                  {desktop.id}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  ENTRADA AL ALMACÉN
                </div>
                <div className="text-base font-bold text-black mt-1">
                  {desktop.entryDate}
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              Los componentes del equipo están en el PDF adjunto.
            </p>
          </div>

          {/* Section: Componentes del equipo (PDF) matching Page 7 */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
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
                ? `${desktop.pdfFileName} · ${desktop.pdfPages || 2} páginas · adjuntado al crear la ficha`
                : 'Sin PDF adjunto (Opcional) · Especificaciones registradas en sistema'}
            </div>

            {/* Embedded PDF Sheet Visual Replica */}
            <div
              onClick={() =>
                openPdfModal({
                  title: `Ficha Técnica ${desktop.id}`,
                  equipmentId: desktop.id,
                  fileName: desktop.pdfFileName,
                  specs: desktop.specs,
                  type: 'Sobremesa',
                  pages: 2,
                })
              }
              className="border border-zinc-300 bg-zinc-50 p-6 cursor-pointer hover:border-zinc-400 shadow-inner group relative"
            >
              <div className="absolute top-3 right-3 bg-white/90 text-zinc-700 text-[10px] font-bold px-2 py-1 border border-zinc-200 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Ver informe completo
              </div>

              <div className="bg-white p-6 border border-zinc-200 shadow-sm max-w-lg mx-auto space-y-4 text-xs">
                <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                  <div>
                    <div className="font-mono font-bold text-sm">{desktop.id}</div>
                    <div className="text-[10px] text-zinc-500">SOBREMESA HOMOLOGADO DE REPUESTO</div>
                  </div>
                  <div className="font-mono text-[10px] font-bold text-zinc-400">HCP+</div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">Modelo:</span>
                    <span className="font-semibold">{desktop.specs.model}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">CPU:</span>
                    <span className="font-mono">{desktop.specs.processor}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">RAM:</span>
                    <span className="font-mono font-semibold">{desktop.specs.ram}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">Disco:</span>
                    <span className="font-mono font-semibold">{desktop.specs.storage}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">Gráfica:</span>
                    <span>{desktop.specs.gpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Chasis:</span>
                    <span>{desktop.specs.formFactor}</span>
                  </div>
                </div>

                {/* Simulated pdf text lines */}
                <div className="pt-2 space-y-1 opacity-30">
                  <div className="h-1.5 bg-black w-1/3"></div>
                  <div className="h-1 bg-zinc-400 w-full"></div>
                  <div className="h-1 bg-zinc-400 w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5): Disponibilidad card matching Page 7 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black text-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">
              Disponibilidad
            </h2>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                ESTADO ACTUAL
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[#d8fa18] mt-1">
                {isDisponible ? 'Disponible' : 'Entregado'}
              </div>
              {!isDisponible && (
                <div className="mt-2 text-xs text-zinc-300">
                  Entregado a <span className="font-semibold text-white">{desktop.deliveredTo}</span> el {desktop.deliveryDate}
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed pt-2">
              {isDisponible
                ? 'Al marcarlo como no disponible se pedirá la persona y la fecha de entrega, y el equipo pasará al historial de sobremesas.'
                : 'Este equipo se encuentra actualmente asignado y no está en stock de almacén.'}
            </p>

            <div className="pt-4">
              {isDisponible ? (
                <button
                  onClick={handleOpenDeliver}
                  className="w-full py-3 bg-[#d8fa18] text-black text-xs font-bold hover:bg-[#c6e810] transition-colors text-center"
                >
                  Marcar no disponible
                </button>
              ) : (
                <button
                  onClick={handleReturnToStock}
                  className="w-full py-3 bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors text-center"
                >
                  Reintegrar al almacén de repuesto
                </button>
              )}
            </div>
          </div>

          {/* Movements for this desktop */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-black border-b border-zinc-100 pb-3">
              Historial de movimientos
            </h2>

            <div className="space-y-4 divide-y divide-zinc-100">
              {desktop.history.map((entry, idx) => (
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

      {/* Deliver Desktop Modal */}
      {deliverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-zinc-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setDeliverModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Marcar como no disponible
            </div>
            <h3 className="text-xl font-bold text-black mb-4">
              {desktop.id}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Persona a quien se entrega *
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ej. Nuria Vidal"
                  list="desktop-detail-persons"
                  autoFocus
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-black"
                />
                <datalist id="desktop-detail-persons">
                  {allKnownPersons.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fecha de entrega
                </label>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeliverModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeliver}
                  disabled={!recipient.trim()}
                  className="px-5 py-2 bg-black text-[#d8fa18] text-xs font-bold disabled:opacity-50 hover:bg-zinc-800"
                >
                  Confirmar entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
