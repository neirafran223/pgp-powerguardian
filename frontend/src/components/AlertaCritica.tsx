import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEnVivo, { type CriticaVivo } from "../hooks/useEnVivo";

/**
 * Aviso emergente de alerta critica.
 *
 * Escucha el evento "critica" del canal en vivo y muestra un banner fijo en la
 * parte superior de TODA la aplicacion (esta montado en el Layout), con sonido,
 * hasta que el usuario lo cierre. Pensado para lo que exige accion inmediata:
 * sobrevoltaje, bajo voltaje, sobrecorriente o THD muy alto.
 */

interface Aviso extends CriticaVivo {
  id: string;
}

// Mismo equipo + tipo no debe re-sonar cada segundo: el backend ya agrupa por
// ventana de 60 s, aqui se agrega una demora extra para no atoscar al usuario.
const DEMORA_REPETICION_MS = 120_000;
const MAX_AVISOS = 3;

function tonoCritico() {
  // Dos pitidos cortos y agudos, sin archivos de audio
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ahora = ctx.currentTime;
    [0, 0.35].forEach((inicio) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ahora + inicio);
      gain.gain.exponentialRampToValueAtTime(0.15, ahora + inicio + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ahora + inicio + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ahora + inicio);
      osc.stop(ahora + inicio + 0.3);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Sin audio disponible: el banner igual aparece
  }
}

function formatoHora(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AlertaCritica() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [ultimoTono, setUltimoTono] = useState(0);
  const navigate = useNavigate();
  const ultimosRef = useRef<Map<string, number>>(new Map());

  const descartar = useCallback((id: string) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEnVivo({
    critica: (d) => {
      const clave = `${d.equipo_id}-${d.tipo}`;
      const ahora = Date.now();
      const ultimo = ultimosRef.current.get(clave) ?? 0;
      if (ahora - ultimo < DEMORA_REPETICION_MS) return;
      ultimosRef.current.set(clave, ahora);

      const aviso: Aviso = { ...d, id: `${clave}-${ahora}` };
      setAvisos((prev) => [aviso, ...prev].slice(0, MAX_AVISOS));

      // Sonido: solo si la pestana esta visible y no acaba de sonar
      if (document.visibilityState === "visible" && ahora - ultimoTono > 5_000) {
        setUltimoTono(ahora);
        tonoCritico();
      }
    },
  });

  // Cierra los avisos viejos solos a los 60 s (queda el registro en Incidencias)
  useEffect(() => {
    if (avisos.length === 0) return;
    const id = setTimeout(() => setAvisos([]), 60_000);
    return () => clearTimeout(id);
  }, [avisos]);

  if (avisos.length === 0) return null;

  return (
    <div className="pgp-aviso-critico" role="alert" aria-live="assertive">
      {avisos.map((a) => (
        <div key={a.id} className="pgp-aviso-critico-item">
          <div className="pgp-aviso-critico-pulso" aria-hidden="true" />
          <div className="pgp-aviso-critico-cuerpo">
            <div className="pgp-aviso-critico-titulo">
              Alerta crítica — requiere acción inmediata
              <span className="pgp-aviso-critico-hora">{formatoHora(a.timestamp)}</span>
            </div>
            <div className="pgp-aviso-critico-msg">
              <strong>{a.equipo ?? `Equipo ${a.equipo_id}`}</strong>
              {": "}
              {a.descripcion ?? a.tipo}
            </div>
            <div className="pgp-aviso-critico-datos">
              {a.valor_medido != null && (
                <span>
                  Valor medido: <strong>{a.valor_medido}</strong>
                </span>
              )}
              {a.umbral != null && (
                <span>
                  Límite permitido: <strong>{a.umbral}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="pgp-aviso-critico-acc">
            <button
              style={{
                padding: "6px 12px",
                background: "var(--danger)",
                border: "1px solid var(--danger)",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => {
                setAvisos([]);
                navigate("/incidencias");
              }}
            >
              Ver incidencias
            </button>
            <button
              className="pgp-aviso-critico-cerrar"
              onClick={() => descartar(a.id)}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
