
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VisitFormData, EvaluationStatus, ChecklistItem, SignaturePerson } from './types';
import { INITIAL_FORM_DATA } from './constants';

const App: React.FC = () => {
  const [formData, setFormData] = useState<VisitFormData>(INITIAL_FORM_DATA);
  const [isSaved, setIsSaved] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('eep_visit_form_v2');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eep_visit_form_v2', JSON.stringify(formData));
  }, [formData]);

  const handleGeneralDataChange = (field: keyof VisitFormData['generalData'], value: string) => {
    setFormData(prev => ({
      ...prev,
      generalData: { ...prev.generalData, [field]: value }
    }));
  };

  const handleChecklistChange = (
    section: 'situacionesEncontradas' | 'observacionesEspecificas',
    id: string,
    field: 'status' | 'description',
    value: EvaluationStatus | string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleFirmaChange = (
    person: 'atendidaPor' | 'realizadaPor',
    field: keyof SignaturePerson,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      firmas: {
        ...prev.firmas,
        [person]: { ...prev.firmas[person], [field]: value }
      }
    }));
  };

  const resetForm = () => {
    if (window.confirm('¿Está seguro de reiniciar el formulario? Se perderán todos los cambios.')) {
      setFormData(INITIAL_FORM_DATA);
      localStorage.removeItem('eep_visit_form_v2');
    }
  };

  const downloadReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `visita_EEP_${formData.generalData.radicadoEntrada || 'sin_radicado'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-28 md:pb-8 print:pb-0 print:bg-white bg-slate-50">
      
      {/* 
        PLANTILLA DE IMPRESIÓN OFICIAL (Solo visible al imprimir)
        Esta sección replica la estructura del formato PM04-PR88-M2
      */}
      <div className="hidden print:block font-serif text-[12px] leading-tight p-4">
        {/* Header Oficial */}
        <table className="w-full border-collapse border border-black mb-4">
          <tr>
            <td className="border border-black p-2 w-1/4 text-center">
              <img src="https://picsum.photos/seed/bogota/100/40" alt="Logo" className="mx-auto" />
            </td>
            <td className="border border-black p-2 w-1/2 text-center align-middle">
              <p className="font-bold text-[14px] uppercase">ALCALDÍA MAYOR DE BOGOTÁ</p>
              <p className="font-bold uppercase">Evaluación, Control y Seguimiento</p>
              <p className="font-medium">Acta de visita técnica a componentes de la EEP</p>
            </td>
            <td className="border border-black p-0 w-1/4">
              <table className="w-full border-collapse">
                <tr><td className="border-b border-black p-1"><strong>Código:</strong> PM04-PR88-M2</td></tr>
                <tr><td className="border-b border-black p-1"><strong>Versión:</strong> 3</td></tr>
                <tr><td className="p-1"><strong>Vigencia:</strong> 2024</td></tr>
              </table>
            </td>
          </tr>
        </table>

        {/* Datos Generales Print */}
        <div className="border border-black bg-gray-100 p-1 font-bold uppercase mb-2">Datos Generales</div>
        <table className="w-full border-collapse border border-black mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/3"><strong>Componente:</strong> {formData.generalData.componente}</td>
              <td className="border border-black p-1 w-1/3"><strong>Dirección:</strong> {formData.generalData.direccion}</td>
              <td className="border border-black p-1 w-1/3"><strong>Localidad:</strong> {formData.generalData.localidad}</td>
            </tr>
            <tr>
              <td className="border border-black p-1"><strong>Barrio:</strong> {formData.generalData.barrio}</td>
              <td className="border border-black p-1"><strong>Radicado:</strong> {formData.generalData.radicadoEntrada}</td>
              <td className="border border-black p-1"><strong>Fecha Rad:</strong> {formData.generalData.fechaRadicado}</td>
            </tr>
            <tr>
              <td className="border border-black p-1"><strong>Fecha Visita:</strong> {formData.generalData.fechaVisita}</td>
              <td className="border border-black p-1"><strong>Hora Inicio:</strong> {formData.generalData.horaInicio}</td>
              <td className="border border-black p-1"><strong>Expediente:</strong> {formData.generalData.expediente}</td>
            </tr>
          </tbody>
        </table>

        {/* Motivo Print */}
        <div className="border border-black bg-gray-100 p-1 font-bold uppercase mb-1">1. Motivo de la Visita</div>
        <div className="border border-black p-2 min-h-[60px] mb-4 italic text-justify">
          {formData.motivoVisita || "No especificado"}
        </div>

        {/* Situaciones Encontradas Print */}
        <div className="border border-black bg-gray-100 p-1 font-bold uppercase mb-1">2. Situaciones Encontradas</div>
        <table className="w-full border-collapse border border-black mb-4 text-[10px]">
          <thead>
            <tr className="bg-gray-50 text-center">
              <th className="border border-black p-1 w-[60%]">Ítem de Evaluación</th>
              <th className="border border-black p-1 w-[5%]">C</th>
              <th className="border border-black p-1 w-[5%]">I</th>
              <th className="border border-black p-1 w-[5%]">NA</th>
              <th className="border border-black p-1">Descripción / Observación</th>
            </tr>
          </thead>
          <tbody>
            {formData.situacionesEncontradas.map(item => (
              <tr key={item.id}>
                <td className="border border-black p-1">{item.label}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'C' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'I' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NA' ? 'X' : ''}</td>
                <td className="border border-black p-1">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Observaciones Específicas Print */}
        <div className="border border-black bg-gray-100 p-1 font-bold uppercase mb-1">3. Observaciones Específicas</div>
        <table className="w-full border-collapse border border-black mb-4 text-[10px]">
          <thead>
            <tr className="bg-gray-50 text-center">
              <th className="border border-black p-1 w-[60%]">Hallazgo / Evidencia</th>
              <th className="border border-black p-1 w-[5%]">SI</th>
              <th className="border border-black p-1 w-[5%]">NO</th>
              <th className="border border-black p-1 w-[5%]">NA</th>
              <th className="border border-black p-1">Descripción / Detalles</th>
            </tr>
          </thead>
          <tbody>
            {formData.observacionesEspecificas.map(item => (
              <tr key={item.id}>
                <td className="border border-black p-1">{item.label}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'SI' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NO' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NA' ? 'X' : ''}</td>
                <td className="border border-black p-1">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Consideraciones Print */}
        <div className="border border-black bg-gray-100 p-1 font-bold uppercase mb-1">Consideraciones Finales</div>
        <div className="border border-black p-2 min-h-[100px] mb-8 text-justify">
          {formData.consideracionesFinales || "Sin observaciones adicionales."}
        </div>

        {/* Firmas Print */}
        <table className="w-full border-collapse">
          <tr>
            <td className="w-1/2 pr-4 align-top">
              <div className="border-t border-black pt-2 mt-20">
                {formData.firmas.atendidaPor.signatureImage && (
                  <img src={formData.firmas.atendidaPor.signatureImage} className="h-16 mb-2" />
                )}
                <p><strong>Firma:</strong> _________________________</p>
                <p><strong>Nombre:</strong> {formData.firmas.atendidaPor.nombre}</p>
                <p><strong>Cargo:</strong> {formData.firmas.atendidaPor.cargo}</p>
                <p><strong>C.C:</strong> ___________________________</p>
              </div>
            </td>
            <td className="w-1/2 pl-4 align-top">
              <div className="border-t border-black pt-2 mt-20">
                {formData.firmas.realizadaPor.signatureImage && (
                  <img src={formData.firmas.realizadaPor.signatureImage} className="h-16 mb-2" />
                )}
                <p><strong>Firma Profesional:</strong> ___________________</p>
                <p><strong>Nombre:</strong> {formData.firmas.realizadaPor.nombre}</p>
                <p><strong>Mat. Prof:</strong> {formData.firmas.realizadaPor.cargo}</p>
                <p><strong>Dependencia:</strong> {formData.firmas.realizadaPor.empresa}</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      {/* --- INTERFAZ DE USUARIO (Screen Only) --- */}
      <div className="print:hidden">
        {/* HEADER SECTION */}
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4">
              <img src="https://picsum.photos/seed/bogota/80/32" alt="Logo" className="h-8 md:h-10 object-contain" />
              <div className="border-l pl-3 hidden sm:block">
                <h1 className="text-[10px] md:text-sm font-bold uppercase text-gray-700 leading-tight">Gestión EEP Bogotá</h1>
                <p className="text-[9px] md:text-xs text-gray-400 font-medium">Acta Técnica PM04</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={resetForm}
                className="p-2 md:px-4 md:py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Reiniciar"
              >
                <i className="fas fa-undo"></i><span className="hidden md:inline ml-2">Reiniciar</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 md:px-4 md:py-2 text-xs font-bold bg-gray-800 text-white rounded-full shadow-sm flex items-center gap-2 hover:bg-black transition-all"
              >
                <i className="fas fa-file-pdf"></i>
                <span className="hidden md:inline">Descargar PDF</span>
              </button>
              <button
                onClick={downloadReport}
                className={`px-3 py-2 md:px-4 md:py-2 text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-2 ${
                  isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                <i className={`fas ${isSaved ? 'fa-check' : 'fa-download'}`}></i>
                <span className="hidden md:inline">{isSaved ? 'Guardado' : 'Exportar JSON'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-10 bg-white md:my-6 md:shadow-2xl md:rounded-3xl">
          
          {/* Form Identity - Compact on Mobile */}
          <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4 mb-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-blue-600 uppercase">Documento Oficial</span>
              <span className="text-xs font-mono font-bold text-gray-800">PM04-PR88-M2 (v3)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Visita Técnica</span>
            </div>
          </div>

          {/* Section: General Data */}
          <section className="space-y-4">
            <SectionTitle icon="fa-info-circle" title="Datos Generales" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <FormField label="Componente de la EEP" value={formData.generalData.componente} onChange={(v) => handleGeneralDataChange('componente', v)} />
              <FormField label="Dirección" value={formData.generalData.direccion} onChange={(v) => handleGeneralDataChange('direccion', v)} />
              <FormField label="Localidad" value={formData.generalData.localidad} onChange={(v) => handleGeneralDataChange('localidad', v)} />
              <FormField label="Barrio" value={formData.generalData.barrio} onChange={(v) => handleGeneralDataChange('barrio', v)} />
              <FormField label="Radicado de Entrada" value={formData.generalData.radicadoEntrada} onChange={(v) => handleGeneralDataChange('radicadoEntrada', v)} />
              <FormField label="Fecha Radicado" type="date" value={formData.generalData.fechaRadicado} onChange={(v) => handleGeneralDataChange('fechaRadicado', v)} />
              <FormField label="Proceso" value={formData.generalData.proceso} onChange={(v) => handleGeneralDataChange('proceso', v)} />
              <FormField label="Fecha de Visita" type="date" value={formData.generalData.fechaVisita} onChange={(v) => handleGeneralDataChange('fechaVisita', v)} />
              <FormField label="Hora de Inicio" type="time" value={formData.generalData.horaInicio} onChange={(v) => handleGeneralDataChange('horaInicio', v)} />
              <FormField label="Autoridad Competente" value={formData.generalData.autoridadCompetente} onChange={(v) => handleGeneralDataChange('autoridadCompetente', v)} />
              <FormField label="Expediente N°" value={formData.generalData.expediente} onChange={(v) => handleGeneralDataChange('expediente', v)} />
            </div>
          </section>

          {/* Section 1: Motivo */}
          <section className="space-y-4">
            <SectionTitle icon="fa-bullseye" title="1- Motivo de la Visita" />
            <textarea
              className="w-full min-h-[80px] md:min-h-[120px] p-4 text-sm border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50"
              placeholder="Especifique el motivo de la inspección..."
              value={formData.motivoVisita}
              onChange={(e) => setFormData(prev => ({ ...prev, motivoVisita: e.target.value }))}
            />
          </section>

          {/* Section 2: Situaciones Encontradas */}
          <section className="space-y-4">
            <SectionTitle icon="fa-tasks" title="2- Situaciones Encontradas" />
            
            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {formData.situacionesEncontradas.map((item) => (
                <EvaluationCard
                  key={item.id}
                  item={item}
                  options={[EvaluationStatus.C, EvaluationStatus.I, EvaluationStatus.NA]}
                  onStatusChange={(status) => handleChecklistChange('situacionesEncontradas', item.id, 'status', status)}
                  onDescriptionChange={(desc) => handleChecklistChange('situacionesEncontradas', item.id, 'description', desc)}
                />
              ))}
            </div>

            {/* Tablet/Desktop View: Table */}
            <div className="hidden md:block overflow-hidden border rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/2">Ítem</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {formData.situacionesEncontradas.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      options={[EvaluationStatus.C, EvaluationStatus.I, EvaluationStatus.NA]}
                      onStatusChange={(status) => handleChecklistChange('situacionesEncontradas', item.id, 'status', status)}
                      onDescriptionChange={(desc) => handleChecklistChange('situacionesEncontradas', item.id, 'description', desc)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Observaciones Específicas */}
          <section className="space-y-4">
            <SectionTitle icon="fa-clipboard-check" title="3- Observaciones Específicas" />
            
            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {formData.observacionesEspecificas.map((item) => (
                <EvaluationCard
                  key={item.id}
                  item={item}
                  options={[EvaluationStatus.SI, EvaluationStatus.NO, EvaluationStatus.NA]}
                  onStatusChange={(status) => handleChecklistChange('observacionesEspecificas', item.id, 'status', status)}
                  onDescriptionChange={(desc) => handleChecklistChange('observacionesEspecificas', item.id, 'description', desc)}
                />
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-hidden border rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/2">Hallazgo</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Presencia</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {formData.observacionesEspecificas.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      options={[EvaluationStatus.SI, EvaluationStatus.NO, EvaluationStatus.NA]}
                      onStatusChange={(status) => handleChecklistChange('observacionesEspecificas', item.id, 'status', status)}
                      onDescriptionChange={(desc) => handleChecklistChange('observacionesEspecificas', item.id, 'description', desc)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Final Considerations */}
          <section className="space-y-4">
            <SectionTitle icon="fa-comment-dots" title="Consideraciones Finales" />
            <textarea
              className="w-full min-h-[120px] md:min-h-[180px] p-4 text-sm border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50"
              placeholder="Conclusiones y compromisos finales..."
              value={formData.consideracionesFinales}
              onChange={(e) => setFormData(prev => ({ ...prev, consideracionesFinales: e.target.value }))}
            />
          </section>

          {/* Signatures Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-8 border-t">
            <SignatureBox
              title="Atendido Por"
              person={formData.firmas.atendidaPor}
              onDataChange={(field, val) => handleFirmaChange('atendidaPor', field, val)}
              icon="fa-user-tie"
            />
            <SignatureBox
              title="Profesional Responsable"
              person={formData.firmas.realizadaPor}
              onDataChange={(field, val) => handleFirmaChange('realizadaPor', field, val)}
              icon="fa-id-card-clip"
            />
          </section>
        </main>

        {/* Optimized Floating Action Bar for Mobile */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full p-2 md:hidden flex justify-between gap-2 z-50">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 text-white py-3 px-6 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="fas fa-file-pdf"></i> PDF
          </button>
          <button
            onClick={downloadReport}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="fas fa-save"></i> JSON
          </button>
        </div>

        <footer className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest no-print">
          EEP Bogotá - Sistema de Inspección Digital
        </footer>
      </div>
    </div>
  );
};

/* --- ENHANCED SUB-COMPONENTS --- */

const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
      <i className={`fas ${icon}`}></i>
    </div>
    <h2 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight">{title}</h2>
  </div>
);

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      className="px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all placeholder:text-slate-300 shadow-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const EvaluationCard: React.FC<{ 
  item: ChecklistItem; 
  options: EvaluationStatus[]; 
  onStatusChange: (status: EvaluationStatus) => void; 
  onDescriptionChange: (desc: string) => void 
}> = ({ item, options, onStatusChange, onDescriptionChange }) => (
  <div className="p-5 border-2 border-slate-100 rounded-3xl bg-white shadow-sm space-y-4">
    <p className="text-sm font-bold text-slate-800 leading-snug">{item.label}</p>
    
    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-2xl">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onStatusChange(opt)}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
            item.status === opt
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>

    <input
      type="text"
      className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-medium border-2 border-transparent focus:border-blue-100 outline-none"
      placeholder="Agregar observación técnica..."
      value={item.description}
      onChange={(e) => onDescriptionChange(e.target.value)}
    />
  </div>
);

const ChecklistRow: React.FC<{ 
  item: ChecklistItem; 
  options: EvaluationStatus[]; 
  onStatusChange: (status: EvaluationStatus) => void; 
  onDescriptionChange: (desc: string) => void 
}> = ({ item, options, onStatusChange, onDescriptionChange }) => (
  <tr className="hover:bg-blue-50/20 transition-colors group">
    <td className="p-4">
      <p className="text-sm text-slate-700 font-bold leading-tight">{item.label}</p>
    </td>
    <td className="p-4">
      <div className="flex justify-center gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onStatusChange(opt)}
            className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black ${
              item.status === opt
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-slate-100 text-slate-300 hover:border-blue-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </td>
    <td className="p-4">
      <input
        type="text"
        className="w-full text-xs p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-100 outline-none font-medium"
        placeholder="Anotar detalles..."
        value={item.description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </td>
  </tr>
);

const SignatureBox: React.FC<{ 
  title: string; 
  person: SignaturePerson; 
  onDataChange: (field: keyof SignaturePerson, val: string) => void;
  icon: string;
}> = ({ title, person, onDataChange, icon }) => (
  <div className="p-6 md:p-8 border-2 border-slate-100 rounded-[32px] bg-white relative overflow-hidden flex flex-col gap-4">
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center opacity-40">
       <i className={`fas ${icon} text-3xl text-slate-200`}></i>
    </div>
    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
    <FormField label="Nombre Completo" value={person.nombre} onChange={(v) => onDataChange('nombre', v)} />
    <FormField label="Cargo / Entidad" value={person.cargo} onChange={(v) => onDataChange('cargo', v)} />
    <FormField label="Empresa" value={person.empresa} onChange={(v) => onDataChange('empresa', v)} />
    
    <SignatureInput 
      value={person.signatureImage} 
      onSave={(img) => onDataChange('signatureImage', img)} 
    />
  </div>
);

const SignatureInput: React.FC<{ value?: string; onSave: (img: string) => void }> = ({ value, onSave }) => {
  const [mode, setMode] = useState<'draw' | 'upload' | 'view'>(value ? 'view' : 'draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  const resizeCanvas = useCallback(() => {
    if (mode === 'draw' && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      setMode('view');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onSave(ev.target.result as string);
          setMode('view');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-4 border-2 border-slate-100 rounded-3xl p-4 md:p-6 bg-slate-50/50" ref={containerRef}>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex bg-white p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setMode('draw')}
            className={`text-[10px] px-4 py-2 rounded-lg font-black transition-all ${mode === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            FIRMAR
          </button>
          <button 
            onClick={() => setMode('upload')}
            className={`text-[10px] px-4 py-2 rounded-lg font-black transition-all ${mode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            SUBIR
          </button>
        </div>
        {mode === 'view' && (
          <button onClick={() => setMode('draw')} className="text-[10px] text-red-500 font-black flex items-center gap-1">
             BORRAR
          </button>
        )}
      </div>

      <div className="relative min-h-[180px] flex items-center justify-center">
        {mode === 'draw' && (
          <div className="w-full flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              className="w-full bg-white border-2 border-blue-50 rounded-2xl cursor-crosshair touch-none shadow-inner"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex gap-4 w-full">
              <button onClick={clearCanvas} className="flex-1 py-3 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase border-2 border-slate-100 active:scale-95 transition-transform">Limpiar</button>
              <button onClick={saveCanvas} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-transform">Confirmar Firma</button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-blue-50 border-dashed rounded-[32px] cursor-pointer bg-white hover:bg-blue-50/50 transition-colors">
            <i className="fas fa-camera text-blue-200 text-3xl mb-3"></i>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tomar Foto o Subir</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        )}

        {mode === 'view' && value && (
          <div className="w-full flex flex-col items-center py-4">
            <img src={value} alt="Firma" className="max-h-[140px] w-auto mix-blend-multiply" />
            <div className="mt-4 w-32 h-0.5 bg-slate-200 rounded-full"></div>
            <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 tracking-[0.2em]">Firma Registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
