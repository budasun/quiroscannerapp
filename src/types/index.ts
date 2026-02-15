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
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
