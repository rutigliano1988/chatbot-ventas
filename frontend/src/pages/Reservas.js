import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Badge from '../components/Badge';

const FILTROS = [
  { key: 'pendiente',  label: '🕐 Pendientes' },
  { key: 'confirmada', label: '✓ Confirmadas' },
  { key: 'cancelada',  label: '✗ Canceladas' },
  { key: 'completada', label: '★ Completadas' },
  { key: '',           label: 'Todas' },
];

export default function Reservas() {
  const [reservas,  setReservas]  = useState([]);
  const [filtro,    setFiltro]    = useState('pendiente');
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = filtro ? { estado: filtro } : {};
      const { data } = await api.get('/reservas', { params });
      setReservas(data);
    } catch {
      setError('No se pudieron cargar las reservas. ¿El servidor está corriendo?');
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/reservas/${id}`, { estado: nuevoEstado });
      cargar();
    } catch {
      alert('Error al actualizar la reserva.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Reservas</h2>
        <button onClick={cargar} style={btn('#64748b')}>↻ Actualizar</button>
      </div>

      <div style={styles.tabs}>
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={tab(filtro === f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {cargando ? (
        <div style={styles.vacio}>Cargando...</div>
      ) : reservas.length === 0 ? (
        <div style={styles.vacio}>
          No hay reservas {filtro ? `con estado "${filtro}"` : ''}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservas.map(r => <TarjetaReserva key={r.id} r={r} onCambio={cambiarEstado} />)}
        </div>
      )}
    </div>
  );
}

function TarjetaReserva({ r, onCambio }) {
  const nombreCliente = r.cliente
    ? `${r.cliente.nombre || ''} ${r.cliente.apellido || ''}`.trim() || 'Sin nombre'
    : '—';

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
              {formatFecha(r.fecha)}
            </div>
            <div style={{ fontSize: 15, color: '#64748b', marginTop: 2 }}>
              {r.hora?.slice(0, 5)} hs
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{nombreCliente}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>📞 {r.cliente?.telefono}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              👥 {r.personas} {r.personas === 1 ? 'persona' : 'personas'}
            </div>
            {r.observaciones && (
              <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>📝 {r.observaciones}</div>
            )}
          </div>
        </div>
        <Badge estado={r.estado} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {r.estado === 'pendiente' && (
          <button onClick={() => onCambio(r.id, 'confirmada')} style={btn('#10b981')}>✓ Confirmar</button>
        )}
        {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
          <button onClick={() => onCambio(r.id, 'cancelada')} style={btn('#ef4444')}>✗ Cancelar</button>
        )}
        {r.estado === 'confirmada' && (
          <button onClick={() => onCambio(r.id, 'completada')} style={btn('#6366f1')}>★ Completar</button>
        )}
      </div>
    </div>
  );
}

function formatFecha(str) {
  if (!str) return '—';
  const [, m, d] = str.split('-');
  return `${d}/${m}`;
}

// ── Estilos ───────────────────────────────────────────────

const styles = {
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titulo:  { fontSize: 22, fontWeight: 800, color: '#1e293b' },
  tabs:    { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 },
  card:    { background: 'white', borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' },
  vacio:   { textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 15 },
  error:   { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 },
};

function btn(color) {
  return { padding: '7px 14px', background: color, color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600 };
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
