
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
    <div className="min-h-screen pb-28 md:pb-8 bg-slate-50 print:bg-white">
      
      {/* 
        PLANTILLA DE IMPRESIÓN OFICIAL (Solo visible al imprimir)
        Diseñada para emular el formato físico PM04-PR88-M2
      */}
      <div className="hidden print:block font-sans text-[11px] leading-tight p-0 max-w-[21cm] mx-auto">
        {/* Header Oficial con bordes dobles/fuertes */}
        <table className="w-full border-2 border-black border-collapse mb-1">
          <tbody>
            <tr>
              <td className="border-2 border-black p-4 w-1/4 text-center align-middle">
                <img src="https://picsum.photos/seed/bogota/120/50" alt="Alcaldía de Bogotá" className="mx-auto block" />
              </td>
              <td className="border-2 border-black p-2 w-1/2 text-center align-middle">
                <p className="font-bold text-[13px] uppercase m-0 leading-tight">ALCALDÍA MAYOR DE BOGOTÁ</p>
                <p className="font-bold uppercase m-0 leading-tight text-[11px]">Evaluación, Control y Seguimiento</p>
                <p className="font-medium m-0 leading-tight">Acta de visita técnica a componentes de la EEP</p>
              </td>
              <td className="border-2 border-black p-0 w-1/4 align-top">
                <table className="w-full border-collapse h-full">
                  <tbody>
                    <tr><td className="border-b-2 border-black p-1"><strong>Código:</strong> PM04-PR88-M2</td></tr>
                    <tr><td className="border-b-2 border-black p-1"><strong>Versión:</strong> 03</td></tr>
                    <tr><td className="p-1"><strong>Vigencia:</strong> 2024</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Datos Generales Print - Layout de rejilla compacta */}
        <div className="bg-gray-200 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-center text-[10px]">Datos Generales de la Visita</div>
        <table className="w-full border-collapse border-2 border-black mb-2">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 w-1/2"><strong>Componente EEP:</strong> {formData.generalData.componente || '________________'}</td>
              <td className="border border-black p-1.5 w-1/2"><strong>Dirección:</strong> {formData.generalData.direccion || '________________'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5"><strong>Localidad / Barrio:</strong> {formData.generalData.localidad} / {formData.generalData.barrio}</td>
              <td className="border border-black p-1.5"><strong>Radicado Entrada:</strong> {formData.generalData.radicadoEntrada} ({formData.generalData.fechaRadicado})</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5"><strong>Fecha Visita:</strong> {formData.generalData.fechaVisita}</td>
              <td className="border border-black p-1.5"><strong>Hora Inicio:</strong> {formData.generalData.horaInicio}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5" colSpan={2}><strong>Expediente N°:</strong> {formData.generalData.expediente || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        {/* Motivo Print */}
        <div className="bg-gray-100 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-[10px]">1. Motivo de la Visita Técnica</div>
        <div className="border-2 border-black p-3 min-h-[50px] mb-2 text-justify">
          {formData.motivoVisita || "No se especificó motivo de visita."}
        </div>

        {/* Situaciones Encontradas Print */}
        <div className="bg-gray-100 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-[10px]">2. Evaluación de Situaciones Encontradas</div>
        <table className="w-full border-collapse border-2 border-black mb-2 text-[9px]">
          <thead>
            <tr className="bg-gray-50 text-center">
              <th className="border-2 border-black p-1 w-[55%]">Ítem de Evaluación</th>
              <th className="border-2 border-black p-1 w-[4%]">C</th>
              <th className="border-2 border-black p-1 w-[4%]">I</th>
              <th className="border-2 border-black p-1 w-[4%]">NA</th>
              <th className="border-2 border-black p-1">Descripción / Observación Técnica</th>
            </tr>
          </thead>
          <tbody>
            {formData.situacionesEncontradas.map(item => (
              <tr key={item.id}>
                <td className="border border-black p-1 font-medium">{item.label}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'C' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'I' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NA' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-[8px] italic">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Observaciones Específicas Print */}
        <div className="bg-gray-100 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-[10px]">3. Observaciones Específicas / Hallazgos</div>
        <table className="w-full border-collapse border-2 border-black mb-2 text-[9px]">
          <thead>
            <tr className="bg-gray-50 text-center">
              <th className="border-2 border-black p-1 w-[55%]">Hallazgo / Evidencia Directa</th>
              <th className="border-2 border-black p-1 w-[4%]">SI</th>
              <th className="border-2 border-black p-1 w-[4%]">NO</th>
              <th className="border-2 border-black p-1 w-[4%]">NA</th>
              <th className="border-2 border-black p-1">Descripción / Detalles Adicionales</th>
            </tr>
          </thead>
          <tbody>
            {formData.observacionesEspecificas.map(item => (
              <tr key={item.id}>
                <td className="border border-black p-1 font-medium">{item.label}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'SI' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NO' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-center font-bold">{item.status === 'NA' ? 'X' : ''}</td>
                <td className="border border-black p-1 text-[8px] italic">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Consideraciones Print */}
        <div className="bg-gray-100 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-[10px]">4. Consideraciones y Conclusiones Finales</div>
        <div className="border-2 border-black p-3 min-h-[120px] mb-4 text-justify whitespace-pre-wrap">
          {formData.consideracionesFinales || "No hay observaciones finales registradas."}
        </div>

        {/* Firmas Print - Boxed style */}
        <div className="bg-gray-100 border-x-2 border-t-2 border-black p-1 font-bold uppercase text-[10px]">Firmas de Responsables</div>
        <table className="w-full border-collapse border-2 border-black">
          <tbody>
            <tr>
              <td className="w-1/2 border border-black p-4 align-top">
                <div className="min-h-[120px] flex flex-col justify-end">
                  {formData.firmas.atendidaPor.signatureImage && (
                    <img src={formData.firmas.atendidaPor.signatureImage} className="max-h-[80px] object-contain mb-2 mx-auto" />
                  )}
                  <div className="border-t border-black mt-2 pt-1">
                    <p className="m-0 uppercase"><strong>Atendida por:</strong> {formData.firmas.atendidaPor.nombre || '________________'}</p>
                    <p className="m-0 text-[9px]"><strong>C.C / Nit:</strong> __________________________</p>
                    <p className="m-0 text-[9px]"><strong>Cargo/Relación:</strong> {formData.firmas.atendidaPor.cargo}</p>
                    <p className="m-0 text-[9px]"><strong>Empresa:</strong> {formData.firmas.atendidaPor.empresa}</p>
                  </div>
                </div>
              </td>
              <td className="w-1/2 border border-black p-4 align-top">
                <div className="min-h-[120px] flex flex-col justify-end">
                  {formData.firmas.realizadaPor.signatureImage && (
                    <img src={formData.firmas.realizadaPor.signatureImage} className="max-h-[80px] object-contain mb-2 mx-auto" />
                  )}
                  <div className="border-t border-black mt-2 pt-1">
                    <p className="m-0 uppercase"><strong>Profesional Responsable:</strong> {formData.firmas.realizadaPor.nombre || '________________'}</p>
                    <p className="m-0 text-[9px]"><strong>Matrícula Prof:</strong> {formData.firmas.realizadaPor.cargo}</p>
                    <p className="m-0 text-[9px]"><strong>Entidad/Dependencia:</strong> {formData.firmas.realizadaPor.empresa}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <p className="text-[7px] text-right mt-1 italic uppercase">Bogotá D.C., Colombia - Generado digitalmente</p>
      </div>

      {/* --- INTERFAZ DE USUARIO (Screen Only) --- */}
      <div className="print:hidden">
        {/* HEADER SECTION */}
        <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4">
              <img src="https://picsum.photos/seed/bogota/80/32" alt="Logo" className="h-8 md:h-10 object-contain" />
              <div className="border-l pl-3 hidden sm:block">
                <h1 className="text-[10px] md:text-sm font-bold uppercase text-gray-700 leading-tight">Acta Técnica EEP</h1>
                <p className="text-[9px] md:text-xs text-gray-400 font-medium">Formato Digital PM04</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={resetForm}
                className="p-2 md:px-4 md:py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center gap-2"
                title="Reiniciar Formulario"
              >
                <i className="fas fa-trash-alt"></i><span className="hidden md:inline">Limpiar</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-black bg-slate-900 text-white rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
              >
                <i className="fas fa-file-pdf text-red-400"></i>
                <span className="">GENERAR PDF</span>
              </button>
              <button
                onClick={downloadReport}
                className={`px-3 py-2 md:px-4 md:py-2 text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-2 ${
                  isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                <i className={`fas ${isSaved ? 'fa-check' : 'fa-save'}`}></i>
                <span className="hidden md:inline">{isSaved ? 'OK' : 'Guardar JSON'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-10 bg-white md:my-6 md:shadow-2xl md:rounded-3xl">
          
          {/* Form Identity Card */}
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Estructura Ecológica Principal</span>
              <h2 className="text-sm font-bold text-slate-800">Evaluación de Campo - PM04-PR88-M2</h2>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ver. 03 - Vigencia 2024</span>
            </div>
          </div>

          {/* Section: General Data */}
          <section className="space-y-4">
            <SectionTitle icon="fa-map-marker-alt" title="Datos Generales" />
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
            <SectionTitle icon="fa-file-alt" title="1- Motivo de la Visita" />
            <textarea
              className="w-full min-h-[80px] md:min-h-[120px] p-4 text-sm border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50 outline-none"
              placeholder="Describa el motivo técnico de la inspección..."
              value={formData.motivoVisita}
              onChange={(e) => setFormData(prev => ({ ...prev, motivoVisita: e.target.value }))}
            />
          </section>

          {/* Section 2: Situaciones Encontradas */}
          <section className="space-y-4">
            <SectionTitle icon="fa-check-double" title="2- Situaciones Encontradas" />
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
            <div className="hidden md:block overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/2">Ítem</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
            <SectionTitle icon="fa-search-plus" title="3- Observaciones Específicas" />
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
            <div className="hidden md:block overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/2">Hallazgo</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Presencia</th>
                    <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
            <SectionTitle icon="fa-comment-medical" title="Consideraciones Finales" />
            <textarea
              className="w-full min-h-[150px] md:min-h-[200px] p-4 text-sm border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50 outline-none"
              placeholder="Conclusiones, compromisos y cierre de la visita..."
              value={formData.consideracionesFinales}
              onChange={(e) => setFormData(prev => ({ ...prev, consideracionesFinales: e.target.value }))}
            />
          </section>

          {/* Signatures Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-8 border-t">
            <SignatureBox
              title="Persona que atiende la visita"
              person={formData.firmas.atendidaPor}
              onDataChange={(field, val) => handleFirmaChange('atendidaPor', field, val)}
              icon="fa-user-check"
            />
            <SignatureBox
              title="Profesional que realiza visita"
              person={formData.firmas.realizadaPor}
              onDataChange={(field, val) => handleFirmaChange('realizadaPor', field, val)}
              icon="fa-user-shield"
            />
          </section>
        </main>

        <footer className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Plataforma de Inspección Técnica EEP - Distrito Capital
        </footer>

        {/* Floating Action Mobile */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-2 md:hidden flex justify-between gap-2 z-50">
          <button
            onClick={handlePrint}
            className="flex-1 bg-white text-slate-900 py-3 px-6 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <i className="fas fa-file-pdf text-red-600"></i> PDF OFICIAL
          </button>
          <button
            onClick={downloadReport}
            className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <i className="fas fa-save"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- ENHANCED SUB-COMPONENTS --- */

const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm shadow-lg shadow-blue-100">
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
      className="px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all shadow-sm placeholder:text-slate-300"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Ingresar ${label.toLowerCase()}...`}
    />
  </div>
);

const EvaluationCard: React.FC<{ 
  item: ChecklistItem; 
  options: EvaluationStatus[]; 
  onStatusChange: (status: EvaluationStatus) => void; 
  onDescriptionChange: (desc: string) => void 
}> = ({ item, options, onStatusChange, onDescriptionChange }) => (
  <div className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm space-y-4">
    <p className="text-sm font-bold text-slate-800 leading-snug">{item.label}</p>
    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-2xl">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onStatusChange(opt)}
          className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${
            item.status === opt ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
    <input
      type="text"
      className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-medium border border-transparent focus:border-blue-100 outline-none"
      placeholder="Comentarios adicionales..."
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
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="p-4">
      <p className="text-sm text-slate-700 font-bold leading-tight">{item.label}</p>
    </td>
    <td className="p-4">
      <div className="flex justify-center gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onStatusChange(opt)}
            className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black ${
              item.status === opt
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
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
        placeholder="Anotación técnica..."
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
  <div className="p-6 md:p-8 border border-slate-100 rounded-[2rem] bg-white relative overflow-hidden flex flex-col gap-4">
    <div className="absolute top-4 right-4 text-slate-50">
       <i className={`fas ${icon} text-4xl`}></i>
    </div>
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
    <FormField label="Nombre Completo" value={person.nombre} onChange={(v) => onDataChange('nombre', v)} />
    <FormField label="Cargo / Especialidad" value={person.cargo} onChange={(v) => onDataChange('cargo', v)} />
    <FormField label="Entidad / Empresa" value={person.empresa} onChange={(v) => onDataChange('empresa', v)} />
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
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // Slate 900
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'draw') {
      const timer = setTimeout(resizeCanvas, 100);
      window.addEventListener('resize', resizeCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [mode, resizeCanvas]);

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
    <div className="mt-4 border-2 border-slate-50 rounded-2xl p-4 bg-slate-100/30" ref={containerRef}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex bg-white p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setMode('draw')}
            className={`text-[9px] px-3 py-1.5 rounded-lg font-black transition-all ${mode === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            PANTALLA
          </button>
          <button 
            onClick={() => setMode('upload')}
            className={`text-[9px] px-3 py-1.5 rounded-lg font-black transition-all ${mode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            SUBIR IMAGEN
          </button>
        </div>
        {mode === 'view' && (
          <button onClick={() => setMode('draw')} className="text-[9px] text-red-500 font-black hover:bg-red-50 px-2 py-1 rounded">
             NUEVA FIRMA
          </button>
        )}
      </div>

      <div className="relative min-h-[160px] flex items-center justify-center">
        {mode === 'draw' && (
          <div className="w-full flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              className="w-full bg-white border border-slate-200 rounded-xl cursor-crosshair touch-none shadow-inner"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex gap-2 w-full">
              <button onClick={clearCanvas} className="flex-1 py-2 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600">Borrar</button>
              <button onClick={saveCanvas} className="flex-[2] py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase shadow-lg">Confirmar Firma</button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
            <i className="fas fa-upload text-slate-300 text-xl mb-2"></i>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cargar archivo de firma</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        )}

        {mode === 'view' && value && (
          <div className="w-full flex flex-col items-center py-2">
            <img src={value} alt="Firma" className="max-h-[120px] mix-blend-multiply opacity-90" />
            <p className="text-[8px] text-slate-300 font-black uppercase mt-2 tracking-widest">Digitalmente Firmado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
