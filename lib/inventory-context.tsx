'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  InventoryDatabase,
  LaptopEquipment,
  DesktopEquipment,
  PeripheralItem,
  Movement,
  INITIAL_DATA,
} from '@/data/initial-data';

export type ActiveTab =
  | 'dashboard'
  | 'portatiles'
  | 'sobremesas'
  | 'perifericos'
  | 'historial'
  | 'nueva-ficha'
  | 'portatil-detail'
  | 'sobremesa-detail';

interface PdfModalState {
  isOpen: boolean;
  title: string;
  equipmentId: string;
  fileName: string;
  pages?: number;
  specs?: any;
  type: 'Portátil' | 'Sobremesa';
}

interface InventoryContextType {
  data: InventoryDatabase;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPortatilId: string | null;
  setSelectedPortatilId: (id: string | null) => void;
  selectedSobremesaId: string | null;
  setSelectedSobremesaId: (id: string | null) => void;
  openPortatilDetail: (id: string) => void;
  openSobremesaDetail: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Modals
  pdfModal: PdfModalState | null;
  openPdfModal: (modal: Omit<PdfModalState, 'isOpen'>) => void;
  closePdfModal: () => void;
  isIisModalOpen: boolean;
  setIsIisModalOpen: (open: boolean) => void;
  // Operations
  assignLaptop: (id: string, assignedTo: string, date?: string) => void;
  returnLaptop: (id: string, date?: string) => void;
  reassignLaptop: (id: string, newPerson: string, date?: string) => void;
  markLaptopDamaged: (id: string, reason?: string) => void;
  markLaptopRepaired: (id: string) => void;
  deliverDesktop: (id: string, deliveredTo: string, date?: string) => void;
  returnDesktopToStock: (id: string) => void;
  updatePeripheralQuantity: (id: string, delta: number) => void;
  addPeripheral: (item: { brand: string; name: string; category: 'Cámara web' | 'Auriculares' | 'Otro'; quantity: number }) => void;
  addNewEquipment: (item: { type: 'Portátil' | 'Sobremesa'; id: string; pdfFileName?: string; specs?: any }) => boolean;
  replacePdf: (equipmentId: string, type: 'Portátil' | 'Sobremesa', newFileName: string) => void;
  resetToDefault: () => Promise<void>;
  restoreBackupData: (backup: InventoryDatabase) => Promise<boolean>;
  stats: {
    portatilesTotal: number;
    portatilesDisponibles: number;
    portatilesOcupados: number;
    portatilesAveriados: number;
    sobremesasTotal: number;
    sobremesasDisponibles: number;
    sobremesasEntregados: number;
    perifericosTotal: number;
    camarasTotal: number;
    auricularesTotal: number;
  };
  allKnownPersons: string[];
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEY = 'hcp_it_inventory_data_v1';

function formatCurrentDateTime() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function formatCurrentDate() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InventoryDatabase>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPortatilId, setSelectedPortatilId] = useState<string | null>(null);
  const [selectedSobremesaId, setSelectedSobremesaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfModal, setPdfModal] = useState<PdfModalState | null>(null);
  const [isIisModalOpen, setIsIisModalOpen] = useState(false);

  // Initialize from server API or LocalStorage
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Try local storage first for snappy load
      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.portatiles && parsed.sobremesas) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.warn('LocalStorage not available', e);
      }

      // 2. Sync with server-side JSON file (Windows Server / IIS / Next.js API)
      try {
        const res = await fetch('/api/inventory');
        if (res.ok) {
          const serverData = await res.json();
          if (isMounted && serverData && serverData.portatiles) {
            setData(serverData);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Could not sync with server api (using local):', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to localStorage & server JSON
  const persistState = (updated: InventoryDatabase) => {
    setData(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // Persist to server without blocking UI
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SAVE_FULL_STATE',
        payload: updated,
      }),
    }).catch((err) => console.warn('Could not write to server JSON file:', err));
  };

  const openPortatilDetail = (id: string) => {
    setSelectedPortatilId(id);
    setActiveTab('portatil-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSobremesaDetail = (id: string) => {
    setSelectedSobremesaId(id);
    setActiveTab('sobremesa-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPdfModal = (modal: Omit<PdfModalState, 'isOpen'>) => {
    setPdfModal({ ...modal, isOpen: true });
  };

  const closePdfModal = () => {
    setPdfModal(null);
  };

  // Known persons for auto-suggest
  const allKnownPersons = useMemo(() => {
    const set = new Set<string>();
    // Default list of employees from the enterprise
    [
      'Laura Gómez',
      'Pablo Herrera',
      'Andrés Molina',
      'Nuria Vidal',
      'Sergio Navas',
      'Marta Ríos',
      'Sara Blanco',
      'Carlos Méndez',
      'Elena Castro',
      'Alberto Santos',
      'Beatriz Soler',
      'Diana Marín',
      'Enrique Soto',
      'Fernando Gil',
      'Gabriela Ortiz',
      'Hugo Prieto',
      'Inés Roldán',
      'Javier Lozano',
      'Karla Benítez',
      'Lucas Vega',
      'Mónica Blanco',
      'Nicolás Cruz',
      'Olga Domínguez',
      'Pedro Sanabria',
      'Raquel Fuentes',
      'Santiago Ramos',
      'Teresa Cano',
      'Úrsula Valdés',
      'Víctor Morales',
      'Wendy Paredes',
      'Xavier Llorente',
      'Yolanda Serra',
      'Zacarías Peña',
    ].forEach((p) => set.add(p));

    data.portatiles.forEach((p) => {
      if (p.assignedTo) set.add(p.assignedTo);
    });
    data.sobremesas.forEach((s) => {
      if (s.deliveredTo) set.add(s.deliveredTo);
    });
    return Array.from(set).sort();
  }, [data]);

  // Operations
  const assignLaptop = (id: string, assignedTo: string, dateStr?: string) => {
    const timestamp = formatCurrentDateTime();
    const effectiveDate = dateStr || formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Portátil',
      equipment: id,
      action: 'Asignado',
      detail: assignedTo,
    };

    const updatedLaptops = data.portatiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'ocupado' as const,
          assignedTo,
          assignedDate: effectiveDate,
          freeSince: null,
          damagedSince: null,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '09:00'}`,
              action: `Asignado a ${assignedTo}`,
              detail: 'Asignación de equipo',
            },
            ...p.history,
          ],
        };
      }
      return p;
    });

    persistState({
      ...data,
      portatiles: updatedLaptops,
      movements: [newMov, ...data.movements],
    });
  };

  const returnLaptop = (id: string, dateStr?: string) => {
    const laptop = data.portatiles.find((p) => p.id === id);
    if (!laptop) return;

    const prevUser = laptop.assignedTo || 'Empleado';
    const timestamp = formatCurrentDateTime();
    const effectiveDate = dateStr || formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Portátil',
      equipment: id,
      action: 'Devuelto',
      detail: prevUser,
    };

    const updatedLaptops = data.portatiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'disponible' as const,
          assignedTo: null,
          assignedDate: null,
          freeSince: effectiveDate,
          damagedSince: null,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '09:00'}`,
              action: `Devuelto por ${prevUser}`,
              detail: 'Equipo retornado al inventario disponible',
            },
            ...p.history,
          ],
        };
      }
      return p;
    });

    persistState({
      ...data,
      portatiles: updatedLaptops,
      movements: [newMov, ...data.movements],
    });
  };

  const reassignLaptop = (id: string, newPerson: string, dateStr?: string) => {
    const laptop = data.portatiles.find((p) => p.id === id);
    if (!laptop) return;

    const prevUser = laptop.assignedTo || 'Anterior';
    const timestamp = formatCurrentDateTime();
    const effectiveDate = dateStr || formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Portátil',
      equipment: id,
      action: 'Reasignado',
      detail: `${prevUser} → ${newPerson}`,
    };

    const updatedLaptops = data.portatiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'ocupado' as const,
          assignedTo: newPerson,
          assignedDate: effectiveDate,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '09:00'}`,
              action: `Asignado a ${newPerson}`,
              detail: `Reasignado desde ${prevUser}`,
            },
            ...p.history,
          ],
        };
      }
      return p;
    });

    persistState({
      ...data,
      portatiles: updatedLaptops,
      movements: [newMov, ...data.movements],
    });
  };

  const markLaptopDamaged = (id: string, reason?: string) => {
    const laptop = data.portatiles.find((p) => p.id === id);
    if (!laptop) return;

    const timestamp = formatCurrentDateTime();
    const effectiveDate = formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Portátil',
      equipment: id,
      action: 'Averiado',
      detail: '—',
    };

    const updatedLaptops = data.portatiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'averiado' as const,
          assignedTo: null,
          assignedDate: null,
          damagedSince: effectiveDate,
          specs: {
            ...p.specs,
            batteryHealth: reason || 'En reparación / revisión técnica',
          },
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '17:30'}`,
              action: 'Marcado como averiado',
              detail: reason || 'Enviado a servicio técnico',
            },
            ...p.history,
          ],
        };
      }
      return p;
    });

    persistState({
      ...data,
      portatiles: updatedLaptops,
      movements: [newMov, ...data.movements],
    });
  };

  const markLaptopRepaired = (id: string) => {
    const laptop = data.portatiles.find((p) => p.id === id);
    if (!laptop) return;

    const timestamp = formatCurrentDateTime();
    const effectiveDate = formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Portátil',
      equipment: id,
      action: 'Reparado',
      detail: '—',
    };

    const updatedLaptops = data.portatiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'disponible' as const,
          freeSince: effectiveDate,
          damagedSince: null,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '08:50'}`,
              action: 'Reparado y puesto a punto',
              detail: 'Retorno desde servicio técnico, verificado OK',
            },
            ...p.history,
          ],
        };
      }
      return p;
    });

    persistState({
      ...data,
      portatiles: updatedLaptops,
      movements: [newMov, ...data.movements],
    });
  };

  const deliverDesktop = (id: string, deliveredTo: string, dateStr?: string) => {
    const desktop = data.sobremesas.find((s) => s.id === id);
    if (!desktop) return;

    const timestamp = formatCurrentDateTime();
    const effectiveDate = dateStr || formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Sobremesa',
      equipment: id,
      action: 'Entregado',
      detail: deliveredTo,
    };

    const updatedDesktops = data.sobremesas.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: 'entregado' as const,
          deliveredTo,
          deliveryDate: effectiveDate,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '10:00'}`,
              action: `Entregado a ${deliveredTo}`,
              detail: 'Entrega de equipo sobremesa',
            },
            ...s.history,
          ],
        };
      }
      return s;
    });

    persistState({
      ...data,
      sobremesas: updatedDesktops,
      movements: [newMov, ...data.movements],
    });
  };

  const returnDesktopToStock = (id: string) => {
    const desktop = data.sobremesas.find((s) => s.id === id);
    if (!desktop) return;

    const prevRecipient = desktop.deliveredTo || 'Empleado';
    const timestamp = formatCurrentDateTime();
    const effectiveDate = formatCurrentDate();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Sobremesa',
      equipment: id,
      action: 'Alta',
      detail: `Reintegrado desde ${prevRecipient}`,
    };

    const updatedDesktops = data.sobremesas.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: 'disponible' as const,
          deliveredTo: null,
          deliveryDate: null,
          history: [
            {
              id: `h-${Date.now()}`,
              date: `${effectiveDate} ${timestamp.split(' ')[1] || '10:00'}`,
              action: 'Reintegrado al almacén de repuesto',
              detail: `Devuelto por ${prevRecipient}`,
            },
            ...s.history,
          ],
        };
      }
      return s;
    });

    persistState({
      ...data,
      sobremesas: updatedDesktops,
      movements: [newMov, ...data.movements],
    });
  };

  const updatePeripheralQuantity = (id: string, delta: number) => {
    const item = data.perifericos.find((p) => p.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);
    const timestamp = formatCurrentDateTime();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Periférico',
      equipment: `${item.name.includes(item.brand) ? item.name : `${item.brand} ${item.name}`}`,
      action: delta > 0 ? 'Unidades añadidas' : 'Unidades retiradas',
      detail: `${delta > 0 ? '+' : ''}${delta} ${Math.abs(delta) === 1 ? 'unidad' : 'unidades'}`,
    };

    const updatedPerif = data.perifericos.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          quantity: newQty,
        };
      }
      return p;
    });

    persistState({
      ...data,
      perifericos: updatedPerif,
      movements: [newMov, ...data.movements],
    });
  };

  const addPeripheral = (item: {
    brand: string;
    name: string;
    category: 'Cámara web' | 'Auriculares' | 'Otro';
    quantity: number;
  }) => {
    const newId = `perif-${Date.now()}`;
    const timestamp = formatCurrentDateTime();

    const newItem: PeripheralItem = {
      id: newId,
      brand: item.brand,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      inStock: true,
    };

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      timestamp,
      type: 'Periférico',
      equipment: `${item.brand} ${item.name}`,
      action: 'Unidades añadidas',
      detail: `+${item.quantity} unidades`,
    };

    persistState({
      ...data,
      perifericos: [...data.perifericos, newItem],
      movements: [newMov, ...data.movements],
    });
  };

  const addNewEquipment = (item: {
    type: 'Portátil' | 'Sobremesa';
    id: string;
    pdfFileName?: string;
    specs?: any;
  }): boolean => {
    const formattedId = item.id.trim().toUpperCase();
    if (!formattedId) return false;

    // Check duplicate
    const existsLaptop = data.portatiles.some((p) => p.id.toLowerCase() === formattedId.toLowerCase());
    const existsDesktop = data.sobremesas.some((s) => s.id.toLowerCase() === formattedId.toLowerCase());
    if (existsLaptop || existsDesktop) {
      alert(`El identificador ${formattedId} ya existe en el inventario.`);
      return false;
    }

    const today = formatCurrentDate();
    const timestamp = formatCurrentDateTime();
    const hasPdf = Boolean(item.pdfFileName && item.pdfFileName.trim() !== '');
    const actualPdfFileName = hasPdf ? item.pdfFileName! : '';

    if (item.type === 'Portátil') {
      const newLaptop: LaptopEquipment = {
        id: formattedId,
        name: `Portátil ${formattedId}`,
        status: 'disponible',
        assignedTo: null,
        assignedDate: null,
        freeSince: today,
        damagedSince: null,
        pdfFileName: actualPdfFileName,
        pdfPages: hasPdf ? 2 : 0,
        pdfAttachedDate: hasPdf ? today : '',
        specs: item.specs || {
          model: 'Equipo Homologado Corporativo',
          processor: 'Intel Core i5-1345U (10 núcleos)',
          ram: '16 GB DDR5 4800MHz',
          storage: '512 GB NVMe M.2 SSD',
          display: '14.0" FHD IPS Anti-Glare',
          serial: `SN-${formattedId}-${Math.floor(1000 + Math.random() * 9000)}`,
          batteryHealth: '100% (Nuevo)',
        },
        history: [
          {
            id: `h-${Date.now()}`,
            date: `${today} ${timestamp.split(' ')[1] || '09:00'}`,
            action: 'Alta en el inventario',
            detail: hasPdf ? 'Recepción inicial con ficha PDF' : 'Recepción inicial sin PDF adjunto',
          },
        ],
      };

      const newMov: Movement = {
        id: `mov-${Date.now()}`,
        timestamp,
        type: 'Portátil',
        equipment: formattedId,
        action: 'Alta',
        detail: 'Entrada al almacén',
      };

      persistState({
        ...data,
        portatiles: [newLaptop, ...data.portatiles],
        movements: [newMov, ...data.movements],
      });
      return true;
    } else {
      const newDesktop: DesktopEquipment = {
        id: formattedId,
        name: `Sobremesa ${formattedId}`,
        status: 'disponible',
        entryDate: today,
        deliveredTo: null,
        deliveryDate: null,
        pdfFileName: actualPdfFileName,
        pdfPages: hasPdf ? 2 : 0,
        pdfAttachedDate: hasPdf ? today : '',
        specs: item.specs || {
          model: 'Dell OptiPlex 7010 SFF',
          processor: 'Intel Core i5-13500 (14 núcleos)',
          ram: '16 GB DDR4 3200MHz',
          storage: '512 GB NVMe PCIe SSD',
          gpu: 'Intel UHD Graphics 770',
          formFactor: 'Small Form Factor',
          serial: `DL-${formattedId}-SN`,
        },
        history: [
          {
            id: `h-${Date.now()}`,
            date: `${today} ${timestamp.split(' ')[1] || '09:00'}`,
            action: 'Alta en el inventario',
            detail: hasPdf ? 'Entrada al almacén con PDF' : 'Entrada al almacén sin PDF adjunto',
          },
        ],
      };

      const newMov: Movement = {
        id: `mov-${Date.now()}`,
        timestamp,
        type: 'Sobremesa',
        equipment: formattedId,
        action: 'Alta',
        detail: 'Entrada al almacén',
      };

      persistState({
        ...data,
        sobremesas: [newDesktop, ...data.sobremesas],
        movements: [newMov, ...data.movements],
      });
      return true;
    }
  };

  const replacePdf = (equipmentId: string, type: 'Portátil' | 'Sobremesa', newFileName: string) => {
    const today = formatCurrentDate();
    if (type === 'Portátil') {
      const updated = data.portatiles.map((p) => {
        if (p.id === equipmentId) {
          return {
            ...p,
            pdfFileName: newFileName,
            pdfAttachedDate: today,
          };
        }
        return p;
      });
      persistState({ ...data, portatiles: updated });
    } else {
      const updated = data.sobremesas.map((s) => {
        if (s.id === equipmentId) {
          return {
            ...s,
            pdfFileName: newFileName,
            pdfAttachedDate: today,
          };
        }
        return s;
      });
      persistState({ ...data, sobremesas: updated });
    }
  };

  const resetToDefault = async () => {
    persistState(INITIAL_DATA);
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_TO_DEFAULT' }),
      });
    } catch {}
  };

  const restoreBackupData = async (backup: InventoryDatabase): Promise<boolean> => {
    if (!backup || !Array.isArray(backup.portatiles) || !Array.isArray(backup.sobremesas)) {
      return false;
    }
    persistState(backup);
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE_BACKUP', payload: backup }),
      });
      return true;
    } catch {
      return true;
    }
  };

  // Aggregated counts matching the badges in mockups
  const stats = useMemo(() => {
    const portatilesTotal = data.portatiles.length;
    const portatilesDisponibles = data.portatiles.filter((p) => p.status === 'disponible').length;
    const portatilesOcupados = data.portatiles.filter((p) => p.status === 'ocupado').length;
    const portatilesAveriados = data.portatiles.filter((p) => p.status === 'averiado').length;

    const sobremesasTotal = data.sobremesas.length;
    const sobremesasDisponibles = data.sobremesas.filter((s) => s.status === 'disponible').length;
    const sobremesasEntregados = data.sobremesas.filter((s) => s.status === 'entregado').length;

    const perifericosTotal = data.perifericos.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const camarasTotal = data.perifericos
      .filter((p) => p.category === 'Cámara web' || p.name.toLowerCase().includes('cámara'))
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const auricularesTotal = data.perifericos
      .filter((p) => p.category === 'Auriculares' || p.name.toLowerCase().includes('auriculares'))
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    return {
      portatilesTotal,
      portatilesDisponibles,
      portatilesOcupados,
      portatilesAveriados,
      sobremesasTotal,
      sobremesasDisponibles,
      sobremesasEntregados,
      perifericosTotal,
      camarasTotal,
      auricularesTotal,
    };
  }, [data]);

  return (
    <InventoryContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        selectedPortatilId,
        setSelectedPortatilId,
        selectedSobremesaId,
        setSelectedSobremesaId,
        openPortatilDetail,
        openSobremesaDetail,
        searchQuery,
        setSearchQuery,
        pdfModal,
        openPdfModal,
        closePdfModal,
        isIisModalOpen,
        setIsIisModalOpen,
        assignLaptop,
        returnLaptop,
        reassignLaptop,
        markLaptopDamaged,
        markLaptopRepaired,
        deliverDesktop,
        returnDesktopToStock,
        updatePeripheralQuantity,
        addPeripheral,
        addNewEquipment,
        replacePdf,
        resetToDefault,
        restoreBackupData,
        stats,
        allKnownPersons,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
