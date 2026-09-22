import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import api from "../api/axios";

interface EstadoGeneral {
  total_equipos: number;
  equipos_activos: number;
  total_mediciones: number;
}

interface Equipo {
  id: number;
  nombre: string;
  estado: string;
  ubicacion: string;
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
  thd: number;
  frecuencia: number;
  factor_potencia: number;
}

export default function Dashboard() {
  const [estado, setEstado] = useState<EstadoGeneral | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<ResumenEquipo | null>(null);
  const [medicionesRecientes, setMedicionesRecientes] = useState<Medicion[]>(
    [],
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    api
      .get("/dashboard/estado-general")
      .then((res) => setEstado(res.data))
      .catch(() => setError("Error cargando estado general"));

    api
      .get("/equipos/")
      .then((res) => {
        setEquipos(res.data);
        if (res.data.length > 0) {
          setEquipoId(res.data[0].id);
        }
      })
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
      .then((res) => {
        const datos = res.data.reverse().slice(-20);
        setMedicionesRecientes(datos);
      })
      .catch(() => setMedicionesRecientes([]));
  }, [equipoId]);

  const formatFecha = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">PowerGuardian Pro</h1>
          <nav className="flex gap-4 text-sm">
            <span className="text-white font-semibold border-b border-blue-400 pb-1">
              Dashboard
            </span>
            <button
              onClick={() => navigate("/equipos")}
              className="text-blue-300 hover:text-white transition cursor-pointer"
            >
              Equipos
            </button>
            <button
              onClick={() => navigate("/graficos")}
              className="text-blue-300 hover:text-white transition cursor-pointer"
            >
              Graficos
            </button>
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
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tarjetas estado general */}
        <h2 className="text-lg font-semibold text-blue-300 mb-4">
          Estado General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <p className="text-sm text-blue-300 mb-1">Total Equipos</p>
            <p className="text-4xl font-bold">{estado?.total_equipos ?? "-"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <p className="text-sm text-green-300 mb-1">Equipos Activos</p>
            <p className="text-4xl font-bold text-green-400">
              {estado?.equipos_activos ?? "-"}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <p className="text-sm text-purple-300 mb-1">Total Mediciones</p>
            <p className="text-4xl font-bold text-purple-400">
              {estado?.total_mediciones ?? "-"}
            </p>
          </div>
        </div>

        {/* Selector de equipo */}
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-blue-300">
            Monitoreo de Equipo
          </h2>
          <select
            value={equipoId ?? ""}
            onChange={(e) => setEquipoId(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400"
          >
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id} className="bg-slate-900">
                {eq.nombre} ({eq.estado})
              </option>
            ))}
          </select>
        </div>

        {resumen?.equipo?.id ? (
          <>
            {/* Info del equipo + ultima medicion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Info equipo */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold">
                    {resumen.equipo.nombre}
                  </p>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      resumen.equipo.estado === "activo"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {resumen.equipo.estado}
                  </span>
                </div>
                <p className="text-sm text-white/50 mb-4">
                  {resumen.total_mediciones} mediciones registradas
                </p>

                {resumen.ultima_medicion?.timestamp && (
                  <p className="text-xs text-white/40">
                    Ultima lectura:{" "}
                    {formatFecha(resumen.ultima_medicion.timestamp)}
                  </p>
                )}
              </div>

              {/* Mini grafico voltaje */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-blue-300 mb-2">
                  Tendencia Voltaje L1
                </p>
                {medicionesRecientes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={medicionesRecientes}>
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="voltaje_l1"
                        stroke="#3b82f6"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/30 text-sm">Sin datos</p>
                )}
              </div>
            </div>

            {/* Indicadores ultima medicion */}
            {resumen.ultima_medicion?.timestamp && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-300 mb-1">Voltaje L1</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.voltaje_l1}
                  </p>
                  <p className="text-xs text-white/40">V</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-300 mb-1">Voltaje L2</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.voltaje_l2}
                  </p>
                  <p className="text-xs text-white/40">V</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-300 mb-1">Voltaje L3</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.voltaje_l3}
                  </p>
                  <p className="text-xs text-white/40">V</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-red-300 mb-1">THD</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.thd}
                  </p>
                  <p className="text-xs text-white/40">%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-purple-300 mb-1">Frecuencia</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.frecuencia}
                  </p>
                  <p className="text-xs text-white/40">Hz</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-cyan-300 mb-1">Factor Potencia</p>
                  <p className="text-xl font-mono font-bold">
                    {resumen.ultima_medicion.factor_potencia}
                  </p>
                  <p className="text-xs text-white/40">FP</p>
                </div>
              </div>
            )}

            {/* Tabla ultimas mediciones */}
            <h3 className="text-md font-semibold text-blue-300 mb-3">
              Ultimas Mediciones
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-blue-300 text-left">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">V L1</th>
                    <th className="px-4 py-3 font-medium">V L2</th>
                    <th className="px-4 py-3 font-medium">V L3</th>
                    <th className="px-4 py-3 font-medium">THD</th>
                    <th className="px-4 py-3 font-medium">Hz</th>
                    <th className="px-4 py-3 font-medium">FP</th>
                  </tr>
                </thead>
                <tbody>
                  {medicionesRecientes
                    .slice(-10)
                    .reverse()
                    .map((m, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-2 text-white/60 text-xs">
                          {formatFecha(m.timestamp)}
                        </td>
                        <td className="px-4 py-2 font-mono">{m.voltaje_l1}</td>
                        <td className="px-4 py-2 font-mono">
                          {(m as any).voltaje_l2}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {(m as any).voltaje_l3}
                        </td>
                        <td className="px-4 py-2 font-mono">{m.thd}</td>
                        <td className="px-4 py-2 font-mono">{m.frecuencia}</td>
                        <td className="px-4 py-2 font-mono">
                          {m.factor_potencia}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-white/40">
            Selecciona un equipo para ver su monitoreo
          </div>
        )}
      </main>
    </div>
  );
}
