'use client';

import React, { useState } from 'react';
import { InventoryProvider, useInventory } from '@/lib/inventory-context';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { PortatilesView } from '@/components/PortatilesView';
import { SobremesasView } from '@/components/SobremesasView';
import { NuevaFichaView } from '@/components/NuevaFichaView';
import { HistorialView } from '@/components/HistorialView';
import { PortatilDetailView } from '@/components/PortatilDetailView';
import { SobremesaDetailView } from '@/components/SobremesaDetailView';
import { PerifericosView } from '@/components/PerifericosView';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { IisConfigModal } from '@/components/IisConfigModal';
import { Menu, X, Server } from 'lucide-react';

function InventoryApp() {
  const { activeTab, setIsIisModalOpen } = useInventory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row text-zinc-900 font-sans antialiased selection:bg-[#d8fa18] selection:text-black">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-black text-white px-4 py-3 flex items-center justify-between border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-xl font-black">HCP</span>
          <span className="text-xl text-[#d8fa18]">+</span>
          <span className="text-xs text-zinc-400 font-sans ml-1">Inventario IT</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIisModalOpen(true)}
            className="p-1.5 text-[#d8fa18] bg-zinc-900 rounded"
            title="IIS Config"
          >
            <Server className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80">
          <div className="w-64 h-full bg-black">
            <div className="p-4 flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'portatiles' && <PortatilesView />}
        {activeTab === 'sobremesas' && <SobremesasView />}
        {activeTab === 'perifericos' && <PerifericosView />}
        {activeTab === 'historial' && <HistorialView />}
        {activeTab === 'nueva-ficha' && <NuevaFichaView />}
        {activeTab === 'portatil-detail' && <PortatilDetailView />}
        {activeTab === 'sobremesa-detail' && <SobremesaDetailView />}
      </main>

      {/* Modals */}
      <PdfViewerModal />
      <IisConfigModal />
    </div>
  );
}

export default function Page() {
  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  );
}
