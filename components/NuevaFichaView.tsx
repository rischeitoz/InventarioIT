'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/lib/inventory-context';
import {
  Laptop,
  Monitor,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Cpu,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  Upload,
} from 'lucide-react';
import { getApiEndpoint } from '@/lib/utils';

export function NuevaFichaView() {
  const { setActiveTab, addNewEquipment } = useInventory();

  const [equipmentType, setEquipmentType] = useState<'Portátil' | 'Sobremesa'>('Portátil');
  const [equipmentName, setEquipmentName] = useState('');
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number; base64?: string } | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [extractedFeedback, setExtractedFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSpecsDetails, setShowSpecsDetails] = useState(false);

  // Hardware specs matching HCPTOOLKIT structure
  const [specs, setSpecs] = useState({
    model: '',
    processor: '',
    ram: '',
    storage: '',
    gpu: '',
    vram: '',
    os: '',
    architecture: '',
    currentUser: '',
    emissionDate: '',
    serial: '',
    batteryHealth: '',
    display: '',
    formFactor: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF is optional: only equipment name is required to save
  const isNameValid = equipmentName.trim().length > 0;
  const canSave = isNameValid && !isReadingPdf;

  const getMissingText = () => {
    if (!isNameValid) return 'Falta: el nombre o código del equipo. (El PDF de componentes es opcional)';
    if (pdfFile) return 'Nombre completado y PDF analizado con éxito.';
    return 'Listo para guardar ficha (sin PDF adjunto).';
  };

  const processPdfFile = async (file: File) => {
    setIsReadingPdf(true);
    setExtractedFeedback(null);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      setPdfFile({
        name: file.name,
        size: file.size,
        base64: base64Data,
      });

      // Call extraction endpoint to read the uploaded PDF's structure
      const response = await fetch(getApiEndpoint('/api/extract-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64Data,
          mimeType: file.type || 'application/pdf',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          applyExtractedData(result.data, file.name);
        }
      }
    } catch (err) {
      console.error('Error processing PDF:', err);
      setExtractedFeedback('El PDF se adjuntó. Puedes revisar o ajustar las especificaciones manualmente.');
    } finally {
      setIsReadingPdf(false);
    }
  };

  const applyExtractedData = (d: any, fileName: string) => {
    // 1. Host / Equipment Name from uploaded PDF
    if (d.id || d.hostname) {
      setEquipmentName(d.id || d.hostname);
    } else {
      // If not explicit in PDF, extract clean name from filename
      const cleanName = fileName.replace('.pdf', '').replace(/^componentes[-_]/i, '');
      setEquipmentName(cleanName);
    }

    // 2. Type: Sobremesa vs Portátil
    if (d.type === 'Portátil' || d.type === 'Sobremesa') {
      setEquipmentType(d.type);
    }

    // 3. Complete Specs from the uploaded PDF
    setSpecs({
      model: d.model || d.motherboard || '',
      processor: d.processor || '',
      ram: d.ram || '',
      storage: d.storage || '',
      gpu: d.gpu ? `${d.gpu}${d.vram ? ` (${d.vram})` : ''}` : '',
      vram: d.vram || '',
      os: d.os || '',
      architecture: d.architecture || '',
      currentUser: d.currentUser || '',
      emissionDate: d.emissionDate || '',
      serial: d.serial || `SN-${d.id || 'EQUIP'}-${Math.floor(1000 + Math.random() * 9000)}`,
      batteryHealth: d.batteryHealth || '',
      display: d.display || '',
      formFactor: d.formFactor || '',
    });

    setShowSpecsDetails(true);
    setExtractedFeedback(
      `Información extraída del PDF: Equipo "${d.id || d.hostname || 'detectado'}" · ${d.processor ? `CPU: ${d.processor}` : ''} · ${d.ram ? `RAM: ${d.ram}` : ''} · ${d.gpu ? `GPU: ${d.gpu}` : ''}`
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setExtractedFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!canSave) return;

    const formattedId = equipmentName.trim();

    const finalSpecs = {
      model: specs.model || (equipmentType === 'Portátil' ? 'Portátil Estándar Corporativo' : 'Equipo Sobremesa'),
      processor: specs.processor || (equipmentType === 'Portátil' ? 'Intel Core i5-1345U' : 'Intel Core i5-13500'),
      ram: specs.ram || '16 GB DDR5',
      storage: specs.storage || '512 GB SSD NVMe',
      display: specs.display || (equipmentType === 'Portátil' ? '14.0" FHD IPS' : ''),
      gpu: specs.gpu || (equipmentType === 'Sobremesa' ? 'Intel UHD Graphics 770' : ''),
      serial: specs.serial || `SN-${formattedId}`,
      batteryHealth: specs.batteryHealth || (equipmentType === 'Portátil' ? '100%' : ''),
      formFactor: specs.formFactor || (equipmentType === 'Sobremesa' ? 'Small Form Factor' : ''),
    };

    const success = addNewEquipment({
      type: equipmentType,
      id: formattedId,
      pdfFileName: pdfFile ? pdfFile.name : '',
      specs: finalSpecs,
    });

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        if (equipmentType === 'Portátil') {
          setActiveTab('portatiles');
        } else {
          setActiveTab('sobremesas');
        }
      }, 1000);
    }
  };

  const handleCancel = () => {
    if (equipmentType === 'Portátil') {
      setActiveTab('portatiles');
    } else {
      setActiveTab('sobremesas');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            ALTA DE EQUIPO
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black font-sans">
            Nueva ficha
          </h1>
        </div>

        {/* Portátil / Sobremesa Switcher */}
        <div className="flex items-center border border-black p-0.5 bg-zinc-100">
          <button
            onClick={() => setEquipmentType('Portátil')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
              equipmentType === 'Portátil'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Portátil
          </button>
          <button
            onClick={() => setEquipmentType('Sobremesa')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
              equipmentType === 'Sobremesa'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Sobremesa
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">
            ¡Ficha de {equipmentName} guardada correctamente! Redirigiendo al panel...
          </span>
        </div>
      )}

      {/* Auto-extraction feedback banner */}
      {extractedFeedback && (
        <div className="p-4 bg-[#d8fa18]/25 border-2 border-[#d8fa18] text-black text-xs font-medium flex items-start gap-3 shadow-xs">
          <Sparkles className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Estructura del PDF leída con éxito:</span> {extractedFeedback}
          </div>
        </div>
      )}

      {/* Two-Column Form Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Equipment Data */}
        <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">
              Datos del {equipmentType.toLowerCase()}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200">
              Campo obligatorio
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-2">
              Nombre / Host del {equipmentType.toLowerCase()} *
            </label>
            <input
              type="text"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder={equipmentType === 'Portátil' ? 'Ej. HCP-PT-049' : 'Ej. HCP-SM-013'}
              className="w-full px-4 py-3 bg-white border border-zinc-300 text-base font-mono focus:outline-none focus:border-black rounded-none shadow-sm"
            />
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed pt-1">
            Solo se pide el nombre para identificar el {equipmentType.toLowerCase()}. Si adjuntas el PDF de diagnóstico del equipo, el nombre y los componentes se rellenarán automáticamente según la estructura del documento.
          </p>

          {/* Collapsible hardware specs view/edit */}
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setShowSpecsDetails(!showSpecsDetails)}
              className="w-full flex items-center justify-between py-2 text-xs font-bold text-zinc-700 hover:text-black"
            >
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                Componentes de hardware {pdfFile ? '(extraídos del PDF)' : '(opcionales)'}
              </span>
              {showSpecsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSpecsDetails && (
              <div className="space-y-3 pt-3 text-xs bg-zinc-50/80 p-4 border border-zinc-200 mt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Placa Base / Modelo
                  </label>
                  <input
                    type="text"
                    value={specs.model}
                    onChange={(e) => setSpecs({ ...specs, model: e.target.value })}
                    placeholder="Modelo o placa base del equipo"
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Procesador (CPU)
                  </label>
                  <input
                    type="text"
                    value={specs.processor}
                    onChange={(e) => setSpecs({ ...specs, processor: e.target.value })}
                    placeholder="Procesador detectado"
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Memoria RAM
                    </label>
                    <input
                      type="text"
                      value={specs.ram}
                      onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                      placeholder="Capacidad y tipo de RAM"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Tarjeta Gráfica (GPU)
                    </label>
                    <input
                      type="text"
                      value={specs.gpu}
                      onChange={(e) => setSpecs({ ...specs, gpu: e.target.value })}
                      placeholder="Adaptador gráfico"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Unidades de Almacenamiento
                  </label>
                  <input
                    type="text"
                    value={specs.storage}
                    onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                    placeholder="Capacidad y discos"
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Sistema Operativo
                    </label>
                    <input
                      type="text"
                      value={specs.os}
                      onChange={(e) => setSpecs({ ...specs, os: e.target.value })}
                      placeholder="Sistema Operativo"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Usuario Detectado
                    </label>
                    <input
                      type="text"
                      value={specs.currentUser}
                      onChange={(e) => setSpecs({ ...specs, currentUser: e.target.value })}
                      placeholder="Usuario asignado"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PDF Upload Area */}
        <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <span>PDF de diagnóstico del equipo</span>
              <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-zinc-200">
                Opcional
              </span>
            </h2>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Adjunta el PDF del equipo. El sistema leerá automáticamente su estructura de diagnóstico y autorrellenará la ficha.
          </p>

          {/* Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processPdfFile(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-zinc-300 p-8 text-center flex flex-col items-center justify-center min-h-[220px] bg-zinc-50/50 relative hover:border-zinc-400 transition-colors"
          >
            {isReadingPdf ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
                <div className="text-xs font-bold text-black">
                  Leyendo estructura del PDF del equipo...
                </div>
                <div className="text-[11px] text-zinc-500">
                  Extrayendo Host, CPU, RAM, GPU, Almacenamiento y Sistema Operativo
                </div>
              </div>
            ) : pdfFile ? (
              <div className="space-y-3 w-full max-w-sm">
                <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-3 py-2 border border-emerald-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-xs font-bold truncate">{pdfFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="text-zinc-400 hover:text-rose-600 p-1"
                    title="Eliminar PDF adjunto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-2">
                  <span>{(pdfFile.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Datos del PDF leídos con éxito
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-zinc-400 stroke-1 mb-2" />
                <div className="text-xs font-semibold text-zinc-700 mb-1">
                  Arrastra o selecciona el PDF de este equipo
                </div>
                <div className="text-[11px] text-zinc-500 mb-4 max-w-xs">
                  Todos los PDFs con la estructura de diagnóstico serán leídos y procesados automáticamente.
                </div>
              </div>
            )}

            {!isReadingPdf && (
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{pdfFile ? 'Cambiar PDF del equipo' : 'Seleccionar PDF del equipo'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
            <div className="font-semibold text-black flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-700" />
              Lectura automática por estructura:
            </div>
            <div>• Lee el campo <strong>EQUIPO / HOST</strong> como identificador de la ficha.</div>
            <div>• Extrae Placa Base, Procesador, Memoria RAM, Adaptador Gráfico y Discos locales.</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {!isNameValid ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span className={`text-xs font-medium ${!isNameValid ? 'text-zinc-500' : 'text-emerald-700'}`}>
            {getMissingText()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-black hover:underline"
          >
            Cancelar y volver
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-8 py-2.5 text-xs font-bold transition-all ${
              canSave
                ? 'bg-[#d8fa18] text-black hover:bg-[#c6e810] shadow-sm'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Guardar ficha
          </button>
        </div>
      </div>
    </div>
  );
}
