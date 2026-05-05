import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Badge from '../components/Badge';

export default function Consultas() {
  const [consultas,    setConsultas]    = useState([]);
  const [filtro,       setFiltro]       = useState('pendiente');
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState(null);
  const [respondiendo, setRespondiendo] = useState(null);
  const [respuesta,    setRespuesta]    = useState('');
  const [enviando,     setEnviando]     = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = filtro ? { estado: filtro } : {};
      const { data } = await api.get('/consultas', { params });
      setConsultas(data);
    } catch {
      setError('No se pudieron cargar las consultas. ¿El servidor está corriendo?');
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const enviarRespuesta = async (id) => {
    if (!respuesta.trim()) return;
    setEnviando(true);
    try {
      await api.post(`/consultas/${id}/responder`, { respuesta: respuesta.trim() });
      setRespondiendo(null);
      setRespuesta('');
      cargar();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al enviar la respuesta.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Consultas</h2>
        <button onClick={cargar} style={btn('#64748b')}>↻ Actualizar</button>
      </div>

      <div style={styles.tabs}>
        {[{ key: 'pendiente', label: '🕐 Pendientes' }, { key: 'respondida', label: '✓ Respondidas' }].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={tab(filtro === f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {cargando ? (
        <div style={styles.vacio}>Cargando...</div>
      ) : consultas.length === 0 ? (
        <div style={styles.vacio}>
          No hay consultas {filtro === 'pendiente' ? 'pendientes' : 'respondidas'}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {consultas.map(c => (
            <div
              key={c.id}
              style={{
                ...styles.card,
                borderLeft: `4px solid ${c.estado === 'pendiente' ? '#f59e0b' : '#10b981'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                    {c.cliente ? `${c.cliente.nombre || ''} ${c.cliente.apellido || ''}`.trim() || 'Sin nombre' : '—'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 13, marginLeft: 10 }}>
                    📞 {c.cliente?.telefono}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatFecha(c.creadaEn)}</span>
                  <Badge estado={c.estado} />
                </div>
              </div>

              <blockquote style={styles.pregunta}>{c.pregunta}</blockquote>

              {c.respuesta && (
                <div style={styles.respuestaBox}>
                  <strong>Tu respuesta:</strong> {c.respuesta}
                </div>
              )}

              {c.estado === 'pendiente' && (
                respondiendo === c.id ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
                    <textarea
                      value={respuesta}
                      onChange={e => setRespuesta(e.target.value)}
                      placeholder="Escribí tu respuesta para el cliente..."
                      rows={3}
                      autoFocus
                      style={styles.textarea}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => enviarRespuesta(c.id)}
                        disabled={enviando || !respuesta.trim()}
                        style={btn(enviando || !respuesta.trim() ? '#94a3b8' : '#10b981')}
                      >
                        {enviando ? '...' : '✓ Enviar'}
                      </button>
                      <button
                        onClick={() => { setRespondiendo(null); setRespuesta(''); }}
                        style={btn('#e2e8f0', '#475569')}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setRespondiendo(c.id); setRespuesta(''); }}
                    style={{ ...btn('#0ea5e9'), marginTop: 10 }}
                  >
                    💬 Responder por WhatsApp
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatFecha(str) {
  if (!str) return '';
  const f = new Date(str);
  const d  = f.getDate().toString().padStart(2, '0');
  const mo = (f.getMonth() + 1).toString().padStart(2, '0');
  const h  = f.getHours().toString().padStart(2, '0');
  const mi = f.getMinutes().toString().padStart(2, '0');
  return `${d}/${mo} ${h}:${mi}`;
}

const styles = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titulo:       { fontSize: 22, fontWeight: 800, color: '#1e293b' },
  tabs:         { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0' },
  card:         { background: 'white', borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' },
  vacio:        { textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 15 },
  error:        { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 },
  pregunta:     { borderLeft: '3px solid #e2e8f0', paddingLeft: 12, color: '#374151', fontSize: 14, lineHeight: 1.5 },
  respuestaBox: { background: '#f0fdf4', borderRadius: 6, padding: '8px 12px', fontSize: 14, color: '#166534', marginTop: 10 },
  textarea:     { flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical', minHeight: 72 },
};

function btn(bg, color = 'white') {
  return { padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600 };
}

function tab(activo) {
  return {
    padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: activo ? 700 : 400,
    color: activo ? '#0ea5e9' : '#64748b',
    borderBottom: `2px solid ${activo ? '#0ea5e9' : 'transparent'}`,
    marginBottom: -1,
  };
}
