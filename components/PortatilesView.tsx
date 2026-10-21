'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Laptop, Search, Plus, Check, RotateCcw, ArrowRightLeft, Wrench, X } from 'lucide-react';
import { LaptopEquipment } from '@/data/initial-data';

export function PortatilesView() {
  const {
    data,
    stats,
    setActiveTab,
    openPortatilDetail,
    assignLaptop,
    returnLaptop,
    reassignLaptop,
    markLaptopRepaired,
    markLaptopDamaged,
    allKnownPersons,
  } = useInventory();

  const [activeFilter, setActiveFilter] = useState<'todos' | 'disponibles' | 'ocupados' | 'averiados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCards, setShowAllCards] = useState(false);

  // Modals state
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; laptop: LaptopEquipment | null; mode: 'assign' | 'reassign' }>({
    isOpen: false,
    laptop: null,
    mode: 'assign',
  });
  const [targetPerson, setTargetPerson] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const [repairModal, setRepairModal] = useState<{ isOpen: boolean; laptop: LaptopEquipment | null }>({
    isOpen: false,
    laptop: null,
  });

  const filteredLaptops = useMemo(() => {
    let list = data.portatiles;

    if (activeFilter === 'disponibles') {
      list = list.filter((p) => p.status === 'disponible');
    } else if (activeFilter === 'ocupados') {
      list = list.filter((p) => p.status === 'ocupado');
    } else if (activeFilter === 'averiados') {
      list = list.filter((p) => p.status === 'averiado');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          (p.assignedTo && p.assignedTo.toLowerCase().includes(term)) ||
          (p.specs && p.specs.model.toLowerCase().includes(term))
      );
    }

    return list;
  }, [data.portatiles, activeFilter, searchTerm]);

  // Highlight exact 12 from mockup if showAllCards is false
  const displayedLaptops = useMemo(() => {
    if (showAllCards || searchTerm.trim() || activeFilter !== 'todos') {
      return filteredLaptops;
    }
    // Match the 12 shown in Page 2:
    const page2Ids = [
      'HCP-PT-001',
      'HCP-PT-002',
      'HCP-PT-007',
      'HCP-PT-011',
      'HCP-PT-014',
      'HCP-PT-018',
      'HCP-PT-020',
      'HCP-PT-024',
      'HCP-PT-027',
      'HCP-PT-029',
      'HCP-PT-031',
      'HCP-PT-035',
    ];
    const top12 = filteredLaptops.filter((p) => page2Ids.includes(p.id));
    return top12.length > 0 ? top12 : filteredLaptops.slice(0, 12);
  }, [filteredLaptops, showAllCards, searchTerm, activeFilter]);

  const handleOpenAssign = (laptop: LaptopEquipment, mode: 'assign' | 'reassign') => {
    setAssignModal({ isOpen: true, laptop, mode });
    setTargetPerson(mode === 'reassign' ? '' : '');
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setTargetDate(`${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`);
  };

  const handleConfirmAssign = () => {
    if (!assignModal.laptop || !targetPerson.trim()) return;
    if (assignModal.mode === 'assign') {
      assignLaptop(assignModal.laptop.id, targetPerson.trim(), targetDate);
    } else {
      reassignLaptop(assignModal.laptop.id, targetPerson.trim(), targetDate);
    }
    setAssignModal({ isOpen: false, laptop: null, mode: 'assign' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Page 2 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            2.0 PORTÁTILES · DATOS DE EJEMPLO
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Panel de portátiles
          </h1>
        </div>

        {/* Search & New button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar portátil o empleado..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black rounded-none shadow-sm placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => setActiveTab('nueva-ficha')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo portátil
          </button>
        </div>
      </div>

      {/* Summary count bar */}
      <div className="flex items-center gap-3 py-1">
        <span className="bg-[#d8fa18] text-black font-black text-lg px-2.5 py-1">
          {stats.portatilesDisponibles}
        </span>
        <span className="text-sm font-semibold text-black">disponibles</span>
        <span className="text-sm text-zinc-500">
          {stats.portatilesOcupados} ocupados · {stats.portatilesAveriados} averiados · {stats.portatilesTotal} en total
        </span>
      </div>

      {/* Filter Tabs matching Page 2 */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 pb-3 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'todos' ? 'bg-black text-white' : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Todos {stats.portatilesTotal}
          </button>
          <button
            onClick={() => setActiveFilter('disponibles')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'disponibles' ? 'bg-black text-white' : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Disponibles {stats.portatilesDisponibles}
          </button>
          <button
            onClick={() => setActiveFilter('ocupados')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'ocupados' ? 'bg-black text-white' : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Ocupados {stats.portatilesOcupados}
          </button>
          <button
            onClick={() => setActiveFilter('averiados')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'averiados' ? 'bg-black text-white' : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Averiados {stats.portatilesAveriados}
          </button>
        </div>

        {activeFilter === 'todos' && !searchTerm && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 font-mono">
              {showAllCards ? `Mostrando todos (${filteredLaptops.length})` : 'Vista de ejemplo con 12 de los 48 portátiles'}
            </span>
            <button
              onClick={() => setShowAllCards(!showAllCards)}
              className="text-xs text-black font-semibold underline hover:text-zinc-600"
            >
              {showAllCards ? 'Mostrar solo 12' : 'Ver los 48'}
            </button>
          </div>
        )}
      </div>

      {/* Grid of Laptops - EXACT Mockup Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedLaptops.map((laptop) => {
          const isDisponible = laptop.status === 'disponible';
          const isAveriado = laptop.status === 'averiado';
          const isOcupado = laptop.status === 'ocupado';

          // Card styles
          if (isDisponible) {
            return (
              <div
                key={laptop.id}
                className="bg-[#d8fa18] p-5 text-black border border-black/10 flex flex-col justify-between min-h-[260px] relative transition-transform hover:-translate-y-0.5 shadow-sm"
              >
                <div>
                  {/* Top: Icon + Status Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="border border-black p-1 bg-transparent">
                      <Laptop className="w-5 h-5 text-black" strokeWidth={1.7} />
                    </div>
                    <span className="bg-black text-[#d8fa18] text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                      DISPONIBLE
                    </span>
                  </div>

                  {/* ID */}
                  <div
                    onClick={() => openPortatilDetail(laptop.id)}
                    className="text-[11px] font-mono text-zinc-700 cursor-pointer hover:underline"
                  >
                    {laptop.id}
                  </div>

                  {/* Big title */}
                  <div
                    onClick={() => openPortatilDetail(laptop.id)}
                    className="text-2xl font-black tracking-tight text-black mt-2 cursor-pointer hover:opacity-80 flex items-center gap-1.5"
                  >
                    <span>✓</span>
                    <span>Disponible</span>
                  </div>

                  <div className="text-xs text-zinc-800 mt-1">
                    Libre desde {laptop.freeSince || '28/08/2026'}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6">
                  <button
                    onClick={() => handleOpenAssign(laptop, 'assign')}
                    className="w-full py-2 bg-black text-[#d8fa18] text-xs font-bold hover:bg-zinc-900 transition-colors"
                  >
                    Asignar
                  </button>
                </div>
              </div>
            );
          }

          if (isAveriado) {
            return (
              <div
                key={laptop.id}
                className="bg-[#f8f9fa] p-5 text-black border-2 border-dashed border-zinc-400 flex flex-col justify-between min-h-[260px] relative transition-transform hover:-translate-y-0.5"
              >
                <div>
                  {/* Top: Icon + Status Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="border border-zinc-700 p-1 bg-transparent">
                      <Laptop className="w-5 h-5 text-zinc-700" strokeWidth={1.7} />
                    </div>
                    <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                      AVERIADO
                    </span>
                  </div>

                  {/* ID */}
                  <div
                    onClick={() => openPortatilDetail(laptop.id)}
                    className="text-[11px] font-mono text-zinc-700 cursor-pointer hover:underline"
                  >
                    {laptop.id}
                  </div>

                  {/* Big title */}
                  <div
                    onClick={() => openPortatilDetail(laptop.id)}
                    className="text-2xl font-bold tracking-tight text-zinc-800 mt-2 cursor-pointer hover:opacity-80"
                  >
                    Averiado
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    En reparación desde {laptop.damagedSince || '16/10/2026'}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6">
                  <button
                    onClick={() => markLaptopRepaired(laptop.id)}
                    className="w-full py-2 bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Marcar reparado
                  </button>
                </div>
              </div>
            );
          }

          // Default: Ocupado
          return (
            <div
              key={laptop.id}
              className="bg-white p-5 text-black border border-zinc-200 flex flex-col justify-between min-h-[260px] relative transition-transform hover:-translate-y-0.5 shadow-sm"
            >
              <div>
                {/* Top: Icon + Status Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="border border-zinc-400 p-1 bg-transparent">
                    <Laptop className="w-5 h-5 text-zinc-800" strokeWidth={1.7} />
                  </div>
                  <span className="bg-zinc-100 text-zinc-600 text-[10px] font-semibold px-2 py-0.5 tracking-wider uppercase border border-zinc-200">
                    OCUPADO
                  </span>
                </div>

                {/* ID */}
                <div
                  onClick={() => openPortatilDetail(laptop.id)}
                  className="text-[11px] font-mono text-zinc-700 cursor-pointer hover:underline"
                >
                  {laptop.id}
                </div>

                {/* Big Employee Name */}
                <div
                  onClick={() => openPortatilDetail(laptop.id)}
                  className="text-2xl font-bold tracking-tight text-black mt-2 cursor-pointer hover:opacity-80 truncate"
                  title={laptop.assignedTo || 'Empleado'}
                >
                  {laptop.assignedTo || 'Empleado'}
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  Ocupado desde {laptop.assignedDate || '03/09/2026'}
                </div>
              </div>

              {/* Bottom Actions: Devolver + Reasignar */}
              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => returnLaptop(laptop.id)}
                  className="flex-1 py-2 bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors text-center"
                >
                  Devolver
                </button>
                <button
                  onClick={() => handleOpenAssign(laptop, 'reassign')}
                  className="flex-1 py-2 bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-colors text-center"
                >
                  Reasignar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {displayedLaptops.length === 0 && (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200">
          No se encontraron portátiles con los filtros aplicados.
        </div>
      )}

      {/* Assign / Reassign Dialog */}
      {assignModal.isOpen && assignModal.laptop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-zinc-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAssignModal({ isOpen: false, laptop: null, mode: 'assign' })}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              {assignModal.mode === 'assign' ? 'Asignar Portátil' : 'Reasignar Portátil'}
            </div>
            <h3 className="text-xl font-bold text-black mb-4">
              {assignModal.laptop.id} · {assignModal.laptop.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nombre del empleado *
                </label>
                <input
                  type="text"
                  value={targetPerson}
                  onChange={(e) => setTargetPerson(e.target.value)}
                  placeholder="Ej. Laura Gómez"
                  list="employee-suggestions"
                  autoFocus
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-black"
                />
                <datalist id="employee-suggestions">
                  {allKnownPersons.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-zinc-400 mt-1">El campo sugiere nombres ya usados antes.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fecha de asignación
                </label>
                <input
                  type="text"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setAssignModal({ isOpen: false, laptop: null, mode: 'assign' })}
                  className="px-4 py-2 border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAssign}
                  disabled={!targetPerson.trim()}
                  className="px-5 py-2 bg-black text-[#d8fa18] text-xs font-bold disabled:opacity-50 hover:bg-zinc-800"
                >
                  {assignModal.mode === 'assign' ? 'Confirmar Asignación' : 'Confirmar Reasignación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
