import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './views/Login.tsx'
import Register from './views/Register.tsx'
import GestionProductos from './views/GestionProductos.tsx'
import {Easter} from './views/Easter.tsx'
import Tienda from './views/Tienda.tsx'
import Carrito from './views/Carrito.tsx'

export const App = ({user}) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/easter" element={<Easter />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gestion-productos" element={<GestionProductos />} />
        <Route path="/" element={<Tienda />} />
        <Route path="/carrito" element={<Carrito />} />
      </Routes>
    </BrowserRouter>
  )
}
