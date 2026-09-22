import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Equipo {
  id: number;
  cliente_id: number;
  nombre: string;
  ubicacion: string | null;
  estado: string;
  fecha_registro: string;
}

interface EquipoForm {
  cliente_id: number;
  nombre: string;
  ubicacion: string;
  estado: string;
}

export default function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<EquipoForm>({
    cliente_id: 1,
    nombre: "",
    ubicacion: "",
    estado: "activo",
  });
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchEquipos = () => {
    api
      .get("/equipos/")
      .then((res) => setEquipos(res.data))
      .catch(() => setError("Error cargando equipos"));
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/equipos/", form);
      setSuccess("Equipo creado exitosamente");
      setForm({ cliente_id: 1, nombre: "", ubicacion: "", estado: "activo" });
      setShowForm(false);
      fetchEquipos();
    } catch {
      setError("Error al crear equipo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
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
            <span className="text-blue-400 font-semibold border-b border-blue-400 pb-1">
              Equipos
            </span>
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
        <button
          onClick={() => navigate("/graficos")}
          className="text-blue-300 hover:text-white transition cursor-pointer"
        >
          Graficos
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Header + boton crear */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-blue-300">
            Gestion de Equipos
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-lg transition cursor-pointer"
          >
            {showForm ? "Cancelar" : "Nuevo Equipo"}
          </button>
        </div>

        {/* Formulario crear */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
          >
            <h3 className="text-md font-semibold mb-4">Crear Nuevo Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition text-sm"
                  placeholder="Panel Solar Planta Norte"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-1">
                  Ubicacion
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition text-sm"
                  placeholder="Santiago, Chile"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-1">
                  Cliente ID
                </label>
                <input
                  type="number"
                  value={form.cliente_id}
                  onChange={(e) =>
                    setForm({ ...form, cliente_id: Number(e.target.value) })
                  }
                  min={1}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 transition text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-1">
                  Estado
                </label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 transition text-sm"
                >
                  <option value="activo" className="bg-slate-900">
                    Activo
                  </option>
                  <option value="inactivo" className="bg-slate-900">
                    Inactivo
                  </option>
                  <option value="mantencion" className="bg-slate-900">
                    En Mantencion
                  </option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              Crear Equipo
            </button>
          </form>
        )}

        {/* Tabla de equipos */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-blue-300 text-left">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Ubicacion</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {equipos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-white/40"
                  >
                    No hay equipos registrados
                  </td>
                </tr>
              ) : (
                equipos.map((eq) => (
                  <tr
                    key={eq.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-3 font-mono">{eq.id}</td>
                    <td className="px-6 py-3">{eq.nombre}</td>
                    <td className="px-6 py-3 text-white/60">
                      {eq.ubicacion || "-"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          eq.estado === "activo"
                            ? "bg-green-500/20 text-green-300"
                            : eq.estado === "mantencion"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {eq.estado}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white/60">
                      {new Date(eq.fecha_registro).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
