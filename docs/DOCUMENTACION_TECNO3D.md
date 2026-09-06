# TECNO 3D

## Documentación General del Proyecto

---

## 1. Información del proyecto

**Nombre:** TECNO 3D

**Tipo:** Plataforma e-commerce

**Versión:** 1.0

**Estado:** Producción

**Arquitectura:** Cliente-Servidor

**Frontend:** React + Vite

**Backend:** Node.js + Express

**ORM:** Prisma ORM

**Base de datos:** PostgreSQL

**Infraestructura:** Amazon Web Services (AWS)

TECNO 3D es una plataforma de comercio electrónico orientada a la comercialización de productos tecnológicos, impresión 3D, filamentos, resinas, accesorios, repuestos y productos relacionados.

El sistema integra frontend, backend, base de datos, autenticación, gestión de productos, carrito, pedidos, pagos, promociones, usuarios y herramientas administrativas.

La plataforma se encuentra desplegada en un entorno de producción y cuenta con mecanismos de seguridad, monitoreo y despliegue automatizado.

---

# 2. Objetivos del sistema

Los principales objetivos de TECNO 3D son:

* Permitir a los clientes consultar el catálogo de productos.
* Permitir búsquedas y filtros de productos.
* Gestionar categorías y marcas.
* Permitir registro e inicio de sesión de usuarios.
* Gestionar diferentes roles de usuario.
* Permitir agregar productos al carrito.
* Gestionar favoritos.
* Gestionar direcciones de los clientes.
* Permitir realizar pedidos.
* Permitir seleccionar métodos de entrega.
* Gestionar pagos.
* Integrar Mercado Pago.
* Gestionar estados de pedidos.
* Gestionar stock.
* Permitir publicar reseñas.
* Gestionar banners promocionales.
* Gestionar cupones y descuentos.
* Proporcionar un panel administrativo.
* Proporcionar métricas del negocio.
* Mantener una arquitectura organizada y mantenible.
* Disponer de un sistema preparado para futuras ampliaciones.

---

# 3. Arquitectura general

TECNO 3D utiliza una arquitectura cliente-servidor con separación entre frontend, backend, persistencia y servicios externos.

```text
                         INTERNET
                            │
                            ▼
                     HTTPS / Dominio
                            │
                            ▼
                          Nginx
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
        Frontend                       Backend API
     React + Vite                    Node.js + Express
                                           │
                                           ▼
                                         PM2
                                           │
                                           ▼
                                        Prisma
                                           │
                                           ▼
                                  PostgreSQL / RDS
```

Servicios externos:

```text
TECNO 3D
   │
   ├── Mercado Pago
   │
   └── Cloudinary
```

Esta separación permite mantener independientes la interfaz, la lógica de negocio y la persistencia de datos.

---

# 4. Tecnologías utilizadas

## 4.1 Frontend

El frontend utiliza:

* React.
* Vite.
* Tailwind CSS.
* Axios.
* React Router.
* React Query.
* React Hook Form.
* Zod.
* Lucide React.
* Framer Motion.
* Sonner.

### Responsabilidades

El frontend se encarga principalmente de:

* Interfaz gráfica.
* Navegación.
* Formularios.
* Validaciones del lado del cliente.
* Consumo de la API.
* Gestión de sesión.
* Catálogo.
* Carrito.
* Checkout.
* Favoritos.
* Pedidos.
* Panel administrativo.

---

# 5. Backend

El backend utiliza:

* Node.js.
* Express.
* Prisma ORM.
* PostgreSQL.
* JWT.
* Zod.
* bcrypt.
* Helmet.
* CORS.

### Responsabilidades

El backend administra:

* Autenticación.
* Autorización.
* Usuarios.
* Roles.
* Productos.
* Categorías.
* Marcas.
* Carrito.
* Pedidos.
* Pagos.
* Checkout.
* Cupones.
* Favoritos.
* Reseñas.
* Banners.
* Imágenes.
* Dashboard.
* Comunicación con servicios externos.

La lógica de negocio se mantiene principalmente en el backend para evitar depender de validaciones realizadas únicamente en el frontend.

---

# 6. Base de datos

TECNO 3D utiliza PostgreSQL como sistema gestor de base de datos.

Prisma ORM actúa como capa de acceso y definición del modelo de datos.

Las principales entidades incluyen:

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
Review
Favorite
```

En producción, PostgreSQL se ejecuta mediante **Amazon RDS**.

La base de datos de producción se encuentra aislada de Internet y solamente permite las conexiones autorizadas desde la infraestructura correspondiente.

La documentación detallada del modelo se encuentra en:

```text
docs/BASE_DE_DATOS.md
```

---

# 7. Roles del sistema

TECNO 3D utiliza tres roles principales:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

## ADMIN

Posee el mayor nivel de privilegios administrativos.

Puede realizar las operaciones administrativas permitidas por el sistema, incluyendo:

* Gestión de usuarios.
* Gestión de productos.
* Gestión de categorías.
* Gestión de marcas.
* Gestión de pedidos.
* Gestión de estados.
* Gestión de banners.
* Gestión de stock.
* Gestión de promociones.
* Visualización del dashboard.
* Administración general.

## EMPLOYEE

Posee permisos operativos definidos por el sistema.

Puede acceder a funcionalidades relacionadas con:

* Pedidos.
* Estados de pedidos.
* Operaciones administrativas autorizadas.
* Información necesaria para la operación comercial.

## CUSTOMER

Representa al cliente final.

Puede:

* Registrarse.
* Iniciar sesión.
* Consultar productos.
* Buscar y filtrar productos.
* Administrar el carrito.
* Realizar compras.
* Administrar direcciones.
* Consultar sus pedidos.
* Consultar información de pagos.
* Gestionar favoritos.
* Publicar reseñas.

---

# 8. Autenticación y seguridad

La autenticación utiliza JSON Web Tokens (JWT).

Flujo general:

```text
Usuario
   │
   ▼
Login
   │
   ▼
Backend
   │
   ├── Validación de credenciales
   ├── Verificación de contraseña
   └── Generación de JWT
   │
   ▼
Frontend
   │
   ▼
Token
   │
   ▼
Requests autenticadas
```

Las contraseñas se almacenan utilizando hashing mediante bcrypt.

El backend utiliza middleware para:

* Verificar autenticación.
* Validar tokens.
* Identificar al usuario.
* Controlar roles.
* Proteger endpoints.
* Aplicar restricciones de acceso.

La API también utiliza mecanismos de protección como:

* Helmet.
* CORS.
* Rate limiting en rutas sensibles.
* Validación de datos.
* Control de acceso.
* Manejo centralizado de errores.
* HTTPS.

---

# 9. Gestión de productos

El sistema permite administrar productos mediante operaciones CRUD.

Los productos pueden contener:

* Nombre.
* Slug.
* Descripción.
* Precio.
* Precio de oferta.
* Porcentaje de descuento.
* Estado.
* Stock.
* Categoría.
* Marca.
* Imagen principal.
* Galería de imágenes.
* Propietario.
* Fecha de creación.
* Fecha de actualización.

Los productos pueden consultarse mediante:

* Búsqueda.
* Categoría.
* Marca.
* Oferta.
* Ordenamiento por precio.
* Ordenamiento por fecha.
* Paginación.

---

# 10. Búsqueda y catálogo

El catálogo incorpora herramientas de búsqueda, filtrado y ordenamiento.

El sistema contempla términos equivalentes para mejorar la experiencia del usuario.

Ejemplos:

```text
mouse → mouse / mouses

notebook → notebook / laptop

impresora → impresora / impresora 3d

filamento → filamento / filamentos

resina → resina / resinas
```

Esto permite obtener resultados más relevantes ante diferentes formas de realizar una búsqueda.

---

# 11. Carrito de compras

Cada cliente dispone de un carrito asociado a su cuenta.

El carrito permite:

* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Consultar productos.
* Preparar la compra.
* Validar disponibilidad.

Los productos del carrito se gestionan mediante `CartItem`.

El sistema evita duplicaciones del mismo producto dentro del carrito mediante las restricciones correspondientes del modelo de datos.

---

# 12. Checkout

El checkout permite convertir el carrito del cliente en un pedido.

El proceso contempla:

```text
Carrito
   │
   ▼
Checkout
   │
   ▼
Validaciones
   │
   ▼
Pedido
   │
   ▼
Pago
```

Durante el proceso se validan:

* Productos.
* Cantidades.
* Stock.
* Método de entrega.
* Dirección cuando corresponde.
* Propiedad de la dirección.
* Descuentos aplicables.
* Total del pedido.

---

# 13. Métodos de entrega

TECNO 3D utiliza:

```text
SHIPPING
PICKUP
```

## SHIPPING

Requiere una dirección válida del cliente.

Los pedidos enviados pueden almacenar:

* Empresa de envío.
* Número de seguimiento.

## PICKUP

Permite retirar el pedido en el local.

No requiere una dirección de envío.

---

# 14. Pedidos

Los pedidos poseen un ciclo de vida controlado.

Estados disponibles:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

Flujo principal:

```text
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
```

Las transiciones de estado son controladas por reglas de negocio.

Esto evita modificaciones arbitrarias del estado de un pedido.

---

# 15. Pagos

Los pedidos poseen un registro asociado de pago.

Estados disponibles:

```text
PENDING
PAID
FAILED
REFUNDED
```

Métodos contemplados por el modelo:

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

La información de los pagos incluye los datos necesarios para relacionar la operación con el pedido correspondiente.

---

# 16. Mercado Pago

TECNO 3D integra Mercado Pago como plataforma de procesamiento de pagos.

El flujo general es:

```text
Cliente
   │
   ▼
Checkout
   │
   ▼
Creación del pedido
   │
   ▼
Mercado Pago
   │
   ▼
Pago
   │
   ▼
Webhook
   │
   ▼
Backend
   │
   ▼
Actualización del pago
   │
   ▼
Actualización del pedido
```

La integración fue probada utilizando el entorno de producción.

Las credenciales y secretos de Mercado Pago no forman parte del código fuente ni de la documentación pública.

---

# 17. Webhooks

TECNO 3D utiliza webhooks para recibir notificaciones de Mercado Pago.

El backend procesa las notificaciones correspondientes y valida la información recibida antes de actualizar datos internos.

Los webhooks permiten mantener sincronizado el estado del pago con el estado del pedido.

La validación de firma forma parte de las medidas de protección del flujo de notificaciones.

---

# 18. Cupones y descuentos

El sistema incorpora un mecanismo de promociones mediante cupones y descuentos.

Los descuentos pueden aplicarse durante el proceso de compra cuando cumplen las condiciones configuradas.

El total final del pedido se calcula en el backend considerando los descuentos correspondientes.

La información utilizada para el pago se genera a partir del total calculado por el sistema.

---

# 19. Favoritos

Los usuarios autenticados pueden guardar productos como favoritos.

La funcionalidad permite:

* Agregar favoritos.
* Consultar favoritos.
* Eliminar favoritos.

La relación entre usuario y producto utiliza restricciones que evitan duplicaciones.

---

# 20. Reseñas

Los clientes pueden publicar reseñas sobre productos.

Una reseña puede contener:

* Usuario.
* Producto.
* Calificación.
* Comentario.
* Fecha de creación.
* Fecha de actualización.

El sistema evita múltiples reseñas del mismo usuario sobre un mismo producto mediante la restricción correspondiente.

---

# 21. Banners

El sistema permite administrar banners promocionales.

Los banners pueden contener:

* Título.
* Descripción.
* Texto del botón.
* Enlace.
* Imagen.
* Identificador de Cloudinary.
* Estado activo/inactivo.
* Fecha de creación.
* Fecha de actualización.

Los banners permiten gestionar contenido promocional desde el área administrativa.

---

# 22. Gestión de imágenes

Las imágenes se gestionan mediante Cloudinary.

Se utiliza para recursos como:

* Imágenes de productos.
* Galerías de productos.
* Banners.
* Otros recursos multimedia de la plataforma.

El sistema almacena las referencias necesarias para utilizar las imágenes posteriormente.

Los archivos no se almacenan directamente dentro del servidor de aplicación.

---

# 23. Dashboard administrativo

TECNO 3D dispone de un dashboard administrativo.

El dashboard permite consultar información real del negocio, incluyendo:

* Ventas totales.
* Pedidos totales.
* Clientes.
* Productos.
* Ventas por período.
* Ventas por categoría.
* Productos más vendidos.
* Pedidos recientes.
* Estado de pagos.
* Productos con bajo stock.

La información se obtiene desde los datos persistidos en PostgreSQL mediante Prisma.

---

# 24. API REST

El backend expone una API REST organizada por módulos.

Principales recursos:

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

La documentación específica de la API se encuentra en:

```text
docs/API.md
```

---

# 25. Arquitectura interna

El backend utiliza separación de responsabilidades:

```text
Route
   ↓
Middleware
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

### Middlewares

Gestionan autenticación, autorización, seguridad y validaciones transversales.

### Controllers

Gestionan solicitudes y respuestas HTTP.

### Services

Contienen la lógica y reglas de negocio.

### Repositories

Gestionan el acceso a los datos.

### Prisma

Actúa como ORM.

### PostgreSQL

Mantiene la información persistente.

---

# 26. Infraestructura de producción

TECNO 3D se encuentra desplegado sobre AWS.

La infraestructura principal está compuesta por:

```text
Internet
   │
   ▼
Route 53
   │
   ▼
Dominio
   │
   ▼
HTTPS
   │
   ▼
Nginx
   │
   ▼
EC2
   │
   ├── Frontend
   ├── Node.js
   └── PM2
          │
          ▼
       Prisma
          │
          ▼
       RDS PostgreSQL
```

Servicios externos:

```text
EC2
 │
 ├── Mercado Pago
 │
 └── Cloudinary
```

---

# 27. EC2

La aplicación backend se ejecuta sobre una instancia Amazon EC2.

La instancia ejecuta:

* Node.js.
* PM2.
* Nginx.
* Frontend compilado.
* Herramientas necesarias para la aplicación.

El backend escucha internamente en:

```text
127.0.0.1:5000
```

El puerto de la aplicación no se expone directamente a Internet.

Nginx funciona como reverse proxy para las solicitudes dirigidas a la API.

---

# 28. Amazon RDS

La base de datos de producción utiliza Amazon RDS PostgreSQL.

RDS proporciona:

* Persistencia administrada.
* Almacenamiento cifrado.
* Control de acceso mediante Security Groups.
* Capacidad de ampliación de almacenamiento.
* Métricas de CloudWatch.

La base de datos no se encuentra expuesta públicamente.

El acceso está restringido a la infraestructura autorizada.

---

# 29. HTTPS y dominio

La plataforma utiliza HTTPS para las comunicaciones públicas.

El tráfico HTTP es redirigido a HTTPS.

Los servicios públicos principales son:

```text
https://tecno3d.net
https://www.tecno3d.net
https://api.tecno3d.net
```

El certificado TLS permite proteger la comunicación entre los usuarios y la infraestructura.

---

# 30. Despliegue automatizado

TECNO 3D utiliza GitHub Actions para automatizar los despliegues.

El flujo general es:

```text
Desarrollador
      │
      ▼
Git Push
      │
      ▼
GitHub
      │
      ▼
GitHub Actions
      │
      ▼
AWS IAM / OIDC
      │
      ▼
AWS SSM
      │
      ▼
EC2
```

Durante el despliegue se realizan operaciones como:

* Actualización del código.
* Instalación de dependencias.
* Prisma Generate.
* Prisma Migrate.
* Reinicio del backend.
* Build del frontend.
* Publicación del frontend.
* Reload de Nginx.

El proceso utiliza autenticación federada mediante OIDC para acceder a AWS.

---

# 31. Monitoreo y observabilidad

La infraestructura utiliza Amazon CloudWatch para monitorear los principales recursos de producción.

Se supervisan métricas relacionadas con:

* CPU de EC2.
* Estado de EC2.
* CPU de RDS.
* Almacenamiento disponible de RDS.
* Conexiones de RDS.
* Capacidad de infraestructura.

También existen alarmas configuradas para detectar situaciones anómalas.

Las notificaciones de las alarmas se gestionan mediante Amazon SNS.

---

# 32. Gestión de logs

El backend se ejecuta mediante PM2.

PM2 permite:

* Mantener el proceso activo.
* Reiniciar la aplicación cuando corresponde.
* Consultar logs.
* Supervisar el estado del proceso.

Los logs de la aplicación se gestionan mediante rotación para evitar un crecimiento indefinido de los archivos.

---

# 33. Seguridad de producción

La infraestructura y aplicación incorporan diferentes medidas de seguridad.

Entre ellas:

* HTTPS.
* Security Groups de AWS.
* Backend no expuesto directamente a Internet.
* RDS sin acceso público.
* SSH restringido.
* Autenticación mediante claves.
* Deshabilitación de autenticación SSH por contraseña.
* JWT.
* bcrypt.
* Helmet.
* CORS restringido.
* Rate limiting.
* Validación de datos.
* Autorización por roles.
* Validación de propiedad de recursos.
* Validación de webhooks.
* Gestión externa de credenciales sensibles.

Los secretos de producción no se almacenan en el repositorio público.

---

# 34. Mantenimiento y operación

El proyecto mantiene una estructura orientada a facilitar el mantenimiento.

Antes de realizar modificaciones importantes se deben analizar:

1. Arquitectura existente.
2. Dependencias.
3. Backend.
4. Frontend.
5. Base de datos.
6. Integraciones externas.
7. Seguridad.
8. Despliegue.
9. Funcionalidades existentes.

Los cambios deben realizarse de forma controlada para evitar afectar funcionalidades ya operativas.

---

# 35. Estado actual del proyecto

TECNO 3D cuenta actualmente con las principales funcionalidades de una plataforma e-commerce:

* Autenticación.
* Usuarios.
* Roles.
* Productos.
* Categorías.
* Marcas.
* Imágenes.
* Carrito.
* Checkout.
* Direcciones.
* Pedidos.
* Pagos.
* Mercado Pago.
* Webhooks.
* Cupones.
* Descuentos.
* Favoritos.
* Reseñas.
* Banners.
* Dashboard administrativo.
* Gestión de stock.
* Seguimiento de envíos.

El sistema se encuentra desplegado y operativo en producción.

Las funcionalidades principales fueron integradas y probadas entre frontend, backend, base de datos y servicios externos.

---

# 36. Documentación complementaria

La documentación técnica se divide en varios documentos:

```text
docs/

├── DOCUMENTACION_TECNO3D.md
├── ARQUITECTURA.md
├── BASE_DE_DATOS.md
├── API.md
└── MANUAL_USUARIO.md
```

### DOCUMENTACION_TECNO3D.md

Documentación general del proyecto.

### ARQUITECTURA.md

Documentación de la arquitectura técnica y organización interna.

### BASE_DE_DATOS.md

Documentación del modelo de datos, entidades, relaciones, enums y restricciones.

### API.md

Documentación de endpoints, métodos HTTP, autenticación y respuestas.

### MANUAL_USUARIO.md

Documentación destinada a usuarios finales y administradores.

---

# 37. Objetivo del proyecto

TECNO 3D tiene como objetivo funcionar como una plataforma de comercio electrónico profesional y como un proyecto de portfolio técnico.

El sistema combina:

* Desarrollo frontend.
* Desarrollo backend.
* Diseño de base de datos.
* Autenticación.
* Autorización.
* Integración de pagos.
* Gestión de archivos.
* Infraestructura cloud.
* Despliegue automatizado.
* Monitoreo.
* Seguridad.

La arquitectura permite continuar incorporando funcionalidades sin modificar innecesariamente los componentes existentes.

---

# 38. Stack tecnológico final

```text
FRONTEND
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

BACKEND
Node.js
Express
Prisma ORM
JWT
Zod
bcrypt
Helmet
CORS

DATABASE
PostgreSQL
Amazon RDS

INFRASTRUCTURE
Amazon EC2
Amazon RDS
Amazon Route 53
Nginx
PM2
HTTPS

CI/CD
GitHub
GitHub Actions
AWS IAM OIDC
AWS SSM

MONITORING
Amazon CloudWatch
Amazon SNS

EXTERNAL SERVICES
Mercado Pago
Cloudinary
```

---

# 39. Conclusión

TECNO 3D es una plataforma e-commerce full-stack desarrollada con tecnologías modernas y una arquitectura organizada por responsabilidades.

El sistema integra frontend, backend, base de datos, autenticación, autorización, catálogo, carrito, checkout, pedidos, pagos, promociones, favoritos, reseñas, banners y herramientas administrativas.

La plataforma se encuentra desplegada en producción utilizando infraestructura AWS, con PostgreSQL mediante Amazon RDS, backend ejecutado sobre EC2, Nginx como reverse proxy, HTTPS, despliegue automatizado mediante GitHub Actions y monitoreo mediante CloudWatch.

La arquitectura y las herramientas utilizadas permiten mantener el sistema, detectar problemas operativos y continuar evolucionándolo hacia nuevas funcionalidades y etapas de crecimiento.
