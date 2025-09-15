// comprar.js - Funcionalidad para la página de compra
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const formularioCompra = document.getElementById('formulario-compra');
    const metodoPagoSelect = document.getElementById('metodo-pago');
    const infoTarjeta = document.getElementById('info-tarjeta');
    const productosResumen = document.getElementById('productos-resumen');
    const resumenSubtotal = document.getElementById('resumen-subtotal');
    const resumenEnvio = document.getElementById('resumen-envio');
    const resumenTotal = document.getElementById('resumen-total');
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    
    // Variables
    let carrito = [];
    let subtotal = 0;
    let envio = 0;
    let total = 0;
    
    // Inicializar
    inicializarCompra();
    configurarEventos();
    
    function inicializarCompra() {
        // Cargar carrito desde localStorage
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            mostrarResumenProductos();
            calcularTotales();
        } else {
            // Si no hay carrito, redirigir
            window.location.href = 'carrito.html';
        }
        
        // Verificar si el usuario está logueado
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = 'login.html';
        } else {
            // Cargar datos del usuario si existen
            cargarDatosUsuario();
        }
    }
    
    function configurarEventos() {
        // Cambiar visibilidad de información de tarjeta según método de pago
        metodoPagoSelect.addEventListener('change', function() {
            if (this.value === 'tarjeta' || this.value === 'debito') {
                infoTarjeta.style.display = 'block';
            } else {
                infoTarjeta.style.display = 'none';
            }
        });
        
        // Validar formulario al enviar
        formularioCompra.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validarFormulario()) {
                finalizarCompra();
            }
        });
        
        // Validar campos en tiempo real
        const camposRequeridos = formularioCompra.querySelectorAll('[required]');
        camposRequeridos.forEach(campo => {
            campo.addEventListener('blur', function() {
                validarCampo(this);
            });
        });
        
        // Validar formato de tarjeta
        const numeroTarjeta = document.getElementById('numero-tarjeta');
        if (numeroTarjeta) {
            numeroTarjeta.addEventListener('input', function(e) {
                // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = '';
                
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                    }
                    formattedValue += value[i];
                }
                
                e.target.value = formattedValue;
            });
        }
        
        // Validar fecha de expiración
        const fechaExpiracion = document.getElementById('fecha-expiracion');
        if (fechaExpiracion) {
            fechaExpiracion.addEventListener('input', function(e) {
                // Formatear fecha (MM/AA)
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    value = value.match(new RegExp('.{1,2}', 'g')).join('/');
                }
                e.target.value = value;
            });
        }
    }
    
    function mostrarResumenProductos() {
        productosResumen.innerHTML = '';
        
        if (carrito.length === 0) {
            productosResumen.innerHTML = '<p class="text-center">No hay productos en el carrito</p>';
            return;
        }
        
        carrito.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-resumen';
            productoElement.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="producto-resumen-info">
                    <h4>${producto.nombre}</h4>
                    <p>Cantidad: ${producto.cantidad} x $${producto.precio}</p>
                </div>
                <div class="producto-resumen-total">
                    $${producto.precio * producto.cantidad}
                </div>
            `;
            productosResumen.appendChild(productoElement);
        });
    }
    
    function calcularTotales() {
        // Calcular subtotal
        subtotal = carrito.reduce((sum, producto) => {
            return sum + (producto.precio * producto.cantidad);
        }, 0);
        
        // Calcular envío (gratis sobre $5000, sino $500)
        envio = subtotal > 5000 ? 0 : 500;
        
        // Calcular total
        total = subtotal + envio;
        
        // Actualizar UI
        resumenSubtotal.textContent = `$${subtotal}`;
        resumenEnvio.textContent = envio === 0 ? 'Gratis' : `$${envio}`;
        resumenTotal.textContent = `$${total}`;
    }
    
    function cargarDatosUsuario() {
        const username = localStorage.getItem('username');
        if (username) {
            // Intentar cargar datos del usuario si existen
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username);
            
            if (user) {
                // Rellenar campos con datos del usuario
                document.getElementById('email').value = user.email || '';
                
                if (user.fullname) {
                    const names = user.fullname.split(' ');
                    document.getElementById('nombre').value = names[0] || '';
                    if (names.length > 1) {
                        document.getElementById('apellido').value = names.slice(1).join(' ');
                    }
                }
            }
        }
    }
    
    function validarFormulario() {
        let isValid = true;
        resetErrors();
        
        // Validar campos requeridos
        const camposRequeridos = formularioCompra.querySelectorAll('[required]');
        camposRequeridos.forEach(campo => {
            if (!validarCampo(campo)) {
                isValid = false;
            }
        });
        
        // Validar información de tarjeta si es necesario
        if (metodoPagoSelect.value === 'tarjeta' || metodoPagoSelect.value === 'debito') {
            if (!validarInfoTarjeta()) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validarCampo(campo) {
        const value = campo.value.trim();
        const errorElement = document.getElementById(`${campo.id}-error`);
        
        if (!value) {
            mostrarError(campo, 'Este campo es obligatorio');
            return false;
        }
        
        // Validaciones específicas por tipo de campo
        switch (campo.type) {
            case 'email':
                if (!isValidEmail(value)) {
                    mostrarError(campo, 'Ingresa un correo electrónico válido');
                    return false;
                }
                break;
                
            case 'tel':
                if (!isValidPhone(value)) {
                    mostrarError(campo, 'Ingresa un número de teléfono válido');
                    return false;
                }
                break;
        }
        
        // Validaciones por ID
        switch (campo.id) {
            case 'numero-tarjeta':
                if (!isValidCardNumber(value)) {
                    mostrarError(campo, 'Número de tarjeta inválido');
                    return false;
                }
                break;
                
            case 'fecha-expiracion':
                if (!isValidExpiryDate(value)) {
                    mostrarError(campo, 'Fecha de expiración inválida');
                    return false;
                }
                break;
                
            case 'cvv':
                if (!isValidCVV(value)) {
                    mostrarError(campo, 'CVV inválido');
                    return false;
                }
                break;
        }
        
        resetError(campo);
        return true;
    }
    
    function validarInfoTarjeta() {
        let isValid = true;
        
        const camposTarjeta = [
            'numero-tarjeta',
            'fecha-expiracion',
            'cvv',
            'nombre-tarjeta'
        ];
        
        camposTarjeta.forEach(id => {
            const campo = document.getElementById(id);
            if (campo && !validarCampo(campo)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function finalizarCompra() {
        // Deshabilitar botón para evitar múltiples clics
        btnFinalizarCompra.disabled = true;
        btnFinalizarCompra.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        // Simular procesamiento de pago
        setTimeout(() => {
            // Crear objeto con información de la compra
            const compra = {
                fecha: new Date().toISOString(),
                productos: carrito,
                subtotal: subtotal,
                envio: envio,
                total: total,
                cliente: {
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    email: document.getElementById('email').value,
                    telefono: document.getElementById('telefono').value,
                    direccion: document.getElementById('direccion').value,
                    ciudad: document.getElementById('ciudad').value,
                    codigoPostal: document.getElementById('codigo-postal').value,
                    pais: document.getElementById('pais').value
                },
                pago: {
                    metodo: document.getElementById('metodo-pago').value
                }
            };
            
            // Guardar historial de compras
            guardarHistorialCompra(compra);
            
            // Vaciar carrito
            localStorage.removeItem('carrito');
            
            // Mostrar modal de confirmación
            mostrarModalConfirmacion(compra);
            
            // Restaurar botón
            btnFinalizarCompra.disabled = false;
            btnFinalizarCompra.innerHTML = '<i class="fas fa-check"></i> Finalizar Compra';
        }, 2000);
    }
    
    function guardarHistorialCompra(compra) {
        let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
        historial.push(compra);
        localStorage.setItem('historialCompras', JSON.stringify(historial));
    }
    
    function mostrarModalConfirmacion(compra) {
        const modalMensaje = document.getElementById('modal-mensaje');
        modalMensaje.textContent = `Tu pedido #${Math.floor(100000 + Math.random() * 900000)} ha sido procesado correctamente. Se envió un resumen a ${compra.cliente.email}.`;
        
        modalConfirmacion.style.display = 'flex';
    }
    
    // Funciones de utilidad
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function isValidPhone(phone) {
        const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
        return re.test(phone);
    }
    
    function isValidCardNumber(number) {
        const re = /^[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}$/;
        return re.test(number);
    }
    
    function isValidExpiryDate(date) {
        const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!re.test(date)) return false;
        
        const [month, year] = date.split('/');
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        if (parseInt(year) < currentYear) return false;
        if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
        
        return true;
    }
    
    function isValidCVV(cvv) {
        const re = /^[0-9]{3,4}$/;
        return re.test(cvv);
    }
    
    function mostrarError(campo, mensaje) {
        campo.classList.add('input-error');
        const errorElement = document.getElementById(`${campo.id}-error`);
        if (errorElement) {
            errorElement.textContent = mensaje;
            errorElement.classList.add('show');
        }
    }
    
    function resetError(campo) {
        campo.classList.remove('input-error');
        const errorElement = document.getElementById(`${campo.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('show');
        });
        
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
    }

    // Función para verificar si ya hay una sesión activa (MODIFICADA) NUECO
function checkExistingSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn && loginTime) {
        const currentTime = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (currentTime - loginTime > twentyFourHours) {
            // Sesión expirada
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('loginTime');
        } else {
            // Solo redirigir si NO estamos en la página de login
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        }
    }
}
});