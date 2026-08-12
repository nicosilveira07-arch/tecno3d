# MANUAL DE USUARIO — TECNO3D

## 1. Introducción

TECNO3D es una plataforma de comercio electrónico orientada a la venta de productos tecnológicos, impresión 3D, filamentos, resinas, accesorios y productos relacionados.

El sistema permite a los clientes consultar productos, administrar su carrito, realizar pedidos, seleccionar métodos de entrega y consultar el estado de sus compras.

Además, dispone de un área administrativa para la gestión de productos, usuarios, pedidos, pagos, stock y demás funcionalidades internas de la plataforma.

---

# 2. Acceso al sistema

Para utilizar TECNO3D, el usuario debe ingresar a la plataforma desde un navegador web compatible.

La pantalla inicial permite acceder al catálogo de productos y a las funcionalidades disponibles para clientes.

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

---

# 3. Inicio de sesión

El usuario debe ingresar sus credenciales registradas.

Una vez autenticado, el sistema identifica automáticamente el rol correspondiente y habilita las funcionalidades disponibles para dicho usuario.

Los roles definidos en TECNO3D son:

* `CUSTOMER`
* `EMPLOYEE`
* `ADMIN`

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

El usuario puede utilizar las herramientas de búsqueda y filtrado para encontrar productos específicos.

---

# 5. Búsqueda de productos

El sistema permite buscar productos mediante texto.

La búsqueda contempla diferentes términos relacionados y variantes de determinados productos para facilitar la localización.

Por ejemplo, búsquedas como:

* Mouse.
* Maus.
* Notebook.
* Laptop.
* Impresora.
* Impresora 3D.
* Filamento.
* Resina.
* Monitor.
* Accesorios.

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

Esto permite al usuario reducir los resultados y encontrar rápidamente el producto deseado.

---

# 7. Detalle del producto

Al seleccionar un producto, el usuario puede acceder a su información detallada.

La vista del producto permite consultar sus características, imágenes, precio, disponibilidad y valoraciones.

También puede agregarse el producto al carrito o utilizar las funcionalidades disponibles para favoritos.

---

# 8. Carrito de compras

El carrito permite administrar los productos que el usuario desea comprar.

El usuario puede:

* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Consultar subtotales.
* Consultar el total de la compra.

El sistema mantiene una relación entre el carrito y el usuario autenticado.

---

# 9. Checkout

Una vez finalizada la selección de productos, el usuario puede iniciar el proceso de checkout.

Durante este proceso se validan:

* Productos seleccionados.
* Cantidades.
* Stock disponible.
* Método de entrega.
* Dirección de envío cuando corresponde.

El sistema calcula automáticamente el importe total del pedido.

---

# 10. Métodos de entrega

TECNO3D contempla dos métodos principales de entrega:

### Envío

El pedido requiere una dirección de entrega.

El usuario debe seleccionar una dirección previamente registrada.

### Retiro en local

El cliente puede seleccionar el retiro en el local.

En este caso no se utiliza una dirección de envío.

El sistema valida que cada método de entrega sea utilizado correctamente.

---

# 11. Direcciones

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

# 12. Pedidos

Una vez confirmado el checkout, el sistema genera un pedido.

Cada pedido contiene:

* Identificador.
* Usuario.
* Productos.
* Cantidades.
* Precio de cada producto.
* Total.
* Método de entrega.
* Dirección cuando corresponde.
* Estado.
* Información de envío cuando corresponde.
* Información de pago.

---

# 13. Estados de los pedidos

Los pedidos utilizan los siguientes estados:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

Las transiciones están controladas por el backend para evitar cambios de estado inválidos.

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

Un pedido también puede ser cancelado desde los estados permitidos por las reglas del sistema.

---

# 14. Pagos

Los pedidos pueden asociarse a un registro de pago.

Los métodos de pago soportados por el sistema son:

* Mercado Pago.
* PayPal.
* Efectivo.
* Transferencia bancaria.

Los estados de pago disponibles son:

```text
PENDING
PAID
FAILED
REFUNDED
```

El sistema relaciona cada pago con un pedido específico.

---

# 15. Preparación y envío

Antes de pasar un pedido a `PROCESSING`, el sistema verifica que el pago correspondiente se encuentre confirmado.

Para pasar un pedido de `PROCESSING` a `SHIPPED`, cuando el método seleccionado es envío, se requiere:

* Empresa de envío.
* Número de rastreo.

Estos datos quedan asociados al pedido.

---

# 16. Favoritos

Los usuarios autenticados pueden guardar productos como favoritos.

La funcionalidad permite:

* Agregar productos a favoritos.
* Consultar productos favoritos.
* Eliminar productos de favoritos.

Cada favorito pertenece a un usuario y a un producto.

---

# 17. Reseñas

Los clientes pueden valorar productos mediante reseñas.

Una reseña puede contener:

* Calificación.
* Comentario.
* Usuario.
* Producto.
* Fecha.

El sistema evita que un mismo usuario registre múltiples reseñas para el mismo producto.

---

# 18. Roles de usuario

TECNO3D utiliza tres niveles principales de acceso.

## CUSTOMER

Es el usuario final de la plataforma.

Puede:

* Consultar productos.
* Buscar y filtrar productos.
* Administrar el carrito.
* Crear pedidos.
* Administrar direcciones.
* Consultar sus pedidos.
* Consultar sus pagos.
* Gestionar favoritos.
* Realizar reseñas.

---

## EMPLOYEE

Dispone de permisos administrativos y operativos superiores a un cliente.

Puede acceder a funcionalidades relacionadas con:

* Gestión de pedidos.
* Actualización de estados.
* Gestión operativa definida por el sistema.
* Consulta de información administrativa autorizada.

---

## ADMIN

Es el nivel de mayor privilegio dentro de la plataforma.

Puede acceder a las funcionalidades administrativas y de gestión general del sistema.

Entre ellas:

* Gestión de usuarios.
* Gestión de productos.
* Gestión de categorías.
* Gestión de marcas.
* Gestión de pedidos.
* Gestión de pagos.
* Gestión de stock.
* Administración del dashboard.
* Gestión de banners.
* Administración general de la plataforma.

---

# 19. Dashboard administrativo

El dashboard proporciona una visión general del funcionamiento comercial de TECNO3D.

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

Las métricas son obtenidas desde la información almacenada en la base de datos PostgreSQL mediante Prisma.

---

# 20. Gestión de productos

Los usuarios autorizados pueden administrar el catálogo.

Las operaciones disponibles incluyen:

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

Los productos pueden tener múltiples imágenes.

Las imágenes pueden almacenarse mediante el sistema de almacenamiento configurado para la plataforma.

---

# 21. Gestión de categorías

Las categorías permiten organizar los productos del catálogo.

Cada categoría puede contener:

* Nombre.
* Slug.
* Imagen.
* Productos asociados.

La categorización facilita la navegación y búsqueda dentro del catálogo.

---

# 22. Gestión de marcas

Las marcas permiten asociar productos con su fabricante o marca correspondiente.

Cada marca puede contener:

* Nombre.
* Slug.
* Imagen.
* Productos asociados.

---

# 23. Gestión de stock

El stock representa la cantidad disponible de cada producto.

Durante la creación de pedidos el sistema verifica que exista stock suficiente.

Cuando corresponde, el stock puede disminuir según las cantidades adquiridas.

El dashboard administrativo también permite identificar productos con niveles bajos de stock.

---

# 24. Seguridad

TECNO3D utiliza mecanismos de seguridad para proteger el acceso a sus funcionalidades.

Entre ellos:

* Autenticación mediante JWT.
* Middleware de autenticación.
* Control de roles.
* Validación de permisos.
* Contraseñas almacenadas mediante hash.
* Validaciones en backend.
* Protección mediante Helmet.
* Configuración CORS.
* Validación de datos.
* Control de acceso a recursos asociados a usuarios.

Las funcionalidades administrativas no deben estar disponibles para usuarios sin los permisos correspondientes.

---

# 25. Recomendaciones de uso

Para utilizar correctamente la plataforma se recomienda:

1. Mantener actualizados los datos personales.
2. Verificar el stock antes de confirmar una compra.
3. Revisar la dirección de envío antes de confirmar el pedido.
4. Seleccionar correctamente el método de entrega.
5. Verificar los datos del pedido antes de finalizar la compra.
6. Conservar la información de rastreo cuando corresponda.
7. No compartir las credenciales de acceso.

---

# 26. Flujo general de compra

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
Seleccionar entrega
          ↓
Seleccionar dirección
          ↓
      Crear pedido
          ↓
       Realizar pago
          ↓
      Pago confirmado
          ↓
       Procesamiento
          ↓
        Envío
          ↓
       Entregado
```

Cuando el usuario selecciona retiro en local, el flujo de envío se adapta al método `PICKUP`.

---

# 27. Soporte y mantenimiento

La plataforma está diseñada siguiendo una arquitectura separada entre frontend y backend.

El frontend proporciona la interfaz de usuario y consume la API REST.

El backend administra:

* Autenticación.
* Autorización.
* Lógica de negocio.
* Validaciones.
* Persistencia.
* Pedidos.
* Pagos.
* Productos.
* Usuarios.

La información persistente se almacena en PostgreSQL mediante Prisma ORM.

---

# 28. Conclusión

TECNO3D integra las principales funcionalidades necesarias para una plataforma de comercio electrónico profesional.

El sistema permite administrar el ciclo completo de una compra, desde la consulta del catálogo hasta la entrega del pedido, manteniendo separación de responsabilidades, control de acceso, validaciones y persistencia de información.

La plataforma está preparada para continuar incorporando funcionalidades y mejoras sin alterar la arquitectura principal del sistema.
