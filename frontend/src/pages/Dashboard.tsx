import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";

interface EstadoGeneral {
  total_equipos: number;
  equipos_activos: number;
  total_mediciones: number;
}

interface Equipo {
  id: number;
  nombre: string;
  estado: string;
}

interface ResumenEquipo {
  equipo: { id: number; nombre: string; estado: string };
  total_mediciones: number;
  ultima_medicion: {
    timestamp: string | null;
    voltaje_l1: number | null;
    voltaje_l2: number | null;
    voltaje_l3: number | null;
    thd: number | null;
    frecuencia: number | null;
    factor_potencia: number | null;
  };
}

interface Medicion {
  timestamp: string;
  voltaje_l1: number;
  voltaje_l2: number;
  voltaje_l3: number;
  thd: number;
  frecuencia: number;
  factor_potencia: number;
}

interface AlertaCount {
  total_activas: number;
  criticas: number;
}

function GaugeSVG({
  value,
  max,
  label,
  unit,
  color,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 240 - 120;
  const r = 38;
  const cx = 50;
  const cy = 50;

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = ((startAngle - 90) * Math.PI) / 180;
    const e = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="pgp-gauge-wrap">
      <svg width="100" height="80" viewBox="0 0 100 80">
        <path
          d={arcPath(-120, 120)}
          fill="none"
          stroke="var(--border2)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={arcPath(-120, angle)}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontWeight="800"
          fontFamily="Consolas, monospace"
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="var(--txt3)"
          fontSize="8"
        >
          {unit}
        </text>
      </svg>
      <div className="pgp-gauge-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [estado, setEstado] = useState<EstadoGeneral | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<ResumenEquipo | null>(null);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [alertas, setAlertas] = useState<AlertaCount>({
    total_activas: 0,
    criticas: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/estado-general")
      .then((res) => setEstado(res.data))
      .catch(() => setError("Error cargando estado general"));

    api
      .get("/equipos/")
      .then((res) => {
        setEquipos(res.data);
        if (res.data.length > 0) setEquipoId(res.data[0].id);
      })
      .catch(() => {});

    api
      .get("/incidencias/activas/count")
      .then((res) => setAlertas(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!equipoId) return;

    api
      .get(`/dashboard/resumen/${equipoId}`)
      .then((res) => setResumen(res.data))
      .catch(() => setResumen(null));

    api
      .get(`/mediciones/?equipo_id=${equipoId}`)
      .then((res) => setMediciones(res.data.reverse().slice(-20)))
      .catch(() => setMediciones([]));
  }, [equipoId]);

  const um = resumen?.ultima_medicion;

  const fpColor = (v: number | null) => {
    if (!v) return "var(--txt3)";
    if (v >= 0.92) return "var(--ok)";
    if (v >= 0.85) return "var(--warn)";
    return "var(--danger)";
  };

  const thdColor = (v: number | null) => {
    if (!v) return "var(--txt3)";
    if (v <= 5) return "var(--ok)";
    if (v <= 8) return "var(--warn)";
    return "var(--danger)";
  };

  return (
    <Layout>
      <div className="pgp-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {error && (
          <div className="pgp-alert pgp-alert-err">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="pgp-kpi-row">
          <div className="pgp-kpi">
            <div
              className="pgp-kpi-icon"
              style={{ background: "rgba(0,200,232,0.12)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L10 6H14L11 9L12 14L8 11L4 14L5 9L2 6H6L8 1Z"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="pgp-kpi-val accent">
              {estado?.total_equipos ?? "-"}
            </div>
            <div className="pgp-kpi-label">Total Equipos</div>
          </div>
          <div className="pgp-kpi">
            <div
              className="pgp-kpi-icon"
              style={{ background: "rgba(45,189,110,0.12)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="var(--ok)"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 8L7 10L11 6"
                  stroke="var(--ok)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="pgp-kpi-val ok">
              {estado?.equipos_activos ?? "-"}
            </div>
            <div className="pgp-kpi-label">Equipos Activos</div>
          </div>
          <div className="pgp-kpi">
            <div
              className="pgp-kpi-icon"
              style={{ background: "rgba(0,200,232,0.12)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="12"
                  height="8"
                  rx="1"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                <path
                  d="M2 8H14"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  opacity="0.4"
                />
              </svg>
            </div>
            <div className="pgp-kpi-val accent">
              {estado?.total_mediciones ?? "-"}
            </div>
            <div className="pgp-kpi-label">Total Mediciones</div>
          </div>
          <div className="pgp-kpi">
            <div
              className="pgp-kpi-icon"
              style={{
                background:
                  alertas.criticas > 0
                    ? "rgba(224,48,64,0.12)"
                    : "rgba(45,189,110,0.12)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L14 13H2L8 2Z"
                  stroke={alertas.criticas > 0 ? "var(--danger)" : "var(--ok)"}
                  strokeWidth="1.5"
                  fill="none"
                />
                <line
                  x1="8"
                  y1="6"
                  x2="8"
                  y2="9"
                  stroke={alertas.criticas > 0 ? "var(--danger)" : "var(--ok)"}
                  strokeWidth="1.5"
                />
                <circle
                  cx="8"
                  cy="11"
                  r="0.5"
                  fill={alertas.criticas > 0 ? "var(--danger)" : "var(--ok)"}
                />
              </svg>
            </div>
            <div
              className={`pgp-kpi-val ${alertas.criticas > 0 ? "err" : "ok"}`}
            >
              {alertas.total_activas}
            </div>
            <div className="pgp-kpi-label">Alertas Activas</div>
          </div>
        </div>

        {/* Selector equipo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "9px",
              color: "var(--accent)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Equipo Monitoreado
          </span>
          <select
            value={equipoId ?? ""}
            onChange={(e) => setEquipoId(Number(e.target.value))}
            style={{
              padding: "5px 10px",
              background: "var(--bg-deep)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--txt1)",
              fontSize: "10px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {equipos.map((eq) => (
              <option
                key={eq.id}
                value={eq.id}
                style={{ background: "var(--bg-deep)" }}
              >
                {eq.nombre} ({eq.estado})
              </option>
            ))}
          </select>
          {resumen?.equipo && (
            <span
              className={`pgp-badge ${resumen.equipo.estado === "activo" ? "pgp-badge-ok" : "pgp-badge-err"}`}
            >
              {resumen.equipo.estado.toUpperCase()}
            </span>
          )}
        </div>

        {resumen?.equipo?.id && um?.timestamp ? (
          <>
            {/* Estado operacional */}
            <div
              className={`pgp-alert ${
                alertas.criticas > 0
                  ? "pgp-alert-err"
                  : um.thd && um.thd > 5
                    ? "pgp-alert-warn"
                    : "pgp-alert-ok"
              }`}
              style={{ fontSize: "10px" }}
            >
              <strong>Estado Operacional - {resumen.equipo.nombre}:</strong>{" "}
              {alertas.criticas > 0
                ? `${alertas.criticas} alerta(s) critica(s) activa(s). Revision requerida.`
                : um.thd && um.thd > 5
                  ? `THD en ${um.thd}% - Limite IEC 519 al 5%. Monitorear.`
                  : "Operacion normal. Todos los parametros dentro de rango."}
            </div>

            {/* Two columns: Readings + Sparkline */}
            <div className="pgp-grid-2">
              {/* Readings */}
              <div className="pgp-card">
                <div className="pgp-card-title">Indicadores PGP</div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">Voltaje L1</span>
                  <span className="pgp-reading-val">{um.voltaje_l1}</span>
                  <span className="pgp-reading-unit">V</span>
                </div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">Voltaje L2</span>
                  <span className="pgp-reading-val">{um.voltaje_l2}</span>
                  <span className="pgp-reading-unit">V</span>
                </div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">Voltaje L3</span>
                  <span className="pgp-reading-val">{um.voltaje_l3}</span>
                  <span className="pgp-reading-unit">V</span>
                </div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">THD-V</span>
                  <span
                    className="pgp-reading-val"
                    style={{ color: thdColor(um.thd) }}
                  >
                    {um.thd}
                  </span>
                  <span className="pgp-reading-unit">%</span>
                </div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">cos phi</span>
                  <span
                    className="pgp-reading-val"
                    style={{ color: fpColor(um.factor_potencia) }}
                  >
                    {um.factor_potencia}
                  </span>
                  <span className="pgp-reading-unit"></span>
                </div>
                <div className="pgp-reading">
                  <span className="pgp-reading-label">Frecuencia</span>
                  <span className="pgp-reading-val">{um.frecuencia}</span>
                  <span className="pgp-reading-unit">Hz</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="pgp-card">
                <div className="pgp-card-title">Tendencia Voltaje L1</div>
                {mediciones.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={mediciones}>
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a1a2e",
                          border: "1px solid #1a4060",
                          borderRadius: "6px",
                          fontSize: "10px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="voltaje_l1"
                        stroke="var(--accent)"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: "var(--txt3)", fontSize: "10px" }}>
                    Sin datos disponibles
                  </p>
                )}
              </div>
            </div>

            {/* Gauges */}
            <div className="pgp-card">
              <div className="pgp-card-title">
                Gauges - Calidad de Energia (IEC 61000)
              </div>
              <div className="pgp-gauges">
                <GaugeSVG
                  value={Number(um.factor_potencia) || 0}
                  max={1}
                  label="Factor Potencia"
                  unit="cos phi"
                  color={fpColor(um.factor_potencia)}
                />
                <GaugeSVG
                  value={Number(um.thd) || 0}
                  max={15}
                  label="THD (%)"
                  unit="%"
                  color={thdColor(um.thd)}
                />
                <GaugeSVG
                  value={Number(um.frecuencia) || 0}
                  max={51}
                  label="Frecuencia"
                  unit="Hz"
                  color="var(--accent)"
                />
              </div>
            </div>

            {/* Table */}
            <div className="pgp-card">
              <div className="pgp-card-title">Ultimas Mediciones</div>
              <div style={{ overflowX: "auto" }}>
                <table className="pgp-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>V L1</th>
                      <th>V L2</th>
                      <th>V L3</th>
                      <th>THD</th>
                      <th>Hz</th>
                      <th>FP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediciones
                      .slice(-10)
                      .reverse()
                      .map((m, i) => {
                        const d = new Date(m.timestamp);
                        const ts = d.toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: "9px", color: "var(--txt3)" }}>{ts}</td>
                            <td className="mono">{m.voltaje_l1}</td>
                            <td className="mono">{m.voltaje_l2}</td>
                            <td className="mono">{m.voltaje_l3}</td>
                            <td className="mono" style={{ color: thdColor(m.thd) }}>{m.thd}</td>
                            <td className="mono">{m.frecuencia}</td>
                            <td className="mono" style={{ color: fpColor(m.factor_potencia) }}>{m.factor_potencia}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="pgp-card" style={{ textAlign: "center", color: "var(--txt3)", padding: "40px" }}>
            Selecciona un equipo para ver su monitoreo
          </div>
        )}
      </div>
    </Layout>
  );
}
