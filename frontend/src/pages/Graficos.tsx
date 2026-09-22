import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchMediciones = () => {
    setLoading(true);
    api
      .get(`/mediciones/?equipo_id=${equipoId}`)
      .then((res) => {
        const datos = res.data.reverse();
        setMediciones(datos);
      })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">PowerGuardian Pro</h1>
          <nav className="flex gap-4 text-sm">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-300 hover:text-white transition cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/equipos")}
              className="text-blue-300 hover:text-white transition cursor-pointer"
            >
              Equipos
            </button>
            <span className="text-white font-semibold border-b border-blue-400 pb-1">
              Graficos
            </span>
          </nav>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
        >
          Cerrar Sesion
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-300">
            Graficos de Mediciones
          </h2>
          <label className="text-sm text-blue-200">Equipo ID:</label>
          <input
            type="number"
            value={equipoId}
            onChange={(e) => setEquipoId(Number(e.target.value))}
            min={1}
            className="w-20 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={fetchMediciones}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer"
          >
            Actualizar
          </button>
        </div>

        {loading && <p className="text-blue-300 mb-4">Cargando datos...</p>}

        {mediciones.length === 0 && !loading ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/40">
            Sin mediciones para este equipo
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grafico Voltajes */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-md font-semibold text-blue-300 mb-4">
                Voltajes (V)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="voltaje_l1"
                    stroke="#3b82f6"
                    name="L1"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="voltaje_l2"
                    stroke="#22c55e"
                    name="L2"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="voltaje_l3"
                    stroke="#f59e0b"
                    name="L3"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafico THD */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-md font-semibold text-blue-300 mb-4">
                THD - Distorsion Armonica (%)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="thd"
                    stroke="#ef4444"
                    name="THD"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafico Frecuencia */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-md font-semibold text-blue-300 mb-4">
                Frecuencia (Hz)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[49.5, 50.5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="frecuencia"
                    stroke="#a855f7"
                    name="Frecuencia"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafico Factor de Potencia */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-md font-semibold text-blue-300 mb-4">
                Factor de Potencia
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0.8, 1.0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="factor_potencia"
                    stroke="#06b6d4"
                    name="FP"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
