// session.js - Manejo del estado de sesión del usuario
document.addEventListener('DOMContentLoaded', function() {

    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
    }
    // Actualizar contador en todas las páginas
    actualizarContadorCarritoGlobal();

    
// Función global para actualizar el contador
function actualizarContadorCarritoGlobal() {
    const carritoGuardado = localStorage.getItem('carrito');
    let totalItems = 0;
    
    if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);
    }
    
    const contadores = document.querySelectorAll('.carrito-count');
    contadores.forEach(contador => {
        if (totalItems > 0) {
            contador.textContent = totalItems;
            contador.style.display = 'inline-block';
        } else {
            contador.style.display = 'none';
        }
    });
}

    // Función para actualizar la interfaz según el estado de sesión
    function actualizarEstadoSesion() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('username');
        const loginBtn = document.getElementById('login-btn-item');
        const userMenu = document.getElementById('user-menu-item');
        const userName = document.getElementById('user-name');

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
        
        // Mostrar notificación
        mostrarNotificacion('Sesión cerrada correctamente');
        
        // Redirigir a la página principal después de cerrar sesión
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Función para mostrar notificaciones
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

    // Configurar evento para el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }

    // Actualizar estado de sesión al cargar la página
    actualizarEstadoSesion();

    // Cerrar menús dropdown al hacer clic fuera de ellos
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            const dropdowns = document.querySelectorAll('.user-menu .dropdown-menu');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });

    // Abrir/cerrar menú desplegable al hacer clic en el nombre de usuario
    const userMenu = document.getElementById('user-menu-item');
    if (userMenu) {
        const userMenuLink = userMenu.querySelector('a');
        userMenuLink.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = userMenu.querySelector('.dropdown-menu');
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            } else {
                dropdown.style.display = 'block';
                
                // Cerrar otros dropdowns abiertos
                document.querySelectorAll('.dropdown-menu').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.style.display = 'none';
                    }
                });
            }
        });
    }
});