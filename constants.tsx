
import React from 'react';
import { VisitFormData, EvaluationStatus } from './types';

export const INITIAL_FORM_DATA: VisitFormData = {
  generalData: {
    componente: '',
    direccion: '',
    localidad: '',
    barrio: '',
    radicadoEntrada: '',
    fechaRadicado: '',
    proceso: '',
    fechaVisita: new Date().toISOString().split('T')[0],
    horaInicio: '',
    autoridadCompetente: 'Secretaría Distrital de Ambiente',
    expediente: '',
  },
  motivoVisita: '',
  situacionesEncontradas: [
    { id: 'sit_1', label: 'El cuerpo de agua se encuentra libre de escombros y/ residuos sólidos', status: null, description: '' },
    { id: 'sit_2', label: 'La Zona de manejo y preservación Ambiental – ZMPA se encuentra despejada de escombros, RCD y/o Residuos Sólidos.', status: null, description: '' },
    { id: 'sit_3', label: 'La infraestructura presente en la EEP cuenta con permiso de la Autoridad Ambiental Competente', status: null, description: '' },
    { id: 'sit_4', label: 'Las descargas de aguas lluvias al cuerpo de agua cuentan con Permiso EAAB ó POC ó lineamientos SER – SDA', status: null, description: '' },
    { id: 'sit_5', label: 'El componente de la EEP se encuentra protegido de derrames de Hidrocarburos u otros compuestos químicos', status: null, description: '' },
    { id: 'sit_6', label: 'El suelo de la EEP se encuentra libre de afectaciones al suelo como (compactación, excavación, otros)', status: null, description: '' },
    { id: 'sit_7', label: 'El arbolado o zonas verdes se encuentran libres de afectaciones (mecánicas, excavación, disposición, otras)', status: null, description: '' },
    { id: 'sit_8', label: 'El cerramiento de la obra hacia la EEP se encuentra en buen estado', status: null, description: '' },
    { id: 'sit_9', label: 'Los mojones de delimitación se encuentran materializados de acuerdo a lo establecido en el POT', status: null, description: '' },
    { id: 'sit_10', label: 'La EEP se encuentra libre de endurecimientos.', status: null, description: '' },
    { id: 'sit_11', label: 'El componente de la EEP se encuentra despejado de actividades diferentes a las de recreación pasiva', status: null, description: '' },
  ],
  observacionesEspecificas: [
    { id: 'obs_1', label: 'Se evidencian especies Ferales', status: null, description: '' },
    { id: 'obs_2', label: 'Se evidencian procesos de eutroficación', status: null, description: '' },
    { id: 'obs_3', label: 'Se evidencia presencia de habitantes de calle', status: null, description: '' },
    { id: 'obs_4', label: 'Se evidencia pastoreo de semovientes', status: null, description: '' },
    { id: 'obs_5', label: 'Se evidencian captaciones ilegales del Recurso Hídrico', status: null, description: '' },
    { id: 'obs_6', label: 'Se evidencian descarga de aguas residuales al cuerpo de agua y/o conexiones erradas', status: null, description: '' },
    { id: 'obs_7', label: 'Se evidencian quemas a cielo abierto', status: null, description: '' },
    { id: 'obs_8', label: 'La fauna existente en el sector se encuentra protegida de afectaciones', status: null, description: '' },
    { id: 'obs_9', label: 'Se mantiene el cerramiento de delimitación en las condiciones establecidas por la EAAB', status: null, description: '' },
  ],
  consideracionesFinales: '',
  firmas: {
    atendidaPor: { nombre: '', cargo: '', empresa: '' },
    realizadaPor: { nombre: '', cargo: '', empresa: '' },
  }
};

export const LOGO_URLS = {
  bogota: 'https://seeklogo.com/images/A/alcaldia-mayor-de-bogota-logo-2623B68A57-seeklogo.com.png',
  sda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Secretar%C3%ADa_de_Ambiente_de_Bogot%C3%A1.svg/1200px-Secretar%C3%ADa_de_Ambiente_de_Bogot%C3%A1.svg.png'
};
