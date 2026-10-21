'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Video, Headphones, Plus, Minus, Search, X } from 'lucide-react';

export function PerifericosView() {
  const { data, stats, updatePeripheralQuantity, addPeripheral } = useInventory();

  const [activeTab, setActiveTab] = useState<'Todos' | 'Cámaras web' | 'Auriculares'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add peripheral form state
  const [newBrand, setNewBrand] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Cámara web' | 'Auriculares' | 'Otro'>('Cámara web');
  const [newQty, setNewQty] = useState<number>(10);

  const filteredItems = useMemo(() => {
    let list = data.perifericos;

    if (activeTab === 'Cámaras web') {
      list = list.filter((p) => p.category === 'Cámara web' || p.name.toLowerCase().includes('cámara'));
    } else if (activeTab === 'Auriculares') {
      list = list.filter((p) => p.category === 'Auriculares' || p.name.toLowerCase().includes('auriculares'));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) => p.brand.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
      );
    }

    return list;
  }, [data.perifericos, activeTab, searchTerm]);

  const handleCreatePeripheral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !newName.trim()) return;

    addPeripheral({
      brand: newBrand.trim(),
      name: newName.trim(),
      category: newCategory,
      quantity: Number(newQty) || 0,
    });

    setIsAddModalOpen(false);
    setNewBrand('');
    setNewName('');
    setNewQty(10);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Page 8 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            4.0 PERIFÉRICOS · DATOS DE EJEMPLO
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Periféricos
          </h1>
        </div>

        {/* Search & Add button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por marca o tipo..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black rounded-none shadow-sm placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir periférico
          </button>
        </div>
      </div>

      {/* Info Block matching Page 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-1">
        <div className="bg-[#d8fa18] text-black font-black text-2xl px-3.5 py-1.5 shrink-0 flex items-center gap-2">
          <span>{stats.perifericosTotal}</span>
          <span className="text-sm font-semibold">unidades en almacén</span>
        </div>
        <div className="text-xs text-zinc-600 max-w-2xl">
          Se controla por cantidades: cada fila es una marca (o el nombre del periférico si no se conoce).
        </div>
      </div>

      {/* Filter Tabs matching Page 8 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab('Todos')}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'Todos'
              ? 'bg-black text-white'
              : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Todos {stats.perifericosTotal}
        </button>
        <button
          onClick={() => setActiveTab('Cámaras web')}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'Cámaras web'
              ? 'bg-black text-white'
              : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Cámaras web {stats.camarasTotal}
        </button>
        <button
          onClick={() => setActiveTab('Auriculares')}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'Auriculares'
              ? 'bg-black text-white'
              : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Auriculares {stats.auricularesTotal}
        </button>
      </div>

      {/* Peripherals Cards Grid matching Page 8 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isWebcam = item.category === 'Cámara web' || item.name.toLowerCase().includes('cámara');

          return (
            <div
              key={item.id}
              className="bg-white p-5 border border-zinc-200 shadow-sm flex flex-col justify-between min-h-[220px] relative hover:border-zinc-300 transition-all"
            >
              <div>
                {/* Top: Icon + En almacén pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="border border-zinc-400 p-1.5 bg-transparent">
                    {isWebcam ? (
                      <Video className="w-5 h-5 text-black" strokeWidth={1.7} />
                    ) : (
                      <Headphones className="w-5 h-5 text-black" strokeWidth={1.7} />
                    )}
                  </div>
                  <span className="bg-[#d8fa18] text-black text-[10px] font-bold px-2 py-0.5 tracking-wider">
                    En almacén
                  </span>
                </div>

                {/* Brand Title */}
                <h3 className="text-xl font-bold text-black tracking-tight">
                  {item.brand}
                </h3>

                {/* Subtitle / Type */}
                <p className="text-xs text-zinc-500 mt-0.5">
                  {item.name}
                </p>

                {/* Big Quantity */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-black tracking-tight">
                    {item.quantity}
                  </span>
                  <span className="text-xs font-semibold text-zinc-600">unidades</span>
                </div>
              </div>

              {/* Stepper Buttons: − and + matching Page 8 */}
              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => updatePeripheralQuantity(item.id, -1)}
                  disabled={item.quantity <= 0}
                  className="flex-1 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-40 text-black text-base font-bold flex items-center justify-center transition-colors shadow-2xs"
                  title="Retirar 1 unidad"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => updatePeripheralQuantity(item.id, 1)}
                  className="flex-1 py-1.5 bg-black hover:bg-zinc-800 text-white text-base font-bold flex items-center justify-center transition-colors shadow-2xs"
                  title="Añadir 1 unidad"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200">
          No se encontraron periféricos para el filtro seleccionado.
        </div>
      )}

      {/* Add Peripheral Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-zinc-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Nuevo Periférico
            </div>
            <h3 className="text-xl font-bold text-black mb-4">
              Añadir al inventario de almacén
            </h3>

            <form onSubmit={handleCreatePeripheral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    setNewCategory(cat);
                    if (!newName) setNewName(cat);
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 text-xs focus:outline-none focus:border-black bg-white"
                >
                  <option value="Cámara web">Cámara web</option>
                  <option value="Auriculares">Auriculares</option>
                  <option value="Otro">Otro periférico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Marca o identificación *
                </label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Ej. Logitech, Jabra, Sin marca..."
                  required
                  className="w-full px-3 py-2 border border-zinc-300 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Denominación / Modelo *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Auriculares Jabra Evolve 20, Cámara web HD..."
                  required
                  className="w-full px-3 py-2 border border-zinc-300 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Cantidad inicial en stock *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-zinc-300 text-xs focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newBrand.trim() || !newName.trim()}
                  className="px-5 py-2 bg-black text-[#d8fa18] text-xs font-bold disabled:opacity-50 hover:bg-zinc-800"
                >
                  Guardar Periférico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
