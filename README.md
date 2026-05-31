# ShopDario — Resumen del Proyecto

# Usuarios de prueba
usuario cliente =>  email: cliente@tienda.com    contraseña: 123456
usuario administrador =>  email: admin@tienda.com    contraseña: 123456


## ¿Qué es este proyecto?

**ShopDario** (también llamado internamente *ShopSphere*) es una tienda online completa desarrollada con **React + TypeScript + Vite** como frontend y **Supabase** como backend (base de datos PostgreSQL, autenticación y almacenamiento). Permite a cualquier persona navegar un catálogo de productos, añadirlos a un carrito, registrarse como cliente y gestionar sus pedidos. Los administradores disponen además de un panel de control para gestionar tanto el inventario de productos como los usuarios registrados.

El proyecto implementa un sistema de **roles diferenciados** (`admin` / `cliente`) que controla qué rutas y funcionalidades están disponibles para cada tipo de usuario.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| Enrutado | React Router v6 |
| Iconos | Lucide React |

---

## Estructura de rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `/` y `/tienda` | Catálogo de productos | Todos |
| `/login` | Iniciar sesión | Sin sesión |
| `/register` | Crear cuenta | Sin sesión |
| `/carrito` | Carrito de compra | Todos (datos en local) |
| `/perfil` | Perfil de usuario | Autenticado |
| `/mis-reservas` | Historial de pedidos | Autenticado |
| `/admin/gestion-productos` | Panel de productos | Solo admin |
| `/admin/gestion-usuarios` | Panel de usuarios | Solo admin |

---

## Qué puede hacer cada tipo de usuario

---

### 👤 Usuario sin registrar

Es cualquier visitante que accede a la web sin haber iniciado sesión.

- **Ver el catálogo completo** de productos con imágenes, precios, stock y categorías.
- **Filtrar y buscar productos** por nombre, marca y categoría (electrónica, ropa, zapatillas, hogar, deporte, belleza, otros).
- **Añadir productos al carrito** — el carrito se guarda localmente en el navegador (`localStorage`), por lo que persiste aunque se cierre la pestaña.
- **Ver el carrito** con el resumen de productos, cantidades y precio total.
- **Acceder a las páginas de login y registro** para crear una cuenta o iniciar sesión.

> Lo que **no puede** hacer: tramitar un pedido (se le pide que inicie sesión), acceder a su perfil ni ver reservas.

---

### 🛍️ Usuario cliente (registrado)

Es un usuario que se ha registrado con nombre, email y contraseña. Al registrarse, se crea automáticamente con el rol `cliente` tanto en Supabase Auth como en la tabla `usuario` de la base de datos.

Tiene todo lo del usuario sin registrar, más:

- **Iniciar y cerrar sesión** de forma segura.
- **Recuperar la contraseña** por email (enlace de restauración).
- **Tramitar pedidos** desde el carrito — el pedido se guarda en la base de datos con estado `pendiente` o `pagado` (modo simulación).
- **Ver sus reservas** en `/mis-reservas`: historial completo de todos sus pedidos con fecha, estado y líneas de detalle.
- **Gestionar reservas pendientes**: puede modificar las cantidades de los productos de una reserva antes de pagarla, simular el pago para marcarla como `pagada` o cancelar/eliminar una reserva que todavía no ha sido pagada.
- **Editar su perfil**: cambiar su nombre de usuario (se actualiza tanto en Auth como en la BD).
- **Eliminar su cuenta** de forma permanente (mediante función RPC en Supabase).

---

### 🔐 Usuario administrador

Es un usuario con el rol `admin` en la base de datos. Al hacer login, el sistema detecta su rol y le muestra opciones adicionales tanto en el menú de navegación (escritorio y móvil) como en las rutas disponibles.

Tiene todo lo del cliente, más:

**Panel de gestión de productos** (`/admin/gestion-productos`):
- Ver el catálogo completo con métricas en tiempo real: número total de productos y cantidad de artículos con stock bajo (≤ 5 unidades).
- Buscar y filtrar productos por nombre, marca o categoría.
- **Añadir nuevos productos** a través de un formulario deslizante (Sheet).
- **Editar** cualquier producto existente (nombre, marca, tipo, precio, stock, descripción, imágenes).
- **Eliminar** productos del catálogo de forma permanente.

**Panel de gestión de usuarios** (`/admin/gestion-usuarios`):
- Ver la lista completa de todos los usuarios registrados con su nombre, email y rol.
- Buscar usuarios por nombre o email.
- Filtrar la lista por rol: todos, solo clientes o solo administradores.
- **Eliminar cuentas de clientes** (los administradores están protegidos y no pueden ser eliminados desde este panel).
- Refrescar la lista manualmente.

---

## Flujo general de la aplicación

```
Visita la web
      │
      ▼
  [ Tienda ] ──── Añadir al carrito (localStorage)
      │
      ├── Sin sesión ──► [ Login / Registro ]
      │                         │
      │                         ▼
      └── Con sesión ──► [ Tramitar pedido ] ──► [ Mis Reservas ]
                                │
                         rol = admin?
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          [ Gestión Productos ]   [ Gestión Usuarios ]
```

---

## Aspectos técnicos destacables

- **Carrito persistente en local**: los productos añadidos al carrito no requieren sesión y sobreviven a recargas de página gracias a `localStorage`.
- **Detección de rol en el header**: el componente `AppHeader` consulta el rol del usuario en Supabase al cargar y muestra u oculta los enlaces de administración dinámicamente.
- **Protección de rutas**: existe un `AuthProvider` con contexto de React y un componente `ProtectedRoute` que redirige a `/login` si no hay sesión activa.
- **Imágenes de productos relacionales**: cada producto puede tener múltiples imágenes en la tabla `imagen_producto`, con una marcada como portada (`es_portada: true`).
- **Gestión de pedidos en dos pasos**: al tramitar, primero se inserta el pedido en la tabla `pedido` y después las líneas en `linea_pedido`, respetando las restricciones de clave foránea.
