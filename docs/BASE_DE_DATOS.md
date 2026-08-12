# TECNO3D

## Documentación General del Proyecto

**Proyecto:** TECNO3D
**Tipo:** E-commerce profesional
**Versión:** 1.0
**Estado:** En desarrollo
**Tecnologías principales:** React, Vite, Tailwind CSS, Node.js, Express, Prisma y PostgreSQL.

---

# 1. Introducción

TECNO3D es una plataforma de comercio electrónico orientada a la comercialización de productos tecnológicos, impresión 3D, filamentos, resinas, accesorios, repuestos y productos relacionados.

El sistema está diseñado con una arquitectura moderna y escalable, separando claramente el frontend, backend, lógica de negocio y persistencia de datos.

El objetivo es disponer de una plataforma profesional que permita administrar productos, usuarios, pedidos, pagos, categorías, marcas, favoritos, reseñas, carrito de compras y demás funcionalidades propias de un e-commerce moderno.

---

# 2. Objetivos del proyecto

## 2.1 Objetivo general

Desarrollar una plataforma de comercio electrónico profesional, segura, escalable y preparada para un entorno de producción.

## 2.2 Objetivos específicos

* Permitir el registro y autenticación de usuarios.
* Administrar diferentes roles de usuario.
* Mostrar un catálogo de productos.
* Permitir búsquedas y filtros.
* Administrar categorías y marcas.
* Gestionar imágenes de productos.
* Implementar carrito de compras.
* Permitir la creación y gestión de pedidos.
* Gestionar diferentes métodos de entrega.
* Integrar métodos de pago.
* Gestionar estados de pedidos.
* Permitir seguimiento de envíos.
* Permitir valoraciones y reseñas.
* Implementar favoritos.
* Administrar direcciones de los clientes.
* Disponer de un panel administrativo.
* Mostrar métricas reales del negocio.
* Controlar stock.
* Mantener una arquitectura preparada para futuras ampliaciones.

---

# 3. Arquitectura general

El proyecto está dividido principalmente en dos aplicaciones:

```text
TECNO3D
│
├── frontend/
│
└── backend/
```

## Frontend

El frontend es responsable de la interfaz gráfica y de la interacción con el usuario.

Tecnologías principales:

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* React Query
* React Hook Form
* Zod
* Lucide React
* Framer Motion
* Sonner

## Backend

El backend contiene la API, reglas de negocio, autenticación, autorización y comunicación con la base de datos.

Tecnologías principales:

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Zod
* bcrypt
* Helmet
* CORS
* Cloudinary

---

# 4. Arquitectura del Backend

El backend utiliza una separación por responsabilidades.

```text
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
    ├── app.js
    └── server.js
```

### Controllers

Reciben las solicitudes HTTP y devuelven las respuestas correspondientes.

### Services

Contienen las reglas y lógica de negocio.

### Repositories

Se encargan del acceso y comunicación con la base de datos mediante Prisma.

### Routes

Definen los endpoints disponibles en la API.

### Validators

Validan los datos recibidos desde el cliente.

### Middlewares

Implementan funcionalidades transversales como:

* Autenticación.
* Autorización.
* Manejo de errores.
* Seguridad.
* Validaciones.

### Prisma

Se utiliza como ORM para interactuar con PostgreSQL.

---

# 5. Roles del sistema

El sistema utiliza tres roles principales:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

## ADMIN

El administrador posee acceso a las funciones administrativas y de gestión general del sistema.

Entre sus responsabilidades se encuentran:

* Administrar usuarios.
* Administrar productos.
* Administrar categorías.
* Administrar marcas.
* Administrar pedidos.
* Gestionar estados de pedidos.
* Consultar métricas.
* Gestionar banners.
* Supervisar operaciones generales.

## EMPLOYEE

El empleado posee permisos operativos para determinadas funciones administrativas.

Puede, dependiendo de los permisos establecidos:

* Consultar pedidos.
* Gestionar pedidos.
* Actualizar estados.
* Consultar información del catálogo.
* Realizar tareas operativas.

## CUSTOMER

Es el usuario final de la plataforma.

Puede:

* Registrarse.
* Iniciar sesión.
* Consultar productos.
* Buscar productos.
* Agregar productos al carrito.
* Crear pedidos.
* Gestionar direcciones.
* Consultar sus pedidos.
* Consultar pagos.
* Agregar favoritos.
* Crear reseñas.

---

# 6. Autenticación y seguridad

TECNO3D utiliza autenticación mediante JWT.

El flujo general es:

```text
Usuario
   ↓
Login
   ↓
Backend
   ↓
Validación de credenciales
   ↓
JWT
   ↓
Frontend
   ↓
Token almacenado
   ↓
Requests autenticadas
```

Las contraseñas son almacenadas utilizando hashing mediante `bcrypt`.

Las rutas protegidas utilizan middleware de autenticación.

Además, el backend incorpora medidas de seguridad mediante:

* Helmet.
* CORS.
* JWT.
* Control de roles.
* Validación de datos.
* Separación de responsabilidades.
* Manejo centralizado de errores.

---

# 7. Gestión de productos

El sistema permite administrar productos mediante operaciones CRUD.

Cada producto puede contener información como:

* Nombre.
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

Los productos pueden tener múltiples imágenes almacenadas mediante `ProductImage`.

Las imágenes pueden gestionarse mediante Cloudinary.

---

# 8. Catálogo y búsqueda

El catálogo permite consultar productos utilizando diferentes criterios.

Entre ellos:

* Búsqueda por nombre.
* Búsqueda por descripción.
* Búsqueda por slug.
* Búsqueda por categoría.
* Búsqueda por marca.
* Filtros.
* Ordenamiento por precio.
* Ordenamiento por fecha.
* Productos en oferta.
* Paginación.

También se implementaron términos equivalentes para mejorar la experiencia de búsqueda.

Por ejemplo:

```text
mouse → mouse / mouses
notebook → notebook / laptop
impresora → impresora / impresora 3d
filamento → filamento / filamentos
resina → resina / resinas
```

---

# 9. Carrito de compras

Cada cliente puede disponer de un carrito asociado a su usuario.

El carrito permite:

* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Consultar productos agregados.
* Preparar el pedido para checkout.

La relación entre carrito y producto utiliza restricciones para evitar duplicaciones del mismo producto dentro del carrito.

---

# 10. Pedidos

El sistema permite crear y administrar pedidos.

Los pedidos pueden contener:

* Usuario.
* Productos.
* Cantidades.
* Precios.
* Total.
* Dirección.
* Método de entrega.
* Estado.
* Empresa de envío.
* Número de seguimiento.
* Fecha de creación.
* Fecha de actualización.

Los métodos de entrega disponibles son:

```text
SHIPPING
PICKUP
```

### SHIPPING

Requiere una dirección válida perteneciente al usuario.

### PICKUP

Permite retirar el pedido en el local y no requiere dirección de envío.

---

# 11. Estados de pedidos

Los pedidos utilizan los siguientes estados:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

El sistema controla las transiciones permitidas.

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

También se contempla la cancelación cuando corresponde.

No se permite cambiar arbitrariamente un pedido de cualquier estado a otro.

---

# 12. Sistema de pagos

TECNO3D posee una estructura específica para gestionar los pagos asociados a los pedidos.

Métodos contemplados:

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

Estados de pago:

```text
PENDING
PAID
FAILED
REFUNDED
```

La relación entre pedido y pago es de uno a uno.

Además, el sistema valida que un pedido tenga el pago correspondiente antes de avanzar a determinadas etapas del procesamiento.

---

# 13. Envíos

Los pedidos enviados pueden almacenar información relacionada con el transporte:

* Empresa de envío.
* Número de seguimiento.

Un pedido solamente puede pasar a `SHIPPED` cuando se proporciona la información requerida para el envío.

Esto evita que un pedido sea marcado como enviado sin datos de seguimiento.

---

# 14. Usuarios y direcciones

Los usuarios poseen información básica de identificación y contacto.

El sistema permite administrar:

* Nombre.
* Apellido.
* Email.
* Teléfono.
* Avatar.
* Rol.
* Direcciones.

Las direcciones pueden contener:

* Título.
* Calle.
* Número.
* Ciudad.
* Departamento/estado.
* País.
* Código postal.
* Dirección predeterminada.

Las direcciones están asociadas directamente al usuario propietario.

---

# 15. Categorías y marcas

El catálogo se organiza mediante categorías y marcas.

## Categorías

Permiten clasificar los productos.

Cada categoría posee:

* Nombre.
* Slug.
* Imagen.

## Marcas

Cada marca posee:

* Nombre.
* Slug.
* Imagen.
* Fecha de creación.
* Fecha de actualización.

Los productos pueden estar asociados a una categoría y opcionalmente a una marca.

---

# 16. Favoritos

Los usuarios pueden guardar productos como favoritos.

La relación entre usuario y producto posee una restricción única para evitar que el mismo producto sea agregado varias veces a favoritos por el mismo usuario.

---

# 17. Reseñas

Los clientes pueden valorar productos mediante reseñas.

Cada reseña puede contener:

* Usuario.
* Producto.
* Calificación.
* Comentario.
* Fecha de creación.
* Fecha de actualización.

El sistema evita que un mismo usuario genere múltiples reseñas para el mismo producto.

---

# 18. Banners

El sistema dispone de banners administrables para contenido promocional.

Los banners pueden contener:

* Título.
* Descripción.
* Texto del botón.
* Enlace.
* Imagen.
* Identificador público de Cloudinary.
* Estado activo/inactivo.
* Fecha de creación.
* Fecha de actualización.

---

# 19. Dashboard administrativo

El panel administrativo está diseñado para mostrar información real obtenida desde PostgreSQL mediante Prisma.

Las métricas principales incluyen:

1. Ventas totales.
2. Pedidos totales.
3. Cantidad de clientes.
4. Cantidad de productos.
5. Ventas por período.
6. Ventas por categoría.
7. Productos más vendidos.
8. Pedidos recientes.
9. Estado de pagos.
10. Stock y productos con poco stock.

El objetivo del dashboard es proporcionar una visión general del estado del negocio y evitar depender de información estática o hardcodeada.

---

# 20. Base de datos

La aplicación utiliza PostgreSQL como sistema gestor de base de datos.

Prisma ORM se utiliza como capa de acceso a datos y definición del modelo.

Las principales entidades del sistema son:

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

La documentación detallada del modelo de datos se encuentra en:

```text
docs/BASE_DE_DATOS.md
```

---

# 21. API

El backend expone una API REST organizada por recursos.

Principales grupos de endpoints:

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

La documentación detallada de los endpoints se encuentra en:

```text
docs/API.md
```

---

# 22. Frontend

El frontend está desarrollado utilizando React y Vite.

La interfaz utiliza Tailwind CSS para los estilos y componentes reutilizables.

La comunicación con el backend se realiza mediante Axios.

La estructura busca mantener separadas:

* Páginas.
* Componentes.
* Servicios/API.
* Configuración HTTP.
* Estado de la aplicación.
* Formularios.

---

# 23. Gestión de imágenes

Las imágenes de productos y otros recursos multimedia pueden gestionarse mediante Cloudinary.

El backend recibe los archivos mediante endpoints específicos de subida.

El sistema almacena:

* URL pública.
* Public ID.
* Relación con el recurso correspondiente.

Esto permite administrar galerías de imágenes sin almacenar físicamente los archivos dentro del servidor.

---

# 24. Principios de desarrollo

Durante el desarrollo del proyecto se mantienen los siguientes principios:

### Separación de responsabilidades

Cada capa posee una responsabilidad específica.

### Reutilización

Se evita duplicar lógica cuando puede ser centralizada.

### Seguridad

Las rutas y recursos sensibles están protegidos mediante autenticación y autorización.

### Validación

Los datos recibidos desde el cliente deben validarse antes de ser procesados.

### Escalabilidad

La arquitectura permite agregar nuevos módulos sin modificar innecesariamente los existentes.

### Mantenibilidad

El código se organiza para facilitar futuras modificaciones y mantenimiento.

---

# 25. Metodología de desarrollo

El desarrollo del proyecto se realiza de forma incremental.

Cada funcionalidad se implementa siguiendo un proceso controlado:

```text
1. Analizar requerimiento
        ↓
2. Diseñar solución
        ↓
3. Implementar backend
        ↓
4. Probar endpoint
        ↓
5. Implementar frontend
        ↓
6. Probar integración
        ↓
7. Corregir errores
        ↓
8. Confirmar funcionamiento
        ↓
9. Continuar con la siguiente funcionalidad
```

Se prioriza mantener las funcionalidades existentes funcionando antes de incorporar nuevos cambios.

---

# 26. Estado actual del proyecto

El proyecto cuenta actualmente con una arquitectura funcional para:

* Autenticación.
* Usuarios.
* Roles.
* Productos.
* Categorías.
* Marcas.
* Carrito.
* Pedidos.
* Direcciones.
* Pagos.
* Checkout.
* Mercado Pago.
* Webhooks.
* Reseñas.
* Favoritos.
* Banners.
* Gestión de imágenes.
* Dashboard administrativo.

El desarrollo continúa orientado a completar y mejorar la plataforma para alcanzar un producto final profesional y preparado para producción.

---

# 27. Documentación complementaria

La documentación del proyecto se divide en varios documentos especializados:

```text
docs/
│
├── DOCUMENTACION_TECNO3D.md
├── ARQUITECTURA.md
├── BASE_DE_DATOS.md
├── API.md
└── MANUAL_USUARIO.md
```

## DOCUMENTACION_TECNO3D.md

Documento general del proyecto, objetivos, funcionalidades y visión general.

## ARQUITECTURA.md

Describe detalladamente la arquitectura técnica y organización del código.

## BASE_DE_DATOS.md

Describe las tablas, modelos, relaciones, enums y reglas de la base de datos.

## API.md

Documenta los endpoints, métodos HTTP, autenticación, parámetros, respuestas y errores.

## MANUAL_USUARIO.md

Explica cómo utilizar la plataforma desde el punto de vista del usuario final y del administrador.

---

# 28. Objetivo final

El objetivo final de TECNO3D es disponer de una plataforma de e-commerce profesional que pueda ser utilizada como producto real y como proyecto de portfolio profesional.

La plataforma debe ofrecer:

* Buena experiencia de usuario.
* Diseño moderno.
* Seguridad.
* Escalabilidad.
* Código mantenible.
* Arquitectura organizada.
* Integración entre frontend y backend.
* Persistencia real de datos.
* Gestión completa del ciclo de compra.
* Herramientas administrativas.
* Preparación para servicios externos de pago y almacenamiento.

---

# 29. Conclusión

TECNO3D representa una aplicación web full-stack desarrollada con tecnologías modernas y una arquitectura orientada a la separación de responsabilidades.

El proyecto integra frontend, backend, base de datos, autenticación, gestión de productos, pedidos, pagos, usuarios y herramientas administrativas dentro de una misma plataforma.

La estructura utilizada permite continuar incorporando funcionalidades y evolucionar el sistema hacia una aplicación de comercio electrónico completa y preparada para un entorno de producción.
