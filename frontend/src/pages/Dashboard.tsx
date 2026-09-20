import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface EstadoGeneral {
  total_equipos: number;
  equipos_activos: number;
  total_mediciones: number;
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

export default function Dashboard() {
  const [estado, setEstado] = useState<EstadoGeneral | null>(null);
  const [resumen, setResumen] = useState<ResumenEquipo | null>(null);
  const [equipoId, setEquipoId] = useState(1);
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
  }, []);

  useEffect(() => {
    api
      .get(`/dashboard/resumen/${equipoId}`)
      .then((res) => setResumen(res.data))
      .catch(() => setResumen(null));
  }, [equipoId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">PowerGuardian Pro</h1>
          <nav className="flex gap-4 text-sm">
            <span className="text-white font-semibold border-b border-blue-400 pb-1">Dashboard</span>
            <button onClick={() => navigate("/equipos")} className="text-blue-300 hover:text-white transition cursor-pointer">Equipos</button>
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
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-blue-300">Total Equipos</p>
            <p className="text-3xl font-bold mt-1">
              {estado?.total_equipos ?? "-"}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-green-300">Equipos Activos</p>
            <p className="text-3xl font-bold mt-1">
              {estado?.equipos_activos ?? "-"}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-purple-300">Total Mediciones</p>
            <p className="text-3xl font-bold mt-1">
              {estado?.total_mediciones ?? "-"}
            </p>
          </div>
        </div>

        {/* Resumen por equipo */}
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-blue-300">
            Resumen Equipo
          </h2>
          <input
            type="number"
            value={equipoId}
            onChange={(e) => setEquipoId(Number(e.target.value))}
            min={1}
            className="w-20 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {resumen?.equipo?.id ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">{resumen.equipo.nombre}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    resumen.equipo.estado === "activo"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {resumen.equipo.estado}
                </span>
              </div>
              <p className="text-sm text-blue-300">
                {resumen.total_mediciones} mediciones
              </p>
            </div>

            {resumen.ultima_medicion?.timestamp ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-blue-300">Voltaje L1</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.voltaje_l1} V
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Voltaje L2</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.voltaje_l2} V
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Voltaje L3</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.voltaje_l3} V
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">THD</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.thd} %
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Frecuencia</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.frecuencia} Hz
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Factor Potencia</p>
                  <p className="text-lg font-mono">
                    {resumen.ultima_medicion.factor_potencia}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40 mt-4">
                Sin mediciones registradas
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-white/40">
            Equipo no encontrado
          </div>
        )}
      </main>
    </div>
  );
}
