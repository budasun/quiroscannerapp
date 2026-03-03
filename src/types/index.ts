export interface DiagnosisResult {
  mensaje_maestro: string;
  diagnostico_wang: {
    observacion_visual: string;
    organo_afectado: string;
    significado_mtc: string;
  };
  niveles_radar: {
    fuego: number;
    tierra: number;
    metal: number;
    agua: number;
    madera: number;
  };
  cuadrantes_integral: {
    yo: { titulo: string; detalle: string };
    ello: { titulo: string; detalle: string };
    nosotros: { titulo: string; detalle: string };
    ellos: { titulo: string; detalle: string };
  };
  pronostico_evolucion?: {
    camino_enfermedad: string;
    consecuencias_cronicas: string;
  };
  tratamiento_mtc?: {
    acupuntura: string[];
    herbolaria_mexicana_y_china: string[];
    dietetica: string[];
  };
  consejos_practicos?: {
    fisicos: string[];
    mentales: string[];
    espirituales: string[];
    sueno_taoista?: string[];
  };
  pregunta_despertar?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
