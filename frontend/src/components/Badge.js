const ESTILOS = {
  pendiente:  { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  confirmada: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  cancelada:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  completada: { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
  respondida: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
};

export default function Badge({ estado }) {
  const e = ESTILOS[estado] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  return (
    <span style={{
      background: e.bg,
      color: e.color,
      border: `1px solid ${e.border}`,
      borderRadius: 20,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      textTransform: 'capitalize'
    }}>
      {estado}
    </span>
  );
}
