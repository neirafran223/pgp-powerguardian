import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

interface Incidencia {
  id: number;
  equipo_id: number;
  timestamp: string;
  tipo: string;
  nivel: string;
  estado: string;
  descripcion: string | null;
  valor_medido: number | null;
  umbral_config: number | null;
}

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();

  const fetchIncidencias = () => {
    setLoading(true);
    let url = "/incidencias/";
    if (filtroEstado !== "todas") {
      url += `?estado=${filtroEstado}`;
    }
    api
      .get(url)
      .then((res) => setIncidencias(res.data))
      .catch(() => setIncidencias([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidencias();
  }, [filtroEstado]);

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    api
      .put(`/incidencias/${id}`, { estado: nuevoEstado })
      .then(() => fetchIncidencias())
      .catch(() => alert("Error al actualizar"));
  };

  const formatFecha = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nivelStyle = (nivel: string) => {
    if (nivel === "critico")
      return {
        background: "rgba(224,48,64,0.08)",
        borderLeft: "3px solid var(--danger)",
      };
    return {
      background: "rgba(232,160,0,0.08)",
      borderLeft: "3px solid var(--warn)",
    };
  };

  const estadoBadge = (estado: string) => {
    if (estado === "activa") return "pgp-badge pgp-badge-err";
    if (estado === "reconocida") return "pgp-badge pgp-badge-warn";
    return "pgp-badge pgp-badge-ok";
  };

  return (
    <Layout>
      <div
        className="pgp-fade-in"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "9px",
              color: "var(--danger)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Incidencias y Alertas
          </span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
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
            <option value="todas" style={{ background: "var(--bg-deep)" }}>
              Todas
            </option>
            <option value="activa" style={{ background: "var(--bg-deep)" }}>
              Activas
            </option>
            <option value="reconocida" style={{ background: "var(--bg-deep)" }}>
              Reconocidas
            </option>
            <option value="resuelta" style={{ background: "var(--bg-deep)" }}>
              Resueltas
            </option>
          </select>
          <button
            onClick={fetchIncidencias}
            style={{
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border2)",
              borderRadius: "4px",
              color: "var(--txt2)",
              fontSize: "9px",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Actualizar
          </button>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "9px",
              color: "var(--txt3)",
            }}
          >
            {incidencias.length} resultado(s)
          </span>
        </div>

        {loading && (
          <div className="pgp-alert pgp-alert-info">
            Cargando incidencias...
          </div>
        )}

        {incidencias.length === 0 && !loading ? (
          <div
            className="pgp-card"
            style={{
              textAlign: "center",
              color: "var(--txt3)",
              padding: "40px",
            }}
          >
            No hay incidencias registradas con este filtro
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {incidencias.map((inc) => (
              <div
                key={inc.id}
                className="pgp-card"
                style={{
                  ...nivelStyle(inc.nivel),
                  borderRadius: "6px",
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        className={`pgp-dot ${inc.nivel === "critico" ? "pgp-dot-err" : "pgp-dot-warn"}`}
                      ></span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--txt1)",
                        }}
                      >
                        {inc.tipo}
                      </span>
                      <span className={estadoBadge(inc.estado)}>
                        {inc.estado.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "9px", color: "var(--txt3)" }}>
                        Equipo #{inc.equipo_id}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "9.5px",
                        color: "var(--txt2)",
                        marginBottom: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {inc.descripcion}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        fontSize: "8.5px",
                        color: "var(--txt3)",
                      }}
                    >
                      <span>
                        Medido:{" "}
                        <span
                          style={{
                            fontFamily: "Consolas, monospace",
                            color: "var(--txt2)",
                          }}
                        >
                          {inc.valor_medido !== null
                            ? Number(inc.valor_medido).toFixed(2)
                            : "-"}
                        </span>
                      </span>
                      <span>
                        Umbral:{" "}
                        <span
                          style={{
                            fontFamily: "Consolas, monospace",
                            color: "var(--txt2)",
                          }}
                        >
                          {inc.umbral_config !== null
                            ? Number(inc.umbral_config).toFixed(2)
                            : "-"}
                        </span>
                      </span>
                      <span>{formatFecha(inc.timestamp)}</span>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "6px", marginLeft: "12px" }}
                  >
                    {inc.estado === "activa" && (
                      <button
                        onClick={() => cambiarEstado(inc.id, "reconocida")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "8px",
                          background: "transparent",
                          border: "1px solid var(--warn)",
                          borderRadius: "3px",
                          color: "var(--warn)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        RECONOCER
                      </button>
                    )}
                    {inc.estado !== "resuelta" && (
                      <button
                        onClick={() => cambiarEstado(inc.id, "resuelta")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "8px",
                          background: "transparent",
                          border: "1px solid var(--ok)",
                          borderRadius: "3px",
                          color: "var(--ok)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        RESOLVER
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
