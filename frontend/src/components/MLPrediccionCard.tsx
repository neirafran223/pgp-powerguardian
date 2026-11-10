import React, { useEffect, useState } from "react";
import { obtenerRiesgoEquipo, RiesgoEquipoResponse } from "../api/ml";

interface Props {
  equipoId: number;
}

export const MLPrediccionCard: React.FC<Props> = ({ equipoId }) => {
  const [riesgoData, setRiesgoData] = useState<RiesgoEquipoResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarRiesgo = async () => {
      try {
        setLoading(true);
        const data = await obtenerRiesgoEquipo(equipoId);
        setRiesgoData(data);
        setError(null);
      } catch (err: any) {
        setError("No se pudo cargar el analisis de Machine Learning.");
      } finally {
        setLoading(false);
      }
    };

    cargarRiesgo();
    // Actualizar automaticamente cada 15 segundos
    const intervalo = setInterval(cargarRiesgo, 15000);
    return () => clearInterval(intervalo);
  }, [equipoId]);

  if (loading && !riesgoData) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Analizando patrones electricos con ML...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>;
  }

  if (!riesgoData) return null;

  // Colores segun nivel de alerta
  const coloresAlerta: Record<string, string> = {
    bajo: "text-green-400 border-green-500/30 bg-green-500/10",
    moderado: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    alto: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    critico: "text-red-500 border-red-500/40 bg-red-500/15 animate-pulse",
  };

  const estiloNivel =
    coloresAlerta[riesgoData.nivel_alerta] ||
    "text-gray-400 border-gray-700 bg-gray-800";
  const porcentajeRiesgo = (riesgoData.riesgo_falla * 100).toFixed(1);

  return (
    <div
      className={`p-5 rounded-xl border ${estiloNivel} shadow-lg backdrop-blur-sm transition-all duration-300`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold tracking-wide uppercase">
          Prediccion Predictiva (PowerGuardian Pro)
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-black/40 border border-current">
          Modelo {riesgoData.modelo_version}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Score de Riesgo */}
        <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
          <span className="text-xs text-gray-400 block mb-1">
            Indice de Riesgo de Falla
          </span>
          <div className="text-2xl font-bold font-mono">
            {porcentajeRiesgo}%
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-500"
              style={{ width: `${porcentajeRiesgo}%` }}
            />
          </div>
        </div>

        {/* Horizonte Temporal */}
        <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
          <span className="text-xs text-gray-400 block mb-1">
            Horizonte Estimado hasta Falla
          </span>
          <div className="text-2xl font-bold font-mono">
            {riesgoData.horizonte_estimado_min !== null
              ? `${riesgoData.horizonte_estimado_min} min`
              : "N/D"}
          </div>
          <span className="text-xs text-gray-300 mt-1 block">
            Alerta:{" "}
            <strong className="uppercase">{riesgoData.nivel_alerta}</strong>
          </span>
        </div>

        {/* Estado Predominante */}
        <div className="bg-black/30 p-3.5 rounded-lg border border-white/5">
          <span className="text-xs text-gray-400 block mb-1">
            Patron Operativo Reciente
          </span>
          <div className="text-lg font-semibold font-mono uppercase mt-1 truncate">
            {riesgoData.clase_predominante_reciente}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Ventana: {riesgoData.mediciones_analizadas} lecturas
          </span>
        </div>
      </div>

      {/* Factores Contribuyentes */}
      <div className="text-xs text-gray-400 border-t border-white/10 pt-3 flex flex-wrap justify-between gap-2">
        <span>
          Tendencia Degr.:{" "}
          {(
            riesgoData.factores_contribuyentes.tendencia_degradacion * 100
          ).toFixed(0)}
          %
        </span>
        <span>
          Severidad IF:{" "}
          {(
            riesgoData.factores_contribuyentes.severidad_isolation_forest * 100
          ).toFixed(0)}
          %
        </span>
        <span>
          Anomalia Ventana:{" "}
          {(
            riesgoData.factores_contribuyentes.proporcion_anomala_ventana * 100
          ).toFixed(0)}
          %
        </span>
      </div>
    </div>
  );
};
