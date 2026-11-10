import api from "./axios";

export interface RiesgoEquipoResponse {
  equipo_id: number;
  timestamp_evaluacion: string;
  mediciones_analizadas: number;
  riesgo_falla: number; // 0.0000 a 1.0000
  nivel_alerta: string; // bajo, moderado, alto, critico
  horizonte_estimado_min: number | null;
  clase_predominante_reciente: string;
  factores_contribuyentes: {
    proporcion_anomala_ventana: number;
    severidad_isolation_forest: number;
    tendencia_degradacion: number;
    probabilidad_falla_instantanea: number;
  };
  modelo_version: string;
}

export interface PrediccionMLResponse {
  id: number;
  equipo_id: number;
  timestamp: string;
  clase_predicha: string;
  probabilidad: number;
  riesgo_falla: number;
  horizonte_estimado_min: number | null;
  modelo_version: string;
  es_anomalia_aislada?: boolean;
  score_anomalia?: number;
}

export const obtenerRiesgoEquipo = async (
  equipoId: number,
): Promise<RiesgoEquipoResponse> => {
  const response = await api.get<RiesgoEquipoResponse>(
    `/ml/riesgo/${equipoId}`,
  );
  return response.data;
};

export const ejecutarPrediccionEquipo = async (
  equipoId: number,
): Promise<PrediccionMLResponse> => {
  const response = await api.post<PrediccionMLResponse>(
    `/ml/predecir/${equipoId}`,
  );
  return response.data;
};
