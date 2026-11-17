import React, { useEffect, useState } from "react";
import { obtenerRiesgoEquipo } from "../api/ml";
import type { RiesgoEquipoResponse } from "../api/ml";

interface Props {
  equipoId: number;
}

export const MLAlertaPrediccion: React.FC<Props> = ({ equipoId }) => {
  const [riesgoData, setRiesgoData] = useState<RiesgoEquipoResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarRiesgo = async () => {
      try {
        const data = await obtenerRiesgoEquipo(equipoId);
        setRiesgoData(data);
      } catch (err) {
        console.error("Error al obtener el riesgo de falla", err);
      } finally {
        setLoading(false);
      }
    };

    cargarRiesgo();
    const intervalo = setInterval(cargarRiesgo, 10000);
    return () => clearInterval(intervalo);
  }, [equipoId]);

  if (loading || !riesgoData) return null;

  const esAlertaActiva = riesgoData.nivel_alerta !== "bajo";
  const diag = riesgoData.diagnostico;

  if (!esAlertaActiva) {
    return (
      <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Equipo operando en parámetros normales (Riesgo:{" "}
          {(riesgoData.riesgo_falla * 100).toFixed(1)}%)
        </span>
        <span className="font-mono text-xs opacity-75">
          {riesgoData.modelo_version}
        </span>
      </div>
    );
  }

  const estilosAlerta =
    {
      moderado: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
      alto: "bg-orange-500/20 border-orange-500/50 text-orange-300",
      critico: "bg-red-600/25 border-red-500 text-red-200 animate-pulse",
    }[riesgoData.nivel_alerta] || "bg-gray-800 border-gray-700 text-gray-300";

  return (
    <div
      className={`mb-6 p-5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${estilosAlerta}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-black/40 border border-current text-xl">
            {riesgoData.nivel_alerta === "critico" ? "!!" : "!"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold uppercase tracking-wider text-sm">
                Alerta de posible falla — {riesgoData.nivel_alerta}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-black/50 border border-current">
                {(riesgoData.riesgo_falla * 100).toFixed(1)}% Riesgo
              </span>
            </div>
            {diag ? (
              <div className="mt-1">
                <p className="text-xs font-semibold">
                  {diag.titulo}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {diag.descripcion.substring(0, 150)}
                </p>
                {diag.indicadores_anomalos_actuales.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {diag.indicadores_anomalos_actuales.slice(0, 3).map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-current/30"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-90 mt-1">
                Tendencia anomala detectada:{" "}
                <strong className="uppercase underline">
                  {riesgoData.clase_predominante_reciente}
                </strong>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-lg border border-current/20 w-full md:w-auto justify-between">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider block opacity-75">
              Tiempo hasta la falla
            </span>
            <span className="text-lg font-mono font-bold">
              {riesgoData.horizonte_estimado_min !== null
                ? `~${riesgoData.horizonte_estimado_min} min`
                : "Inminente"}
            </span>
          </div>
        </div>
      </div>

      {/* Accion recomendada visible directamente */}
      {diag && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-300">
          <strong>Accion:</strong> {diag.accion_recomendada}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-current/20 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs opacity-90">
        <div>
          Deterioro:{" "}
          <span className="font-mono font-bold">
            {(
              riesgoData.factores_contribuyentes.tendencia_degradacion * 100
            ).toFixed(0)}
            %
          </span>
        </div>
        <div>
          Severidad:{" "}
          <span className="font-mono font-bold">
            {(
              riesgoData.factores_contribuyentes.severidad_isolation_forest *
              100
            ).toFixed(0)}
            %
          </span>
        </div>
        <div>
          Lecturas anómalas:{" "}
          <span className="font-mono font-bold">
            {(
              riesgoData.factores_contribuyentes.proporcion_anomala_ventana *
              100
            ).toFixed(0)}
            %
          </span>
        </div>
        <div>
          Versión:{" "}
          <span className="font-mono font-bold">
            {riesgoData.modelo_version}
          </span>
        </div>
      </div>
    </div>
  );
};
