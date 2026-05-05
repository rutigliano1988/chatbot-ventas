import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/',              label: '📅 Reservas',      end: true },
  { to: '/consultas',     label: '💬 Consultas',     end: false },
  { to: '/configuracion', label: '⚙️ Configuración', end: false },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 230,
        background: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8' }}>ChatBot Ventas</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Panel de administración</div>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'block',
                padding: '11px 20px',
                color: isActive ? '#38bdf8' : '#cbd5e1',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? '#0f172a' : 'transparent',
                borderLeft: `3px solid ${isActive ? '#38bdf8' : 'transparent'}`,
                transition: 'background 0.15s'
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #334155', fontSize: 11, color: '#475569' }}>
          v1.0 — MVP
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
