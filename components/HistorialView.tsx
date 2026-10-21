'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Search, Download, FileSpreadsheet } from 'lucide-react';

export function HistorialView() {
  const { data, openPortatilDetail, openSobremesaDetail } = useInventory();
  const [filterType, setFilterType] = useState<'Todos' | 'Portátiles' | 'Sobremesas' | 'Periféricos'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = useMemo(() => {
    let list = data.movements;

    if (filterType === 'Portátiles') {
      list = list.filter((m) => m.type === 'Portátil');
    } else if (filterType === 'Sobremesas') {
      list = list.filter((m) => m.type === 'Sobremesa');
    } else if (filterType === 'Periféricos') {
      list = list.filter((m) => m.type === 'Periférico');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.equipment.toLowerCase().includes(term) ||
          m.detail.toLowerCase().includes(term) ||
          m.action.toLowerCase().includes(term) ||
          m.timestamp.toLowerCase().includes(term)
      );
    }

    return list;
  }, [data.movements, filterType, searchTerm]);

  const handleExportCsv = () => {
    const headers = ['FECHA Y HORA', 'TIPO', 'EQUIPO', 'ACCIÓN', 'PERSONA / DETALLE'];
    const rows = filteredMovements.map((m) => [
      `"${m.timestamp}"`,
      `"${m.type}"`,
      `"${m.equipment}"`,
      `"${m.action}"`,
      `"${m.detail.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hcp_historial_movimientos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Page 5 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            ADMINISTRACIÓN
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Historial de movimientos
          </h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar equipo o persona..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black rounded-none shadow-sm placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCsv}
            title="Exportar a CSV para Excel / Auditoría IT en Windows"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs matching Page 5 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        {(['Todos', 'Portátiles', 'Sobremesas', 'Periféricos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterType === tab
                ? 'bg-black text-white'
                : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Movements Table matching Page 5 */}
      <div className="bg-white border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
              <th className="py-3 px-4">FECHA Y HORA</th>
              <th className="py-3 px-4">TIPO</th>
              <th className="py-3 px-4">EQUIPO</th>
              <th className="py-3 px-4">ACCIÓN</th>
              <th className="py-3 px-4">PERSONA / DETALLE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredMovements.map((mov) => {
              const isLaptop = mov.type === 'Portátil';
              const isDesktop = mov.type === 'Sobremesa';
              const isPeripheral = mov.type === 'Periférico';

              const isClickable =
                (isLaptop && data.portatiles.some((p) => p.id === mov.equipment)) ||
                (isDesktop && data.sobremesas.some((s) => s.id === mov.equipment));

              return (
                <tr key={mov.id} className="hover:bg-zinc-50/80 transition-colors">
                  {/* Fecha y hora */}
                  <td className="py-3.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                    {mov.timestamp}
                  </td>

                  {/* Tipo Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isLaptop && (
                      <span className="inline-block bg-black text-white font-bold text-[10px] px-2.5 py-0.5 tracking-wider">
                        Portátil
                      </span>
                    )}
                    {isDesktop && (
                      <span className="inline-block bg-white text-zinc-800 border border-zinc-300 font-bold text-[10px] px-2.5 py-0.5 tracking-wider">
                        Sobremesa
                      </span>
                    )}
                    {isPeripheral && (
                      <span className="inline-block bg-[#d8fa18] text-black font-bold text-[10px] px-2.5 py-0.5 tracking-wider">
                        Periférico
                      </span>
                    )}
                  </td>

                  {/* Equipo */}
                  <td className="py-3.5 px-4 font-bold text-black font-mono">
                    {isClickable ? (
                      <span
                        onClick={() => {
                          if (isLaptop) openPortatilDetail(mov.equipment);
                          if (isDesktop) openSobremesaDetail(mov.equipment);
                        }}
                        className="cursor-pointer hover:underline hover:text-blue-600"
                      >
                        {mov.equipment}
                      </span>
                    ) : (
                      mov.equipment
                    )}
                  </td>

                  {/* Acción */}
                  <td className="py-3.5 px-4 text-zinc-700 font-medium">
                    {mov.action}
                  </td>

                  {/* Persona / Detalle */}
                  <td className="py-3.5 px-4 text-zinc-800">
                    {mov.detail}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMovements.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No se encontraron movimientos registrados con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
