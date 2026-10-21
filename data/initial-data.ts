export interface Movement {
  id: string;
  timestamp: string;
  type: 'Portátil' | 'Sobremesa' | 'Periférico';
  equipment: string;
  action: 'Asignado' | 'Devuelto' | 'Averiado' | 'Reparado' | 'Entregado' | 'Reasignado' | 'Unidades añadidas' | 'Unidades retiradas' | 'Alta';
  detail: string;
}

export interface EquipmentHistoryEntry {
  id: string;
  date: string;
  action: string;
  detail: string;
}

export interface LaptopEquipment {
  id: string; // e.g. HCP-PT-001
  name: string;
  status: 'disponible' | 'ocupado' | 'averiado';
  assignedTo: string | null;
  assignedDate: string | null;
  freeSince: string | null;
  damagedSince: string | null;
  pdfFileName: string;
  pdfPages: number;
  pdfAttachedDate: string;
  specs: {
    model: string;
    processor: string;
    ram: string;
    storage: string;
    display: string;
    serial: string;
    batteryHealth: string;
  };
  history: EquipmentHistoryEntry[];
}

export interface DesktopEquipment {
  id: string; // e.g. HCP-SM-001
  name: string;
  status: 'disponible' | 'entregado';
  entryDate: string;
  deliveredTo: string | null;
  deliveryDate: string | null;
  pdfFileName: string;
  pdfPages: number;
  pdfAttachedDate: string;
  specs: {
    model: string;
    processor: string;
    ram: string;
    storage: string;
    gpu: string;
    formFactor: string;
    serial: string;
  };
  history: EquipmentHistoryEntry[];
}

export interface PeripheralItem {
  id: string;
  brand: string;
  name: string; // e.g. "Cámara web", "Auriculares", "Cámara web · sin marca"
  category: 'Cámara web' | 'Auriculares' | 'Otro';
  quantity: number;
  inStock: boolean;
}

export interface InventoryDatabase {
  portatiles: LaptopEquipment[];
  sobremesas: DesktopEquipment[];
  perifericos: PeripheralItem[];
  movements: Movement[];
  lastUpdated: string;
}

export const INITIAL_DATA: InventoryDatabase = {
  lastUpdated: '2026-10-21T09:00:00Z',
  movements: [
    {
      id: 'mov-1',
      timestamp: '20/10/2026 11:02',
      type: 'Portátil',
      equipment: 'HCP-PT-031',
      action: 'Asignado',
      detail: 'Laura Gómez',
    },
    {
      id: 'mov-2',
      timestamp: '20/10/2026 09:15',
      type: 'Portátil',
      equipment: 'HCP-PT-018',
      action: 'Devuelto',
      detail: 'Pablo Herrera',
    },
    {
      id: 'mov-3',
      timestamp: '16/10/2026 17:30',
      type: 'Portátil',
      equipment: 'HCP-PT-007',
      action: 'Averiado',
      detail: '—',
    },
    {
      id: 'mov-4',
      timestamp: '15/10/2026 10:20',
      type: 'Periférico',
      equipment: 'Auriculares Jabra',
      action: 'Unidades añadidas',
      detail: '+3 unidades',
    },
    {
      id: 'mov-5',
      timestamp: '12/10/2026 10:05',
      type: 'Sobremesa',
      equipment: 'HCP-SM-004',
      action: 'Entregado',
      detail: 'Nuria Vidal',
    },
    {
      id: 'mov-6',
      timestamp: '09/10/2026 16:45',
      type: 'Portátil',
      equipment: 'HCP-PT-024',
      action: 'Reasignado',
      detail: 'Andrés Molina → Sara Blanco',
    },
    {
      id: 'mov-7',
      timestamp: '05/10/2026 09:30',
      type: 'Sobremesa',
      equipment: 'HCP-SM-009',
      action: 'Entregado',
      detail: 'Andrés Molina',
    },
    {
      id: 'mov-8',
      timestamp: '01/10/2026 08:50',
      type: 'Portátil',
      equipment: 'HCP-PT-015',
      action: 'Reparado',
      detail: '—',
    },
    {
      id: 'mov-9',
      timestamp: '30/09/2026 14:10',
      type: 'Sobremesa',
      equipment: 'HCP-SM-011',
      action: 'Entregado',
      detail: 'Sergio Navas',
    },
    {
      id: 'mov-10',
      timestamp: '28/09/2026 11:25',
      type: 'Periférico',
      equipment: 'Cámara web Logitech',
      action: 'Unidades añadidas',
      detail: '+5 unidades',
    },
  ],
  portatiles: [
    // Page 2 highlighted laptops
    {
      id: 'HCP-PT-001',
      name: 'Portátil HCP-PT-001',
      status: 'ocupado',
      assignedTo: 'Andrés Molina',
      assignedDate: '03/09/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-001.pdf',
      pdfPages: 2,
      pdfAttachedDate: '03/09/2026',
      specs: {
        model: 'Lenovo ThinkPad T14 Gen 4',
        processor: 'AMD Ryzen 7 PRO 7840U (8C/16T)',
        ram: '32 GB LPDDR5x 6400MHz',
        storage: '1 TB NVMe M.2 PCIe 4.0 SSD',
        display: '14.0" WUXGA (1920x1200) IPS 400 nits',
        serial: 'PF-4X88921',
        batteryHealth: '98% (52.5 Wh)',
      },
      history: [
        { id: 'h-1', date: '03/09/2026 09:30', action: 'Asignado a Andrés Molina', detail: 'Inicio de asignación para departamento IT' },
        { id: 'h-2', date: '01/09/2026 10:00', action: 'Alta en el inventario', detail: 'Recepción inicial almacén' },
      ],
    },
    {
      id: 'HCP-PT-002',
      name: 'Portátil HCP-PT-002',
      status: 'disponible',
      assignedTo: null,
      assignedDate: null,
      freeSince: '28/08/2026',
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-002.pdf',
      pdfPages: 2,
      pdfAttachedDate: '28/08/2026',
      specs: {
        model: 'Dell Latitude 5440',
        processor: 'Intel Core i5-1345U vPro (10C/12T)',
        ram: '16 GB DDR4 3200MHz',
        storage: '512 GB SSD PCIe NVMe',
        display: '14.0" FHD (1920x1080) Anti-glare',
        serial: 'DL-772109',
        batteryHealth: '100% (54 Wh)',
      },
      history: [
        { id: 'h-3', date: '28/08/2026 12:15', action: 'Devuelto por Carlos Méndez', detail: 'Fin de proyecto, formateado e instalado SO base' },
        { id: 'h-4', date: '10/01/2026 11:00', action: 'Alta en el inventario', detail: 'Recepción inicial' },
      ],
    },
    {
      id: 'HCP-PT-007',
      name: 'Portátil HCP-PT-007',
      status: 'averiado',
      assignedTo: null,
      assignedDate: null,
      freeSince: null,
      damagedSince: '16/10/2026',
      pdfFileName: 'componentes-HCP-PT-007.pdf',
      pdfPages: 2,
      pdfAttachedDate: '16/10/2026',
      specs: {
        model: 'HP EliteBook 840 G9',
        processor: 'Intel Core i7-1265U',
        ram: '16 GB DDR5 4800MHz',
        storage: '512 GB PCIe Gen4 SSD',
        display: '14.0" WUXGA AG LED UWVA',
        serial: 'HP-5CE23891',
        batteryHealth: '84% (Fallo en placa base / puerto USB-C)',
      },
      history: [
        { id: 'h-5', date: '16/10/2026 17:30', action: 'Marcado como averiado', detail: 'Enviado a servicio técnico oficial HP (pantalla parpadea)' },
        { id: 'h-6', date: '14/03/2026 09:10', action: 'Alta en el inventario', detail: 'Equipo homologado' },
      ],
    },
    {
      id: 'HCP-PT-011',
      name: 'Portátil HCP-PT-011',
      status: 'ocupado',
      assignedTo: 'Pablo Herrera',
      assignedDate: '12/05/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-011.pdf',
      pdfPages: 2,
      pdfAttachedDate: '12/05/2026',
      specs: {
        model: 'Lenovo ThinkPad L14 Gen 3',
        processor: 'Intel Core i5-1235U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD NVMe',
        display: '14.0" FHD IPS',
        serial: 'PF-2K90123',
        batteryHealth: '94%',
      },
      history: [
        { id: 'h-7', date: '12/05/2026 10:00', action: 'Asignado a Pablo Herrera', detail: 'Incorporación departamento Financiero' },
      ],
    },
    {
      id: 'HCP-PT-014',
      name: 'Portátil HCP-PT-014',
      status: 'disponible',
      assignedTo: null,
      assignedDate: null,
      freeSince: '02/10/2026',
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-014.pdf',
      pdfPages: 2,
      pdfAttachedDate: '02/10/2026',
      specs: {
        model: 'Dell Latitude 5540',
        processor: 'Intel Core i7-1365U',
        ram: '32 GB DDR5',
        storage: '1 TB PCIe SSD',
        display: '15.6" FHD IPS',
        serial: 'DL-994321',
        batteryHealth: '99%',
      },
      history: [
        { id: 'h-8', date: '02/10/2026 15:40', action: 'Devuelto por Elena Castro', detail: 'Equipo higienizado y listo para entrega' },
      ],
    },
    {
      id: 'HCP-PT-018',
      name: 'Portátil HCP-PT-018',
      status: 'disponible',
      assignedTo: null,
      assignedDate: null,
      freeSince: '19/10/2026',
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-018.pdf',
      pdfPages: 2,
      pdfAttachedDate: '19/10/2026',
      specs: {
        model: 'Lenovo ThinkPad E14 Gen 4',
        processor: 'AMD Ryzen 5 5625U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '14.0" FHD',
        serial: 'PF-883901',
        batteryHealth: '95%',
      },
      history: [
        { id: 'h-9', date: '19/10/2026 09:15', action: 'Devuelto por Pablo Herrera', detail: 'Devuelto por cambio a nuevo modelo' },
      ],
    },
    {
      id: 'HCP-PT-020',
      name: 'Portátil HCP-PT-020',
      status: 'ocupado',
      assignedTo: 'Sergio Navas',
      assignedDate: '21/07/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-020.pdf',
      pdfPages: 2,
      pdfAttachedDate: '21/07/2026',
      specs: {
        model: 'HP ProBook 450 G9',
        processor: 'Intel Core i5-1235U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD NVMe',
        display: '15.6" FHD',
        serial: 'HP-992100',
        batteryHealth: '92%',
      },
      history: [
        { id: 'h-10', date: '21/07/2026 11:30', action: 'Asignado a Sergio Navas', detail: 'Puesto de operaciones' },
      ],
    },
    {
      id: 'HCP-PT-024',
      name: 'Portátil HCP-PT-024',
      status: 'ocupado',
      assignedTo: 'Nuria Vidal',
      assignedDate: '16/10/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-024.pdf',
      pdfPages: 2,
      pdfAttachedDate: '16/10/2026',
      specs: {
        model: 'Dell Latitude 3440',
        processor: 'Intel Core i5-1335U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '14.0" FHD',
        serial: 'DL-112233',
        batteryHealth: '97%',
      },
      history: [
        { id: 'h-11', date: '16/10/2026 10:00', action: 'Asignado a Nuria Vidal', detail: 'Reasignado desde Sara Blanco' },
      ],
    },
    {
      id: 'HCP-PT-027',
      name: 'Portátil HCP-PT-027',
      status: 'ocupado',
      assignedTo: 'Marta Ríos',
      assignedDate: '30/06/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-027.pdf',
      pdfPages: 2,
      pdfAttachedDate: '30/06/2026',
      specs: {
        model: 'Lenovo ThinkPad T14s',
        processor: 'Intel Core i7-1260P',
        ram: '32 GB LPDDR5',
        storage: '1 TB SSD NVMe',
        display: '14.0" 2.2K IPS',
        serial: 'PF-662211',
        batteryHealth: '91%',
      },
      history: [
        { id: 'h-12', date: '30/06/2026 09:15', action: 'Asignado a Marta Ríos', detail: 'Dirección Comercial' },
      ],
    },
    {
      id: 'HCP-PT-029',
      name: 'Portátil HCP-PT-029',
      status: 'disponible',
      assignedTo: null,
      assignedDate: null,
      freeSince: '09/10/2026',
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-029.pdf',
      pdfPages: 2,
      pdfAttachedDate: '09/10/2026',
      specs: {
        model: 'HP EliteBook 640 G9',
        processor: 'Intel Core i5-1235U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '14.0" FHD',
        serial: 'HP-441188',
        batteryHealth: '96%',
      },
      history: [
        { id: 'h-13', date: '09/10/2026 14:00', action: 'Devuelto por Alberto Santos', detail: 'Listo para asignación' },
      ],
    },
    {
      id: 'HCP-PT-031',
      name: 'Portátil HCP-PT-031',
      status: 'ocupado',
      assignedTo: 'Laura Gómez',
      assignedDate: '19/10/2026',
      freeSince: null,
      damagedSince: null,
      pdfFileName: 'componentes-HCP-PT-031.pdf',
      pdfPages: 2,
      pdfAttachedDate: '19/10/2026',
      specs: {
        model: 'Dell Latitude 5540',
        processor: 'Intel Core i7-13700H (14C/20T)',
        ram: '32 GB DDR5 4800MHz (2x16GB)',
        storage: '1 TB NVMe M.2 Class 40 SSD',
        display: '15.6" FHD (1920x1080) WVA Anti-Glare',
        serial: 'DL-HCP-PT031-2026',
        batteryHealth: '100% (64 Wh)',
      },
      history: [
        { id: 'h-14', date: '19/10/2026 09:42', action: 'Asignado a Laura Gómez', detail: 'Asignación tras validación de RRHH' },
        { id: 'h-15', date: '12/10/2026 16:10', action: 'Devuelto por Sergio Navas', detail: 'Revisión técnica periódica completada' },
        { id: 'h-16', date: '02/03/2026 11:25', action: 'Asignado a Sergio Navas', detail: 'Entrega inicial de equipo corporativo' },
        { id: 'h-17', date: '15/01/2026 09:00', action: 'Alta en el inventario', detail: 'Recepción del proveedor y etiquetado HCP' },
      ],
    },
    {
      id: 'HCP-PT-035',
      name: 'Portátil HCP-PT-035',
      status: 'averiado',
      assignedTo: null,
      assignedDate: null,
      freeSince: null,
      damagedSince: '05/10/2026',
      pdfFileName: 'componentes-HCP-PT-035.pdf',
      pdfPages: 2,
      pdfAttachedDate: '05/10/2026',
      specs: {
        model: 'Lenovo ThinkPad E15 Gen 4',
        processor: 'AMD Ryzen 7 5825U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '15.6" FHD IPS',
        serial: 'PF-004419',
        batteryHealth: '0% (Batería hinchada, pendiente sustitución)',
      },
      history: [
        { id: 'h-18', date: '05/10/2026 11:15', action: 'Marcado como averiado', detail: 'Batería defectuosa, tramitando garantía' },
      ],
    },
    // Additional laptops to complete 48 total (14 disponibles, 30 ocupados, 4 averiados)
    // 2 more averiados (total 4)
    {
      id: 'HCP-PT-008',
      name: 'Portátil HCP-PT-008',
      status: 'averiado',
      assignedTo: null,
      assignedDate: null,
      freeSince: null,
      damagedSince: '14/10/2026',
      pdfFileName: 'componentes-HCP-PT-008.pdf',
      pdfPages: 2,
      pdfAttachedDate: '14/10/2026',
      specs: {
        model: 'Dell Inspiron 14',
        processor: 'Intel Core i5-1135G7',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '14.0" FHD',
        serial: 'DL-882199',
        batteryHealth: 'Fallo en teclado por derrame de líquido',
      },
      history: [{ id: 'h-19', date: '14/10/2026 16:00', action: 'Marcado como averiado', detail: 'Derrame de líquido' }],
    },
    {
      id: 'HCP-PT-042',
      name: 'Portátil HCP-PT-042',
      status: 'averiado',
      assignedTo: null,
      assignedDate: null,
      freeSince: null,
      damagedSince: '01/10/2026',
      pdfFileName: 'componentes-HCP-PT-042.pdf',
      pdfPages: 2,
      pdfAttachedDate: '01/10/2026',
      specs: {
        model: 'Lenovo ThinkBook 14 G4',
        processor: 'Intel Core i7-1255U',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        display: '14.0" FHD',
        serial: 'PF-908123',
        batteryHealth: 'Pantalla rota por impacto',
      },
      history: [{ id: 'h-20', date: '01/10/2026 18:20', action: 'Marcado como averiado', detail: 'Pantalla fisurada' }],
    },
    // 9 more disponibles (making 14 total disponibles: 002, 014, 018, 029 + 9 = 13 + 1 = 14)
    ...Array.from({ length: 10 }, (_, i) => {
      const num = 36 + i;
      const code = `HCP-PT-0${num}`;
      return {
        id: code,
        name: `Portátil ${code}`,
        status: 'disponible' as const,
        assignedTo: null,
        assignedDate: null,
        freeSince: '15/10/2026',
        damagedSince: null,
        pdfFileName: `componentes-${code}.pdf`,
        pdfPages: 2,
        pdfAttachedDate: '15/10/2026',
        specs: {
          model: 'Dell Latitude 5440 Core i5',
          processor: 'Intel Core i5-1345U',
          ram: '16 GB DDR5',
          storage: '512 GB SSD NVMe',
          display: '14.0" FHD IPS',
          serial: `DL-SER-${num}882`,
          batteryHealth: '100%',
        },
        history: [{ id: `h-disp-${i}`, date: '15/10/2026 10:00', action: 'Alta en inventario', detail: 'Lote de reposición' }],
      };
    }),
    // 24 more ocupados (making 30 total ocupados: 001, 011, 020, 024, 027, 031 + 24 = 30)
    ...[
      { code: 'HCP-PT-003', user: 'Beatriz Soler', date: '14/04/2026' },
      { code: 'HCP-PT-004', user: 'Carlos Méndez', date: '09/02/2026' },
      { code: 'HCP-PT-005', user: 'Diana Marín', date: '22/01/2026' },
      { code: 'HCP-PT-006', user: 'Enrique Soto', date: '18/03/2026' },
      { code: 'HCP-PT-009', user: 'Fernando Gil', date: '05/05/2026' },
      { code: 'HCP-PT-010', user: 'Gabriela Ortiz', date: '12/04/2026' },
      { code: 'HCP-PT-012', user: 'Hugo Prieto', date: '02/06/2026' },
      { code: 'HCP-PT-013', user: 'Inés Roldán', date: '17/06/2026' },
      { code: 'HCP-PT-015', user: 'Javier Lozano', date: '01/10/2026' },
      { code: 'HCP-PT-016', user: 'Karla Benítez', date: '03/07/2026' },
      { code: 'HCP-PT-017', user: 'Lucas Vega', date: '14/08/2026' },
      { code: 'HCP-PT-019', user: 'Mónica Blanco', date: '29/08/2026' },
      { code: 'HCP-PT-021', user: 'Nicolás Cruz', date: '08/09/2026' },
      { code: 'HCP-PT-022', user: 'Olga Domínguez', date: '15/09/2026' },
      { code: 'HCP-PT-023', user: 'Pedro Sanabria', date: '20/09/2026' },
      { code: 'HCP-PT-025', user: 'Raquel Fuentes', date: '25/09/2026' },
      { code: 'HCP-PT-026', user: 'Santiago Ramos', date: '28/09/2026' },
      { code: 'HCP-PT-028', user: 'Teresa Cano', date: '04/10/2026' },
      { code: 'HCP-PT-030', user: 'Úrsula Valdés', date: '07/10/2026' },
      { code: 'HCP-PT-032', user: 'Víctor Morales', date: '11/10/2026' },
      { code: 'HCP-PT-033', user: 'Wendy Paredes', date: '13/10/2026' },
      { code: 'HCP-PT-034', user: 'Xavier Llorente', date: '15/10/2026' },
      { code: 'HCP-PT-047', user: 'Yolanda Serra', date: '17/10/2026' },
      { code: 'HCP-PT-048', user: 'Zacarías Peña', date: '18/10/2026' },
    ].map((item) => ({
      id: item.code,
      name: `Portátil ${item.code}`,
      status: 'ocupado' as const,
      assignedTo: item.user,
      assignedDate: item.date,
      freeSince: null,
      damagedSince: null,
      pdfFileName: `componentes-${item.code}.pdf`,
      pdfPages: 2,
      pdfAttachedDate: item.date,
      specs: {
        model: 'Lenovo ThinkPad T14 Gen 4',
        processor: 'Intel Core i5-1345U',
        ram: '16 GB DDR5',
        storage: '512 GB SSD',
        display: '14.0" FHD IPS',
        serial: `SN-${item.code}`,
        batteryHealth: '95%',
      },
      history: [{ id: `h-${item.code}`, date: `${item.date} 09:00`, action: `Asignado a ${item.user}`, detail: 'Asignación estándar' }],
    })),
  ],
  sobremesas: [
    // Page 3 exact 9 disponibles
    {
      id: 'HCP-SM-001',
      name: 'Sobremesa HCP-SM-001',
      status: 'disponible',
      entryDate: '14/01/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-001.pdf',
      pdfPages: 2,
      pdfAttachedDate: '14/01/2026',
      specs: {
        model: 'Dell OptiPlex 7010 SFF',
        processor: 'Intel Core i5-13500 (14 núcleos)',
        ram: '16 GB DDR4 3200MHz',
        storage: '512 GB NVMe PCIe M.2 SSD',
        gpu: 'Intel UHD Graphics 770',
        formFactor: 'Small Form Factor (SFF)',
        serial: 'DL-SM-001-2026',
      },
      history: [{ id: 'h-sm-1', date: '14/01/2026 10:00', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-002',
      name: 'Sobremesa HCP-SM-002',
      status: 'disponible',
      entryDate: '14/01/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-002.pdf',
      pdfPages: 2,
      pdfAttachedDate: '14/01/2026',
      specs: {
        model: 'Dell OptiPlex 7010 SFF',
        processor: 'Intel Core i5-13500 (14 núcleos)',
        ram: '16 GB DDR4 3200MHz',
        storage: '512 GB NVMe PCIe M.2 SSD',
        gpu: 'Intel UHD Graphics 770',
        formFactor: 'Small Form Factor (SFF)',
        serial: 'DL-SM-002-2026',
      },
      history: [{ id: 'h-sm-2', date: '14/01/2026 10:00', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-003',
      name: 'Sobremesa HCP-SM-003',
      status: 'disponible',
      entryDate: '03/02/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-003.pdf',
      pdfPages: 2,
      pdfAttachedDate: '03/02/2026',
      specs: {
        model: 'HP Pro Tower 400 G9',
        processor: 'Intel Core i7-13700 (16 núcleos)',
        ram: '32 GB DDR4 3200MHz',
        storage: '1 TB NVMe SSD + 1 TB HDD',
        gpu: 'Intel UHD Graphics 770',
        formFactor: 'Microtower',
        serial: 'HP-SM-003-8821',
      },
      history: [{ id: 'h-sm-3', date: '03/02/2026 11:30', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-005',
      name: 'Sobremesa HCP-SM-005',
      status: 'disponible',
      entryDate: '02/04/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-005.pdf',
      pdfPages: 2,
      pdfAttachedDate: '02/04/2026',
      specs: {
        model: 'Dell OptiPlex 7010 Tower',
        processor: 'Intel Core i7-13700 (16 núcleos, hasta 5.2 GHz)',
        ram: '32 GB DDR5 4800MHz (2 x 16GB)',
        storage: '1 TB NVMe M.2 PCIe Gen4 SSD',
        gpu: 'NVIDIA T1000 8GB GDDR6',
        formFactor: 'Tower ATX',
        serial: 'DL-SM005-992144',
      },
      history: [{ id: 'h-sm-5', date: '02/04/2026 09:00', action: 'Alta en el inventario', detail: 'Entrada al almacén de repuesto' }],
    },
    {
      id: 'HCP-SM-006',
      name: 'Sobremesa HCP-SM-006',
      status: 'disponible',
      entryDate: '02/04/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-006.pdf',
      pdfPages: 2,
      pdfAttachedDate: '02/04/2026',
      specs: {
        model: 'Dell OptiPlex 7010 Tower',
        processor: 'Intel Core i7-13700',
        ram: '32 GB DDR5',
        storage: '1 TB NVMe SSD',
        gpu: 'NVIDIA T1000 8GB',
        formFactor: 'Tower',
        serial: 'DL-SM006-992145',
      },
      history: [{ id: 'h-sm-6', date: '02/04/2026 09:00', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-007',
      name: 'Sobremesa HCP-SM-007',
      status: 'disponible',
      entryDate: '19/05/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-007.pdf',
      pdfPages: 2,
      pdfAttachedDate: '19/05/2026',
      specs: {
        model: 'Lenovo ThinkCentre M70s Gen 4',
        processor: 'Intel Core i5-13400',
        ram: '16 GB DDR4',
        storage: '512 GB SSD NVMe',
        gpu: 'Intel UHD 730',
        formFactor: 'Small Form Factor',
        serial: 'LN-SM-007-331',
      },
      history: [{ id: 'h-sm-7', date: '19/05/2026 14:00', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-008',
      name: 'Sobremesa HCP-SM-008',
      status: 'disponible',
      entryDate: '19/05/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-008.pdf',
      pdfPages: 2,
      pdfAttachedDate: '19/05/2026',
      specs: {
        model: 'Lenovo ThinkCentre M70s Gen 4',
        processor: 'Intel Core i5-13400',
        ram: '16 GB DDR4',
        storage: '512 GB SSD NVMe',
        gpu: 'Intel UHD 730',
        formFactor: 'Small Form Factor',
        serial: 'LN-SM-008-332',
      },
      history: [{ id: 'h-sm-8', date: '19/05/2026 14:00', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-010',
      name: 'Sobremesa HCP-SM-010',
      status: 'disponible',
      entryDate: '23/06/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-010.pdf',
      pdfPages: 2,
      pdfAttachedDate: '23/06/2026',
      specs: {
        model: 'HP ProDesk 400 G9 Mini',
        processor: 'Intel Core i5-12500T',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        gpu: 'Intel UHD 770',
        formFactor: 'Desktop Mini (1L)',
        serial: 'HP-SM010-8812',
      },
      history: [{ id: 'h-sm-10', date: '23/06/2026 16:20', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    {
      id: 'HCP-SM-012',
      name: 'Sobremesa HCP-SM-012',
      status: 'disponible',
      entryDate: '15/09/2026',
      deliveredTo: null,
      deliveryDate: null,
      pdfFileName: 'componentes-HCP-SM-012.pdf',
      pdfPages: 2,
      pdfAttachedDate: '15/09/2026',
      specs: {
        model: 'Dell OptiPlex 7010 Micro',
        processor: 'Intel Core i5-13500T',
        ram: '16 GB DDR5',
        storage: '512 GB SSD NVMe',
        gpu: 'Intel UHD Graphics',
        formFactor: 'Micro SFF',
        serial: 'DL-SM012-9988',
      },
      history: [{ id: 'h-sm-12', date: '15/09/2026 10:15', action: 'Alta en el inventario', detail: 'Entrada al almacén' }],
    },
    // The 3 in Historial (delivered/entregados) to reach total 12:
    {
      id: 'HCP-SM-004',
      name: 'Sobremesa HCP-SM-004',
      status: 'entregado',
      entryDate: '10/02/2026',
      deliveredTo: 'Nuria Vidal',
      deliveryDate: '12/10/2026',
      pdfFileName: 'componentes-HCP-SM-004.pdf',
      pdfPages: 2,
      pdfAttachedDate: '10/02/2026',
      specs: {
        model: 'Dell OptiPlex 7010 SFF',
        processor: 'Intel Core i5-13500',
        ram: '16 GB DDR4',
        storage: '512 GB SSD',
        gpu: 'Intel UHD 770',
        formFactor: 'SFF',
        serial: 'DL-SM-004-88',
      },
      history: [
        { id: 'h-sm-4-1', date: '12/10/2026 10:05', action: 'Entregado a Nuria Vidal', detail: 'Puesto fijo en planta 2' },
        { id: 'h-sm-4-2', date: '10/02/2026 09:30', action: 'Alta en el inventario', detail: 'Entrada inicial' },
      ],
    },
    {
      id: 'HCP-SM-009',
      name: 'Sobremesa HCP-SM-009',
      status: 'entregado',
      entryDate: '01/06/2026',
      deliveredTo: 'Andrés Molina',
      deliveryDate: '05/10/2026',
      pdfFileName: 'componentes-HCP-SM-009.pdf',
      pdfPages: 2,
      pdfAttachedDate: '01/06/2026',
      specs: {
        model: 'HP Pro Tower 400 G9',
        processor: 'Intel Core i7-13700',
        ram: '32 GB DDR4',
        storage: '1 TB SSD',
        gpu: 'Intel UHD 770',
        formFactor: 'Tower',
        serial: 'HP-SM009-1234',
      },
      history: [
        { id: 'h-sm-9-1', date: '05/10/2026 09:30', action: 'Entregado a Andrés Molina', detail: 'Puesto desarrollo de aplicaciones' },
        { id: 'h-sm-9-2', date: '01/06/2026 11:00', action: 'Alta en el inventario', detail: 'Entrada inicial' },
      ],
    },
    {
      id: 'HCP-SM-011',
      name: 'Sobremesa HCP-SM-011',
      status: 'entregado',
      entryDate: '10/07/2026',
      deliveredTo: 'Sergio Navas',
      deliveryDate: '30/09/2026',
      pdfFileName: 'componentes-HCP-SM-011.pdf',
      pdfPages: 2,
      pdfAttachedDate: '10/07/2026',
      specs: {
        model: 'Dell OptiPlex 7010 Tower',
        processor: 'Intel Core i7-13700',
        ram: '32 GB DDR5',
        storage: '1 TB SSD',
        gpu: 'Intel UHD 770',
        formFactor: 'Tower',
        serial: 'DL-SM011-7788',
      },
      history: [
        { id: 'h-sm-11-1', date: '30/09/2026 14:10', action: 'Entregado a Sergio Navas', detail: 'Reemplazo equipo obsoleto' },
        { id: 'h-sm-11-2', date: '10/07/2026 10:00', action: 'Alta en el inventario', detail: 'Entrada inicial' },
      ],
    },
  ],
  perifericos: [
    // Page 8 exact list
    {
      id: 'perif-1',
      brand: 'Logitech',
      name: 'Cámara web',
      category: 'Cámara web',
      quantity: 22,
      inStock: true,
    },
    {
      id: 'perif-2',
      brand: 'Microsoft',
      name: 'Cámara web',
      category: 'Cámara web',
      quantity: 10,
      inStock: true,
    },
    {
      id: 'perif-3',
      brand: 'Cámara web',
      name: 'Cámara web · sin marca',
      category: 'Cámara web',
      quantity: 8,
      inStock: true,
    },
    {
      id: 'perif-4',
      brand: 'Jabra',
      name: 'Auriculares',
      category: 'Auriculares',
      quantity: 30,
      inStock: true,
    },
    {
      id: 'perif-5',
      brand: 'Logitech',
      name: 'Auriculares',
      category: 'Auriculares',
      quantity: 18,
      inStock: true,
    },
    {
      id: 'perif-6',
      brand: 'Auriculares',
      name: 'Auriculares · sin marca',
      category: 'Auriculares',
      quantity: 12,
      inStock: true,
    },
  ],
};
