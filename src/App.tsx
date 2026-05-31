import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './views/Login.tsx';
import Register from './views/Register.tsx';
import GestionProductos from './views/GestionProductos.tsx';
import GestionUsuarios from './views/GestionUsuarios.tsx';
import Tienda from './views/Tienda.tsx';
import Carrito from './views/Carrito.tsx';
import Profile from './views/Profile.tsx';
import MisReservas from './views/MisReservas.tsx';

export const App = () => (
  <BrowserRouter>
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />


        <Route path="/" element={<Tienda />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/carrito" element={<Carrito />} />

        <Route path="/admin/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/admin/gestion-productos" element={<GestionProductos />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);
