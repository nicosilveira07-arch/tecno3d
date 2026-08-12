# TECNO 3D
## Documentación General del Proyecto

---

## 1. Información del proyecto

**Nombre:** TECNO 3D  
**Tipo:** Plataforma e-commerce  
**Estado:** En desarrollo  
**Arquitectura:** Cliente-Servidor  
**Base de datos:** PostgreSQL  
**ORM:** Prisma ORM  

TECNO 3D es una plataforma de comercio electrónico desarrollada para la gestión y comercialización de productos tecnológicos, incluyendo impresoras 3D, filamentos, resinas, accesorios y otros productos relacionados.

El sistema está diseñado con una arquitectura moderna, modular y escalable, separando claramente el frontend, backend, lógica de negocio, persistencia de datos y servicios externos.

El objetivo es obtener una aplicación profesional, segura, mantenible y preparada para un entorno real de producción.

---

# 2. Objetivos del sistema

Los principales objetivos de TECNO 3D son:

- Permitir a los clientes consultar el catálogo de productos.
- Permitir búsquedas y filtros de productos.
- Gestionar categorías y marcas.
- Permitir registro e inicio de sesión de usuarios.
- Gestionar diferentes roles de usuario.
- Permitir agregar productos al carrito.
- Permitir gestionar favoritos.
- Permitir gestionar direcciones de envío.
- Permitir realizar pedidos.
- Permitir seleccionar diferentes métodos de entrega.
- Gestionar pagos.
- Integrar medios de pago externos.
- Gestionar estados de pedidos.
- Gestionar stock de productos.
- Permitir publicar reseñas de productos.
- Gestionar banners promocionales.
- Proporcionar un panel administrativo.
- Proporcionar métricas y estadísticas de ventas.
- Permitir la administración de productos, usuarios y pedidos.

---

# 3. Arquitectura general

TECNO 3D utiliza una arquitectura de tipo cliente-servidor.

La aplicación está dividida principalmente en:

```text
TECNO 3D
│
├── Frontend
│   ├── React
│   ├── Vite
│   ├── Tailwind CSS
│   └── Axios
│
├── Backend
│   ├── Node.js
│   ├── Express
│   ├── Prisma ORM
│   └── PostgreSQL
│
└── Servicios externos
    ├── Cloudinary
    └── Mercado Pago

Esta separación permite que frontend y backend evolucionen de manera independiente.

4. Tecnologías utilizadas
4.1 Frontend

El frontend está desarrollado utilizando:

React
Vite
Tailwind CSS
Axios
React Router
React Query
React Hook Form
Zod
Lucide React
Framer Motion
Sonner
Responsabilidad

El frontend se encarga principalmente de:

Interfaz gráfica.
Navegación.
Formularios.
Validaciones del lado del cliente.
Consumo de la API.
Gestión de sesión.
Visualización de productos.
Carrito.
Checkout.
Panel administrativo.
5. Backend

El backend está desarrollado utilizando:

Node.js
Express
Prisma ORM
PostgreSQL
JWT
Zod
bcrypt
Helmet
CORS
Responsabilidad

El backend se encarga de:

Autenticación.
Autorización.
Reglas de negocio.
Gestión de usuarios.
Gestión de productos.
Gestión de categorías.
Gestión de marcas.
Gestión de pedidos.
Gestión de pagos.
Gestión del carrito.
Gestión de favoritos.
Gestión de reseñas.
Gestión de banners.
Gestión de imágenes.
Acceso a la base de datos.
6. Base de datos

TECNO 3D utiliza PostgreSQL como sistema gestor de base de datos.

Prisma ORM se utiliza como capa de acceso y abstracción de datos.

Entre las principales entidades del sistema se encuentran:

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

La estructura completa de la base de datos se encuentra documentada en:

docs/BASE_DE_DATOS.md
7. Roles del sistema

El sistema utiliza tres roles principales:

ADMIN
EMPLOYEE
CUSTOMER
ADMIN

El administrador posee acceso a las funciones administrativas del sistema.

Entre ellas:

Gestión de usuarios.
Gestión de productos.
Gestión de categorías.
Gestión de marcas.
Gestión de pedidos.
Gestión de pagos.
Gestión de banners.
Visualización del dashboard.
Gestión general de la plataforma.
EMPLOYEE

El empleado posee permisos operativos sobre determinadas funciones administrativas.

Puede acceder, según los permisos definidos por el sistema, a:

Pedidos.
Productos.
Gestión operativa.
Estados de pedidos.
Información necesaria para la operación comercial.
CUSTOMER

El cliente representa al usuario final de la plataforma.

Puede:

Consultar productos.
Buscar productos.
Filtrar productos.
Agregar productos al carrito.
Gestionar favoritos.
Gestionar direcciones.
Crear pedidos.
Consultar sus pedidos.
Consultar pagos.
Publicar reseñas.
8. Autenticación y seguridad

La autenticación del sistema utiliza JSON Web Tokens (JWT).

El flujo general es:

Usuario
   │
   ▼
Login
   │
   ▼
Backend
   │
   ├── Verificación de credenciales
   ├── Validación de contraseña
   └── Generación de JWT
   │
   ▼
Frontend
   │
   ▼
Token almacenado
   │
   ▼
Requests autenticadas

Las contraseñas son almacenadas utilizando hashing mediante bcrypt.

El backend utiliza middleware para:

Verificar autenticación.
Validar tokens.
Identificar al usuario.
Controlar roles.
Proteger endpoints.
9. Productos

El sistema permite gestionar productos con información como:

Nombre.
Slug.
Descripción.
Precio.
Precio de oferta.
Porcentaje de descuento.
Estado de oferta.
Stock.
Imagen principal.
Imágenes adicionales.
Categoría.
Marca.
Propietario.
Fecha de creación.
Fecha de actualización.

Los productos pueden encontrarse mediante:

Búsqueda.
Categoría.
Marca.
Oferta.
Orden por precio.
Orden por fecha.

El sistema también contempla normalización de términos de búsqueda para mejorar la experiencia del usuario.

10. Carrito de compras

Cada usuario puede disponer de un carrito asociado a su cuenta.

El carrito permite:

Agregar productos.
Modificar cantidades.
Eliminar productos.
Consultar productos agregados.
Validar disponibilidad.

La relación entre carrito y productos se gestiona mediante CartItem.

11. Checkout

El proceso de checkout permite convertir el carrito del usuario en un pedido.

El sistema contempla dos métodos de entrega:

SHIPPING
PICKUP
SHIPPING

Requiere una dirección válida perteneciente al usuario.

PICKUP

Representa el retiro del pedido en el local y no requiere dirección de envío.

Durante la creación del pedido se valida:

Existencia del producto.
Stock disponible.
Método de entrega.
Dirección.
Propiedad de la dirección.
Cantidades solicitadas.
12. Pedidos

Los pedidos poseen un ciclo de vida controlado.

Los estados disponibles son:

PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED

Las transiciones están controladas por reglas de negocio.

Ejemplo:

PENDING
   │
   ▼
CONFIRMED
   │
   ▼
PROCESSING
   │
   ▼
SHIPPED
   │
   ▼
DELIVERED

Un pedido también puede ser cancelado cuando las reglas del sistema lo permiten.

13. Pagos

El sistema posee una entidad Payment asociada a cada pedido.

Los estados disponibles son:

PENDING
PAID
FAILED
REFUNDED

Los métodos de pago contemplados son:

MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER

El sistema también contempla:

Identificador de transacción.
Monto.
Fecha de creación.
Fecha de actualización.
Asociación con el pedido.
14. Integración con Mercado Pago

TECNO 3D contempla integración con Mercado Pago.

El flujo general es:

Cliente
   │
   ▼
Checkout
   │
   ▼
Creación del pedido
   │
   ▼
Generación del pago
   │
   ▼
Mercado Pago
   │
   ▼
Resultado del pago
   │
   ▼
Webhook
   │
   ▼
Actualización del estado

El webhook permite recibir información relacionada con el resultado del pago y actualizar el estado correspondiente dentro del sistema.

15. Imágenes

El sistema contempla almacenamiento de imágenes mediante Cloudinary.

Se utiliza para:

Imágenes de productos.
Imágenes adicionales de productos.
Imágenes de banners.
Imágenes de usuarios.

La base de datos almacena las URLs correspondientes y, cuando corresponde, el identificador público utilizado por Cloudinary.

16. Reseñas

Los usuarios pueden realizar reseñas sobre productos.

Cada reseña contiene:

Usuario.
Producto.
Calificación.
Comentario.
Fecha de creación.
Fecha de actualización.

El sistema establece una relación única entre usuario y producto para evitar múltiples reseñas del mismo usuario sobre un mismo producto.

17. Favoritos

Los usuarios pueden guardar productos como favoritos.

La relación se establece mediante:

User
   │
   ▼
Favorite
   │
   ▼
Product

También se impide que un mismo usuario agregue repetidamente el mismo producto a favoritos.

18. Banners

La plataforma posee un sistema de banners promocionales.

Los banners pueden contener:

Título.
Descripción.
Texto del botón.
Enlace.
Imagen.
Identificador de Cloudinary.
Estado activo/inactivo.
Fecha de creación.
Fecha de actualización.

Esto permite administrar contenido promocional desde el sistema.

19. Dashboard administrativo

TECNO 3D dispone de un dashboard administrativo orientado a la gestión y análisis del negocio.

El dashboard contempla:

Ventas totales.
Pedidos totales.
Cantidad de clientes.
Cantidad de productos.
Ventas por período.
Ventas por categoría.
Productos más vendidos.
Pedidos recientes.
Estado de pagos.
Stock y productos con poco stock.

Las métricas deben obtenerse directamente desde PostgreSQL mediante Prisma.

No se utilizan valores ficticios para las métricas definitivas.

20. API

El backend expone una API REST.

Las principales áreas disponibles son:

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

La documentación completa de endpoints se encuentra en:

docs/API.md
21. Estructura del backend

La estructura principal del backend es:

backend/
│
├── prisma/
│   └── schema.prisma
│
└── src/
    │
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── routes/
    ├── validators/
    ├── middlewares/
    ├── lib/
    │
    ├── app.js
    └── server.js

La aplicación utiliza separación por responsabilidades.

Controllers

Gestionan las solicitudes HTTP y respuestas.

Services

Contienen las reglas de negocio.

Repositories

Gestionan el acceso a la base de datos.

Routes

Definen los endpoints de la API.

Middlewares

Gestionan autenticación, autorización, seguridad y errores.

Validators

Validan los datos recibidos.

22. Estructura del frontend

La aplicación frontend utiliza una estructura basada en componentes, páginas y servicios.

Estructura conceptual:

frontend/
│
└── src/
    │
    ├── api/
    ├── components/
    ├── pages/
    ├── services/
    ├── hooks/
    ├── layouts/
    ├── utils/
    ├── App.jsx
    └── main.jsx

La estructura puede evolucionar durante el desarrollo manteniendo la separación de responsabilidades.

23. Comunicación Frontend ↔ Backend

El frontend consume la API mediante Axios.

El flujo general es:

React
  │
  ▼
Service / API
  │
  ▼
Axios
  │
  ▼
Express API
  │
  ▼
Controller
  │
  ▼
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

Las respuestas del backend utilizan una estructura consistente para facilitar el consumo desde el frontend.

24. Manejo de errores

El backend dispone de middleware centralizado para el manejo de errores.

El objetivo es evitar duplicación de lógica y mantener respuestas consistentes.

Los errores pueden corresponder a:

Datos inválidos.
Usuario no autenticado.
Usuario sin permisos.
Recursos inexistentes.
Stock insuficiente.
Transiciones de estado inválidas.
Errores de base de datos.
Errores de servicios externos.
25. Seguridad

Entre las medidas de seguridad implementadas se encuentran:

JWT.
bcrypt.
Middleware de autenticación.
Middleware de autorización por roles.
CORS.
Helmet.
Validación de datos.
Control de acceso a recursos.
Validación de propiedad de direcciones.
Validación de stock.
Control de transiciones de pedidos.
Separación de responsabilidades.
26. Principios de desarrollo

El proyecto sigue los siguientes principios:

Código modular.
Separación de responsabilidades.
Reutilización.
Validación de datos.
Seguridad.
Escalabilidad.
Mantenibilidad.
Consistencia.
Evitar duplicación.
Mantener las reglas de negocio en el backend.
27. Estado actual del proyecto

El proyecto se encuentra en etapa de desarrollo avanzado.

Actualmente se encuentran implementadas las principales estructuras del sistema:

Autenticación.
Usuarios.
Roles.
Productos.
Categorías.
Marcas.
Imágenes.
Carrito.
Direcciones.
Pedidos.
Pagos.
Checkout.
Mercado Pago.
Webhooks.
Reseñas.
Favoritos.
Banners.
Dashboard administrativo.

Las funcionalidades continúan integrándose y validándose entre frontend, backend y base de datos.

28. Documentación complementaria

Esta documentación se complementa con los siguientes archivos:

docs/
│
├── DOCUMENTACION_TECNO3D.md
├── ARQUITECTURA.md
├── BASE_DE_DATOS.md
├── API.md
└── MANUAL_USUARIO.md
DOCUMENTACION_TECNO3D.md

Documento general del proyecto.

ARQUITECTURA.md

Explica la arquitectura técnica y organización interna.

BASE_DE_DATOS.md

Documenta modelos, relaciones, enums e información de PostgreSQL.

API.md

Documenta endpoints, métodos HTTP, autenticación, parámetros y respuestas.

MANUAL_USUARIO.md

Explica cómo utilizar la plataforma desde la perspectiva del usuario final y administrativo.

29. Objetivo final

El objetivo final de TECNO 3D es disponer de una plataforma e-commerce profesional, funcional, segura y escalable, capaz de operar como una solución comercial real.

El sistema busca proporcionar una experiencia moderna para los clientes y herramientas completas de gestión para la administración del negocio.

La arquitectura implementada permite continuar incorporando nuevas funcionalidades sin comprometer las existentes y manteniendo una estructura preparada para futuras etapas de crecimiento.

TECNO 3D

Plataforma e-commerce profesional

Frontend: React + Vite
Backend: Node.js + Express
ORM: Prisma
Base de datos: PostgreSQL


### Ahora

Guardalo en:

```text
frontend/
└── docs/
    └── DOCUMENTACION_TECNO3D.md