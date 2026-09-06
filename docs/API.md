# API — TECNO 3D

## 1. Información general

TECNO 3D utiliza una API REST desarrollada con **Node.js** y **Express**.

La API permite gestionar:

* Autenticación.
* Usuarios.
* Productos.
* Categorías.
* Marcas.
* Carrito.
* Pedidos.
* Checkout.
* Direcciones.
* Pagos.
* Mercado Pago.
* Webhooks.
* Reseñas.
* Favoritos.
* Banners.
* Carga de imágenes.

### URL base

#### Producción

```text
https://api.tecno3d.net/api
```

#### Desarrollo

En desarrollo, la API utiliza la configuración local definida para el proyecto.

La aplicación Node.js escucha internamente en:

```text
127.0.0.1:5000
```

En producción, las solicitudes externas son recibidas mediante **Nginx** y posteriormente enviadas al backend.

---

# 2. Autenticación y autorización

Las rutas protegidas utilizan autenticación mediante **JWT**.

El token debe enviarse mediante el header:

```http
Authorization: Bearer TOKEN
```

El middleware de autenticación valida el token antes de permitir el acceso al recurso.

La API utiliza control de acceso basado en roles.

Los roles disponibles son:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

Los endpoints administrativos utilizan middleware de autorización para limitar el acceso según el rol correspondiente.

---

# 3. Autenticación

Base:

```text
/api/auth
```

### Registro

```http
POST /api/auth/register
```

Permite registrar un nuevo usuario.

### Inicio de sesión

```http
POST /api/auth/login
```

Permite autenticar un usuario y obtener sus credenciales de acceso.

### Usuario autenticado

```http
GET /api/auth/me
```

Permite obtener la información del usuario autenticado.

### Cambio de contraseña

```http
PATCH /api/auth/change-password
```

Permite cambiar la contraseña del usuario autenticado.

---

# 4. Productos

Base:

```text
/api/products
```

### Obtener productos

```http
GET /api/products
```

Permite consultar el catálogo.

Parámetros disponibles:

```text
page
limit
search
categoryId
brandId
offerActive
sort
```

Ejemplo:

```http
GET /api/products?search=notebook&sort=price_asc
```

### Obtener producto

```http
GET /api/products/:id
```

Obtiene la información completa de un producto.

### Crear producto

```http
POST /api/products
```

Permite crear un nuevo producto.

Requiere los permisos correspondientes.

### Actualizar producto

```http
PUT /api/products/:id
```

Actualiza la información de un producto.

### Eliminar producto

```http
DELETE /api/products/:id
```

Elimina un producto según las reglas de negocio y permisos establecidos.

---

# 5. Categorías

Base:

```text
/api/categories
```

Permite gestionar las categorías de productos.

Operaciones principales:

```http
GET /api/categories
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id
```

Las operaciones de modificación requieren autorización administrativa.

---

# 6. Marcas

Base:

```text
/api/brands
```

Operaciones principales:

```http
GET /api/brands
POST /api/brands
PUT /api/brands/:id
DELETE /api/brands/:id
```

Las marcas permiten asociar productos con fabricantes o marcas comerciales.

---

# 7. Usuarios

Base:

```text
/api/users
```

Permite administrar los usuarios de la plataforma.

### Obtener usuarios

```http
GET /api/users
```

Permite obtener usuarios utilizando paginación y filtros.

Parámetros:

```text
page
limit
search
role
```

### Crear usuario

```http
POST /api/users
```

Permite crear usuarios desde el área administrativa.

### Actualizar rol

```http
PATCH /api/users/:id/role
```

Permite modificar el rol de un usuario autorizado.

Roles disponibles:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

---

# 8. Direcciones

Base:

```text
/api/addresses
```

Permite administrar las direcciones asociadas a los usuarios.

Operaciones disponibles:

```http
GET /api/addresses
POST /api/addresses
PUT /api/addresses/:id
DELETE /api/addresses/:id
```

Las direcciones están asociadas al usuario autenticado.

---

# 9. Carrito

Base:

```text
/api/cart
```

El carrito pertenece a un usuario autenticado.

Permite:

* Consultar el carrito.
* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Vaciar el carrito.

Las rutas se encuentran definidas en:

```text
src/routes/cart.routes.js
```

---

# 10. Pedidos

Base:

```text
/api/orders
```

### Crear pedido

```http
POST /api/orders
```

Permite crear un nuevo pedido.

El backend valida, entre otros aspectos:

* Productos.
* Cantidades.
* Stock.
* Usuario.
* Método de entrega.
* Dirección de envío.

### Obtener mis pedidos

```http
GET /api/orders/my-orders
```

Permite obtener los pedidos correspondientes al usuario autenticado.

### Obtener todos los pedidos

```http
GET /api/orders
```

Disponible para:

```text
ADMIN
EMPLOYEE
```

### Obtener pedido

```http
GET /api/orders/:id
```

Permite consultar un pedido específico.

Los clientes solamente pueden consultar sus propios pedidos.

### Actualizar estado

```http
PATCH /api/orders/:id/status
```

Disponible para:

```text
ADMIN
EMPLOYEE
```

Permite cambiar el estado del pedido respetando las transiciones definidas por la lógica de negocio.

Estados disponibles:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

---

# 11. Pagos

Base:

```text
/api/payments
```

### Obtener pago de un pedido

```http
GET /api/payments/order/:orderId
```

Obtiene el pago asociado a un pedido.

### Crear pago

```http
POST /api/payments
```

Crea un registro de pago.

### Actualizar pago

```http
PATCH /api/payments/:id
```

Actualiza la información de un pago.

Estados:

```text
PENDING
PAID
FAILED
REFUNDED
```

Métodos:

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

---

# 12. Checkout

Base:

```text
/api/checkout
```

El módulo de checkout centraliza las operaciones relacionadas con la finalización de una compra.

Permite preparar el proceso de creación del pedido y pago.

---

# 13. Mercado Pago

Base:

```text
/api/mercadopago
```

Este módulo integra TECNO 3D con Mercado Pago.

Se utiliza para las operaciones necesarias para procesar pagos mediante Mercado Pago.

El flujo general es:

```text
Frontend
   │
   ▼
Checkout
   │
   ▼
Backend
   │
   ▼
Mercado Pago
   │
   ▼
Pago
```

La aplicación utiliza el resultado del proceso de pago para mantener actualizado el estado correspondiente del pedido.

---

# 14. Webhooks de Mercado Pago

Base:

```text
/api/webhook
```

Los Webhooks permiten recibir notificaciones externas relacionadas con eventos de Mercado Pago.

Principalmente se utilizan para procesar eventos relacionados con pagos.

El flujo es:

```text
Mercado Pago
      │
      ▼
Webhook
      │
      ▼
Backend TECNO 3D
      │
      ▼
Validación del evento
      │
      ▼
Actualización del pago
      │
      ▼
Actualización del pedido
```

Los eventos recibidos se validan antes de actualizar información relacionada con los pagos.

La integración utiliza validación de firma para proteger el endpoint frente a solicitudes no autorizadas.

---

# 15. Reseñas

Base:

```text
/api/reviews
```

Permite administrar las reseñas realizadas sobre productos.

### Obtener reseñas de un producto

```http
GET /api/reviews/product/:productId
```

Permite consultar las reseñas correspondientes a un producto.

Las reseñas contienen información relacionada con:

```text
rating
comment
userId
productId
createdAt
updatedAt
```

Un usuario no puede registrar más de una reseña para el mismo producto.

---

# 16. Favoritos

Base:

```text
/api/favorites
```

Permite administrar los productos favoritos de los usuarios.

Las operaciones permiten:

* Consultar favoritos.
* Agregar productos a favoritos.
* Eliminar productos de favoritos.

Las operaciones están asociadas al usuario autenticado.

---

# 17. Banners

Base:

```text
/api/banners
```

Permite administrar los banners utilizados en la plataforma.

Los banners pueden contener información como:

```text
title
description
buttonText
link
image
publicId
active
```

Los usuarios administrativos pueden gestionar los banners utilizados por el frontend.

---

# 18. Upload

Base:

```text
/api/upload
```

Permite cargar imágenes utilizadas por la aplicación.

El sistema utiliza el servicio de almacenamiento configurado para el proyecto.

Las imágenes pueden utilizarse para:

* Productos.
* Usuarios.
* Banners.
* Otros recursos que requieran imágenes.

Las credenciales del servicio de almacenamiento se mantienen fuera del código fuente.

---

# 19. Respuestas de la API

Las respuestas exitosas utilizan generalmente una estructura similar a:

```json
{
  "success": true,
  "data": {}
}
```

Cuando corresponde, también se incluye un mensaje:

```json
{
  "success": true,
  "message": "Operación realizada correctamente.",
  "data": {}
}
```

La estructura exacta puede variar según el endpoint y la operación realizada.

---

# 20. Errores

Los errores son procesados mediante el middleware global de errores.

Una respuesta de error puede utilizar una estructura similar a:

```json
{
  "success": false,
  "message": "Descripción del error."
}
```

Códigos HTTP utilizados habitualmente:

| Código | Significado                |
| -----: | -------------------------- |
|    200 | Operación exitosa          |
|    201 | Recurso creado             |
|    400 | Solicitud inválida         |
|    401 | No autenticado             |
|    403 | Sin permisos               |
|    404 | Recurso no encontrado      |
|    500 | Error interno del servidor |

Las respuestas públicas no deben exponer información sensible ni detalles internos de la aplicación.

---

# 21. Seguridad

La API utiliza diferentes mecanismos de seguridad.

### Autenticación

* JWT.
* Bearer Token.
* Middleware de autenticación.

### Autorización

* Control de acceso mediante roles.
* Roles `ADMIN`, `EMPLOYEE` y `CUSTOMER`.

### Protección de autenticación

Las rutas de autenticación utilizan rate limiting para reducir intentos abusivos.

### Validación

Los datos recibidos son validados antes de ser procesados.

### Contraseñas

Las contraseñas se almacenan utilizando hashing mediante bcrypt.

### CORS

El acceso CORS se encuentra restringido al frontend autorizado de producción.

### Webhooks

Los Webhooks de Mercado Pago utilizan validación de firma.

### Producción

El backend no se encuentra expuesto directamente a Internet.

Internamente escucha en:

```text
127.0.0.1:5000
```

El tráfico externo es gestionado por Nginx mediante HTTPS.

---

# 22. Arquitectura de la API

La API utiliza separación de responsabilidades:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

### Routes

Definen los endpoints disponibles.

### Controllers

Reciben las solicitudes HTTP y generan las respuestas.

### Services

Contienen la lógica de negocio.

### Repositories

Gestionan el acceso a los datos.

### Prisma

Actúa como ORM para PostgreSQL.

### PostgreSQL

Almacena la información persistente de la aplicación.

En producción, PostgreSQL se encuentra alojado en Amazon RDS.

---

# 23. Estructura de rutas

La API se encuentra organizada mediante:

```text
src/routes/

├── auth.routes.js
├── product.routes.js
├── category.routes.js
├── brand.routes.js
├── order.routes.js
├── address.routes.js
├── user.routes.js
├── upload.routes.js
├── cart.routes.js
├── checkout.routes.js
├── payment.routes.js
├── mercadopago.routes.js
├── webhook.routes.js
├── review.routes.js
├── favorite.routes.js
└── banner.routes.js
```

---

# 24. Integración con el frontend

El frontend consume la API mediante Axios.

El cliente HTTP centralizado permite configurar:

* URL base.
* Headers.
* Token de autenticación.
* Manejo de respuestas.
* Manejo de errores.

Los servicios del frontend encapsulan las llamadas a los endpoints correspondientes.

La separación permite mantener la lógica de comunicación con la API fuera de los componentes visuales.

---

# 25. Base de datos

La API utiliza Prisma como ORM para comunicarse con PostgreSQL.

En producción, la base de datos se encuentra alojada en:

```text
Amazon RDS for PostgreSQL
```

La conexión entre el backend y RDS está restringida mediante la configuración de red de AWS.

Las credenciales de producción no forman parte del repositorio.

---

# 26. Producción

La API de producción se encuentra disponible mediante:

```text
https://api.tecno3d.net/api
```

Arquitectura de acceso:

```text
Internet
   │
   ▼
HTTPS
   │
   ▼
Nginx
   │
   ▼
127.0.0.1:5000
   │
   ▼
Node.js / Express
   │
   ▼
Prisma
   │
   ▼
Amazon RDS PostgreSQL
```

La infraestructura productiva se encuentra alojada en AWS.

La documentación detallada de infraestructura, despliegue, monitoreo y seguridad se encuentra en:

```text
ARQUITECTURA.md
DOCUMENTACION_TECNO3D.md
```

---

# 27. Mantenimiento

Antes de modificar un endpoint existente se debe verificar:

1. Ruta correspondiente.
2. Controller.
3. Service.
4. Repository.
5. Modelo Prisma relacionado.
6. Permisos requeridos.
7. Frontend que consume el endpoint.
8. Funcionalidades que dependen del endpoint.

No se deben modificar contratos existentes sin verificar previamente sus dependencias.

Los cambios deben probarse antes de ser desplegados en producción.

---

# 28. Documentación relacionada

La documentación del proyecto se encuentra organizada en:

```text
docs/

├── Api.md
├── ARQUITECTURA.md
├── BASE_DE_DATOS.md
├── DOCUMENTACION_TECNO3D.md
└── MANUAL_USUARIO.md
```

Cada documento describe una parte específica del sistema.

### Api.md

Documentación de los endpoints y comportamiento de la API.

### ARQUITECTURA.md

Arquitectura técnica de la aplicación e infraestructura.

### BASE_DE_DATOS.md

Modelo de datos, relaciones y persistencia.

### DOCUMENTACION_TECNO3D.md

Documentación general y técnica del proyecto.

### MANUAL_USUARIO.md

Guía de utilización de la plataforma.

---

# 29. Resumen

La API de TECNO 3D proporciona los servicios necesarios para operar una plataforma de comercio electrónico completa.

Su arquitectura permite separar:

* Presentación.
* Comunicación HTTP.
* Lógica de negocio.
* Persistencia.
* Base de datos.

La API se encuentra integrada con el frontend, Mercado Pago y Amazon RDS, y utiliza mecanismos de autenticación, autorización, validación y protección de infraestructura para operar en producción.

La arquitectura establecida permite continuar incorporando funcionalidades manteniendo una separación clara de responsabilidades y facilitando el mantenimiento del sistema.
