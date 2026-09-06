# TECNO 3D — E-commerce

Plataforma de comercio electrónico profesional desarrollada para **TECNO 3D**, orientada a la comercialización de productos tecnológicos, impresión 3D, filamentos, resinas, accesorios y productos relacionados.

El proyecto integra frontend, backend, base de datos, autenticación, autorización, gestión de productos, carrito, checkout, pedidos, pagos, promociones, favoritos, reseñas, administración y despliegue en infraestructura cloud.

Actualmente se encuentra **desplegado y operativo en producción**.

---

## 🚀 Demo

🌐 **Sitio web:**
https://tecno3d.net

🌐 **API:**
https://api.tecno3d.net

---

## 📌 Características principales

### 🛒 E-commerce

* Catálogo de productos.
* Búsqueda de productos.
* Filtros por categoría y marca.
* Ordenamiento por precio y fecha.
* Productos en oferta.
* Carrito de compras.
* Checkout.
* Gestión de stock.
* Pedidos.
* Seguimiento de pedidos.
* Métodos de entrega.
* Retiro en local.
* Envíos.

### 💳 Pagos

* Integración con Mercado Pago.
* Checkout de Mercado Pago.
* Webhooks.
* Validación de notificaciones.
* Actualización automática del estado del pago.
* Sincronización entre pago y pedido.

### 🎟️ Promociones

* Cupones.
* Descuentos porcentuales.
* Descuentos por importe fijo.
* Control de usos.
* Fecha de vencimiento.
* Ofertas de productos.
* Precios promocionales.

### 👤 Usuarios

* Registro.
* Inicio de sesión.
* Autenticación mediante JWT.
* Gestión de perfiles.
* Direcciones.
* Favoritos.
* Reseñas.
* Consulta de pedidos.

### 🔐 Roles

El sistema implementa tres roles:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

Cada rol posee diferentes niveles de acceso controlados desde el backend.

### 🛠️ Administración

* Dashboard administrativo.
* Gestión de usuarios.
* Gestión de productos.
* Gestión de categorías.
* Gestión de marcas.
* Gestión de pedidos.
* Gestión de stock.
* Gestión de banners.
* Gestión de promociones.
* Gestión de cupones.
* Gestión de pagos.

---

# 🏗️ Arquitectura

TECNO 3D utiliza una arquitectura cliente-servidor con separación de responsabilidades.

```text
                        INTERNET
                           │
                           ▼
                     Route 53 / DNS
                           │
                           ▼
                         HTTPS
                           │
                           ▼
                         Nginx
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
         Frontend                  Backend API
        React + Vite            Node.js + Express
                                      │
                                      ▼
                                    PM2
                                      │
                                      ▼
                                   Prisma
                                      │
                                      ▼
                                PostgreSQL
                                    RDS
```

Servicios externos:

```text
TECNO 3D
   │
   ├── Mercado Pago
   │
   └── Cloudinary
```

---

# 💻 Stack tecnológico

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios
* React Query
* React Hook Form
* Zod
* Lucide React
* Framer Motion
* Sonner

## Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Zod
* bcrypt
* Helmet
* CORS
* Rate Limiting

## Base de datos

* PostgreSQL
* Amazon RDS
* Prisma ORM

## Infraestructura

* Amazon EC2
* Amazon RDS
* Amazon Route 53
* Nginx
* PM2
* HTTPS / TLS

## CI/CD

* GitHub
* GitHub Actions
* AWS IAM
* GitHub OIDC
* AWS SSM

## Monitoreo

* Amazon CloudWatch
* Amazon SNS
* PM2
* Logrotate

## Servicios externos

* Mercado Pago
* Cloudinary

---

# 🔐 Seguridad

La plataforma incorpora diferentes mecanismos de seguridad tanto a nivel de aplicación como de infraestructura.

Entre ellos:

* HTTPS.
* JWT.
* Hashing de contraseñas mediante bcrypt.
* Helmet.
* CORS restringido.
* Rate limiting.
* Validación de datos.
* Control de acceso mediante roles.
* Control de propiedad de recursos.
* Validación de webhooks.
* Security Groups de AWS.
* RDS sin exposición pública.
* Backend ejecutándose internamente.
* SSH mediante autenticación por claves.
* Deshabilitación de autenticación SSH mediante contraseña.
* Gestión externa de secretos.
* Variables de entorno fuera del repositorio.

El backend escucha internamente en:

```text
127.0.0.1:5000
```

El puerto de la aplicación no se encuentra expuesto directamente a Internet.

---

# ☁️ Infraestructura de producción

La plataforma se encuentra desplegada sobre AWS.

```text
                    AWS
                     │
          ┌──────────┴──────────┐
          │                     │
         EC2                   RDS
          │                  PostgreSQL
          │
     ┌────┴────┐
     │         │
   Nginx     PM2
     │         │
     │       Node.js
     │
 React + Vite
```

El frontend se compila y se sirve mediante Nginx.

El backend se ejecuta mediante Node.js y PM2.

La base de datos productiva utiliza Amazon RDS PostgreSQL.

---

# 🔄 CI/CD

El proyecto cuenta con despliegue automatizado mediante GitHub Actions.

Flujo:

```text
Developer
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
AWS OIDC
    │
    ▼
AWS IAM
    │
    ▼
AWS SSM
    │
    ▼
EC2
    │
    ├── Git Pull
    ├── npm install
    ├── Prisma Generate
    ├── Prisma Migrate
    ├── PM2 Restart
    ├── Frontend Build
    └── Nginx Reload
```

Esto permite realizar actualizaciones controladas sin depender de despliegues manuales.

---

# 📊 Monitoreo

La infraestructura utiliza Amazon CloudWatch para supervisar los principales recursos de producción.

Se monitorean, entre otros:

* CPU de EC2.
* Estado de EC2.
* CPU de RDS.
* Almacenamiento de RDS.
* Conexiones de RDS.
* Capacidad de infraestructura.

Las alarmas pueden generar notificaciones mediante Amazon SNS.

Los procesos de aplicación son supervisados mediante PM2 y los logs cuentan con rotación para evitar crecimiento indefinido.

---

# 🗄️ Base de datos

TECNO 3D utiliza PostgreSQL mediante Prisma ORM.

El modelo de datos contempla entidades para:

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

La documentación detallada se encuentra en:

```text
docs/BASE_DE_DATOS.md
```

---

# 📁 Estructura del proyecto

```text
TECNO3D/
│
├── frontend/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── routes/
│       ├── validators/
│       ├── middlewares/
│       ├── lib/
│       ├── app.js
│       └── server.js
│
├── docs/
│   ├── API.md
│   ├── ARQUITECTURA.md
│   ├── BASE_DE_DATOS.md
│   ├── DOCUMENTACION_TECNO3D.md
│   └── MANUAL_USUARIO.md
│
└── README.md
```

---

# 📚 Documentación

La documentación técnica del proyecto se encuentra organizada en:

| Documento                  | Descripción                                 |
| -------------------------- | ------------------------------------------- |
| `API.md`                   | Endpoints y funcionamiento de la API REST   |
| `ARQUITECTURA.md`          | Arquitectura y organización interna         |
| `BASE_DE_DATOS.md`         | Modelo de datos, relaciones y restricciones |
| `DOCUMENTACION_TECNO3D.md` | Documentación general del proyecto          |
| `MANUAL_USUARIO.md`        | Manual para usuarios y administradores      |

---

# 🧪 Estado del proyecto

| Área             | Estado          |
| ---------------- | --------------- |
| Frontend         | 🟢 Producción   |
| Backend          | 🟢 Producción   |
| PostgreSQL / RDS | 🟢 Producción   |
| Autenticación    | 🟢 Implementado |
| Roles            | 🟢 Implementado |
| Productos        | 🟢 Implementado |
| Categorías       | 🟢 Implementado |
| Marcas           | 🟢 Implementado |
| Carrito          | 🟢 Implementado |
| Checkout         | 🟢 Implementado |
| Pedidos          | 🟢 Implementado |
| Stock            | 🟢 Implementado |
| Favoritos        | 🟢 Implementado |
| Reseñas          | 🟢 Implementado |
| Cupones          | 🟢 Implementado |
| Descuentos       | 🟢 Implementado |
| Mercado Pago     | 🟢 Producción   |
| Webhooks         | 🟢 Producción   |
| Cloudinary       | 🟢 Producción   |
| CI/CD            | 🟢 Implementado |
| HTTPS            | 🟢 Implementado |
| Monitoreo        | 🟢 Implementado |

---

# 🎯 Objetivo del proyecto

TECNO 3D fue desarrollado como una solución e-commerce completa y como proyecto profesional de desarrollo Full Stack.

El proyecto integra conocimientos de:

* Desarrollo frontend.
* Desarrollo backend.
* Diseño de APIs REST.
* Bases de datos relacionales.
* ORM.
* Autenticación.
* Autorización.
* Seguridad web.
* Integración de pagos.
* Gestión de archivos.
* Cloud computing.
* Infraestructura AWS.
* CI/CD.
* Monitoreo.
* Arquitectura de software.

---

# 👨‍💻 Proyecto Full Stack

TECNO 3D demuestra la implementación de una aplicación completa desde la interfaz de usuario hasta la infraestructura de producción.

```text
Frontend
   ↓
API REST
   ↓
Lógica de negocio
   ↓
Persistencia
   ↓
Base de datos
   ↓
Servicios externos
   ↓
Infraestructura cloud
```

El sistema está diseñado para poder evolucionar y continuar incorporando nuevas funcionalidades manteniendo la separación de responsabilidades y la arquitectura existente.

---

# 📄 Licencia

Proyecto desarrollado para TECNO 3D.

El código, recursos y configuraciones del proyecto se encuentran sujetos a las condiciones establecidas por sus propietarios.
