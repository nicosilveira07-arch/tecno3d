# TECNO 3D

## Documentación de Base de Datos

**Proyecto:** TECNO 3D
**Tipo:** E-commerce profesional
**Motor de base de datos:** PostgreSQL
**ORM:** Prisma
**Esquema:** `prisma/schema.prisma`

---

# 1. Introducción

TECNO 3D utiliza **PostgreSQL** como sistema gestor de base de datos y **Prisma ORM** como capa de acceso y definición del modelo de datos.

La estructura de la base de datos está diseñada para soportar las principales operaciones de la plataforma:

* Usuarios y roles.
* Productos.
* Categorías.
* Marcas.
* Imágenes.
* Carrito de compras.
* Pedidos.
* Pagos.
* Cupones.
* Direcciones.
* Reseñas.
* Favoritos.
* Banners.
* Configuración general de la tienda.

La definición de entidades, relaciones, restricciones y valores predeterminados se encuentra centralizada en:

```text
backend/prisma/schema.prisma
```

---

# 2. Tecnología de persistencia

## PostgreSQL

PostgreSQL es el sistema gestor de base de datos utilizado por TECNO 3D.

En producción, la base de datos se encuentra alojada en **Amazon RDS for PostgreSQL**.

## Prisma ORM

Prisma se utiliza para:

* Definir el modelo de datos.
* Gestionar relaciones entre entidades.
* Generar el cliente de acceso a datos.
* Ejecutar consultas desde el backend.
* Gestionar migraciones.
* Mantener sincronizado el modelo de aplicación con la base de datos.

La conexión utiliza una variable de entorno:

```text
DATABASE_URL
```

El valor de esta variable no forma parte del repositorio.

---

# 3. Estructura general

El esquema actual contiene:

```text
17 modelos
6 enums
```

### Modelos

```text
User
Banner
Cart
CartItem
Address
Category
Brand
Product
ProductImage
Order
OrderItem
Payment
Coupon
Review
Favorite
StoreSettings
```

### Enums

```text
Role
ProductStatus
OrderStatus
PaymentStatus
PaymentMethod
DeliveryMethod
CouponType
```

> Nota: el esquema contiene **7 enums**, correspondientes a los tipos enumerados definidos en `schema.prisma`.

---

# 4. Enumeraciones

## 4.1 Role

Define los roles disponibles para los usuarios.

```text
ADMIN
EMPLOYEE
CUSTOMER
```

### ADMIN

Usuario con permisos administrativos.

### EMPLOYEE

Usuario destinado a tareas operativas según los permisos implementados por la aplicación.

### CUSTOMER

Usuario final de la plataforma.

---

## 4.2 ProductStatus

Define el estado de disponibilidad lógica de un producto.

```text
ACTIVE
INACTIVE
```

El valor predeterminado es:

```text
ACTIVE
```

---

## 4.3 OrderStatus

Define los estados posibles de un pedido.

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

El valor predeterminado es:

```text
PENDING
```

Flujo principal:

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED
```

También puede producirse una cancelación cuando corresponde según las reglas de negocio.

---

## 4.4 PaymentStatus

Define el estado del pago asociado a un pedido.

```text
PENDING
PAID
FAILED
REFUNDED
```

El valor predeterminado es:

```text
PENDING
```

---

## 4.5 PaymentMethod

Define los métodos de pago contemplados por el sistema.

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

---

## 4.6 DeliveryMethod

Define los métodos de entrega.

```text
SHIPPING
PICKUP
```

El valor predeterminado es:

```text
SHIPPING
```

### SHIPPING

Entrega mediante envío.

### PICKUP

Retiro del pedido en el local.

---

## 4.7 CouponType

Define el tipo de descuento de un cupón.

```text
PERCENTAGE
FIXED
```

### PERCENTAGE

El valor representa un porcentaje de descuento.

### FIXED

El valor representa un importe fijo de descuento.

---

# 5. Modelo User

Representa a los usuarios de la plataforma.

```text
User
```

## Campos

| Campo         | Tipo     | Obligatorio | Default / Restricción |
| ------------- | -------- | ----------: | --------------------- |
| `id`          | String   |          Sí | `cuid()` / PK         |
| `firstName`   | String   |          Sí | —                     |
| `lastName`    | String   |          Sí | —                     |
| `email`       | String   |          Sí | `@unique`             |
| `password`    | String   |          Sí | —                     |
| `phone`       | String   |          No | —                     |
| `avatar`      | String   |          No | —                     |
| `role`        | Role     |          Sí | `CUSTOMER`            |
| `createdAt`   | DateTime |          Sí | `now()`               |
| `updatedAt`   | DateTime |          Sí | `@updatedAt`          |
| `createdById` | String   |          No | —                     |

## Relaciones

Un usuario puede tener:

* Muchos productos.
* Muchos pedidos.
* Muchas direcciones.
* Un carrito como máximo.
* Muchas reseñas.
* Muchos favoritos.
* Muchos usuarios creados mediante la relación administrativa `createdBy`.

Relación jerárquica:

```text
User
 ├── createdUsers[]
 └── createdBy?
```

La relación utiliza:

```text
"UserCreatedUsers"
```

Cuando se elimina el usuario creador, `createdById` se establece en `NULL`.

---

# 6. Modelo Banner

Representa los banners promocionales de la plataforma.

```text
Banner
```

## Campos

| Campo         | Tipo     | Obligatorio | Default           |
| ------------- | -------- | ----------: | ----------------- |
| `id`          | String   |          Sí | `cuid()` / PK     |
| `title`       | String   |          Sí | —                 |
| `description` | String   |          No | —                 |
| `buttonText`  | String   |          Sí | `"Comprar ahora"` |
| `link`        | String   |          Sí | —                 |
| `image`       | String   |          Sí | —                 |
| `publicId`    | String   |          No | —                 |
| `active`      | Boolean  |          Sí | `true`            |
| `createdAt`   | DateTime |          Sí | `now()`           |
| `updatedAt`   | DateTime |          Sí | `@updatedAt`      |

El campo `publicId` permite almacenar el identificador asociado al recurso gestionado en Cloudinary.

---

# 7. Modelo Cart

Representa el carrito de compras de un usuario.

```text
Cart
```

## Campos

| Campo       | Tipo     | Obligatorio | Restricción   |
| ----------- | -------- | ----------: | ------------- |
| `id`        | String   |          Sí | `cuid()` / PK |
| `userId`    | String   |          Sí | `@unique`     |
| `createdAt` | DateTime |          Sí | `now()`       |
| `updatedAt` | DateTime |          Sí | `@updatedAt`  |

## Relaciones

```text
Cart
 ├── User
 └── CartItem[]
```

Un usuario puede tener como máximo un carrito.

Un carrito puede contener múltiples elementos `CartItem`.

---

# 8. Modelo CartItem

Representa un producto dentro de un carrito.

```text
CartItem
```

## Campos

| Campo       | Tipo     | Obligatorio | Restricción   |
| ----------- | -------- | ----------: | ------------- |
| `id`        | String   |          Sí | `cuid()` / PK |
| `cartId`    | String   |          Sí | FK            |
| `productId` | String   |          Sí | FK            |
| `quantity`  | Int      |          Sí | —             |
| `createdAt` | DateTime |          Sí | `now()`       |
| `updatedAt` | DateTime |          Sí | `@updatedAt`  |

## Restricción única

```text
@@unique([cartId, productId])
```

Esto impide que un mismo producto aparezca duplicado dentro del mismo carrito.

La cantidad se mantiene en el campo:

```text
quantity
```

---

# 9. Modelo Address

Representa las direcciones pertenecientes a los usuarios.

```text
Address
```

## Campos

| Campo       | Tipo     | Obligatorio | Default       |
| ----------- | -------- | ----------: | ------------- |
| `id`        | String   |          Sí | `cuid()` / PK |
| `userId`    | String   |          Sí | FK            |
| `title`     | String   |          Sí | —             |
| `street`    | String   |          Sí | —             |
| `number`    | String   |          Sí | —             |
| `city`      | String   |          Sí | —             |
| `state`     | String   |          Sí | —             |
| `country`   | String   |          Sí | —             |
| `zipCode`   | String   |          Sí | —             |
| `isDefault` | Boolean  |          Sí | `false`       |
| `createdAt` | DateTime |          Sí | `now()`       |
| `updatedAt` | DateTime |          Sí | `@updatedAt`  |

## Relaciones

```text
User
  │
  └── Address[]
```

Una dirección pertenece a un usuario.

Una dirección también puede estar asociada a múltiples pedidos mediante:

```text
orders Order[]
```

---

# 10. Modelo Category

Representa las categorías de productos.

```text
Category
```

## Campos

| Campo      | Tipo    | Obligatorio | Restricción / Default |
| ---------- | ------- | ----------: | --------------------- |
| `id`       | String  |          Sí | `cuid()` / PK         |
| `name`     | String  |          Sí | —                     |
| `slug`     | String  |          Sí | `@unique`             |
| `image`    | String  |          No | —                     |
| `featured` | Boolean |          Sí | `false`               |

## Relaciones

Una categoría puede contener múltiples productos:

```text
Category
   │
   └── Product[]
```

---

# 11. Modelo Brand

Representa las marcas asociadas al catálogo.

```text
Brand
```

## Campos

| Campo       | Tipo     | Obligatorio | Restricción / Default |
| ----------- | -------- | ----------: | --------------------- |
| `id`        | String   |          Sí | `cuid()` / PK         |
| `name`      | String   |          Sí | `@unique`             |
| `slug`      | String   |          Sí | `@unique`             |
| `image`     | String   |          No | —                     |
| `featured`  | Boolean  |          Sí | `false`               |
| `createdAt` | DateTime |          Sí | `now()`               |
| `updatedAt` | DateTime |          Sí | `@updatedAt`          |

## Relaciones

Una marca puede estar asociada a múltiples productos.

La relación desde `Product` hacia `Brand` es opcional.

---

# 12. Modelo Product

Representa los productos comercializados por TECNO 3D.

```text
Product
```

## Campos

| Campo             | Tipo          | Obligatorio | Restricción / Default |
| ----------------- | ------------- | ----------: | --------------------- |
| `id`              | String        |          Sí | `cuid()` / PK         |
| `name`            | String        |          Sí | —                     |
| `slug`            | String        |          Sí | `@unique`             |
| `description`     | String        |          Sí | —                     |
| `price`           | Float         |          Sí | —                     |
| `offerPrice`      | Float         |          No | —                     |
| `offerPercentage` | Int           |          No | —                     |
| `offerActive`     | Boolean       |          Sí | `false`               |
| `stock`           | Int           |          Sí | —                     |
| `image`           | String        |          No | —                     |
| `status`          | ProductStatus |          Sí | `ACTIVE`              |
| `categoryId`      | String        |          Sí | FK                    |
| `brandId`         | String        |          No | FK                    |
| `ownerId`         | String        |          No | FK                    |
| `createdAt`       | DateTime      |          Sí | `now()`               |
| `updatedAt`       | DateTime      |          Sí | `@updatedAt`          |

## Relaciones

Cada producto pertenece obligatoriamente a una categoría:

```text
Product → Category
```

La marca es opcional:

```text
Product → Brand?
```

El propietario también es opcional:

```text
Product → User?
```

Además, un producto puede tener:

* Muchos elementos de pedido.
* Muchos elementos de carrito.
* Muchas reseñas.
* Muchas imágenes.
* Muchos favoritos.

## Eliminación del propietario

La relación con `User` utiliza:

```text
onDelete: SetNull
```

Por lo tanto, eliminar al propietario no elimina el producto; el campo `ownerId` pasa a `NULL`.

---

# 13. Modelo ProductImage

Representa las imágenes adicionales de un producto.

```text
ProductImage
```

## Campos

| Campo       | Tipo     | Obligatorio | Restricción   |
| ----------- | -------- | ----------: | ------------- |
| `id`        | String   |          Sí | `cuid()` / PK |
| `url`       | String   |          Sí | —             |
| `publicId`  | String   |          Sí | —             |
| `productId` | String   |          Sí | FK            |
| `createdAt` | DateTime |          Sí | `now()`       |

## Relación

```text
Product
   │
   └── ProductImage[]
```

Un producto puede tener múltiples imágenes.

## Eliminación

La relación utiliza:

```text
onDelete: Cascade
```

Si se elimina el producto, sus imágenes asociadas también se eliminan de la base de datos.

---

# 14. Modelo Order

Representa los pedidos realizados en la plataforma.

```text
Order
```

## Campos

| Campo             | Tipo           | Obligatorio | Default       |
| ----------------- | -------------- | ----------: | ------------- |
| `id`              | String         |          Sí | `cuid()` / PK |
| `total`           | Float          |          Sí | —             |
| `discount`        | Float          |          Sí | `0`           |
| `couponId`        | String         |          No | FK            |
| `status`          | OrderStatus    |          Sí | `PENDING`     |
| `deliveryMethod`  | DeliveryMethod |          Sí | `SHIPPING`    |
| `addressId`       | String         |          No | FK            |
| `userId`          | String         |          No | FK            |
| `shippingCompany` | String         |          No | —             |
| `trackingNumber`  | String         |          No | —             |
| `createdAt`       | DateTime       |          Sí | `now()`       |
| `updatedAt`       | DateTime       |          Sí | `@updatedAt`  |

## Relaciones

Un pedido puede estar asociado a:

* Un usuario.
* Una dirección.
* Un cupón.
* Un pago.
* Muchos elementos `OrderItem`.

Las relaciones con usuario y dirección son opcionales.

## Usuario

```text
Order → User?
```

Utiliza:

```text
onDelete: SetNull
```

Si el usuario es eliminado, el pedido permanece almacenado y `userId` pasa a `NULL`.

## Dirección

```text
Order → Address?
```

También utiliza:

```text
onDelete: SetNull
```

Si la dirección es eliminada, el pedido permanece almacenado y `addressId` pasa a `NULL`.

## Cupón

```text
Order → Coupon?
```

También utiliza:

```text
onDelete: SetNull
```

La eliminación del cupón no elimina los pedidos asociados.

---

# 15. Modelo OrderItem

Representa cada producto incluido en un pedido.

```text
OrderItem
```

## Campos

| Campo       | Tipo   | Obligatorio |
| ----------- | ------ | ----------: |
| `id`        | String |          Sí |
| `quantity`  | Int    |          Sí |
| `price`     | Float  |          Sí |
| `orderId`   | String |          Sí |
| `productId` | String |          Sí |

El identificador utiliza:

```text
cuid()
```

como valor predeterminado.

## Relaciones

```text
Order
   │
   └── OrderItem[]

Product
   │
   └── OrderItem[]
```

Cada `OrderItem` pertenece a un pedido y a un producto.

El campo `price` permite almacenar el precio correspondiente al elemento del pedido independientemente del precio actual del producto.

---

# 16. Modelo Payment

Representa el pago asociado a un pedido.

```text
Payment
```

## Campos

| Campo           | Tipo          | Obligatorio | Restricción / Default |
| --------------- | ------------- | ----------: | --------------------- |
| `id`            | String        |          Sí | `cuid()` / PK         |
| `orderId`       | String        |          Sí | `@unique` / FK        |
| `amount`        | Float         |          Sí | —                     |
| `status`        | PaymentStatus |          Sí | `PENDING`             |
| `method`        | PaymentMethod |          Sí | —                     |
| `transactionId` | String        |          No | —                     |
| `createdAt`     | DateTime      |          Sí | `now()`               |
| `updatedAt`     | DateTime      |          Sí | `@updatedAt`          |

## Relación

```text
Order
  │
  └── Payment?
```

La relación es uno a uno debido a:

```text
orderId @unique
```

Esto permite que un pedido tenga como máximo un registro de pago.

---

# 17. Modelo Coupon

Representa los cupones de descuento.

```text
Coupon
```

## Campos

| Campo       | Tipo       | Obligatorio | Restricción / Default |
| ----------- | ---------- | ----------: | --------------------- |
| `id`        | String     |          Sí | `cuid()` / PK         |
| `code`      | String     |          Sí | `@unique`             |
| `type`      | CouponType |          Sí | —                     |
| `value`     | Float      |          Sí | —                     |
| `maxUses`   | Int        |          No | —                     |
| `usedCount` | Int        |          Sí | `0`                   |
| `expiresAt` | DateTime   |          No | —                     |
| `active`    | Boolean    |          Sí | `true`                |
| `createdAt` | DateTime   |          Sí | `now()`               |
| `updatedAt` | DateTime   |          Sí | `@updatedAt`          |

## Relaciones

Un cupón puede estar asociado a múltiples pedidos:

```text
Coupon
   │
   └── Order[]
```

## Control de utilización

El modelo contempla:

```text
maxUses
usedCount
```

Esto permite gestionar límites de utilización.

La fecha de expiración es opcional mediante:

```text
expiresAt
```

El estado activo/inactivo se controla mediante:

```text
active
```

---

# 18. Modelo Review

Representa las reseñas realizadas por usuarios sobre productos.

```text
Review
```

## Campos

| Campo       | Tipo     | Obligatorio |
| ----------- | -------- | ----------: |
| `id`        | String   |          Sí |
| `rating`    | Int      |          Sí |
| `comment`   | String   |          No |
| `userId`    | String   |          Sí |
| `productId` | String   |          Sí |
| `createdAt` | DateTime |          Sí |
| `updatedAt` | DateTime |          Sí |

El identificador utiliza:

```text
cuid()
```

El campo `createdAt` utiliza:

```text
now()
```

El campo `updatedAt` utiliza:

```text
@updatedAt
```

## Restricción única

```text
@@unique([userId, productId])
```

Esta restricción impide que un mismo usuario tenga más de una reseña para el mismo producto.

## Eliminación

Las relaciones con usuario y producto utilizan:

```text
onDelete: Cascade
```

Por lo tanto, la eliminación del usuario o del producto elimina sus reseñas relacionadas.

---

# 19. Modelo Favorite

Representa los productos guardados como favoritos.

```text
Favorite
```

## Campos

| Campo       | Tipo     | Obligatorio |
| ----------- | -------- | ----------: |
| `id`        | String   |          Sí |
| `userId`    | String   |          Sí |
| `productId` | String   |          Sí |
| `createdAt` | DateTime |          Sí |

El identificador utiliza:

```text
cuid()
```

El campo `createdAt` utiliza:

```text
now()
```

## Restricción única

```text
@@unique([userId, productId])
```

Esto evita que un mismo usuario agregue varias veces el mismo producto a favoritos.

## Eliminación

Las relaciones utilizan:

```text
onDelete: Cascade
```

Si se elimina el usuario o el producto, los favoritos asociados se eliminan automáticamente.

---

# 20. Modelo StoreSettings

Representa la configuración general de la tienda.

```text
StoreSettings
```

## Campos

| Campo              | Tipo     | Obligatorio | Default       |
| ------------------ | -------- | ----------: | ------------- |
| `id`               | String   |          Sí | `cuid()` / PK |
| `storeName`        | String   |          Sí | `"TECNO 3D"`  |
| `description`      | String   |          No | —             |
| `logo`             | String   |          No | —             |
| `logoPublicId`     | String   |          No | —             |
| `address`          | String   |          No | —             |
| `city`             | String   |          No | —             |
| `department`       | String   |          No | —             |
| `country`          | String   |          No | —             |
| `phone`            | String   |          No | —             |
| `email`            | String   |          No | —             |
| `whatsappNumber`   | String   |          No | —             |
| `whatsappMessage`  | String   |          No | —             |
| `instagram`        | String   |          No | —             |
| `facebook`         | String   |          No | —             |
| `tiktok`           | String   |          No | —             |
| `youtube`          | String   |          No | —             |
| `openingHours`     | String   |          No | —             |
| `offerEnabled`     | Boolean  |          Sí | `true`        |
| `offerEyebrow`     | String   |          No | —             |
| `offerTitle`       | String   |          No | —             |
| `offerDescription` | String   |          No | —             |
| `offerButtonText`  | String   |          No | —             |
| `offerButtonUrl`   | String   |          No | `"/offers"`   |
| `createdAt`        | DateTime |          Sí | `now()`       |
| `updatedAt`        | DateTime |          Sí | `@updatedAt`  |

## Relaciones

Actualmente `StoreSettings` no posee relaciones declaradas con otros modelos del esquema.

## Configuración de ofertas

El modelo incluye campos específicos para administrar el banner/sección de ofertas:

```text
offerEnabled
offerEyebrow
offerTitle
offerDescription
offerButtonText
offerButtonUrl
```

---

# 21. Relaciones principales

La estructura relacional principal puede representarse de la siguiente manera:

```text
User
 │
 ├── Product[]
 ├── Order[]
 ├── Address[]
 ├── Cart?
 ├── Review[]
 ├── Favorite[]
 └── createdUsers[]

Category
 │
 └── Product[]

Brand
 │
 └── Product[]

Product
 │
 ├── OrderItem[]
 ├── CartItem[]
 ├── Review[]
 ├── ProductImage[]
 └── Favorite[]

Cart
 │
 └── CartItem[]

Order
 │
 ├── OrderItem[]
 ├── Payment?
 ├── Address?
 ├── User?
 └── Coupon?

Coupon
 │
 └── Order[]

StoreSettings
 └── Sin relaciones declaradas
```

---

# 22. Cardinalidades principales

| Relación                  | Cardinalidad |
| ------------------------- | ------------ |
| User → Product            | 1:N          |
| User → Order              | 1:N          |
| User → Address            | 1:N          |
| User → Cart               | 1:0..1       |
| User → Review             | 1:N          |
| User → Favorite           | 1:N          |
| User → User (`createdBy`) | 1:N          |
| Category → Product        | 1:N          |
| Brand → Product           | 1:N          |
| Product → ProductImage    | 1:N          |
| Product → OrderItem       | 1:N          |
| Product → CartItem        | 1:N          |
| Product → Review          | 1:N          |
| Product → Favorite        | 1:N          |
| Cart → CartItem           | 1:N          |
| Order → OrderItem         | 1:N          |
| Order → Payment           | 1:0..1       |
| Order → Address           | 1:0..1       |
| Order → User              | 1:0..1       |
| Order → Coupon            | 1:0..1       |
| Coupon → Order            | 1:N          |

---

# 23. Restricciones de integridad

El esquema utiliza diferentes restricciones para mantener la integridad de los datos.

## Claves primarias

Todos los modelos utilizan:

```text
id String @id @default(cuid())
```

como identificador principal.

## Campos únicos

Los siguientes campos poseen restricciones únicas:

```text
User.email
Cart.userId
Category.slug
Brand.name
Brand.slug
Product.slug
Order.payment.orderId
Coupon.code
```

Además existen restricciones compuestas:

```text
CartItem(cartId, productId)
Review(userId, productId)
Favorite(userId, productId)
```

---

# 24. Comportamiento de eliminación

El esquema utiliza diferentes estrategias de eliminación según la relación.

## SetNull

Se utiliza cuando la entidad relacionada puede desaparecer sin eliminar el registro principal.

### User → Product

```text
ownerId → NULL
```

### User → Order

```text
userId → NULL
```

### Address → Order

```text
addressId → NULL
```

### Coupon → Order

```text
couponId → NULL
```

### User → createdUsers

```text
createdById → NULL
```

---

## Cascade

Se utiliza cuando el registro dependiente debe eliminarse junto con su entidad principal.

### Product → ProductImage

Al eliminar un producto se eliminan sus imágenes relacionadas.

### User → Review

Al eliminar un usuario se eliminan sus reseñas.

### Product → Review

Al eliminar un producto se eliminan sus reseñas.

### User → Favorite

Al eliminar un usuario se eliminan sus favoritos.

### Product → Favorite

Al eliminar un producto se eliminan sus favoritos.

---

# 25. Integridad del carrito

La restricción:

```text
@@unique([cartId, productId])
```

garantiza que un mismo producto no pueda aparecer múltiples veces como registros independientes dentro del mismo carrito.

La cantidad se controla mediante:

```text
quantity
```

Por lo tanto, para aumentar unidades de un mismo producto se modifica la cantidad existente.

---

# 26. Integridad de favoritos

La restricción:

```text
@@unique([userId, productId])
```

garantiza una única relación entre un usuario y un producto.

Esto evita duplicaciones de favoritos.

---

# 27. Integridad de reseñas

Las reseñas también utilizan:

```text
@@unique([userId, productId])
```

Esto garantiza que un usuario solamente pueda tener una reseña asociada a un producto dentro de la base de datos.

---

# 28. Integridad de pagos

El modelo `Payment` utiliza:

```text
orderId String @unique
```

Esto establece una relación uno a uno entre pedido y pago.

Un mismo pedido no puede tener múltiples registros `Payment` asociados mediante `orderId`.

---

# 29. Gestión de descuentos y cupones

Los pedidos almacenan directamente el descuento aplicado:

```text
discount Float @default(0)
```

Además pueden mantener una referencia al cupón utilizado:

```text
couponId String?
```

Los cupones almacenan:

```text
type
value
maxUses
usedCount
expiresAt
active
```

Esto permite representar tanto descuentos porcentuales como descuentos de importe fijo.

---

# 30. Gestión de ofertas de productos

El modelo `Product` dispone de:

```text
price
offerPrice
offerPercentage
offerActive
```

La combinación de estos campos permite representar productos con precio normal y productos que poseen una oferta activa.

El estado de la oferta se controla mediante:

```text
offerActive
```

cuyo valor predeterminado es:

```text
false
```

---

# 31. Gestión de stock

El stock de cada producto se almacena directamente mediante:

```text
stock Int
```

El modelo no utiliza una tabla independiente de movimientos de inventario en el esquema actual.

El control y actualización del stock forman parte de la lógica de negocio implementada por el backend.

---

# 32. Fechas de auditoría

Los principales modelos incluyen:

```text
createdAt
updatedAt
```

Los campos `createdAt` utilizan:

```text
@default(now())
```

Los campos `updatedAt` utilizan:

```text
@updatedAt
```

Esto permite registrar automáticamente la creación y última modificación de los registros.

---

# 33. Identificadores

Los modelos utilizan identificadores de tipo:

```text
String
```

con generación automática mediante:

```text
cuid()
```

Esto evita depender de identificadores numéricos incrementales.

---

# 34. Resumen del modelo

La base de datos actual puede resumirse en los siguientes dominios:

### Usuarios

```text
User
Address
```

### Catálogo

```text
Product
Category
Brand
ProductImage
```

### Compra

```text
Cart
CartItem
Order
OrderItem
```

### Pagos

```text
Payment
```

### Promociones

```text
Coupon
```

### Interacción

```text
Review
Favorite
```

### Contenido

```text
Banner
StoreSettings
```

---

# 35. Arquitectura de persistencia

El acceso a los datos sigue la arquitectura definida en el backend:

```text
HTTP Request
     ↓
Routes
     ↓
Middlewares
     ↓
Controllers
     ↓
Services
     ↓
Repositories
     ↓
Prisma Client
     ↓
PostgreSQL
```

Los repositories son responsables de encapsular las operaciones de persistencia, mientras que los services contienen las reglas de negocio.

Prisma actúa como intermediario entre la aplicación y PostgreSQL.

---

# 36. Producción

En el entorno productivo, PostgreSQL se ejecuta mediante:

```text
AWS RDS for PostgreSQL
```

La aplicación backend desplegada en AWS EC2 se conecta a la instancia RDS mediante la configuración de producción.

La base de datos no se expone directamente a Internet.

El acceso se controla mediante las reglas de red y seguridad configuradas en AWS.

---

# 37. Migraciones

Las modificaciones estructurales de la base de datos se gestionan mediante Prisma Migrate.

El flujo utilizado durante el despliegue es:

```text
Cambio en schema.prisma
        ↓
Prisma Migration
        ↓
Base de datos PostgreSQL
        ↓
Prisma Client
```

En producción se ejecuta el proceso de migración correspondiente como parte del flujo automatizado de despliegue.

---

# 38. Fuente de verdad

La fuente principal para la definición estructural de la base de datos es:

```text
backend/prisma/schema.prisma
```

Este archivo define:

* Modelos.
* Campos.
* Tipos.
* Relaciones.
* Claves primarias.
* Restricciones únicas.
* Valores predeterminados.
* Enumeraciones.
* Comportamientos `onDelete`.

Esta documentación debe mantenerse sincronizada con dicho esquema cuando se produzcan modificaciones estructurales.

---

# 39. Estado actual

La base de datos de TECNO 3D se encuentra implementada sobre PostgreSQL y utiliza Prisma como ORM.

La arquitectura actual permite soportar:

* Gestión de usuarios.
* Control de roles.
* Catálogo.
* Categorías.
* Marcas.
* Imágenes.
* Carrito.
* Pedidos.
* Pagos.
* Cupones.
* Descuentos.
* Envíos.
* Direcciones.
* Reseñas.
* Favoritos.
* Banners.
* Configuración de tienda.
* Persistencia en entorno productivo mediante Amazon RDS.

La estructura está preparada para continuar evolucionando mediante nuevas migraciones controladas sin modificar innecesariamente los componentes existentes.

---

# 40. Conclusión

La base de datos de TECNO 3D utiliza una estructura relacional basada en PostgreSQL y administrada mediante Prisma ORM.

El modelo separa las principales áreas funcionales del e-commerce y utiliza relaciones, restricciones únicas y estrategias de eliminación para mantener la integridad de los datos.

La utilización de Prisma permite mantener una definición centralizada del modelo y facilita las migraciones y operaciones de persistencia desde el backend.

En producción, la base de datos se encuentra desplegada en Amazon RDS, proporcionando una infraestructura administrada y separada del servidor de aplicación.

El esquema actual constituye la fuente de verdad para la estructura de persistencia de TECNO 3D y debe utilizarse como referencia principal para futuras modificaciones de la base de datos.
