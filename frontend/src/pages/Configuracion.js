import { useState, useEffect } from 'react';
import api from '../api';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIA_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
};

const NEGOCIO_VACIO = {
  nombre: '', descripcion: '', direccion: '', telefono: '',
  emailNotificaciones: '', telefonoNotificaciones: '', capacidadTotal: '',
  horarios: Object.fromEntries(DIAS.map(d => [d, null])),
  infoEspecifica: { menu: '', servicios: '', precios: '' }
};

export default function Configuracion() {
  const [negocio,   setNegocio]   = useState(NEGOCIO_VACIO);
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState(null);

  useEffect(() => {
    api.get('/negocio')
      .then(({ data }) => {
        setNegocio({
          ...NEGOCIO_VACIO,
          ...data,
          horarios: { ...NEGOCIO_VACIO.horarios, ...(data.horarios || {}) },
          infoEspecifica: { ...NEGOCIO_VACIO.infoEspecifica, ...(data.infoEspecifica || {}) }
        });
      })
      .catch(() => {}) // si no existe negocio, usa el vacío
      .finally(() => setCargando(false));
  }, []);

  const campo = (key) => ({
    value: negocio[key] ?? '',
    onChange: e => setNegocio(p => ({ ...p, [key]: e.target.value }))
  });

  const campoInfo = (key) => ({
    value: negocio.infoEspecifica?.[key] ?? '',
    onChange: e => setNegocio(p => ({ ...p, infoEspecifica: { ...p.infoEspecifica, [key]: e.target.value } }))
  });

  const toggleDia = (dia, abierto) => setNegocio(p => ({
    ...p,
    horarios: { ...p.horarios, [dia]: abierto ? { apertura: '09:00', cierre: '18:00' } : null }
  }));

  const cambiarHora = (dia, campo, valor) => setNegocio(p => ({
    ...p,
    horarios: { ...p.horarios, [dia]: { ...p.horarios[dia], [campo]: valor } }
  }));

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const payload = {
        ...negocio,
        capacidadTotal: negocio.capacidadTotal ? parseInt(negocio.capacidadTotal) : null
      };
      // Si el negocio ya existe usamos PUT, si no existe usamos POST
      try {
        await api.put('/negocio', payload);
      } catch (e) {
        if (e.response?.status === 404) await api.post('/negocio', payload);
        else throw e;
      }
      setMensaje({ tipo: 'ok', texto: '✅ Configuración guardada correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: '❌ Error al guardar. Revisá los datos e intentá de nuevo.' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  if (cargando) return <div style={{ color: '#64748b', padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={styles.titulo}>Configuración del negocio</h2>

      {mensaje && (
        <div style={{
          background: mensaje.tipo === 'ok' ? '#d1fae5' : '#fee2e2',
          color: mensaje.tipo === 'ok' ? '#065f46' : '#991b1b',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* ── Datos generales ── */}
      <Seccion titulo="Datos generales">
        <Fila label="Nombre del negocio *">
          <input style={styles.input} {...campo('nombre')} placeholder="Ej: El Buen Comer" />
        </Fila>
        <Fila label="Descripción">
          <textarea style={{ ...styles.input, resize: 'vertical', minHeight: 72 }} {...campo('descripcion')} placeholder="Breve descripción del negocio" />
        </Fila>
        <Fila label="Dirección">
          <input style={styles.input} {...campo('direccion')} placeholder="Av. Corrientes 1234, Buenos Aires" />
        </Fila>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Fila label="Teléfono del negocio">
            <input style={styles.input} {...campo('telefono')} placeholder="+54911..." />
          </Fila>
          <Fila label="Capacidad total (mesas/personas)">
            <input style={styles.input} type="number" min="1" {...campo('capacidadTotal')} placeholder="30" />
          </Fila>
        </div>
      </Seccion>

      {/* ── Notificaciones ── */}
      <Seccion titulo="Notificaciones al dueño">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Fila label="Email para notificaciones">
            <input style={styles.input} type="email" {...campo('emailNotificaciones')} placeholder="dueno@gmail.com" />
          </Fila>
          <Fila label="WhatsApp para notificaciones">
            <input style={styles.input} {...campo('telefonoNotificaciones')} placeholder="+54911..." />
          </Fila>
        </div>
      </Seccion>

      {/* ── Horarios ── */}
      <Seccion titulo="Horarios de atención">
        {DIAS.map(dia => {
          const h = negocio.horarios?.[dia];
          const abierto = !!h;
          return (
            <div key={dia} style={styles.filaDia}>
              <div style={styles.labelDia}>{DIA_LABEL[dia]}</div>
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={abierto}
                  onChange={e => toggleDia(dia, e.target.checked)}
                  style={{ accentColor: '#0ea5e9' }}
                />
                <span style={{ color: abierto ? '#0ea5e9' : '#94a3b8', fontWeight: abierto ? 600 : 400 }}>
                  {abierto ? 'Abierto' : 'Cerrado'}
                </span>
              </label>
              {abierto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="time" value={h.apertura}
                    onChange={e => cambiarHora(dia, 'apertura', e.target.value)}
                    style={styles.inputHora}
                  />
                  <span style={{ color: '#64748b', fontSize: 13 }}>a</span>
                  <input
                    type="time" value={h.cierre}
                    onChange={e => cambiarHora(dia, 'cierre', e.target.value)}
                    style={styles.inputHora}
                  />
                </div>
              )}
            </div>
          );
        })}
      </Seccion>

      {/* ── Info específica ── */}
      <Seccion titulo="Información para el bot (menú, servicios, precios)">
        <Fila label="Menú / productos">
          <textarea style={{ ...styles.input, resize: 'vertical', minHeight: 80 }} {...campoInfo('menu')}
            placeholder="Ej: Pastas caseras, carnes a la parrilla, pizzas artesanales." />
        </Fila>
        <Fila label="Servicios">
          <textarea style={{ ...styles.input, resize: 'vertical', minHeight: 60 }} {...campoInfo('servicios')}
            placeholder="Ej: Salón principal, terraza, catering, eventos privados." />
        </Fila>
        <Fila label="Precios">
          <textarea style={{ ...styles.input, resize: 'vertical', minHeight: 60 }} {...campoInfo('precios')}
            placeholder="Ej: Menú del día $3.500. Platos principales desde $4.500." />
        </Fila>
      </Seccion>

      <button
        onClick={guardar}
        disabled={guardando || !negocio.nombre}
        style={{
          padding: '12px 32px', background: guardando ? '#94a3b8' : '#0ea5e9',
          color: 'white', border: 'none', borderRadius: 8, fontSize: 15,
          fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer'
        }}
      >
        {guardando ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={styles.seccionTitulo}>{titulo}</h3>
      <div style={styles.seccionBody}>{children}</div>
    </div>
  );
}

function Fila({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  titulo:      { fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 28 },
  seccionTitulo: { fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  seccionBody: { background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  label:       { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input:       { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 14, color: '#1e293b', background: '#fafafa' },
  inputHora:   { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, color: '#1e293b' },
  filaDia:     { display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  labelDia:    { width: 100, fontSize: 14, fontWeight: 600, color: '#374151' },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', minWidth: 90 },
};
