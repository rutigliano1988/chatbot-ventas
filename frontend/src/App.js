import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reservas from './pages/Reservas';
import Consultas from './pages/Consultas';
import Configuracion from './pages/Configuracion';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Reservas />} />
          <Route path="consultas" element={<Consultas />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
