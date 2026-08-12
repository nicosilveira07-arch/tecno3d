# TECNO 3D

## Arquitectura del Sistema

---

## 1. Introducción

TECNO 3D utiliza una arquitectura cliente-servidor, separando la interfaz de usuario, la lógica de negocio, el acceso a datos y los servicios externos.

La arquitectura está diseñada para mantener el sistema:

* Modular.
* Escalable.
* Seguro.
* Mantenible.
* Fácil de probar.
* Preparado para producción.

La comunicación entre frontend y backend se realiza mediante una API REST.

---

# 2. Arquitectura general

```text
┌──────────────────────────────────────────────┐
│                  USUARIO                     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 FRONTEND                     │
│                                              │
│ React + Vite + Tailwind CSS                  │
│ React Router + Axios                         │
│ React Query + React Hook Form + Zod          │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTP / REST API
                       ▼
┌──────────────────────────────────────────────┐
│                  BACKEND                     │
│                                              │
│ Node.js + Express                            │
│                                              │
│ Routes                                       │
│    ↓                                         │
│ Middlewares                                  │
│    ↓                                         │
│ Controllers                                  │
│    ↓                                         │
│ Services                                     │
│    ↓                                         │
│ Repositories                                 │
│    ↓                                         │
│ Prisma ORM                                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 POSTGRESQL                   │
└──────────────────────────────────────────────┘
```

---

# 3. Frontend

El frontend está desarrollado con React y Vite.

Su responsabilidad principal es presentar la interfaz gráfica y permitir la interacción del usuario con la plataforma.

Entre sus responsabilidades se encuentran:

* Renderización de interfaces.
* Navegación.
* Formularios.
* Validaciones.
* Gestión de sesión.
* Consumo de la API.
* Visualización del catálogo.
* Carrito.
* Checkout.
* Pedidos.
* Perfil.
* Panel administrativo.

---

# 4. Estructura del frontend

La estructura conceptual del frontend es:

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── api/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── index.html
├── package.json
└── vite.config.js
```

La estructura puede evolucionar durante el desarrollo, manteniendo siempre la separación de responsabilidades.

---

# 5. Componentes

La carpeta `components` contiene componentes reutilizables de la interfaz.

Ejemplos:

* Navbar.
* Footer.
* Cards.
* Modales.
* Formularios.
* Botones.
* Elementos de navegación.
* Componentes del dashboard.

El objetivo es evitar duplicación de código y facilitar el mantenimiento.

---

# 6. Pages

La carpeta `pages` contiene las páginas principales de la aplicación.

Entre ellas se encuentran las páginas correspondientes a:

* Inicio.
* Productos.
* Detalle de producto.
* Carrito.
* Checkout.
* Pedidos.
* Perfil.
* Administración.
* Dashboard.

Cada página utiliza componentes reutilizables para construir su interfaz.

---

# 7. API y Services

El frontend separa el consumo de la API de la lógica visual.

Ejemplo conceptual:

```text
Página
  │
  ▼
Service / API
  │
  ▼
Axios
  │
  ▼
Backend
```

Esto permite evitar realizar directamente todas las peticiones HTTP dentro de los componentes visuales.

Por ejemplo:

```text
products.api.js
orders.api.js
users.api.js
dashboard.api.js
```

Los nombres pueden variar según la organización final del frontend.

---

# 8. Axios

El frontend utiliza Axios como cliente HTTP.

La instancia principal permite centralizar:

* URL base.
* Headers.
* Token de autenticación.
* Configuración de peticiones.
* Manejo común de respuestas.

El token JWT se agrega automáticamente a las peticiones autenticadas mediante un interceptor.

Flujo:

```text
Frontend
   │
   ▼
Axios
   │
   ├── Base URL
   ├── Authorization
   └── Headers
   │
   ▼
Express API
```

---

# 9. Backend

El backend está desarrollado con:

* Node.js.
* Express.
* Prisma ORM.
* PostgreSQL.

Su responsabilidad principal es controlar la lógica del sistema y garantizar que las operaciones realizadas sean válidas y seguras.

---

# 10. Estructura del backend

```text
backend/
│
├── prisma/
│   │
│   └── schema.prisma
│
└── src/
    │
    ├── controllers/
    │
    ├── services/
    │
    ├── repositories/
    │
    ├── routes/
    │
    ├── validators/
    │
    ├── middlewares/
    │
    ├── lib/
    │
    ├── app.js
    └── server.js
```

---

# 11. Routes

Las rutas definen los endpoints disponibles en la API.

Ejemplo:

```text
/api/auth
/api/products
/api/categories
/api/brands
/api/orders
/api/addresses
/api/users
/api/upload
/api/cart
/api/checkout
/api/payments
/api/mercadopago
/api/webhook
/api/reviews
/api/favorites
/api/banners
```

Las rutas no deben contener reglas complejas de negocio.

Su responsabilidad es determinar:

* Método HTTP.
* Endpoint.
* Middleware.
* Controller correspondiente.

---

# 12. Middlewares

Los middlewares se ejecutan antes de llegar al controller.

Entre los principales se encuentran:

* Autenticación.
* Autorización.
* Seguridad.
* Manejo de errores.

Ejemplo de flujo:

```text
Request
   │
   ▼
CORS
   │
   ▼
Helmet
   │
   ▼
Authentication
   │
   ▼
Role Authorization
   │
   ▼
Controller
```

---

# 13. Autenticación

TECNO 3D utiliza JWT para autenticar usuarios.

El proceso general es:

```text
Usuario
   │
   ▼
Login
   │
   ▼
Validación de credenciales
   │
   ▼
JWT
   │
   ▼
Frontend
   │
   ▼
Request autenticada
   │
   ▼
auth.middleware
   │
   ▼
req.user
```

El middleware de autenticación identifica al usuario y permite que las capas posteriores conozcan su identidad.

---

# 14. Autorización por roles

El sistema utiliza tres roles:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

La autorización determina qué operaciones puede realizar cada usuario.

Ejemplo:

```text
CUSTOMER
   │
   ├── Catálogo
   ├── Carrito
   ├── Checkout
   ├── Sus pedidos
   └── Favoritos

EMPLOYEE
   │
   ├── Pedidos
   ├── Productos
   └── Operaciones administrativas permitidas

ADMIN
   │
   └── Acceso administrativo completo
```

La autorización se realiza mediante middleware de roles.

---

# 15. Controllers

Los controllers reciben las solicitudes HTTP y generan las respuestas.

Su responsabilidad principal es:

1. Recibir la request.
2. Obtener los datos necesarios.
3. Invocar al service.
4. Generar la respuesta.
5. Delegar errores al middleware correspondiente.

Ejemplo:

```text
Request
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Resultado
   │
   ▼
Response
```

Los controllers no deben contener reglas de negocio complejas.

---

# 16. Services

Los services contienen las reglas de negocio.

Esta es una de las capas más importantes del sistema.

Ejemplo:

```text
createOrderService()
```

puede encargarse de:

* Validar método de entrega.
* Validar dirección.
* Verificar existencia del producto.
* Verificar stock.
* Calcular total.
* Crear los elementos del pedido.
* Crear el pedido.

De esta forma, el controller permanece simple y la lógica de negocio queda centralizada.

---

# 17. Repositories

Los repositories son responsables del acceso a los datos.

Utilizan Prisma para comunicarse con PostgreSQL.

Ejemplo:

```text
Service
   │
   ▼
Repository
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

Los repositories contienen operaciones como:

* Buscar.
* Crear.
* Actualizar.
* Eliminar.
* Contar.
* Consultar relaciones.

---

# 18. Prisma ORM

Prisma funciona como ORM entre el backend y PostgreSQL.

La estructura de datos se define principalmente mediante:

```text
prisma/schema.prisma
```

Prisma permite:

* Definir modelos.
* Definir relaciones.
* Definir enums.
* Ejecutar consultas.
* Crear transacciones.
* Gestionar migraciones.

---

# 19. PostgreSQL

PostgreSQL es el sistema gestor de base de datos utilizado por TECNO 3D.

Las principales entidades incluyen:

```text
User
Product
Category
Brand
ProductImage
Cart
CartItem
Address
Order
OrderItem
Payment
Review
Favorite
Banner
```

Las relaciones entre estas entidades permiten representar la estructura completa del negocio.

---

# 20. Flujo completo de una petición

Una petición típica sigue este flujo:

```text
┌───────────────┐
│    Usuario    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    React      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Axios      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│     Route     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Middleware  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Controller  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Service    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Repository   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Prisma     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  PostgreSQL   │
└───────────────┘
```

---

# 21. Flujo de creación de pedidos

El proceso de creación de pedidos utiliza varias validaciones.

```text
Cliente
   │
   ▼
Checkout
   │
   ▼
POST /api/orders
   │
   ▼
Authentication
   │
   ▼
Order Controller
   │
   ▼
Order Service
   │
   ├── Validar método de entrega
   ├── Validar dirección
   ├── Validar usuario
   ├── Validar productos
   ├── Validar stock
   └── Calcular total
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
   │
   ▼
Pedido creado
```

---

# 22. Flujo de estados de pedidos

Los pedidos utilizan estados controlados:

```text
PENDING
   │
   ├──────────────► CANCELLED
   │
   ▼
CONFIRMED
   │
   ├──────────────► CANCELLED
   │
   ▼
PROCESSING
   │
   ├──────────────► CANCELLED
   │
   ▼
SHIPPED
   │
   ▼
DELIVERED
```

Las transiciones se validan desde la capa de servicios.

Esto evita que un usuario autorizado pueda realizar cambios de estado inválidos.

---

# 23. Flujo de pagos

```text
Pedido
   │
   ▼
Payment
   │
   ▼
Método de pago
   │
   ├── Mercado Pago
   ├── PayPal
   ├── Efectivo
   └── Transferencia bancaria
   │
   ▼
Resultado
   │
   ├── PENDING
   ├── PAID
   ├── FAILED
   └── REFUNDED
```

Cuando corresponde, Mercado Pago comunica el resultado mediante webhook.

---

# 24. Webhooks

Los webhooks permiten que servicios externos comuniquen eventos al backend.

En TECNO 3D se utilizan principalmente para integrar eventos relacionados con pagos.

Flujo:

```text
Mercado Pago
     │
     ▼
Webhook
     │
     ▼
Backend
     │
     ▼
Validación
     │
     ▼
Actualización del Payment
     │
     ▼
PostgreSQL
```

---

# 25. Gestión de imágenes

Las imágenes se gestionan mediante Cloudinary.

Flujo:

```text
Usuario
   │
   ▼
Frontend
   │
   ▼
Upload API
   │
   ▼
Cloudinary
   │
   ▼
URL + publicId
   │
   ▼
PostgreSQL
```

El sistema puede utilizar imágenes principales y múltiples imágenes asociadas a productos.

---

# 26. Dashboard administrativo

El dashboard administrativo obtiene sus métricas mediante la API.

El flujo es:

```text
AdminDashboard.jsx
       │
       ▼
dashboard.api.js
       │
       ▼
GET /api/dashboard
       │
       ▼
Dashboard Controller
       │
       ▼
Dashboard Service
       │
       ▼
Dashboard Repository
       │
       ▼
Prisma
       │
       ▼
PostgreSQL
```

Las métricas se calculan utilizando información real almacenada en la base de datos.

---

# 27. Seguridad de la arquitectura

La arquitectura contempla diferentes niveles de protección:

```text
Cliente
   │
   ▼
CORS
   │
   ▼
Helmet
   │
   ▼
JWT
   │
   ▼
Role Authorization
   │
   ▼
Validaciones
   │
   ▼
Reglas de negocio
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

La seguridad no depende de una única capa, sino de múltiples mecanismos complementarios.

---

# 28. Separación de responsabilidades

Una de las reglas principales de la arquitectura es evitar concentrar toda la lógica en un único archivo.

```text
Routes
  ↓
Definen endpoints

Controllers
  ↓
Gestionan HTTP

Services
  ↓
Gestionan negocio

Repositories
  ↓
Gestionan datos

Prisma
  ↓
Gestiona ORM

PostgreSQL
  ↓
Almacena información
```

Esta separación facilita:

* Mantenimiento.
* Pruebas.
* Escalabilidad.
* Depuración.
* Reutilización.
* Incorporación de nuevas funcionalidades.

---

# 29. Escalabilidad

La arquitectura permite incorporar futuras funcionalidades sin modificar completamente el sistema.

Entre las posibles extensiones se encuentran:

* Nuevos métodos de pago.
* Nuevos métodos de envío.
* Sistema de cupones.
* Promociones.
* Notificaciones.
* Reportes avanzados.
* Auditoría.
* Gestión avanzada de inventario.
* Sistema de facturación.
* Integración con otros servicios externos.

La incorporación de nuevas funcionalidades debe respetar la separación de responsabilidades existente.

---

# 30. Principios arquitectónicos

TECNO 3D sigue los siguientes principios:

* Separación de responsabilidades.
* Modularidad.
* Bajo acoplamiento.
* Reutilización.
* Validación en backend.
* Seguridad por capas.
* Persistencia centralizada.
* Reglas de negocio centralizadas.
* Código mantenible.
* Arquitectura preparada para crecimiento.

---

# 31. Resumen

La arquitectura de TECNO 3D está basada en una separación clara entre:

```text
Frontend
    ↓
API REST
    ↓
Backend
    ↓
Business Logic
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Esta estructura permite construir una plataforma e-commerce profesional manteniendo el código organizado y preparado para futuras ampliaciones.

---

## TECNO 3D

**Arquitectura cliente-servidor**

**Frontend:** React + Vite
**Backend:** Node.js + Express
**ORM:** Prisma
**Base de datos:** PostgreSQL
