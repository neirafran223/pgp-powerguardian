import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";

interface Medicion {
  timestamp: string;
  voltaje_l1: number;
  voltaje_l2: number;
  voltaje_l3: number;
  thd: number;
  frecuencia: number;
  factor_potencia: number;
}

export default function Graficos() {
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [equipoId, setEquipoId] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMediciones = () => {
    setLoading(true);
    api
      .get(`/mediciones/?equipo_id=${equipoId}`)
      .then((res) => setMediciones(res.data.reverse()))
      .catch(() => setMediciones([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMediciones();
  }, [equipoId]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const chartTooltipStyle = {
    backgroundColor: "#0a1a2e",
    border: "1px solid #1a4060",
    borderRadius: "6px",
    fontSize: "10px",
  };

  return (
    <Layout>
      <div className="pgp-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "9px", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Graficos de Mediciones
          </span>
          <span style={{ fontSize: "9px", color: "var(--txt3)" }}>Equipo ID:</span>
          <input
            type="number"
            value={equipoId}
            onChange={(e) => setEquipoId(Number(e.target.value))}
            min={1}
            style={{ width: "60px", padding: "4px 8px", background: "var(--bg-deep)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--txt1)", fontSize: "10px", fontFamily: "Consolas, monospace", outline: "none" }}
          />
          <button
            onClick={fetchMediciones}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--border2)", borderRadius: "4px", color: "var(--txt2)", fontSize: "9px", cursor: "pointer", fontWeight: 600, textTransform: "uppercase" }}
          >
            Actualizar
          </button>
        </div>

        {loading && <div className="pgp-alert pgp-alert-info">Cargando datos...</div>}

        {mediciones.length === 0 && !loading ? (
          <div className="pgp-card" style={{ textAlign: "center", color: "var(--txt3)", padding: "40px" }}>
            Sin mediciones para este equipo
          </div>
        ) : (
          <>
            {/* Voltajes */}
            <div className="pgp-card">
              <div className="pgp-card-title">Voltajes (V) - Trifasico</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--txt3)" fontSize={9} />
                  <YAxis stroke="var(--txt3)" fontSize={9} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "9px" }} />
                  <Line type="monotone" dataKey="voltaje_l1" stroke="var(--accent)" name="L1" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="voltaje_l2" stroke="var(--ok)" name="L2" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="voltaje_l3" stroke="var(--warn)" name="L3" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* THD */}
            <div className="pgp-card">
              <div className="pgp-card-title">THD - Distorsion Armonica (%)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--txt3)" fontSize={9} />
                  <YAxis stroke="var(--txt3)" fontSize={9} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="thd" stroke="var(--danger)" name="THD" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="pgp-grid-2">
              {/* Frecuencia */}
              <div className="pgp-card">
                <div className="pgp-card-title">Frecuencia (Hz)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mediciones}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--txt3)" fontSize={9} />
                    <YAxis stroke="var(--txt3)" fontSize={9} domain={[49.5, 50.5]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="frecuencia" stroke="#a855f7" name="Frecuencia" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Factor de Potencia */}
              <div className="pgp-card">
                <div className="pgp-card-title">Factor de Potencia</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mediciones}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--txt3)" fontSize={9} />
                    <YAxis stroke="var(--txt3)" fontSize={9} domain={[0.8, 1.0]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="factor_potencia" stroke="var(--accent3)" name="FP" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
