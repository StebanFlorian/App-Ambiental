
export enum EvaluationStatus {
  C = 'C',     // Cumple
  I = 'I',     // Incumple
  NA = 'NA',   // No Aplica
  SI = 'SI',
  NO = 'NO'
}

export interface ChecklistItem {
  id: string;
  label: string;
  status: EvaluationStatus | null;
  description: string;
}

export interface SignaturePerson {
  nombre: string;
  cargo: string;
  empresa: string;
  signatureImage?: string; // Base64 string of the signature
}

export interface VisitFormData {
  generalData: {
    componente: string;
    direccion: string;
    localidad: string;
    barrio: string;
    radicadoEntrada: string;
    fechaRadicado: string;
    proceso: string;
    fechaVisita: string;
    horaInicio: string;
    autoridadCompetente: string;
    expediente: string;
  };
  motivoVisita: string;
  situacionesEncontradas: ChecklistItem[];
  observacionesEspecificas: ChecklistItem[];
  consideracionesFinales: string;
  firmas: {
    atendidaPor: SignaturePerson;
    realizadaPor: SignaturePerson;
  };
}
