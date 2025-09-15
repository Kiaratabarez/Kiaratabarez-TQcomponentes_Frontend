// Función para manejar el menú desplegable en móviles // NO TOCAR FUNCIONA
// scripts.js - Funcionalidad para TQComponents

// Carrito de compras
let carrito = [];
let total = 0;

// Productos disponibles
const productos = [
    { id: 1, nombre: "Arduino Uno R3", precio: 10000, imagen: "imagenes/arduino-uno.jpg" },
    { id: 2, nombre: "Servo motor MG995 180 grados", precio: 3000, imagen: "imagenes/servo-motor.jpg" },
    { id: 3, nombre: "Módulo Bluetooth HC-05", precio: 2500, imagen: "imagenes/modulo-bluetooth.jpg" },
    { id: 4, nombre: "Arduino Mega 2560", precio: 15000, imagen: "imagenes/arduino-mega.jpg" },
    { id: 5, nombre: "Sensor Ultrasonido", precio: 2000, imagen: "imagenes/sensor-ultrasonido.jpg" },
    { id: 6, nombre: "Pack de LEDs", precio: 1500, imagen: "imagenes/leds.jpg" },
    { id: 7, nombre: "Pantalla LCD", precio: 5000, imagen: "imagenes/pantalla-lcd.jpg" }
];

// Función para agregar productos al carrito
function agregarAlCarrito(id, cantidad = 1) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        const existe = carrito.find(item => item.id === id);
        if (existe) {
            existe.cantidad += cantidad;
        } else {
            carrito.push({ ...producto, cantidad });
        }
        actualizarCarrito();
        guardarCarrito();
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
    guardarCarrito();
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    const carritoItems = document.getElementById('carrito-items');
    const totalElement = document.getElementById('total');
    
    if (carritoItems && totalElement) {
        carritoItems.innerHTML = '';
        total = 0;
        
        carrito.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>$${item.precio}</td>
                <td>${item.cantidad}</td>
                <td>$${itemTotal}</td>
                <td><button class="btn-eliminar" data-id="${item.id}">Eliminar</button></td>
            `;
            carritoItems.appendChild(tr);
        });
        
        totalElement.textContent = `Total: $${total}`;
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                eliminarDelCarrito(id);
            });
        });
    }
}

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
    guardarCarrito();
    mostrarNotificacion('Carrito vaciado');
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación si no existe
    let notificacion = document.getElementById('notificacion');
    if (!notificacion) {
        notificacion = document.createElement('div');
        notificacion.id = 'notificacion';
        document.body.appendChild(notificacion);
    }
    
    notificacion.textContent = mensaje;
    notificacion.classList.add('mostrar');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 3000);
}

// Toggle del menú hamburguesa en móviles
function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}

// Validación del formulario de compra
function validarFormularioCompra(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const pago = document.getElementById('pago').value;
    
    if (!nombre || !direccion || !telefono || !email || !pago) {
        alert('Por favor, complete todos los campos obligatorios.');
        return false;
    }
    
    if (carrito.length === 0) {
        alert('Debe agregar al menos un producto al carrito.');
        return false;
    }
    
    // Simular proceso de compra
    alert('¡Compra realizada con éxito! Será redirigido a la página de inicio.');
    vaciarCarrito();
    window.location.href = 'index.html';
    return true;
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito desde localStorage
    cargarCarrito();
    
    // Configurar evento para vaciar carrito
    const btnVaciar = document.getElementById('vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', vaciarCarrito);
    }
    
    // Configurar evento para formulario de compra
    const formCompra = document.querySelector('.form-compra');
    if (formCompra) {
        formCompra.addEventListener('submit', validarFormularioCompra);
    }
    
    // Configurar botones de agregar al carrito en páginas de productos
    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            agregarAlCarrito(id);
        });
    });
    
    // Configurar menú hamburguesa para móviles
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
});
function setupMobileDropdown() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
}

// Función para el botón "Ver Productos"
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
});
