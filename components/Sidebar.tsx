'use client';

import React from 'react';
import { useInventory, ActiveTab } from '@/lib/inventory-context';
import {
  Laptop,
  Monitor,
  Headphones,
  History,
  LayoutDashboard,
  Server,
  Database,
  PlusCircle,
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, stats, setIsIisModalOpen } = useInventory();

  const navItems: { id: ActiveTab; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'portatiles',
      label: 'Portátiles',
      count: stats.portatilesTotal,
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      id: 'sobremesas',
      label: 'Sobremesas',
      count: stats.sobremesasTotal,
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      id: 'perifericos',
      label: 'Periféricos',
      count: stats.perifericosTotal,
      icon: <Headphones className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-black text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-zinc-800">
      <div>
        {/* Logo Section matching HCP + */}
        <div className="p-6 pb-5 border-b border-zinc-900">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-3xl font-black tracking-tight text-white font-mono">HCP</span>
            <span className="text-3xl font-light text-[#d8fa18]">+</span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 tracking-wider font-medium">Inventario IT</div>
        </div>

        {/* Quick action button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('nueva-ficha')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded bg-[#d8fa18] text-black hover:bg-[#c6e810] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva ficha de equipo
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'portatiles' && activeTab === 'portatil-detail') ||
              (item.id === 'sobremesas' && activeTab === 'sobremesa-detail');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#d8fa18] text-black font-semibold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-black' : 'text-zinc-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      isActive ? 'bg-black/15 text-black font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Section Divider: ADMINISTRACIÓN */}
          <div className="pt-6 pb-2 px-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Administración</span>
          </div>

          <button
            onClick={() => setActiveTab('historial')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-all ${
              activeTab === 'historial'
                ? 'bg-[#d8fa18] text-black font-semibold'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <History className="w-4 h-4 text-zinc-400" />
            <span>Historial de movimientos</span>
          </button>
        </nav>
      </div>

      {/* Windows Server / IIS integration box */}
      <div className="p-4 border-t border-zinc-900">
        <div className="bg-zinc-900/90 rounded-lg p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#d8fa18]" />
              Servidor IIS
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#d8fa18]/20 text-[#d8fa18] rounded font-mono">
              Sin BD
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight mb-2.5">
            Persistencia en archivo JSON local adaptada a Windows Server.
          </p>
          <button
            onClick={() => setIsIisModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded font-medium border border-zinc-700 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#d8fa18]" />
            Configuración IIS & Backup
          </button>
        </div>
      </div>
    </aside>
  );
}
