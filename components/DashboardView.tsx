'use client';

import React, { useState } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Laptop, Monitor, Headphones, ArrowRight, Search, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export function DashboardView() {
  const { data, stats, setActiveTab, openPortatilDetail, openSobremesaDetail } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  // Search filter across all entities
  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();

    const matchedLaptops = data.portatiles.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        (p.assignedTo && p.assignedTo.toLowerCase().includes(term))
    );

    const matchedDesktops = data.sobremesas.filter(
      (s) =>
        s.id.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        (s.deliveredTo && s.deliveredTo.toLowerCase().includes(term))
    );

    const matchedPerifs = data.perifericos.filter(
      (p) => p.brand.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
    );

    return {
      laptops: matchedLaptops,
      desktops: matchedDesktops,
      peripherals: matchedPerifs,
    };
  }, [searchTerm, data]);

  // Calculations for Portátiles bar percentages
  const totalLaptops = stats.portatilesTotal || 48;
  const dispPct = ((stats.portatilesDisponibles / totalLaptops) * 100).toFixed(1);
  const ocupPct = ((stats.portatilesOcupados / totalLaptops) * 100).toFixed(1);
  const averPct = ((stats.portatilesAveriados / totalLaptops) * 100).toFixed(1);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            PANEL PRINCIPAL · DATOS DE EJEMPLO
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Inventario IT
          </h1>
        </div>

        {/* Global Search Input matching Page 1 */}
        <div className="w-full md:w-80 relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar equipo o persona..."
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-300 text-sm focus:outline-none focus:border-black rounded-none shadow-sm placeholder:text-zinc-400"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 pl-1">
            Equipos por nombre · personas por asignación
          </div>

          {/* Search Dropdown Results */}
          {searchResults && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-zinc-200 shadow-xl max-h-96 overflow-y-auto">
              <div className="p-2 border-b bg-zinc-50 text-xs font-semibold text-zinc-600">
                Resultados para &quot;{searchTerm}&quot;
              </div>

              {/* Laptops */}
              {searchResults.laptops.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Portátiles</div>
                  {searchResults.laptops.slice(0, 5).map((lap) => (
                    <div
                      key={lap.id}
                      onClick={() => {
                        openPortatilDetail(lap.id);
                        setSearchTerm('');
                      }}
                      className="px-2 py-1.5 hover:bg-zinc-100 cursor-pointer text-xs flex items-center justify-between"
                    >
                      <span className="font-mono font-medium">{lap.id}</span>
                      <span className="text-zinc-600 truncate max-w-[150px]">
                        {lap.assignedTo ? `Asignado: ${lap.assignedTo}` : lap.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Desktops */}
              {searchResults.desktops.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sobremesas</div>
                  {searchResults.desktops.slice(0, 5).map((desk) => (
                    <div
                      key={desk.id}
                      onClick={() => {
                        openSobremesaDetail(desk.id);
                        setSearchTerm('');
                      }}
                      className="px-2 py-1.5 hover:bg-zinc-100 cursor-pointer text-xs flex items-center justify-between"
                    >
                      <span className="font-mono font-medium">{desk.id}</span>
                      <span className="text-zinc-600 truncate max-w-[150px]">
                        {desk.deliveredTo ? `Entregado: ${desk.deliveredTo}` : 'Disponible'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Peripherals */}
              {searchResults.peripherals.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Periféricos</div>
                  {searchResults.peripherals.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveTab('perifericos');
                        setSearchTerm('');
                      }}
                      className="px-2 py-1.5 hover:bg-zinc-100 cursor-pointer text-xs flex items-center justify-between"
                    >
                      <span>
                        {p.brand} {p.name}
                      </span>
                      <span className="font-mono font-semibold">{p.quantity} uds.</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.laptops.length === 0 &&
                searchResults.desktops.length === 0 &&
                searchResults.peripherals.length === 0 && (
                  <div className="p-4 text-xs text-zinc-500 text-center">No se encontraron coincidencias.</div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* 3 Top Big Stat Cards - Exact Replica from PDF Page 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Portátiles */}
        <div
          onClick={() => setActiveTab('portatiles')}
          className="bg-[#d8fa18] p-6 text-black cursor-pointer hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">PORTÁTILES</span>
              <div className="border border-black p-1 rounded-sm">
                <Laptop className="w-5 h-5 text-black" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tight">{stats.portatilesDisponibles}</span>
              <span className="text-lg font-medium text-zinc-800">disponibles</span>
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div className="text-sm font-medium space-y-0.5 text-zinc-800">
              <div>{stats.portatilesOcupados} ocupados</div>
              <div>{stats.portatilesAveriados} averiados</div>
            </div>
            <ArrowRight className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>

        {/* Card 2: Sobremesas */}
        <div
          onClick={() => setActiveTab('sobremesas')}
          className="bg-[#d8fa18] p-6 text-black cursor-pointer hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">SOBREMESAS</span>
              <div className="border border-black p-1 rounded-sm">
                <Monitor className="w-5 h-5 text-black" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tight">{stats.sobremesasDisponibles}</span>
              <span className="text-lg font-medium text-zinc-800">disponibles</span>
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div className="text-sm font-medium space-y-0.5 text-zinc-800">
              <div>{stats.sobremesasEntregados} entregados</div>
              <div>{stats.sobremesasTotal} en total</div>
            </div>
            <ArrowRight className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Periféricos */}
        <div
          onClick={() => setActiveTab('perifericos')}
          className="bg-black p-6 text-white cursor-pointer hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">PERIFÉRICOS</span>
              <div className="border border-zinc-700 p-1 rounded-sm">
                <Headphones className="w-5 h-5 text-white" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tight">{stats.perifericosTotal}</span>
              <span className="text-lg font-normal text-zinc-300">unidades</span>
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div className="text-sm font-normal space-y-0.5 text-zinc-300">
              <div>{stats.camarasTotal} cámaras web</div>
              <div>{stats.auricularesTotal} auriculares</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Portátiles de un vistazo & Últimos movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Left: Portátiles de un vistazo */}
        <div className="bg-white border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6">Portátiles de un vistazo</h2>

          {/* Segmented Progress Bar */}
          <div className="w-full flex h-14 overflow-hidden rounded-none border border-zinc-900/10">
            {/* Disponibles segment (Lime) */}
            <div
              style={{ width: `${dispPct}%` }}
              className="bg-[#d8fa18] text-black font-semibold text-sm flex items-center justify-center px-3 truncate transition-all duration-300"
              title={`${stats.portatilesDisponibles} disponibles (${dispPct}%)`}
            >
              {stats.portatilesDisponibles} disp.
            </div>

            {/* Ocupados segment (Dark slate) */}
            <div
              style={{ width: `${ocupPct}%` }}
              className="bg-[#374151] text-white font-semibold text-sm flex items-center justify-center px-3 truncate transition-all duration-300"
              title={`${stats.portatilesOcupados} ocupados (${ocupPct}%)`}
            >
              {stats.portatilesOcupados} ocup.
            </div>

            {/* Averiados segment (Magenta / Hot Pink) */}
            <div
              style={{ width: `${averPct}%` }}
              className="bg-[#f43f5e] text-white font-bold text-sm flex items-center justify-center px-2 truncate transition-all duration-300"
              title={`${stats.portatilesAveriados} averiados (${averPct}%)`}
            >
              {stats.portatilesAveriados}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#d8fa18] inline-block border border-black/20" />
              <span>Disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#374151] inline-block" />
              <span>Ocupados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#f43f5e] inline-block" />
              <span>Averiados</span>
            </div>
          </div>
        </div>

        {/* Right: Últimos movimientos */}
        <div className="bg-white border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">Últimos movimientos</h2>
            <button
              onClick={() => setActiveTab('historial')}
              className="text-xs text-zinc-600 hover:text-black font-semibold hover:underline"
            >
              Ver todos →
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {data.movements.slice(0, 5).map((mov) => {
              // Icon color bullet
              const bulletColor =
                mov.action === 'Asignado'
                  ? 'bg-zinc-800'
                  : mov.action === 'Devuelto'
                  ? 'bg-[#d8fa18]'
                  : mov.action === 'Averiado'
                  ? 'bg-[#f43f5e]'
                  : 'bg-zinc-400';

              return (
                <div key={mov.id} className="py-3 flex items-start gap-4 text-xs">
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className={`w-2.5 h-2.5 ${bulletColor} inline-block`} />
                    <span className="text-zinc-400 font-mono text-[11px]">{mov.timestamp.slice(0, 11)}</span>
                  </div>
                  <div className="text-zinc-800">
                    <span className="font-bold text-black">{mov.equipment}</span>{' '}
                    <span className="text-zinc-600">
                      {mov.action === 'Asignado' && `asignado a ${mov.detail}`}
                      {mov.action === 'Devuelto' && `devuelto por ${mov.detail}`}
                      {mov.action === 'Averiado' && `marcado como averiado`}
                      {mov.action === 'Reparado' && `reparado y disponible`}
                      {mov.action === 'Entregado' && `entregado a ${mov.detail}`}
                      {mov.action === 'Reasignado' && `reasignado (${mov.detail})`}
                      {mov.action === 'Unidades añadidas' && `· ${mov.detail} añadidas`}
                      {mov.action === 'Unidades retiradas' && `· ${mov.detail} retiradas`}
                      {mov.action === 'Alta' && `dado de alta (${mov.detail})`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
