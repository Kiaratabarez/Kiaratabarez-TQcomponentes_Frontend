// ===========================================
// CONFIGURACIÓN DE LA API
// ===========================================
const API_URL = 'php/'; // Ajusta según tu estructura de carpetas

// Variable global para productos (se carga desde BD)
let productos = [];

// ===========================================
// FUNCIONES DE API
// ===========================================

/**
 * Cargar productos desde el backend
 */
async function cargarProductosDesdeAPI(filtros = {}) {
    try {
        let url = `${API_URL}productos.php`;
        const params = new URLSearchParams();
        
        // Agregar filtros si existen
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.destacado !== undefined) params.append('destacado', filtros.destacado);
        if (filtros.search) params.append('search', filtros.search);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        
        if (data.success) {
            productos = data.productos || [];
            return productos;
        } else {
            console.error('Error en la respuesta:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos. Mostrando productos de respaldo.', true);
        // FALLBACK: Devolver productos hardcoded si la API falla
        return obtenerProductosDeRespaldo();
    }
}

/**
 * PRODUCTOS DE RESPALDO (hardcoded) - SE USA SI LA API FALLA
 */
function obtenerProductosDeRespaldo() {
    return [
        {
            id_producto: 1,
            nombre: 'Arduino Uno R3',
            descripcion: 'Placa de desarrollo original Arduino Uno Rev3',
            precio: 36003,
            imagen: 'imagenes/Placas/PlacaUNO-R3.jpg',
            id_categoria: 1,
            nombre_categoria: 'Placas',
            stock: 50,
            destacado: true
        },
        {
            id_producto: 2,
            nombre: 'Arduino Mega 2560',
            descripcion: 'Placa con más memoria y pines',
            precio: 15000,
            imagen: 'imagenes/Placas/Arduino-mega2560.jpg',
            id_categoria: 1,
            nombre_categoria: 'Placas',
            stock: 30,
            destacado: true
        },
        {
            id_producto: 3,
            nombre: 'Arduino Nano',
            descripcion: 'Versión compacta del UNO',
            precio: 8000,
            imagen: 'imagenes/Placas/PlacaNano.jpg',
            id_categoria: 1,
            nombre_categoria: 'Placas',
            stock: 75,
            destacado: true
        },
        {
            id_producto: 16,
            nombre: 'Servo Motor MG995 180°',
            descripcion: 'Servomotor de alta calidad con torque de 10kg/cm',
            precio: 8509,
            imagen: 'imagenes/Actuadores/Servomotor-MG995-180grados.jpg',
            id_categoria: 4,
            nombre_categoria: 'Actuadores',
            stock: 80,
            destacado: true
        },
        {
            id_producto: 20,
            nombre: 'Módulo Bluetooth HC-05',
            descripcion: 'Módulo Bluetooth para comunicación serial',
            precio: 2500,
            imagen: 'imagenes/Modulos/ModuloBluetooth_HC-05.jpg',
            id_categoria: 3,
            nombre_categoria: 'Módulos',
            stock: 100,
            destacado: true
        },
        {
            id_producto: 29,
            nombre: 'Sensor Ultrasonido HC-SR04',
            descripcion: 'Mide distancias mediante ultrasonido',
            precio: 2000,
            imagen: 'imagenes/Sensores/sensordistanciaUltrasonico-HcSr04.png',
            id_categoria: 2,
            nombre_categoria: 'Sensores',
            stock: 120,
            destacado: true
        }
    ];
}

/**
 * Obtener usuario actual de la sesión
 */
async function obtenerUsuarioActual() {
    try {
        const response = await fetch(`${API_URL}login.php?action=check_session`);
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error verificando sesión:', error);
        return null;
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando TQComponents...');
    
    // Limpiar parámetros de URL si viene desde login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Verificar sesión del usuario
    const usuario = await obtenerUsuarioActual();
    
    // Actualizar estado de sesión en el header
    actualizarEstadoSesion(usuario);
    
    // Verificar en qué página estamos
    const paginaActual = window.location.pathname.split("/").pop();
    
    // Cargar productos según la página
    if (paginaActual === "" || paginaActual === "index.html") {
        console.log('📄 Página: Index - Cargando productos destacados...');
        // Página de inicio - Cargar productos destacados en carousel
        await cargarProductosDestacadosCarousel();
    } else if (document.querySelector('.productos-grid')) {
        console.log('📄 Página: Productos - Cargando catálogo...');
        // Página de productos - Cargar productos con filtro
        const categoria = obtenerCategoriaDeURL();
        await cargarProductosPorCategoria(categoria || "todos");
    }

    setupFiltrosCategoria();
    setupMobileDropdown();
    setupVerProductosBtn();
    
    // Actualizar contador del carrito
    if (usuario) {
        await actualizarContadorCarritoDesdeAPI(usuario.id);
    } else {
        actualizarContadorCarrito(); // Usar localStorage como fallback
    }
    
    console.log('✅ Inicialización completa');
});

// ===========================================
// FUNCIONES DE PRODUCTOS
// ===========================================

/**
 * Cargar productos por categoría
 */
async function cargarProductosPorCategoria(categoria) {
    const productosGrid = document.querySelector('.productos-grid');
    
    if (!productosGrid) {
        console.log('⚠️ No se encontró .productos-grid');
        return;
    }
    
    // Mostrar loading
    productosGrid.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">Cargando productos...</p>';
    
    // Cargar productos desde API
    let filtros = {};
    if (categoria && categoria !== 'todos') {
        filtros.categoria = categoria;
    }
    
    console.log('🔍 Cargando productos con filtros:', filtros);
    const productosCargados = await cargarProductosDesdeAPI(filtros);
    console.log('📦 Productos cargados:', productosCargados.length);
    
    // MOSTRAR EN GRID (listado_box.html)
    productosGrid.innerHTML = '';
    
    if (productosCargados.length === 0) {
        productosGrid.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No hay productos en esta categoría</p>';
        return;
    }
    
    productosCargados.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.className = 'producto';
        productoElement.setAttribute('data-categoria', producto.nombre_categoria?.toLowerCase() || '');
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion || 'Producto de calidad para tus proyectos'}</p>
            <p class="precio">$${parseFloat(producto.precio).toLocaleString('es-AR')}</p>
            <button class="btn btn-agregar" data-id="${producto.id_producto}">Agregar al Carrito</button>
        `;
        productosGrid.appendChild(productoElement);
    });
    
    setupBotonesAgregarCarrito();
}

/**
 * Cargar productos destacados en carousel (página inicio)
 */
async function cargarProductosDestacadosCarousel() {
    const carousel = $('.productos-carousel');
    
    if (!carousel.length) {
        console.log('⚠️ No se encontró .productos-carousel (¿jQuery cargado?)');
        return;
    }
    
    console.log('🎠 Inicializando carousel...');
    carousel.html('<p style="text-align:center;width:100%;padding:40px;">Cargando productos...</p>');
    
    // Cargar productos destacados desde API
    const productosDestacados = await cargarProductosDesdeAPI({ destacado: true });
    console.log('⭐ Productos destacados:', productosDestacados.length);
    
    carousel.html('');
    
    if (productosDestacados.length === 0) {
        carousel.html('<p style="text-align:center;width:100%;padding:40px;">No hay productos destacados</p>');
        return;
    }
    
    productosDestacados.forEach(producto => {
        const productoHTML = `
            <div class="producto-item">
                <div class="producto">
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion || 'Producto de calidad'}</p>
                    <p class="precio">$${parseFloat(producto.precio).toLocaleString('es-AR')}</p>
                    <button class="btn btn-agregar" data-id="${producto.id_producto}">Agregar al Carrito</button>
                </div>
            </div>
        `;
        
        carousel.append(productoHTML);
    });
    
    // Inicializar Owl Carousel
    console.log('🦉 Inicializando Owl Carousel...');
    carousel.owlCarousel({
        loop: true,
        margin: 25,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            900: { items: 3 },
            1200: { items: 4 }
        }
    });
    
    setupBotonesAgregarCarrito();
    console.log('✅ Carousel inicializado');
}

// ===========================================
// CARRITO - AGREGAR PRODUCTOS
// ===========================================

/**
 * Configurar botones de agregar al carrito
 */
function setupBotonesAgregarCarrito() {
    const botones = document.querySelectorAll('.btn-agregar');
    console.log('🛒 Configurando', botones.length, 'botones de carrito');
    
    botones.forEach(btn => {
        const nuevoBoton = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBoton, btn);

        nuevoBoton.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            await agregarAlCarrito(id);
        });
    });
}

/**
 * Agregar producto al carrito (conectado con backend)
 */
async function agregarAlCarrito(idProducto) {
    // Verificar si el usuario está logueado
    const usuario = await obtenerUsuarioActual();
    
    if (!usuario) {
        mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    try {
        // Agregar al carrito en el backend
        const response = await fetch(`${API_URL}carrito.php?action=agregar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuario.id,
                id_producto: idProducto,
                cantidad: 1
            })
        });

        const data = await response.json();

        if (data.success) {
            mostrarNotificacion(`"${data.producto}" agregado al carrito`);
            await actualizarContadorCarritoDesdeAPI(usuario.id);
        } else {
            mostrarNotificacion(data.message || 'Error al agregar al carrito', true);
        }
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        mostrarNotificacion('Error al agregar el producto', true);
    }
}

/**
 * Actualizar contador del carrito desde API
 */
async function actualizarContadorCarritoDesdeAPI(idUsuario) {
    try {
        const response = await fetch(`${API_URL}carrito.php?id_usuario=${idUsuario}`);
        const data = await response.json();
        
        if (data.success) {
            const totalItems = data.cantidad_items || 0;
            const contadores = document.querySelectorAll('.carrito-count');
            
            contadores.forEach(contador => {
                contador.textContent = totalItems;
                contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
            });
        }
    } catch (error) {
        console.error('Error actualizando contador:', error);
    }
}

/**
 * Actualizar contador del carrito desde localStorage (fallback)
 */
function actualizarContadorCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    let totalItems = 0;
    
    if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);
    }
    
    const contadores = document.querySelectorAll('.carrito-count');
    contadores.forEach(contador => {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    });
}

// ===========================================
// GESTIÓN DE SESIÓN
// ===========================================

/**
 * Actualizar estado de sesión en el header
 */
function actualizarEstadoSesion(usuario) {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;

    if (usuario) {
        // Usuario logueado
        loginBtn.innerHTML = `
            <div class="user-simple">
                <span class="user-name">¡Hola, ${usuario.username}!</span>
                <a href="#" id="cerrar-sesion" title="Cerrar sesión">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>
        `;

        const cerrarSesionBtn = document.getElementById('cerrar-sesion');
        if (cerrarSesionBtn) {
            cerrarSesionBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await cerrarSesion();
            });
        }
    } else {
        // Usuario no logueado
        loginBtn.innerHTML = '<a href="login.html">Login</a>';
    }
}

/**
 * Cerrar sesión
 */
async function cerrarSesion() {
    try {
        await fetch(`${API_URL}logout.php`, { method: 'POST' });
        mostrarNotificacion('Sesión cerrada correctamente');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        mostrarNotificacion('Error al cerrar sesión', true);
    }
}

// ===========================================
// UTILIDADES
// ===========================================

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, esError = false) {
    const notificacionExistente = document.querySelector('.notificacion');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${esError ? 'error' : ''}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

/**
 * Obtener categoría de la URL
 */
function obtenerCategoriaDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria');
}

function setupFiltrosCategoria() {
    // Implementar si es necesario
}

function setupMobileDropdown() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }
}

function setupVerProductosBtn() {
    const verProductosBtn = document.getElementById('ver-productos-btn');
    if (verProductosBtn) {
        verProductosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'listado_box.html';
        });
    }
}

// Botón Volver
document.addEventListener("DOMContentLoaded", () => {
    const botonVolver = document.querySelector(".btn-volver");
    const paginaActual = window.location.pathname.split("/").pop();
    if (botonVolver) {
        if (paginaActual === "" || paginaActual === "index.html") {
            botonVolver.style.display = "none";
        } else {
            botonVolver.style.display = "flex";
        }
    }
});

// Debug: Función para borrar usuarios (solo desarrollo)
window.borrarUsuarios = function() {
    localStorage.removeItem('users');
    console.log('Usuarios eliminados');
    location.reload();
}