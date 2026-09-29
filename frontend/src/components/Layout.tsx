import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Panel Principal", path: "/dashboard", group: "Dashboard" },
  { label: "Equipos", path: "/equipos", group: "Monitoreo" },
  { label: "Graficos Electricos", path: "/graficos", group: "Monitoreo" },
  { label: "Incidencias", path: "/incidencias", group: "Alertas" },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const grouped = navItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, typeof navItems>,
  );

  return (
    <div className="pgp-app">
      {/* Sidebar */}
      <aside className="pgp-sidebar">
        <div className="pgp-brand">
          <div className="pgp-brand-name">PowerGuardian Pro</div>
          <div className="pgp-brand-sub">SISTEMA DE GESTION ENERGETICA</div>
          <div className="pgp-brand-ver">
            <span className="pgp-dot pgp-dot-ok"></span> v1.0 - Operativo
          </div>
          <div className="pgp-brand-company">INDUC TECH</div>
        </div>

        <nav className="pgp-nav">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="pgp-nav-group">
              <div className="pgp-nav-group-label">{group}</div>
              {items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`pgp-nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  <span className="pgp-nav-indicator"></span>
                  {item.label}
                  {location.pathname === item.path && (
                    <span className="pgp-dot pgp-dot-ok pgp-nav-dot"></span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pgp-sidebar-footer">
          <button className="pgp-sidebar-btn" onClick={logout}>
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="pgp-main">
        <header className="pgp-topbar">
          <div className="pgp-topbar-left">
            <h1 className="pgp-topbar-title">
              PowerGuardian Pro
            </h1>
            <p className="pgp-topbar-sub">
              Sistema Inteligente de Monitoreo y Diagnostico de Calidad Energetica
            </p>
          </div>
          <div className="pgp-topbar-right">
            <span className="pgp-badge pgp-badge-ok">SISTEMA ACTIVO</span>
            <span className="pgp-badge pgp-badge-info">IEC 61000</span>
            <span className="pgp-topbar-time">{timeStr}</span>
          </div>
        </header>

        <main className="pgp-content">{children}</main>
      </div>
    </div>
  );
}
