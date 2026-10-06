import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

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
  //const navigate = useNavigate();

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

  const estadoBadge = (estado: string) => {
    if (estado === "activo") return "pgp-badge pgp-badge-ok";
    if (estado === "mantencion") return "pgp-badge pgp-badge-warn";
    return "pgp-badge pgp-badge-err";
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 10px",
    background: "var(--bg-deep)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    color: "var(--txt1)",
    fontSize: "10px",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <Layout>
      <div
        className="pgp-fade-in"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {error && <div className="pgp-alert pgp-alert-err">{error}</div>}
        {success && <div className="pgp-alert pgp-alert-ok">{success}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "9px",
              color: "var(--accent)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Gestion de Equipos
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "5px 14px",
              background: showForm
                ? "transparent"
                : "linear-gradient(135deg, var(--accent), var(--accent2))",
              border: showForm ? "1px solid var(--border2)" : "none",
              borderRadius: "4px",
              color: showForm ? "var(--txt2)" : "var(--bg-deep)",
              fontSize: "9px",
              cursor: "pointer",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {showForm ? "Cancelar" : "Nuevo Equipo"}
          </button>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "9px",
              color: "var(--txt3)",
            }}
          >
            {equipos.length} equipo(s) registrado(s)
          </span>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="pgp-card">
            <div className="pgp-card-title">Crear Nuevo Equipo</div>
            <div className="pgp-grid-2" style={{ gap: "10px" }}>
              <div>
                <label
                  style={{
                    fontSize: "8px",
                    color: "var(--txt3)",
                    display: "block",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  style={inputStyle}
                  placeholder="Panel Solar Planta Norte"
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "8px",
                    color: "var(--txt3)",
                    display: "block",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Ubicacion
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Santiago, Chile"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "8px",
                    color: "var(--txt3)",
                    display: "block",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Cliente ID
                </label>
                <input
                  type="number"
                  value={form.cliente_id}
                  onChange={(e) =>
                    setForm({ ...form, cliente_id: Number(e.target.value) })
                  }
                  min={1}
                  style={{ ...inputStyle, fontFamily: "Consolas, monospace" }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "8px",
                    color: "var(--txt3)",
                    display: "block",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Estado
                </label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option
                    value="activo"
                    style={{ background: "var(--bg-deep)" }}
                  >
                    Activo
                  </option>
                  <option
                    value="inactivo"
                    style={{ background: "var(--bg-deep)" }}
                  >
                    Inactivo
                  </option>
                  <option
                    value="mantencion"
                    style={{ background: "var(--bg-deep)" }}
                  >
                    En Mantencion
                  </option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                marginTop: "10px",
                padding: "7px 20px",
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent2))",
                border: "none",
                borderRadius: "4px",
                color: "var(--bg-deep)",
                fontSize: "9px",
                cursor: "pointer",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}
            >
              Crear Equipo
            </button>
          </form>
        )}

        {/* Tabla */}
        <div className="pgp-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="pgp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicacion</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {equipos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--txt3)",
                    }}
                  >
                    No hay equipos registrados
                  </td>
                </tr>
              ) : (
                equipos.map((eq) => (
                  <tr key={eq.id}>
                    <td className="mono">{eq.id}</td>
                    <td style={{ color: "var(--txt1)", fontWeight: 600 }}>
                      {eq.nombre}
                    </td>
                    <td>{eq.ubicacion || "-"}</td>
                    <td>
                      <span className={estadoBadge(eq.estado)}>
                        {eq.estado.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: "9px" }}>
                      {new Date(eq.fecha_registro).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
