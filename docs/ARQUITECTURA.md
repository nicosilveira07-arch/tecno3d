# TECNO 3D

# Arquitectura del Sistema

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

La infraestructura productiva se encuentra desplegada en AWS y utiliza Amazon EC2 para la aplicación y Amazon RDS PostgreSQL para la base de datos.

---

# 2. Arquitectura general

La arquitectura completa de TECNO 3D puede representarse de la siguiente manera:

```text
                              INTERNET
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Route 53      │
                         │      DNS        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ HTTPS / SSL     │
                         │     Nginx       │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐       ┌─────────────────┐
           │    FRONTEND     │       │     BACKEND     │
           │ React + Vite    │──────▶│ Node.js +       │
           │ Tailwind CSS    │ REST  │ Express         │
           └─────────────────┘       └────────┬────────┘
                                              │
                                              ▼
                                      ┌─────────────────┐
                                      │     Prisma      │
                                      │      ORM        │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │    AWS RDS      │
                                      │   PostgreSQL    │
                                      └─────────────────┘


                    SERVICIOS EXTERNOS
                           
              ┌─────────────────────────────┐
              │        Mercado Pago         │
              │    Checkout + Webhooks      │
              └──────────────┬──────────────┘
                             │
                             ▼
                          Backend


              ┌─────────────────────────────┐
              │          Cloudinary         │
              │       Almacenamiento        │
              │          de imágenes        │
              └──────────────┬──────────────┘
                             │
                             ▼
                          Backend
```

---

# 3. Infraestructura de producción

La infraestructura productiva utiliza servicios de Amazon Web Services (AWS).

Los principales componentes son:

```text
AWS
│
├── EC2
│   ├── Node.js
│   ├── PM2
│   └── Nginx
│
├── RDS
│   └── PostgreSQL
│
├── Route 53
│   └── DNS
│
├── IAM
│   └── Roles y permisos
│
├── Systems Manager (SSM)
│   └── Ejecución de comandos sobre EC2
│
├── CloudWatch
│   └── Métricas y monitoreo
│
└── SNS
    └── Alertas
```

La infraestructura está diseñada para mantener separados los componentes de aplicación, base de datos, acceso y monitoreo.

---

# 4. Amazon EC2

Amazon EC2 aloja los componentes principales de la aplicación.

La instancia de producción ejecuta:

* Backend Node.js.
* PM2.
* Nginx.
* Frontend generado mediante Vite.

El backend se ejecuta mediante el proceso:

```text
tecno3d-api
```

administrado por PM2.

El backend escucha internamente en:

```text
127.0.0.1:5000
```

Esto evita exponer directamente el servidor Node.js a Internet.

El tráfico externo es recibido por Nginx y posteriormente enviado al backend.

---

# 5. PM2

PM2 administra el proceso del backend Node.js.

Aplicación:

```text
tecno3d-api
```

PM2 permite:

* Mantener el proceso activo.
* Reiniciar la aplicación.
* Consultar logs.
* Consultar consumo de recursos.
* Reiniciar el backend después de un despliegue.

Comandos principales:

```bash
pm2 status
pm2 logs tecno3d-api
pm2 restart tecno3d-api
```

---

# 6. Nginx

Nginx funciona como servidor web y Reverse Proxy.

Sus principales responsabilidades son:

* Recibir solicitudes HTTPS.
* Servir el frontend.
* Redirigir HTTP hacia HTTPS.
* Enviar solicitudes de API al backend.
* Aplicar headers de seguridad.
* Gestionar los dominios de producción.

Flujo:

```text
Internet
    │
    ▼
Nginx
    │
    ├── Frontend
    │
    └── API
          │
          ▼
      127.0.0.1:5000
          │
          ▼
       Node.js
```

El puerto interno del backend no está expuesto públicamente.

---

# 7. Dominio y DNS

El dominio principal del proyecto es:

```text
tecno3d.net
```

La gestión DNS utiliza Amazon Route 53.

Los principales dominios utilizados son:

```text
https://tecno3d.net
https://www.tecno3d.net
https://api.tecno3d.net
```

El dominio principal apunta al frontend y el subdominio de API permite acceder al backend mediante HTTPS.

---

# 8. HTTPS y SSL

La aplicación utiliza HTTPS en producción.

Nginx gestiona las conexiones seguras y redirige las solicitudes HTTP hacia HTTPS.

La arquitectura utiliza TLS moderno y evita exponer directamente los servicios internos.

La conexión pública utiliza:

```text
HTTPS :443
```

mientras que el backend permanece internamente en:

```text
127.0.0.1:5000
```

---

# 9. Security Groups

AWS Security Groups funcionan como firewall de red para la infraestructura.

La configuración productiva restringe los servicios expuestos públicamente.

La instancia EC2 permite principalmente:

```text
HTTP   → 80
HTTPS  → 443
SSH    → acceso restringido
```

El puerto del backend:

```text
5000
```

no está expuesto públicamente.

Amazon RDS utiliza un Security Group separado y permite conexiones PostgreSQL desde la infraestructura EC2 autorizada.

---

# 10. Frontend

El frontend está desarrollado con:

* React.
* Vite.
* Tailwind CSS.
* React Router.
* Axios.
* React Query.
* React Hook Form.
* Zod.
* Lucide React.
* Framer Motion.
* Sonner.

Su responsabilidad principal es presentar la interfaz gráfica y permitir la interacción del usuario con la plataforma.

Entre sus responsabilidades se encuentran:

* Renderización de interfaces.
* Navegación.
* Formularios.
* Validaciones.
* Gestión de sesión.
* Consumo de la API.
* Catálogo.
* Carrito.
* Checkout.
* Pedidos.
* Perfil.
* Favoritos.
* Ofertas.
* Cupones.
* Panel administrativo.
* Dashboard.

---

# 11. Estructura del frontend

La estructura conceptual del frontend es:

```text
frontend/

├── public/
│
├── src/
│   │
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── layouts/
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

La estructura puede evolucionar durante el desarrollo manteniendo la separación de responsabilidades.

Las variables de entorno no deben contener secretos dentro del repositorio.

---

# 12. Componentes

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
* Componentes relacionados con productos.
* Componentes relacionados con pedidos.

El objetivo es reducir la duplicación de código y facilitar el mantenimiento.

---

# 13. Pages

La carpeta `pages` contiene las páginas principales de la aplicación.

Entre ellas se encuentran:

* Inicio.
* Productos.
* Detalle de producto.
* Carrito.
* Checkout.
* Pedidos.
* Perfil.
* Favoritos.
* Administración.
* Dashboard.

Cada página utiliza componentes reutilizables para construir su interfaz.

---

# 14. API y Services

El frontend separa el consumo de la API de la lógica visual.

Flujo conceptual:

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

Esta separación evita concentrar todas las peticiones HTTP dentro de los componentes visuales.

Los servicios encapsulan la comunicación con los diferentes módulos del backend.

---

# 15. Axios

El frontend utiliza Axios como cliente HTTP.

La instancia principal permite centralizar:

* URL base.
* Headers.
* Token de autenticación.
* Configuración de peticiones.
* Manejo común de respuestas.
* Manejo de errores.

El token JWT se agrega a las peticiones autenticadas mediante la configuración correspondiente del cliente HTTP.

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

# 16. Backend

El backend está desarrollado con:

* Node.js.
* Express.
* Prisma ORM.
* PostgreSQL.
* JWT.
* Zod.

Su responsabilidad principal es controlar la lógica del sistema y garantizar que las operaciones realizadas sean válidas y seguras.

---

# 17. Estructura del backend

```text
backend/

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

La estructura implementa separación de responsabilidades.

---

# 18. Routes

Las rutas definen los endpoints disponibles en la API.

Principales módulos:

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

Las rutas determinan:

* Método HTTP.
* Endpoint.
* Middleware.
* Controller correspondiente.

Las reglas complejas de negocio permanecen en los Services.

---

# 19. Middlewares

Los middlewares permiten ejecutar lógica antes de llegar al controller.

Entre los principales mecanismos se encuentran:

* CORS.
* Seguridad.
* Autenticación.
* Autorización.
* Rate limiting.
* Manejo de errores.

Flujo conceptual:

```text
Request
   │
   ▼
CORS
   │
   ▼
Security
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

No todas las rutas requieren autenticación o autorización.

---

# 20. Autenticación

TECNO 3D utiliza JWT para autenticar usuarios.

Proceso general:

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
Authentication Middleware
   │
   ▼
req.user
```

Las contraseñas se almacenan utilizando hashing mediante bcrypt.

---

# 21. Autorización por roles

El sistema utiliza tres roles:

```text
ADMIN
EMPLOYEE
CUSTOMER
```

La autorización determina qué operaciones puede realizar cada usuario.

De forma general:

```text
CUSTOMER
   │
   ├── Catálogo
   ├── Carrito
   ├── Checkout
   ├── Sus pedidos
   ├── Favoritos
   └── Funcionalidades disponibles para clientes

EMPLOYEE
   │
   └── Operaciones administrativas permitidas

ADMIN
   │
   └── Acceso administrativo completo
```

La autorización se realiza mediante middleware de roles y las reglas correspondientes de cada recurso.

---

# 22. Controllers

Los controllers reciben las solicitudes HTTP y generan las respuestas.

Su responsabilidad principal es:

1. Recibir la request.
2. Obtener los datos necesarios.
3. Invocar al Service.
4. Generar la respuesta.
5. Delegar errores al middleware correspondiente.

Flujo:

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

# 23. Services

Los Services contienen las reglas de negocio.

Esta capa centraliza operaciones como:

* Validación de datos.
* Validación de stock.
* Cálculo de totales.
* Gestión de pedidos.
* Gestión de pagos.
* Aplicación de descuentos.
* Validación de cupones.
* Transiciones de estados.
* Reglas de entrega.
* Reglas relacionadas con usuarios y permisos.

Ejemplo conceptual:

```text
createOrderService()
```

puede encargarse de:

* Validar método de entrega.
* Validar dirección.
* Validar usuario.
* Verificar productos.
* Verificar stock.
* Calcular descuentos.
* Calcular total.
* Crear el pedido.
* Crear los elementos del pedido.

---

# 24. Repositories

Los Repositories son responsables del acceso a los datos.

Utilizan Prisma para comunicarse con PostgreSQL.

Flujo:

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

Los repositories pueden realizar operaciones como:

* Buscar.
* Crear.
* Actualizar.
* Eliminar.
* Contar.
* Consultar relaciones.

---

# 25. Prisma ORM

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
* Generar el cliente Prisma.

Los cambios de esquema se gestionan mediante migraciones.

En producción se utiliza:

```bash
npx prisma migrate deploy
```

---

# 26. PostgreSQL

PostgreSQL es el sistema gestor de base de datos utilizado por TECNO 3D.

Entre las principales entidades del sistema se encuentran:

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

Las relaciones entre estas entidades representan la estructura del negocio.

---

# 27. Amazon RDS PostgreSQL

En producción, PostgreSQL se encuentra alojado en Amazon RDS.

La aplicación se conecta a RDS mediante Prisma.

La arquitectura separa la base de datos del servidor de aplicación:

```text
EC2
 │
 │ PostgreSQL
 ▼
RDS
 │
 ▼
PostgreSQL
```

Las conexiones hacia RDS están restringidas mediante Security Groups.

La base de datos utiliza almacenamiento cifrado.

El almacenamiento dispone de auto scaling para permitir crecimiento según las necesidades de la aplicación.

Las credenciales de producción no se almacenan en el repositorio.

---

# 28. Flujo completo de una petición

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
│     Nginx     │
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
│ Amazon RDS    │
│  PostgreSQL   │
└───────────────┘
```

---

# 29. Flujo de creación de pedidos

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
   ├── Validar usuario
   ├── Validar método de entrega
   ├── Validar dirección
   ├── Validar productos
   ├── Validar stock
   ├── Aplicar descuentos
   └── Calcular total
   │
   ▼
Repository
   │
   ▼
Prisma
   │
   ▼
RDS PostgreSQL
   │
   ▼
Pedido creado
```

---

# 30. Flujo de estados de pedidos

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

Las transiciones se validan desde la lógica de negocio.

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

# 31. Flujo de pagos

Los pagos se relacionan con los pedidos.

Métodos definidos por el sistema:

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

Estados:

```text
PENDING
PAID
FAILED
REFUNDED
```

Flujo general:

```text
Pedido
   │
   ▼
Payment
   │
   ▼
Método de pago
   │
   ▼
Procesamiento
   │
   ▼
Resultado
```

---

# 32. Mercado Pago

TECNO 3D utiliza Mercado Pago como plataforma de procesamiento de pagos.

El flujo general es:

```text
Cliente
   │
   ▼
Checkout TECNO 3D
   │
   ▼
Backend
   │
   ▼
Mercado Pago
   │
   ▼
Pago
   │
   ├───────────────┐
   │               │
   ▼               ▼
Redirect        Webhook
   │               │
   │               ▼
   │        Backend TECNO 3D
   │               │
   │               ▼
   │        Validación del evento
   │               │
   │               ▼
   └──────────▶ Pedido / Payment
```

La aplicación utiliza Mercado Pago para procesar el pago y Webhooks para recibir notificaciones externas relacionadas con el resultado de las operaciones.

---

# 33. Webhooks

Los Webhooks permiten que servicios externos comuniquen eventos al backend.

En TECNO 3D se utilizan principalmente para eventos relacionados con Mercado Pago.

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
Payment
      │
      ▼
Order
      │
      ▼
PostgreSQL
```

Los eventos correspondientes se procesan y los eventos no relacionados con el flujo utilizado pueden ser ignorados de forma controlada.

La integración utiliza validación de firma para proteger el endpoint.

---

# 34. Gestión de imágenes

Las imágenes se gestionan mediante Cloudinary.

Flujo conceptual:

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
URL / publicId
   │
   ▼
Backend
   │
   ▼
PostgreSQL
```

Las imágenes pueden utilizarse para:

* Productos.
* Banners.
* Usuarios.
* Otros recursos de la plataforma.

---

# 35. Dashboard administrativo

El dashboard administrativo utiliza información obtenida desde el backend.

Flujo conceptual:

```text
AdminDashboard
      │
      ▼
Dashboard API
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

El acceso al dashboard está restringido a usuarios con permisos administrativos.

Las métricas se calculan a partir de información almacenada en la base de datos.

---

# 36. Cupones, descuentos y ofertas

TECNO 3D incorpora funcionalidades relacionadas con:

* Ofertas.
* Descuentos.
* Cupones.

El flujo general es:

```text
Producto
   │
   ▼
Precio
   │
   ▼
Oferta / Descuento / Cupón
   │
   ▼
Cálculo del pedido
   │
   ▼
Total final
   │
   ▼
Pago
```

La lógica de cálculo se realiza en el backend para evitar depender exclusivamente de los valores enviados por el frontend.

---

# 37. Seguridad de la arquitectura

La arquitectura utiliza múltiples capas de protección.

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
CORS
   │
   ▼
Security Headers
   │
   ▼
Rate Limiting
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
RDS PostgreSQL
```

La seguridad no depende de una única capa.

---

# 38. Seguridad de red

La infraestructura productiva utiliza Security Groups de AWS.

Principios principales:

* HTTPS público.
* HTTP utilizado para redirección hacia HTTPS.
* SSH restringido.
* Puerto 5000 no expuesto.
* RDS no expuesto públicamente.
* RDS accesible desde la infraestructura autorizada.

El backend escucha únicamente en:

```text
127.0.0.1:5000
```

---

# 39. Variables de entorno

La configuración sensible se mantiene fuera del código fuente.

Entre las variables utilizadas por el sistema pueden encontrarse configuraciones relacionadas con:

* PostgreSQL.
* JWT.
* Mercado Pago.
* Cloudinary.
* URLs de producción.
* Node.js.
* Configuración de la aplicación.

Los valores sensibles no deben almacenarse directamente en Git.

---

# 40. GitHub Actions

El proyecto utiliza GitHub Actions para automatizar los despliegues.

El flujo general es:

```text
Developer
    │
    ▼
git push
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
AWS Systems Manager
    │
    ▼
EC2
    │
    ├── git pull
    ├── npm install
    ├── Prisma Generate
    ├── Prisma Migrate
    ├── PM2 restart
    ├── Frontend build
    ├── Publicación del frontend
    └── Nginx reload
```

Esto permite realizar despliegues de forma automatizada.

---

# 41. GitHub OIDC

GitHub Actions utiliza federación mediante OIDC para autenticarse con AWS.

El flujo es:

```text
GitHub Actions
      │
      ▼
OIDC
      │
      ▼
AWS IAM Role
      │
      ▼
Permisos AWS
```

Esto evita depender de Access Keys permanentes almacenadas directamente en GitHub Actions.

El acceso se encuentra limitado mediante el rol correspondiente.

---

# 42. AWS Systems Manager

AWS Systems Manager permite ejecutar comandos sobre la instancia EC2 desde el pipeline de despliegue.

Flujo:

```text
GitHub Actions
      │
      ▼
SSM SendCommand
      │
      ▼
EC2
      │
      ▼
Ejecuta despliegue
```

Esto permite automatizar las operaciones de despliegue sin utilizar SSH como mecanismo principal del pipeline.

---

# 43. Despliegue automático

El pipeline de producción realiza las operaciones necesarias para actualizar la aplicación.

Proceso:

1. Obtener el código actualizado.
2. Instalar dependencias del backend.
3. Generar Prisma.
4. Aplicar migraciones.
5. Reiniciar PM2.
6. Instalar dependencias del frontend.
7. Generar el build de producción.
8. Verificar que exista `dist/index.html`.
9. Publicar el frontend.
10. Recargar Nginx.
11. Verificar el resultado de la ejecución en SSM.

El pipeline utiliza control de errores para evitar considerar exitoso un despliegue que haya fallado.

---

# 44. Monitoreo con CloudWatch

Amazon CloudWatch se utiliza para observar la infraestructura productiva.

### EC2

Se monitorean métricas como:

* CPU.
* Estado de la instancia.
* Créditos de CPU.
* Tráfico de red.
* Capacidad de almacenamiento.

### RDS

Se monitorean métricas como:

* CPU.
* Conexiones.
* Almacenamiento disponible.
* Memoria disponible.
* Carga de base de datos.

---

# 45. Alarmas de producción

Se configuraron alarmas para detectar problemas importantes.

### EC2

```text
TECNO3D-EC2-StatusCheckFailed
TECNO3D-EC2-CPUHigh
```

### RDS

```text
TECNO3D-RDS-CPUHigh
TECNO3D-RDS-FreeStorageLow
TECNO3D-RDS-ConnectionsHigh
```

Las alarmas permiten detectar situaciones anormales antes de que se conviertan en problemas mayores.

---

# 46. Amazon SNS

Amazon SNS se utiliza para enviar notificaciones asociadas a las alarmas de CloudWatch.

Flujo:

```text
CloudWatch
    │
    ▼
Alarm
    │
    ▼
SNS
    │
    ▼
Notificación
```

Esto permite recibir alertas cuando determinados indicadores de producción superan los límites establecidos.

---

# 47. Logs

Los logs del backend son administrados mediante PM2.

Ubicación:

```text
/home/ec2-user/.pm2/logs/
```

Archivos principales:

```text
tecno3d-api-out.log
tecno3d-api-error.log
```

Los logs utilizan `logrotate` para evitar un crecimiento indefinido del almacenamiento.

La rotación permite conservar históricos y comprimir registros antiguos.

---

# 48. Diagnóstico rápido de producción

TECNO 3D dispone de un comando de diagnóstico:

```bash
tecno3d-status
```

El comando permite consultar rápidamente:

* Estado de PM2.
* Estado de Nginx.
* Conexiones con RDS.
* Estado HTTP de la API.
* Uso de disco.
* Uso de memoria.

Esto facilita una primera evaluación del estado de producción.

---

# 49. Procedimiento ante fallos

Ante una alerta o problema de producción se debe realizar primero un diagnóstico.

### Paso 1 — Estado general

```bash
tecno3d-status
```

### Paso 2 — Backend

```bash
sudo -u ec2-user pm2 status
sudo -u ec2-user pm2 logs tecno3d-api --lines 100
```

### Paso 3 — Nginx

```bash
sudo systemctl status nginx --no-pager
sudo nginx -t
```

### Paso 4 — Base de datos

Revisar en CloudWatch:

* CPU.
* DatabaseConnections.
* FreeStorageSpace.
* FreeableMemory.
* Estado de RDS.

### Paso 5 — Deploy

Si el problema comenzó después de una actualización:

* Revisar GitHub Actions.
* Identificar el commit desplegado.
* Determinar si el problema está relacionado con el último cambio.
* Realizar rollback controlado si es necesario.

No se debe modificar producción sin identificar primero la causa probable.

---

# 50. Mantenimiento y actualización

Las actualizaciones de producción deben realizarse mediante Git.

Flujo:

```text
Desarrollo
    │
    ▼
Pruebas
    │
    ▼
Commit
    │
    ▼
Push
    │
    ▼
GitHub Actions
    │
    ▼
Producción
    │
    ▼
Verificación
```

Después de cada despliegue se recomienda verificar:

* PM2.
* Nginx.
* API.
* Frontend.
* Base de datos.
* Mercado Pago.
* Funcionalidades críticas.

---

# 51. Capacidad y escalabilidad

La arquitectura actual está dimensionada para las necesidades actuales del proyecto.

EC2 y RDS son monitoreados mediante CloudWatch para detectar crecimiento de consumo.

La infraestructura permite evolucionar posteriormente mediante:

* Aumento de recursos de EC2.
* Cambio de clase de RDS.
* Aumento del almacenamiento.
* Escalabilidad horizontal.
* Separación adicional de servicios.
* Balanceo de carga.
* Servicios adicionales de AWS.

Estas medidas deben aplicarse únicamente cuando las métricas reales justifiquen el crecimiento.

---

# 52. Separación de responsabilidades

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
* Depuración.
* Reutilización.
* Escalabilidad.
* Incorporación de nuevas funcionalidades.

---

# 53. Principios arquitectónicos

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
* Infraestructura separada de la aplicación.
* Monitoreo de producción.
* Despliegue automatizado.
* Control de versiones.

---

# 54. Evolución futura

La arquitectura permite incorporar futuras funcionalidades sin modificar completamente el sistema.

Entre las posibles extensiones se encuentran:

* Nuevos métodos de pago.
* Nuevos métodos de envío.
* Notificaciones.
* Reportes avanzados.
* Auditoría.
* Gestión avanzada de inventario.
* Sistema de facturación.
* Integraciones con servicios externos.
* Escalabilidad horizontal.

Las funcionalidades existentes, como cupones, descuentos, ofertas, favoritos, pagos y gestión de pedidos, ya forman parte del sistema actual.

---

# 55. Resumen de arquitectura

La arquitectura productiva de TECNO 3D puede resumirse de la siguiente manera:

```text
                         INTERNET
                             │
                             ▼
                         Route 53
                             │
                             ▼
                       HTTPS / Nginx
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
             Frontend                  Backend
          React + Vite            Node.js + Express
                                         │
                                         ▼
                                      Prisma
                                         │
                                         ▼
                                  Amazon RDS
                                    PostgreSQL


        GitHub
           │
           ▼
    GitHub Actions
           │
           ▼
       AWS OIDC
           │
           ▼
          SSM
           │
           ▼
          EC2


       CloudWatch
           │
           ▼
         Alarm
           │
           ▼
          SNS
           │
           ▼
      Notificación
```

TECNO 3D combina una arquitectura de aplicación separada por responsabilidades con una infraestructura cloud orientada a producción.

La solución utiliza AWS para alojamiento, persistencia, DNS, seguridad, despliegue automatizado, monitoreo y alertas, manteniendo una separación clara entre aplicación, datos e infraestructura.
