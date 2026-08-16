# API — TECNO3D

## 1. Información general

TECNO3D utiliza una API REST desarrollada con Node.js y Express.

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

```text
/api
```

En desarrollo, el backend se ejecuta sobre el servidor configurado para el proyecto.

---

# 2. Autenticación

Las rutas protegidas utilizan autenticación mediante JWT.

El token debe enviarse mediante el header:

```http
Authorization: Bearer TOKEN
```

El middleware de autenticación valida el token antes de permitir el acceso al recurso.

---

# 3. Roles

La API utiliza los siguientes roles:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

Los endpoints administrativos utilizan middleware de autorización para limitar el acceso según el rol.

---

# 4. Autenticación

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

---

# 5. Productos

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

Requiere permisos administrativos según la configuración de las rutas.

### Actualizar producto

```http
PUT /api/products/:id
```

Actualiza la información de un producto.

### Eliminar producto

```http
DELETE /api/products/:id
```

Elimina un producto.

---

# 6. Categorías

Base:

```text
/api/categories
```

Permite administrar las categorías de productos.

Operaciones principales:

```http
GET /api/categories
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id
```

Las operaciones de modificación requieren autorización administrativa.

---

# 7. Marcas

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

# 8. Usuarios

Base:

```text
/api/users
```

Permite administrar usuarios de la plataforma.

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

Los roles disponibles son:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

---

# 9. Direcciones

Base:

```text
/api/addresses
```

Permite administrar las direcciones asociadas a los usuarios.

Operaciones disponibles según la configuración actual:

```http
GET /api/addresses
POST /api/addresses
PUT /api/addresses/:id
DELETE /api/addresses/:id
```

Las direcciones están asociadas al usuario autenticado.

---

# 10. Carrito

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

Las rutas disponibles se encuentran definidas en:

```text
src/routes/cart.routes.js
```

---

# 11. Pedidos

Base:

```text
/api/orders
```

### Crear pedido

```http
POST /api/orders
```

Permite crear un nuevo pedido.

El backend valida:

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
EMPLOYEE
ADMIN
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
EMPLOYEE
ADMIN
```

Permite cambiar el estado del pedido respetando las transiciones definidas por la lógica de negocio.

Estados:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

---

# 12. Pagos

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

# 13. Checkout

Base:

```text
/api/checkout
```

El módulo de checkout centraliza las operaciones relacionadas con la finalización de una compra.

Permite preparar el proceso de creación del pedido y pago.

---

# 14. Mercado Pago

Base:

```text
/api/mercadopago
```

Este módulo integra la plataforma con Mercado Pago.

Se utiliza para gestionar las operaciones necesarias para procesar pagos mediante Mercado Pago.

---

# 15. Webhooks

Base:

```text
/api/webhook
```

Los webhooks permiten recibir notificaciones externas relacionadas con eventos de servicios de terceros.

En particular, se utilizan para procesar eventos relacionados con pagos.

---

# 16. Reseñas

Base:

```text
/api/reviews
```

Permite administrar las reseñas realizadas sobre productos.

También se utiliza el endpoint:

```http
GET /api/reviews/product/:productId
```

para consultar las reseñas correspondientes a un producto.

Las reseñas contienen:

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

# 17. Favoritos

Base:

```text
/api/favorites
```

Permite administrar los productos favoritos de los usuarios.

Las operaciones permiten agregar y eliminar productos de favoritos y consultar los favoritos del usuario autenticado.

---

# 18. Banners

Base:

```text
/api/banners
```

Permite administrar los banners utilizados en la plataforma.

Los banners contienen información como:

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

# 19. Upload

Base:

```text
/api/upload
```

Permite cargar imágenes.

El sistema utiliza el servicio de almacenamiento configurado para el proyecto.

Las imágenes pueden utilizarse para:

* Productos.
* Usuarios.
* Banners.
* Otros recursos que requieran imágenes.

---

# 20. Respuestas de la API

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

---

# 21. Errores

Los errores son procesados mediante el middleware global de errores.

Una respuesta de error puede tener una estructura similar a:

```json
{
  "success": false,
  "message": "Descripción del error."
}
```

Códigos HTTP utilizados habitualmente:

| Código | Significado                |
| ------ | -------------------------- |
| 200    | Operación exitosa          |
| 201    | Recurso creado             |
| 400    | Solicitud inválida         |
| 401    | No autenticado             |
| 403    | Sin permisos               |
| 404    | Recurso no encontrado      |
| 500    | Error interno del servidor |

---

# 22. Seguridad

Las rutas protegidas utilizan autenticación mediante JWT.

El backend también utiliza:

* CORS.
* Helmet.
* Middleware de autenticación.
* Middleware de autorización por roles.
* Validación de datos.
* Hash de contraseñas mediante bcrypt.
* Control de acceso a recursos.

---

# 23. Arquitectura de la API

La API está organizada utilizando separación de responsabilidades.

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

Gestionan el acceso a la base de datos.

### Prisma

Actúa como ORM para PostgreSQL.

### PostgreSQL

Almacena la información persistente de la aplicación.

---

# 24. Estructura de rutas

Actualmente la API se encuentra organizada mediante:

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

# 25. Integración con el frontend

El frontend consume la API mediante Axios.

La configuración del cliente HTTP se encuentra en:

```text
src/api/api.js
```

Los servicios del frontend encapsulan las llamadas a los endpoints correspondientes.

Por ejemplo:

```text
src/services/
```

permite separar la lógica de comunicación con la API de los componentes visuales.

---

# 26. Estado actual

La API constituye la capa de comunicación entre el frontend de TECNO3D y el backend.

La arquitectura permite continuar agregando funcionalidades sin modificar innecesariamente los módulos existentes.

Las nuevas funcionalidades deben respetar la arquitectura establecida:

```text
Route
→ Controller
→ Service
→ Repository
→ Prisma
→ PostgreSQL
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
8. Funcionalidades que dependen de él.

No se deben modificar contratos existentes sin verificar previamente sus dependencias.

---

# 28. Documentación relacionada

Para comprender completamente la plataforma consultar:

```text
docs/
├── DOCUMENTACION_TECNO3D.md
├── ARQUITECTURA.md
├── BASE_DE_DATOS.md
├── API.md
└── MANUAL_USUARIO.md
```

Cada documento describe una parte específica del sistema.

---

# 29. Resumen

La API de TECNO3D proporciona los servicios necesarios para operar una plataforma de comercio electrónico completa.

Su diseño permite separar:

* Presentación.
* Comunicación HTTP.
* Lógica de negocio.
* Persistencia.
* Base de datos.

Esta separación facilita el mantenimiento, las pruebas, la escalabilidad y la incorporación de nuevas funcionalidades.
