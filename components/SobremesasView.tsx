'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Monitor, Search, Plus, FileText, ArrowRight, X } from 'lucide-react';
import { DesktopEquipment } from '@/data/initial-data';

export function SobremesasView() {
  const {
    data,
    stats,
    setActiveTab,
    openSobremesaDetail,
    openPdfModal,
    deliverDesktop,
    returnDesktopToStock,
    allKnownPersons,
  } = useInventory();

  const [activeTabSub, setActiveTabSub] = useState<'disponibles' | 'historial'>('disponibles');
  const [searchTerm, setSearchTerm] = useState('');

  // Deliver modal state
  const [deliverModal, setDeliverModal] = useState<{
    isOpen: boolean;
    desktop: DesktopEquipment | null;
  }>({
    isOpen: false,
    desktop: null,
  });
  const [recipient, setRecipient] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const filteredDesktops = useMemo(() => {
    let list = data.sobremesas;

    if (activeTabSub === 'disponibles') {
      list = list.filter((s) => s.status === 'disponible');
    } else {
      list = list.filter((s) => s.status === 'entregado');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term) ||
          (s.deliveredTo && s.deliveredTo.toLowerCase().includes(term))
      );
    }

    return list;
  }, [data.sobremesas, activeTabSub, searchTerm]);

  const handleOpenDeliver = (desktop: DesktopEquipment) => {
    setDeliverModal({ isOpen: true, desktop });
    setRecipient('');
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDeliveryDate(`${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`);
  };

  const handleConfirmDeliver = () => {
    if (!deliverModal.desktop || !recipient.trim()) return;
    deliverDesktop(deliverModal.desktop.id, recipient.trim(), deliveryDate);
    setDeliverModal({ isOpen: false, desktop: null });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Page 3 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            3.0 SOBREMESAS DE REPUESTO · DATOS DE EJEMPLO
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Panel de sobremesas
          </h1>
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar sobremesa o persona..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black rounded-none shadow-sm placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => setActiveTab('nueva-ficha')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir sobremesa
          </button>
        </div>
      </div>

      {/* Tabs matching Page 3: Disponibles 9 | Historial 3 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTabSub('disponibles')}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTabSub === 'disponibles'
              ? 'bg-black text-white'
              : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Disponibles {stats.sobremesasDisponibles}
        </button>
        <button
          onClick={() => setActiveTabSub('historial')}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTabSub === 'historial'
              ? 'bg-black text-white'
              : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Historial {stats.sobremesasEntregados}
        </button>
      </div>

      {/* Yellow Explanation Box from Page 3 */}
      <div className="flex items-center gap-4 py-1">
        <div className="bg-[#d8fa18] text-black font-black text-xl px-3 py-1.5 shrink-0 flex items-center gap-2">
          <span>{stats.sobremesasDisponibles}</span>
          <span className="text-sm font-semibold">disponibles</span>
        </div>
        <div className="text-xs text-zinc-600 max-w-xl">
          Al marcar un sobremesa como no disponible se pide la persona y la fecha, y el equipo pasa al historial.
        </div>
      </div>

      {/* Cards Grid matching Page 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredDesktops.map((desktop) => {
          const isDisp = desktop.status === 'disponible';

          return (
            <div
              key={desktop.id}
              className="bg-white p-5 border border-zinc-200 flex flex-col justify-between min-h-[220px] shadow-sm hover:border-zinc-400 transition-all"
            >
              <div>
                {/* Top: Desktop icon + Disponible badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="border border-zinc-400 p-1 bg-transparent">
                    <Monitor className="w-5 h-5 text-black" strokeWidth={1.7} />
                  </div>
                  {isDisp ? (
                    <span className="bg-[#d8fa18] text-black text-[10px] font-bold px-2.5 py-0.5 tracking-wider">
                      Disponible
                    </span>
                  ) : (
                    <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-2 py-0.5 tracking-wider">
                      Entregado
                    </span>
                  )}
                </div>

                {/* ID */}
                <div
                  onClick={() => openSobremesaDetail(desktop.id)}
                  className="text-lg font-bold font-mono text-black cursor-pointer hover:underline"
                >
                  {desktop.id}
                </div>

                {/* Warehouse date or delivery info */}
                {isDisp ? (
                  <div className="text-xs text-zinc-500 mt-1">
                    Entrada al almacén: {desktop.entryDate}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-700 mt-1">
                    <div>
                      Entregado a <span className="font-semibold text-black">{desktop.deliveredTo}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500">Fecha: {desktop.deliveryDate}</div>
                  </div>
                )}

                {/* Link: Ver componentes (PDF) */}
                <div className="mt-3">
                  <button
                    onClick={() =>
                      openPdfModal({
                        title: `Ficha de Componentes · ${desktop.id}`,
                        equipmentId: desktop.id,
                        fileName: desktop.pdfFileName,
                        specs: desktop.specs,
                        type: 'Sobremesa',
                        pages: desktop.pdfPages || 2,
                      })
                    }
                    className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-black font-medium hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ver componentes (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Action Button: Marcar no disponible / Reintegrar */}
              <div className="mt-5">
                {isDisp ? (
                  <button
                    onClick={() => handleOpenDeliver(desktop)}
                    className="w-full py-2 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Marcar no disponible
                  </button>
                ) : (
                  <button
                    onClick={() => returnDesktopToStock(desktop.id)}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-300 transition-colors"
                  >
                    Reintegrar al almacén
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDesktops.length === 0 && (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200">
          No hay sobremesas en este listado.
        </div>
      )}

      {/* Deliver Dialog */}
      {deliverModal.isOpen && deliverModal.desktop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-zinc-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setDeliverModal({ isOpen: false, desktop: null })}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Entrega de Equipo Sobremesa
            </div>
            <h3 className="text-xl font-bold text-black mb-4">
              {deliverModal.desktop.id}
            </h3>

            <p className="text-xs text-zinc-600 mb-4">
              Al marcar este sobremesa como no disponible, se registrará la persona receptora y pasará automáticamente al historial.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Persona a la que se entrega *
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ej. Nuria Vidal"
                  list="desktop-persons"
                  autoFocus
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-black"
                />
                <datalist id="desktop-persons">
                  {allKnownPersons.map((name) => (
                    <option key={name} value={name} />
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
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeliverModal({ isOpen: false, desktop: null })}
                  className="px-4 py-2 border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeliver}
                  disabled={!recipient.trim()}
                  className="px-5 py-2 bg-black text-white text-xs font-bold disabled:opacity-50 hover:bg-zinc-800"
                >
                  Confirmar entrega y mover a historial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
