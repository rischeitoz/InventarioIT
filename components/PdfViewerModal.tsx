'use client';

import React, { useState } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function PdfViewerModal() {
  const { pdfModal, closePdfModal } = useInventory();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!pdfModal || !pdfModal.isOpen) return null;

  const totalPages = pdfModal.pages || 1;
  const specs = pdfModal.specs || {};
  const isHcptoolkitDoc =
    /Diagnostico|HCPToolKit|Friz-PC/i.test(pdfModal.fileName) ||
    /ASUSTeK|Ryzen|RTX\s*3060/i.test(specs.processor || specs.model || '');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textData = `=====================================================
HCPTOOLKIT — INFORME DE DIAGNÓSTICO DEL PC
=====================================================
EQUIPO / HOST: ${pdfModal.equipmentId || 'Friz-PC'}
USUARIO ACTUAL: ${specs.currentUser || 'rezki'}
SISTEMA OPERATIVO: ${specs.os || 'Windows 11 Home'}
FECHA DE EMISIÓN: ${specs.emissionDate || '21 de octubre de 2026, 20:11:58'}
PLACA BASE: ${specs.model || specs.motherboard || 'ASUSTeK COMPUTER INC. TUF B450M-PRO GAMING'}
ARQUITECTURA: ${specs.architecture || '64 bits (x64)'}

1. PROCESADOR Y MEMORIA RAM:
- Procesador (CPU): ${specs.processor || 'AMD Ryzen 7 2700X Eight-Core Processor (16 núcleos)'} (Estado: Óptimo)
- Memoria RAM: ${specs.ram || '15.9 GB (Team Group Inc)'} (Estado: Óptimo)

2. TARJETA(S) GRÁFICA(S) (GPU):
- Adaptador Gráfico: ${specs.gpu || 'NVIDIA GeForce RTX 3060'}
- Memoria VRAM: ${specs.vram || '12.0 GB (12288 MB)'}
- Temperatura: 40°C
- Controlador: 32.0.16.1088

3. UNIDADES DE ALMACENAMIENTO:
- Almacenamiento: ${specs.storage || '923.1 GB Total (C: 222.6 GB, D: 476.9 GB, E: 223.6 GB)'}

4. OBSERVACIONES Y RECOMENDACIONES:
- Resumen de Estado: Todos los componentes del sistema operan en niveles óptimos de rendimiento y temperatura.
Documento oficial generado por HCPToolKit.
=====================================================`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfModal.fileName.replace('.pdf', '')}_informe.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl rounded-none animate-in fade-in zoom-in-95">
        {/* Top Dark Bar */}
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#d8fa18] p-1.5 text-black rounded-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-zinc-100 flex items-center gap-2">
                <span>{pdfModal.fileName}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 font-sans">
                  HCPToolKit PDF
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                {isHcptoolkitDoc
                  ? 'Informe de Diagnóstico del PC · HCPToolKit'
                  : `Ficha técnica oficial · ${pdfModal.equipmentId}`}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-zinc-400 w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            <button
              onClick={handlePrint}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Imprimir documento"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d8fa18] text-black text-xs font-bold hover:bg-[#c6e810] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>

            <button
              onClick={closePdfModal}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-zinc-800 overflow-y-auto p-6 flex justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150"
          >
            {isHcptoolkitDoc ? (
              /* Exact visual replica of HCPTOOLKIT — INFORME DE DIAGNÓSTICO DEL PC */
              <div className="w-[680px] min-h-[920px] bg-white text-zinc-900 p-8 shadow-2xl border border-zinc-300 font-sans flex flex-col justify-between">
                <div>
                  {/* Top Dark Header Card matching Screenshot */}
                  <div className="bg-[#0f172a] text-white p-6 rounded-lg mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                        <span className="text-[#38bdf8]">HCPTOOLKIT</span>
                        <span className="text-zinc-400">—</span>
                        <span>INFORME DE DIAGNÓSTICO DEL PC</span>
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-5">
                      Auditoría completa de hardware, componentes principales y rendimiento del equipo
                    </p>

                    <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-[10px] border-t border-zinc-800/80 pt-4">
                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">EQUIPO / HOST</div>
                        <div className="font-bold text-white text-xs mt-0.5">{pdfModal.equipmentId || 'Friz-PC'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">USUARIO ACTUAL</div>
                        <div className="font-semibold text-white mt-0.5">{specs.currentUser || 'rezki'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">SISTEMA OPERATIVO</div>
                        <div className="font-semibold text-white mt-0.5">{specs.os || 'Windows 11 Home'}</div>
                      </div>

                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">FECHA DE EMISIÓN</div>
                        <div className="text-zinc-300 mt-0.5">{specs.emissionDate || '21 de octubre de 2026, 20:11:58'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">PLACA BASE</div>
                        <div className="text-zinc-200 mt-0.5 leading-tight">{specs.model || specs.motherboard || 'ASUSTeK COMPUTER INC. TUF B450M-PRO GAMING'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase font-semibold text-[9px]">ARQUITECTURA</div>
                        <div className="text-zinc-300 mt-0.5">{specs.architecture || '64 bits (x64)'}</div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Metric Tiles matching Screenshot */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-zinc-50 border border-zinc-200 p-3 text-center rounded">
                      <div className="text-xl font-black text-black">16</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">NÚCLEOS CPU</div>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 p-3 text-center rounded">
                      <div className="text-xl font-black text-black">15.9 GB</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">RAM TOTAL</div>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 p-3 text-center rounded">
                      <div className="text-xl font-black text-black">1</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">GPUS</div>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 p-3 text-center rounded">
                      <div className="text-xl font-black text-black">3</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">DISCOS</div>
                    </div>
                  </div>

                  {/* 1. PROCESADOR Y MEMORIA RAM */}
                  <div className="mb-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-zinc-900 pb-1 mb-2">
                      1. PROCESADOR Y MEMORIA RAM
                    </h4>
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-100/80 text-zinc-500 font-bold text-[9px] uppercase">
                          <th className="py-1.5 px-2">COMPONENTE</th>
                          <th className="py-1.5 px-2">ESPECIFICACIONES</th>
                          <th className="py-1.5 px-2">USO ACTUAL</th>
                          <th className="py-1.5 px-2 text-right">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        <tr>
                          <td className="py-2 px-2 font-bold text-black">Procesador (CPU)</td>
                          <td className="py-2 px-2 text-zinc-800">{specs.processor || 'AMD Ryzen 7 2700X Eight-Core Processor (16 núcleos)'}</td>
                          <td className="py-2 px-2 text-zinc-600">13% de carga</td>
                          <td className="py-2 px-2 text-right">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Óptimo</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 font-bold text-black">Memoria RAM</td>
                          <td className="py-2 px-2 text-zinc-800">{specs.ram || '15.9 GB (Team Group Inc)'}</td>
                          <td className="py-2 px-2 text-zinc-600">6.8 GB de 15.9 GB (43%)</td>
                          <td className="py-2 px-2 text-right">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Óptimo</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. TARJETA(S) GRÁFICA(S) (GPU) */}
                  <div className="mb-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-zinc-900 pb-1 mb-2">
                      2. TARJETA(S) GRÁFICA(S) (GPU)
                    </h4>
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-100/80 text-zinc-500 font-bold text-[9px] uppercase">
                          <th className="py-1.5 px-2">ADAPTADOR GRÁFICO</th>
                          <th className="py-1.5 px-2">MEMORIA VRAM</th>
                          <th className="py-1.5 px-2">TEMPERATURA</th>
                          <th className="py-1.5 px-2 text-right">CONTROLADOR</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-zinc-200">
                          <td className="py-2 px-2 font-bold text-black">{specs.gpu || 'NVIDIA GeForce RTX 3060'}</td>
                          <td className="py-2 px-2 text-zinc-800">{specs.vram || '12.0 GB (12288 MB)'}</td>
                          <td className="py-2 px-2 text-zinc-600">40°C</td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-700">32.0.16.1088</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. UNIDADES DE ALMACENAMIENTO */}
                  <div className="mb-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-zinc-900 pb-1 mb-2">
                      3. UNIDADES DE ALMACENAMIENTO
                    </h4>
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-100/80 text-zinc-500 font-bold text-[9px] uppercase">
                          <th className="py-1.5 px-2">UNIDAD</th>
                          <th className="py-1.5 px-2">CAPACIDAD TOTAL</th>
                          <th className="py-1.5 px-2">ESPACIO LIBRE</th>
                          <th className="py-1.5 px-2 text-right">USO (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        <tr>
                          <td className="py-1.5 px-2 font-bold text-black font-mono">C: (Disco Local)</td>
                          <td className="py-1.5 px-2">222.6 GB</td>
                          <td className="py-1.5 px-2 text-zinc-600">125.4 GB libres</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-emerald-700">43.6% en uso</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-bold text-black font-mono">D: (Disco Local)</td>
                          <td className="py-1.5 px-2">476.9 GB</td>
                          <td className="py-1.5 px-2 text-zinc-600">204.3 GB libres</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-emerald-700">57.2% en uso</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-bold text-black font-mono">E: (Disco Local)</td>
                          <td className="py-1.5 px-2">223.6 GB</td>
                          <td className="py-1.5 px-2 text-zinc-600">188.2 GB libres</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-emerald-700">15.8% en uso</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 4. OBSERVACIONES Y RECOMENDACIONES */}
                  <div className="bg-sky-50 border-l-4 border-sky-500 p-3 text-[10px]">
                    <div className="font-bold text-sky-950 mb-1">Resumen de Estado:</div>
                    <div className="text-sky-900">
                      • Todos los componentes del sistema operan en niveles óptimos de rendimiento y temperatura.
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-200 pt-3 text-center text-[9px] text-zinc-400">
                  Documento oficial generado por HCPToolKit. Todos los datos han sido auditados en tiempo real.
                </div>
              </div>
            ) : (
              /* Standard Hardware Sheet */
              <div className="w-[680px] min-h-[920px] bg-white text-black p-10 shadow-2xl border border-zinc-300 font-sans flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between border-b-2 border-black pb-5 mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 font-black text-2xl font-mono">
                        <span>HCP</span>
                        <span className="text-[#96b800]">+</span>
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mt-1">
                        DEPARTAMENTO DE SISTEMAS E INFRAESTRUCTURA IT
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-black">{pdfModal.equipmentId}</div>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left mb-6 border-collapse">
                    <tbody>
                      <tr className="border-b border-zinc-200">
                        <td className="py-2.5 font-semibold text-zinc-500 w-1/3">Modelo Comercial</td>
                        <td className="py-2.5 font-bold text-black">{specs.model || 'Estándar'}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-2.5 font-semibold text-zinc-500">Procesador (CPU)</td>
                        <td className="py-2.5 font-mono text-black">{specs.processor || 'Intel Core / AMD Ryzen'}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-2.5 font-semibold text-zinc-500">Memoria RAM</td>
                        <td className="py-2.5 font-mono font-semibold text-black">{specs.ram || '16 GB'}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-2.5 font-semibold text-zinc-500">Almacenamiento</td>
                        <td className="py-2.5 font-mono font-semibold text-black">{specs.storage || '512 GB SSD'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-zinc-200 pt-4 text-center text-[10px] text-zinc-400">
                  HCP+ IT SYSTEMS · Sistema de inventario adaptado para Windows Server e IIS
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
