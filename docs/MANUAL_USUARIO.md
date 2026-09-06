# MANUAL DE USUARIO — TECNO 3D

## 1. Introducción

TECNO 3D es una plataforma de comercio electrónico orientada a la venta de productos tecnológicos, impresión 3D, filamentos, resinas, accesorios y productos relacionados.

El sistema permite a los clientes consultar productos, utilizar herramientas de búsqueda y filtrado, administrar su carrito, aplicar descuentos, realizar pedidos, seleccionar métodos de entrega, efectuar pagos y consultar el estado de sus compras.

Además, dispone de un área administrativa para la gestión de productos, categorías, marcas, pedidos, stock, usuarios, banners, cupones y demás funcionalidades internas de la plataforma.

La plataforma se encuentra desplegada y operativa en producción.

---

# 2. Acceso al sistema

Para utilizar TECNO 3D, el usuario debe ingresar a la plataforma desde un navegador web compatible.

La pantalla inicial permite acceder al catálogo de productos y a las funcionalidades disponibles para clientes.

---

## 2.1 Registro

Los nuevos usuarios pueden crear una cuenta proporcionando los datos solicitados por el sistema.

Los datos registrados permiten:

* Identificar al cliente.
* Realizar pedidos.
* Guardar direcciones.
* Consultar pedidos.
* Gestionar favoritos.
* Realizar reseñas de productos.
* Administrar el carrito de compras.

Una vez completado el registro, el usuario puede iniciar sesión utilizando sus credenciales.

---

# 3. Inicio de sesión

El usuario debe ingresar sus credenciales registradas.

Una vez autenticado, el sistema identifica automáticamente el rol correspondiente y habilita las funcionalidades disponibles para dicho usuario.

Los roles definidos en TECNO 3D son:

```text
CUSTOMER
EMPLOYEE
ADMIN
```

Cada rol posee diferentes niveles de acceso.

---

# 4. Catálogo de productos

El catálogo permite consultar los productos disponibles en la plataforma.

Cada producto puede mostrar información como:

* Nombre.
* Descripción.
* Precio.
* Precio promocional.
* Porcentaje de descuento.
* Stock disponible.
* Categoría.
* Marca.
* Imágenes.
* Valoraciones de clientes.

El usuario puede utilizar las herramientas de búsqueda, filtrado y ordenamiento para encontrar productos específicos.

---

# 5. Búsqueda de productos

El sistema permite buscar productos mediante texto.

La búsqueda contempla diferentes términos relacionados y variantes de determinados productos para facilitar la localización.

Por ejemplo:

```text
Mouse
Maus
Notebook
Laptop
Impresora
Impresora 3D
Filamento
Filamentos
Resina
Resinas
Monitor
Accesorios
```

El sistema normaliza determinados términos para mejorar los resultados obtenidos.

---

# 6. Filtros y ordenamiento

El catálogo permite aplicar diferentes criterios de búsqueda.

Entre ellos:

* Categoría.
* Marca.
* Productos en oferta.
* Precio ascendente.
* Precio descendente.
* Productos más recientes.

Estas herramientas permiten reducir los resultados y encontrar rápidamente el producto deseado.

---

# 7. Detalle del producto

Al seleccionar un producto, el usuario puede acceder a su información detallada.

La vista del producto permite consultar:

* Características.
* Descripción.
* Imágenes.
* Precio.
* Precio de oferta cuando corresponde.
* Descuento cuando corresponde.
* Disponibilidad.
* Categoría.
* Marca.
* Valoraciones.

Desde esta sección el usuario puede agregar el producto al carrito o utilizar la funcionalidad de favoritos.

---

# 8. Carrito de compras

El carrito permite administrar los productos que el usuario desea comprar.

El usuario puede:

* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Consultar subtotales.
* Consultar el total de la compra.

El carrito se encuentra asociado al usuario autenticado.

El sistema evita duplicar el mismo producto dentro del carrito y mantiene las cantidades correspondientes.

---

# 9. Checkout

Una vez finalizada la selección de productos, el usuario puede iniciar el proceso de checkout.

Durante este proceso se validan:

* Productos seleccionados.
* Cantidades.
* Stock disponible.
* Método de entrega.
* Dirección de envío cuando corresponde.
* Propiedad de la dirección.
* Cupones aplicables.
* Descuentos.
* Total final del pedido.

El cálculo final del pedido se realiza en el backend.

El frontend no constituye la fuente de verdad para el importe final de la compra.

---

# 10. Cupones y descuentos

TECNO 3D permite aplicar promociones mediante cupones cuando se encuentran disponibles y cumplen las condiciones configuradas.

Los cupones pueden utilizar diferentes tipos de descuento:

```text
PERCENTAGE
FIXED
```

Los descuentos pueden estar sujetos a:

* Código del cupón.
* Estado activo.
* Fecha de vencimiento.
* Cantidad máxima de usos.
* Cantidad de usos realizados.

Cuando un cupón es válido, el sistema calcula el descuento correspondiente y actualiza el total del pedido.

El total utilizado para el pago es el total calculado por el backend después de aplicar el descuento correspondiente.

---

# 11. Métodos de entrega

TECNO 3D contempla dos métodos principales de entrega:

```text
SHIPPING
PICKUP
```

## 11.1 Envío

El pedido requiere una dirección de entrega válida.

El usuario debe seleccionar una dirección asociada a su propia cuenta.

Cuando corresponde, el pedido puede incorporar:

* Empresa de envío.
* Número de seguimiento.

## 11.2 Retiro en local

El cliente puede seleccionar el retiro en el local.

En este caso no se utiliza una dirección de envío.

El sistema adapta el proceso del pedido al método de entrega seleccionado.

---

# 12. Direcciones

Los usuarios pueden administrar sus direcciones de envío.

Una dirección contiene información como:

* Título.
* Calle.
* Número.
* Ciudad.
* Departamento/Estado.
* País.
* Código postal.
* Dirección predeterminada.

Las direcciones están asociadas exclusivamente al usuario que las creó.

El sistema valida que un usuario no pueda utilizar una dirección perteneciente a otra cuenta.

---

# 13. Creación del pedido

Una vez completado el checkout, el sistema genera el pedido correspondiente.

Cada pedido puede contener:

* Identificador.
* Usuario.
* Productos.
* Cantidades.
* Precio de cada producto.
* Total.
* Descuento.
* Cupón aplicado cuando corresponde.
* Método de entrega.
* Dirección cuando corresponde.
* Estado.
* Información de envío cuando corresponde.
* Información de pago.

El pedido comienza normalmente en estado:

```text
PENDING
```

---

# 14. Estados de los pedidos

Los pedidos utilizan los siguientes estados:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

El flujo principal es:

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

Un pedido también puede pasar a `CANCELLED` cuando las reglas del sistema permiten su cancelación.

Las transiciones son controladas por el backend para evitar modificaciones de estado inválidas.

---

# 15. Pagos

TECNO 3D integra Mercado Pago como plataforma de procesamiento de pagos utilizada en el flujo de compra.

El modelo de datos contempla diferentes métodos de pago:

```text
MERCADO_PAGO
PAYPAL
CASH
BANK_TRANSFER
```

Sin embargo, la integración de pago implementada y probada en producción corresponde a **Mercado Pago**.

Los estados de pago disponibles en el modelo son:

```text
PENDING
PAID
FAILED
REFUNDED
```

Cada registro de pago se encuentra asociado a un pedido específico.

---

# 16. Pago mediante Mercado Pago

El flujo de pago mediante Mercado Pago es:

```text
Carrito
   ↓
Checkout
   ↓
Validaciones
   ↓
Aplicación de descuento
   ↓
Creación del pedido
   ↓
Creación del pago
   ↓
Mercado Pago
   ↓
Pago del cliente
   ↓
Webhook
   ↓
Backend
   ↓
Actualización del pago
   ↓
Actualización del pedido
```

El importe enviado a Mercado Pago corresponde al total calculado por el sistema después de aplicar los descuentos correspondientes.

La integración fue probada en el entorno de producción.

Las credenciales y secretos utilizados para la integración no se almacenan en el código fuente ni se incluyen en esta documentación.

---

# 17. Confirmación de pagos

El estado definitivo del pago es procesado por el backend a partir de las notificaciones correspondientes de Mercado Pago.

Cuando el pago es confirmado, el sistema actualiza la información asociada al pedido.

El proceso permite mantener sincronizados:

```text
Pago
   ↓
Pedido
```

De esta forma, la confirmación del pago no depende únicamente de la información presentada en el navegador del cliente.

---

# 18. Preparación y envío

Una vez confirmado el pedido, puede avanzar hacia su procesamiento de acuerdo con las reglas de negocio.

Cuando el pedido utiliza:

```text
SHIPPING
```

puede incorporar información de envío como:

* Empresa de envío.
* Número de seguimiento.

Estos datos quedan asociados al pedido para permitir su consulta y seguimiento.

Cuando se utiliza:

```text
PICKUP
```

el pedido se adapta al retiro en local y no requiere información de envío.

---

# 19. Consulta de pedidos

Los clientes autenticados pueden consultar sus propios pedidos.

La información puede incluir:

* Identificador del pedido.
* Productos.
* Cantidades.
* Precios.
* Total.
* Descuento.
* Método de entrega.
* Dirección cuando corresponde.
* Estado del pedido.
* Estado del pago.
* Empresa de envío cuando corresponde.
* Número de seguimiento cuando corresponde.
* Fecha del pedido.

Los clientes solamente pueden acceder a los pedidos correspondientes a su propia cuenta.

---

# 20. Favoritos

Los usuarios autenticados pueden guardar productos como favoritos.

La funcionalidad permite:

* Agregar productos a favoritos.
* Consultar productos favoritos.
* Eliminar productos de favoritos.

Cada favorito pertenece a un usuario y a un producto.

El sistema evita duplicar el mismo producto dentro de los favoritos de un usuario.

---

# 21. Reseñas

Los clientes pueden valorar productos mediante reseñas.

Una reseña puede contener:

* Calificación.
* Comentario.
* Usuario.
* Producto.
* Fecha de creación.
* Fecha de actualización.

El sistema evita que un mismo usuario registre múltiples reseñas para el mismo producto.

---

# 22. Roles de usuario

TECNO 3D utiliza tres niveles principales de acceso:

```text
CUSTOMER
EMPLOYEE
ADMIN
```

## 22.1 CUSTOMER

Es el usuario final de la plataforma.

Puede:

* Consultar productos.
* Buscar y filtrar productos.
* Administrar el carrito.
* Crear pedidos.
* Administrar direcciones.
* Consultar sus pedidos.
* Consultar información de pagos.
* Gestionar favoritos.
* Realizar reseñas.

---

## 22.2 EMPLOYEE

Dispone de permisos operativos superiores a un cliente.

Puede acceder a funcionalidades administrativas y operativas autorizadas por el sistema, principalmente relacionadas con la gestión de pedidos y operaciones internas.

Los permisos efectivos se encuentran controlados por el backend.

---

## 22.3 ADMIN

Es el nivel de mayor privilegio dentro de la plataforma.

Puede acceder a las funcionalidades administrativas autorizadas por el sistema, incluyendo:

* Gestión de usuarios.
* Gestión de productos.
* Gestión de categorías.
* Gestión de marcas.
* Gestión de pedidos.
* Gestión de pagos.
* Gestión de stock.
* Gestión de banners.
* Gestión de promociones y cupones.
* Administración del dashboard.
* Administración general de la plataforma.

---

# 23. Dashboard administrativo

El dashboard proporciona una visión general del funcionamiento comercial de TECNO 3D.

El acceso al dashboard administrativo corresponde al rol:

```text
ADMIN
```

Las métricas principales incluyen:

* Ventas totales.
* Pedidos totales.
* Cantidad de clientes.
* Cantidad de productos.
* Ventas por período.
* Ventas por categoría.
* Productos más vendidos.
* Pedidos recientes.
* Estado de pagos.
* Productos con bajo stock.

Las métricas se obtienen a partir de la información almacenada en PostgreSQL mediante Prisma.

---

# 24. Gestión de productos

Los usuarios autorizados pueden administrar el catálogo.

Las operaciones incluyen:

* Crear productos.
* Consultar productos.
* Modificar productos.
* Eliminar productos.
* Administrar precios.
* Administrar stock.
* Asociar categorías.
* Asociar marcas.
* Administrar ofertas.
* Administrar imágenes.

Los productos pueden tener una imagen principal y múltiples imágenes adicionales.

Las imágenes son gestionadas mediante el sistema de almacenamiento configurado para la plataforma.

---

# 25. Gestión de ofertas

Los productos pueden disponer de precios promocionales.

Las ofertas pueden utilizar:

* Precio original.
* Precio de oferta.
* Porcentaje de descuento.
* Estado de oferta.

Cuando una oferta se encuentra activa, el sistema muestra el precio promocional correspondiente.

El cálculo utilizado durante una compra se realiza en el backend.

---

# 26. Gestión de categorías

Las categorías permiten organizar los productos del catálogo.

Una categoría puede contener:

* Nombre.
* Slug.
* Imagen.
* Productos asociados.

La categorización facilita la navegación, búsqueda y filtrado dentro del catálogo.

---

# 27. Gestión de marcas

Las marcas permiten asociar productos con su fabricante o marca correspondiente.

Una marca puede contener:

* Nombre.
* Slug.
* Imagen.
* Productos asociados.

Los productos pueden tener una marca asociada o no tenerla cuando el sistema lo permite.

---

# 28. Gestión de stock

El stock representa la cantidad disponible de cada producto.

Durante el proceso de compra el sistema verifica que exista stock suficiente.

Las cantidades adquiridas se tienen en cuenta para actualizar la disponibilidad correspondiente.

El dashboard administrativo permite identificar productos con niveles bajos de stock.

---

# 29. Gestión de banners

Los usuarios administrativos autorizados pueden gestionar banners promocionales.

Un banner puede contener:

* Título.
* Descripción.
* Texto del botón.
* Enlace.
* Imagen.
* Estado activo/inactivo.

Las imágenes de los banners son gestionadas mediante el almacenamiento configurado para la plataforma.

---

# 30. Gestión de imágenes

TECNO 3D utiliza Cloudinary para gestionar imágenes.

Puede utilizarse para:

* Imágenes de productos.
* Galerías de productos.
* Banners.
* Otros recursos multimedia configurados por la plataforma.

El sistema almacena las referencias necesarias para utilizar posteriormente los recursos.

Los archivos multimedia no se almacenan directamente dentro del servidor de aplicación.

---

# 31. Seguridad

TECNO 3D incorpora diferentes mecanismos de seguridad para proteger las cuentas, los datos y las funcionalidades administrativas.

Entre ellos:

* Autenticación mediante JWT.
* Middleware de autenticación.
* Control de roles.
* Validación de permisos.
* Contraseñas almacenadas mediante hashing con bcrypt.
* Validaciones en backend.
* Helmet.
* CORS restringido.
* Rate limiting en rutas sensibles.
* Control de acceso a recursos.
* Validación de propiedad de recursos.
* Protección de webhooks.
* HTTPS.

Las funcionalidades administrativas no deben estar disponibles para usuarios que no posean los permisos correspondientes.

---

# 32. Recomendaciones de uso

Para utilizar correctamente la plataforma se recomienda:

1. Mantener actualizados los datos personales.
2. Verificar el stock antes de confirmar una compra.
3. Revisar la dirección de envío antes de confirmar el pedido.
4. Seleccionar correctamente el método de entrega.
5. Verificar los productos y cantidades antes de finalizar la compra.
6. Revisar los descuentos aplicados.
7. Verificar el total final antes de realizar el pago.
8. Conservar la información de seguimiento cuando corresponda.
9. No compartir las credenciales de acceso.
10. Utilizar contraseñas seguras.

---

# 33. Flujo general de compra

El flujo principal para un cliente es:

```text
Registro / Inicio de sesión
          ↓
       Catálogo
          ↓
    Buscar producto
          ↓
    Ver producto
          ↓
    Agregar al carrito
          ↓
       Checkout
          ↓
   Aplicar cupón
          ↓
  Calcular descuento
          ↓
 Seleccionar entrega
          ↓
Seleccionar dirección
          ↓
    Crear pedido
          ↓
   Mercado Pago
          ↓
     Realizar pago
          ↓
      Webhook
          ↓
   Pago confirmado
          ↓
     Processing
          ↓
       Envío
          ↓
      Entregado
```

Cuando el usuario selecciona:

```text
PICKUP
```

el flujo se adapta al retiro en local y no requiere una dirección de envío ni información de empresa de transporte.

---

# 34. Flujo administrativo

El flujo general de operación administrativa puede representarse como:

```text
ADMIN
  ↓
Panel administrativo
  ↓
Gestión de catálogo
  ↓
Productos / Categorías / Marcas
  ↓
Gestión de pedidos
  ↓
Verificación de pago
  ↓
Procesamiento
  ↓
Preparación del pedido
  ↓
Envío / Retiro
  ↓
Finalización
```

Las operaciones disponibles dependen del rol y de los permisos definidos por el sistema.

---

# 35. Protección de datos y credenciales

Las credenciales y secretos de producción no forman parte del código fuente público.

El sistema mantiene separadas las configuraciones sensibles de la aplicación.

Los usuarios no deben compartir:

* Contraseñas.
* Tokens.
* Credenciales.
* Información sensible de acceso.

La comunicación pública de la plataforma utiliza HTTPS.

---

# 36. Soporte y mantenimiento

TECNO 3D está diseñada con una arquitectura separada entre frontend y backend.

El frontend proporciona la interfaz de usuario y consume la API REST.

El backend administra:

* Autenticación.
* Autorización.
* Lógica de negocio.
* Validaciones.
* Persistencia.
* Productos.
* Usuarios.
* Pedidos.
* Pagos.
* Promociones.
* Carrito.

La información persistente se almacena en PostgreSQL mediante Prisma ORM.

La infraestructura de producción utiliza AWS y mecanismos de monitoreo y despliegue automatizado.

---

# 37. Estado actual de la plataforma

TECNO 3D se encuentra desplegada y operativa en producción.

Las funcionalidades principales incluyen:

* Autenticación.
* Registro.
* Usuarios.
* Roles.
* Productos.
* Categorías.
* Marcas.
* Ofertas.
* Imágenes.
* Carrito.
* Checkout.
* Direcciones.
* Pedidos.
* Estados de pedidos.
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
* Empresa de envío.
* Número de seguimiento.

Las funcionalidades principales fueron integradas y probadas entre frontend, backend, base de datos e integraciones externas.

---

# 38. Conclusión

TECNO 3D integra las principales funcionalidades necesarias para una plataforma de comercio electrónico profesional.

El sistema permite administrar el ciclo completo de una compra, desde la consulta del catálogo hasta la entrega o retiro del pedido.

La plataforma incorpora:

* Catálogo.
* Búsqueda y filtros.
* Carrito.
* Checkout.
* Descuentos.
* Cupones.
* Pedidos.
* Pagos.
* Mercado Pago.
* Webhooks.
* Seguimiento de envíos.
* Favoritos.
* Reseñas.
* Gestión administrativa.
* Seguridad.
* Persistencia de datos.

El sistema se encuentra desplegado y operativo en producción, manteniendo separación de responsabilidades, control de acceso, validaciones y mecanismos de seguridad.

La arquitectura permite continuar incorporando nuevas funcionalidades y mejoras sin alterar innecesariamente la estructura principal del sistema.
