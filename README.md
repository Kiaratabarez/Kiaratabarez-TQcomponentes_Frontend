# TQComponents - Tienda de Componentes Arduino
 Demo en vivo: https://tqcomponents.netlify.app/

Es un Sistema de e-commerce desarrollado para la venta de componentes electrónicos Arduino, con gestión completa de usuarios, carrito de compras y proceso de checkout.

Descripción
TQComponents es una tienda online especializada en componentes Arduino que ofrece una experiencia de compra completa, desde la navegación de productos hasta la finalización de la compra. El proyecto está desarrollado con tecnologías web estándar sin el uso de frameworks externos.

### Características Principales

  ### Sistema de Usuarios
  
    - Registro e inicio de sesión con validación de datos
    - Persistencia de sesión mediante localStorage
    - Validación de contraseñas con indicador de fortaleza
    - Opción "Recordarme" para facilitar el acceso
    - Protección de rutas: acceso restringido al carrito y checkout para usuarios autenticados
  ### Catálogo de Productos
  
    - 58 productos organizados en 5 categorías:
      - Placas Arduino
      - Sensores
      - Módulos
      - Actuadores
      - Accesorios
    - Dos vistas de productos:
      - Vista en grid (tarjetas)
      - Vista en tabla con filtros
    - Filtrado por categoría mediante URL params
    - Sistema de navegación intuitivo con menú dropdown
  ### Carrito de Compras
  
    - Gestión completa del carrito con localStorage
    - Contador dinámico de productos en el header
    - Modificación de cantidades (aumentar/disminuir)
    - Eliminación de productos individual o total
    - Cálculo automático de subtotal, envío y total
    - Envío gratis para compras superiores a $5000
    - Validación de sesión antes de finalizar compra
  ### Proceso de Checkout
    - Formulario completo con validación en tiempo real:
      - Información personal
      - Dirección de envío
      - Método de pago (tarjeta, débito, PayPal, transferencia)
    - Validaciones específicas:
      - Formato de email y teléfono
      - Número de tarjeta con formato automático (XXXX XXXX XXXX XXXX)
      - Fecha de expiración (MM/AA)
      - CVV de 3-4 dígitos
    - Resumen de pedido en tiempo real
    - Modal de confirmación al finalizar compra
    - Historial de compras guardado en localStorage

### Interfaz de Usuario

  - *Diseño responsive* adaptado a móviles, tablets y desktop
  - *Navegación consistente* en todas las páginas
  - *Botón "Volver"* contextual (oculto en index)
  - *Notificaciones visuales* para acciones del usuario
  - *Menú hamburguesa* para dispositivos móviles
  - *Efectos hover* y transiciones suaves

### Tecnologías Utilizadas

  - *HTML5*: Estructura semántica
  - *CSS3*: Estilos personalizados con variables CSS
  - *JavaScript Vanilla*: Lógica de negocio sin frameworks
  - *LocalStorage*: Persistencia de datos del lado del cliente
  - *Google Fonts (Poppins)*: Tipografía
  - *Netlify*: Hosting y despliegue continuo

### Estructura del Proyecto
  ```
  TQComponents/
  │
  ├── index.html              # Página principal con productos destacados
  ├── listado_box.html        # Vista de productos en grid
  ├── listado_tabla.html      # Vista de productos en tabla
  ├── carrito.html            # Página del carrito de compras
  ├── comprar.html            # Checkout y finalización de compra
  ├── login.html              # Autenticación de usuarios
  │
  ├── css/
  │   ├── styles.css          # Estilos globales
  │   ├── carrito.css         # Estilos específicos del carrito
  │   ├── comprar.css         # Estilos del checkout
  │   └── login.css           # Estilos de autenticación
  │
  ├── js/
  │   ├── scripts.js          # Lógica principal y catálogo de productos
  │   ├── carrito.js          # Gestión del carrito
  │   ├── comprar.js          # Proceso de checkout
  │   ├── login.js            # Sistema de autenticación
  │   └── catalogo.js         # Filtros de productos (tabla)
  │
  └── imagenes/
      ├── Placas/             # Imágenes de placas Arduino
      ├── Sensores/           # Imágenes de sensores
      ├── Modulos/            # Imágenes de módulos
      ├── Actuadores/         # Imágenes de actuadores
      ├── Accesorios/         # Imágenes de accesorios
      └── iconos/             # Iconos del sitio
  ```

### Almacenamiento de Datos

  El proyecto utiliza *localStorage* para persistir:
  - `users`: Array de usuarios registrados
  - `isLoggedIn`: Estado de sesión activa
  - `username`: Usuario actual
  - `loginTime`: Timestamp del último login
  - `carrito`: Productos en el carrito
  - `historialCompras`: Registro de compras realizadas
  - `rememberedUsername/Password`: Datos para función "Recordarme"

### Seguridad 

  - Validación de formularios en el cliente
  - Protección de rutas sensibles (carrito/checkout)
  - Sesiones con expiración de 24 horas
  - Contraseñas almacenadas en localStorage 

### Responsive Design

  El sitio está optimizado para:
  - *Móviles*: < 480px
  - *Tablets*: 481px - 768px
  - *Desktop*: > 769px
  Características responsive:
  - Menú hamburguesa en móviles
  - Grid adaptativo de productos
  - Tablas convertidas en cards en móviles
  - Formularios de una columna en pantallas pequeñas

### Funcionalidades Destacadas

  Sistema Anti-doble Click: Implementado en `agregarAlCarrito()` para evitar duplicados accidentales al agregar productos.
  Normalización de Imágenes: Limpieza automática de nombres de archivos para compatibilidad con diferentes sistemas operativos.
  Validación Inteligente:
  - Verificación de disponibilidad de username/email en tiempo real
  - Validación de fecha de expiración contra fecha actual
  - Formato automático de campos (tarjeta, fecha, teléfono)

### Mejoras Futuras
Implementar backend con base de datos
Panel de administración
Gestión de stock
Recuperación de contraseña

### Autor Tabarez Kiara
Desarrollado como proyecto académico para la materia de Paradigmas y Lenguajes de Programación III
