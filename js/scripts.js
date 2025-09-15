// scripts.js - Funcionalidad general del sitio (sin el código del carrito)

// Productos disponibles con categorías
const productos = [
    { id: 1, nombre: "Arduino Uno R3", precio: 10000, imagen: "imagenes/PlacaUNO-R3.jpg", categoria: "placas" },
    { id: 2, nombre: "Servo motor MG995 180 grados", precio: 3000, imagen: "imagenes/Servomotor-MG995-180grados.jpg", categoria: "actuadores" },
    { id: 3, nombre: "Módulo Bluetooth HC-05", precio: 2500, imagen: "imagenes/MóduloBluetooth_HC-05.jpg", categoria: "modulos" },
    { id: 4, nombre: "Arduino Mega 2560", precio: 15000, imagen: "imagenes/PlacaMega-Compatible-2560R3.jpg", categoria: "placas" },
    { id: 5, nombre: "Sensor Ultrasonido", precio: 2000, imagen: "imagenes/sensor-ultrasonido.jpg", categoria: "sensores" },/*Buscar imagen*/
    { id: 6, nombre: "Pack de LEDs", precio: 1500, imagen: "imagenes/leds.jpg", categoria: "accesorios" },/*Buscar imagen*/
    { id: 7, nombre: "Pantalla LCD", precio: 5000, imagen: "imagenes/DisplayLCD-azul-1602.jpg", categoria: "modulos" },
    { id: 8, nombre: "Cables Dupont H-H 40 und", precio: 1000, imagen: "imagenes/CablesDupont_H-H40und.jpg", categoria: "accesorios" },
    { id: 9, nombre: "Cables Dupont M-H 40 und", precio: 1500, imagen: "imagenes/Cables DupontM-H40_und.jpg", categoria: "accesorios" },
    { id: 10, nombre: "Cables Dupont M-M 40 und", precio: 2000, imagen: "imagenes/CablesDupontM-M_40und.jpg", categoria: "accesorios" },
    { id: 11, nombre: "Arduino Nano", precio: 8000, imagen: "imagenes/PlacaNano.jpg", categoria: "placas" }
];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos por categoría si estamos en una página de listado
    if (document.querySelector('.productos-grid') || document.querySelector('.tabla-productos')) {
        const categoria = obtenerCategoriaDeURL();
        cargarProductosPorCategoria(categoria);
    }
    
    // Configurar menú hamburguesa para móviles
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Configurar filtros de categoría
    setupFiltrosCategoria();
    
    // Configurar dropdown para móviles
    setupMobileDropdown();
    
    // Configurar botón "Ver Productos"
    setupVerProductosBtn();
    
    // Configurar botones "Agregar al Carrito" en la página de inicio
    setupBotonesAgregarCarrito();
});

// Función para cargar productos por categoría
function cargarProductosPorCategoria(categoria) {
    const productosGrid = document.querySelector('.productos-grid');
    const productosTabla = document.querySelector('.tabla-productos tbody');
    
    let productosFiltrados = productos;
    
    // Filtrar por categoría si se especifica
    if (categoria && categoria !== 'todos') {
        productosFiltrados = productos.filter(producto => producto.categoria === categoria);
    }
    
    // Cargar en grid (listado_box.html)
    if (productosGrid) {
        productosGrid.innerHTML = '';
        
        productosFiltrados.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto';
            productoElement.setAttribute('data-categoria', producto.categoria);
            productoElement.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${obtenerDescripcionCorta(producto.nombre)}</p>
                <p class="precio">$${producto.precio}</p>
                <button class="btn btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
            `;
            productosGrid.appendChild(productoElement);
        });
        
        // Configurar botones "Agregar al Carrito"
        setupBotonesAgregarCarrito();
    }
    
    // Cargar en tabla (listado_tabla.html)
    if (productosTabla) {
        productosTabla.innerHTML = '';
        
        productosFiltrados.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><img src="${producto.imagen}" alt="${producto.nombre}"></td>
                <td>${producto.nombre}</td>
                <td>${obtenerDescripcionLarga(producto.nombre)}</td>
                <td>$${producto.precio}</td>
            `;
            productosTabla.appendChild(fila);
        });
    }
}

// Configurar botones "Agregar al Carrito"
function setupBotonesAgregarCarrito() {
    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            agregarAlCarrito(id);
        });
    });
}

// Función para agregar producto al carrito
function agregarAlCarrito(id) {
    // Buscar el producto en la lista de productos disponibles
    const producto = productos.find(p => p.id === id);
    
    if (producto) {
        // Cargar carrito actual
        let carrito = [];
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
        
        // Verificar si el producto ya está en el carrito
        const productoExistente = carrito.findIndex(p => p.id === id);
        
        if (productoExistente !== -1) {
            // Si ya existe, aumentar la cantidad
            carrito[productoExistente].cantidad++;
        } else {
            // Si no existe, agregarlo al carrito
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }
        
        // Guardar carrito
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar contador
        actualizarContadorCarrito();
        
        // Mostrar notificación
        mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
    }
}

// Actualizar contador de carrito en el header
function actualizarContadorCarrito() {
    const contador = document.querySelector('.carrito-count');
    let carrito = [];
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    
    const totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);
    
    if (contador) {
        if (totalItems > 0) {
            contador.textContent = totalItems;
            contador.style.display = 'inline-block';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, esError = false) {
    // Eliminar notificación existente si hay una
    const notificacionExistente = document.querySelector('.notificacion');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${esError ? 'error' : ''}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Mostrar notificación
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    // Ocultar y eliminar notificación después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// Resto de funciones auxiliares (se mantienen igual)
function obtenerDescripcionCorta(nombreProducto) {
    const descripciones = {
        "Arduino Uno R3": "Placa de desarrollo con microcontrolador ATmega328P",
        "Servo motor MG995 180 grados": "Servomotor de alta calidad con torque de 10kg/cm",
        "Módulo Bluetooth HC-05": "Módulo Bluetooth para comunicación serial",
        "Arduino Mega 2560": "Placa con más pines y memoria que Arduino Uno",
        "Sensor Ultrasonido": "Sensor de distancia por ultrasonido HC-SR04",
        "Pack de LEDs": "Set de 50 LEDs de diferentes colores",
        "Pantalla LCD": "Pantalla LCD 16x2 con interfaz I2C",
        "Cables Dupont H-H 40 und": "Cables hembra-hembra para prototipado",
        "Cables Dupont M-H 40 und": "Cables macho-hembra para conexiones",
        "Cables Dupont M-M 40 und": "Cables macho-macho para breadboard",
        "Arduino Nano": "Versión compacta del Arduino UNO"
    };
    
    return descripciones[nombreProducto] || "Producto de calidad para tus proyectos Arduino";
}

function obtenerDescripcionLarga(nombreProducto) {
    const descripciones = {
        "Arduino Uno R3": "Placa de desarrollo original Arduino Uno Rev3 con microcontrolador ATmega328P, ideal para principiantes y proyectos avanzados.",
        "Servo motor MG995 180 grados": "Servomotor de alta calidad con torque de 10kg/cm, perfecto para proyectos de robótica y automatización.",
        "Módulo Bluetooth HC-05": "Módulo Bluetooth para comunicación serial, permite conectar dispositivos Arduino con smartphones y otros dispositivos Bluetooth.",
    };
    
    return descripciones[nombreProducto] || obtenerDescripcionCorta(nombreProducto);
}

function obtenerCategoriaDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria');
}

function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}

function setupFiltrosCategoria() {
    // Implementación según sea necesario
}

function setupMobileDropdown() {
    // Implementación según sea necesario
}

function setupVerProductosBtn() {
    const verProductosBtn = document.getElementById('ver-productos-btn');
    if (verProductosBtn) {
        verProductosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'listado_box.html';
        });


// Función para actualizar la interfaz según el estado de sesión
function actualizarEstadoSesion() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const loginBtn = document.getElementById('login-btn-item');
    const userMenu = document.getElementById('user-menu-item');
    const userName = document.getElementById('user-name-item');

    if (isLoggedIn === 'true' && username) {
        // Usuario logueado
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = username;
    } else {
        // Usuario no logueado
        if (loginBtn) loginBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    actualizarEstadoSesion();
    mostrarNotificacion('Sesión cerrada correctamente');
    
    // Redirigir a la página principal después de cerrar sesión
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

/// Configurar evento para el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }

    // Actualizar estado de sesión al cargar la página
    actualizarEstadoSesion();
    }
}



/*// Función para el botón "Ver Productos"
function setupVerProductosBtn() {
    const verProductosBtn = document.getElementById('ver-productos-btn');
    
    if (verProductosBtn) {
        verProductosBtn.addEventListener('click', (e) => {
            e.preventDefault();
             // Redirigir a la página listado_box.html
            window.location.href = 'listado_box.html';
        });
    }
}

// Actualizar la inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Código anterior...
    
    // Nuevas funciones
    setupMobileDropdown();
    setupVerProductosBtn();
    
    // Configurar menú hamburguesa para móviles
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const nav = document.querySelector('nav ul');
            nav.classList.toggle('active');
        });
    }
});*/