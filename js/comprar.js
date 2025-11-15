// ===========================================
// CONFIGURACIÓN
// ===========================================
const API_URL = 'php/';

document.addEventListener('DOMContentLoaded', async function() {
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
    
    let carrito = [];
    let subtotal = 0;
    let envio = 0;
    let total = 0;
    let usuarioActual = null;
    
    await inicializarCompra();
    configurarEventos();
    
    // ===========================================
    // INICIALIZACIÓN
    // ===========================================
    
    async function inicializarCompra() {
        // Verificar usuario logueado
        usuarioActual = await obtenerUsuarioActual();
        
        if (!usuarioActual) {
            mostrarNotificacion('Debes iniciar sesión para continuar', true);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        // Cargar carrito desde el backend
        await cargarCarritoDesdeAPI();
        
        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío', true);
            setTimeout(() => {
                window.location.href = 'carrito.html';
            }, 2000);
            return;
        }
        
        mostrarResumenProductos();
        calcularTotales();
        cargarDatosUsuario();
    }
    
    // ===========================================
    // FUNCIONES DE API
    // ===========================================
    
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
    
    async function cargarCarritoDesdeAPI() {
        try {
            const response = await fetch(`${API_URL}carrito.php?id_usuario=${usuarioActual.id}`);
            const data = await response.json();
            
            if (data.success) {
                carrito = data.carrito.map(item => ({
                    id: item.id_producto,
                    nombre: item.nombre,
                    precio: parseFloat(item.precio),
                    imagen: item.imagen,
                    cantidad: parseInt(item.cantidad)
                }));
            }
        } catch (error) {
            console.error('Error cargando carrito:', error);
            carrito = [];
        }
    }
    
    async function crearPedido(datosCompra) {
        try {
            const response = await fetch(`${API_URL}pedidos.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosCompra)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creando pedido:', error);
            return {
                success: false,
                message: 'Error al conectar con el servidor'
            };
        }
    }
    
    // ===========================================
    // CONFIGURACIÓN DE EVENTOS
    // ===========================================
    
    function configurarEventos() {
        // Cambiar visibilidad de información de tarjeta
        if (metodoPagoSelect) {
            metodoPagoSelect.addEventListener('change', function() {
                if (this.value === 'tarjeta' || this.value === 'debito') {
                    infoTarjeta.style.display = 'block';
                } else {
                    infoTarjeta.style.display = 'none';
                }
            });
        }
        
        // Validar formulario al enviar
        if (formularioCompra) {
            formularioCompra.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validarFormulario()) {
                    finalizarCompra();
                }
            });
        }
        
        // Validar campos en tiempo real
        const camposRequeridos = formularioCompra.querySelectorAll('[required]');
        camposRequeridos.forEach(campo => {
            campo.addEventListener('blur', function() {
                validarCampo(this);
            });
        });
        
        // Formatear número de tarjeta
        const numeroTarjeta = document.getElementById('numero-tarjeta');
        if (numeroTarjeta) {
            numeroTarjeta.addEventListener('input', function(e) {
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
        
        // Formatear fecha de expiración
        const fechaExpiracion = document.getElementById('fecha-expiracion');
        if (fechaExpiracion) {
            fechaExpiracion.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    value = value.match(new RegExp('.{1,2}', 'g')).join('/');
                }
                e.target.value = value;
            });
        }
    }
    
    // ===========================================
    // MOSTRAR RESUMEN
    // ===========================================
    
    function mostrarResumenProductos() {
        if (!productosResumen) return;
        
        productosResumen.innerHTML = '';
        
        if (carrito.length === 0) {
            productosResumen.innerHTML = '<p class="text-center">No hay productos en el carrito</p>';
            return;
        }
        
        carrito.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-resumen';
            productoElement.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
                <div class="producto-resumen-info">
                    <h4>${producto.nombre}</h4>
                    <p>Cantidad: ${producto.cantidad} x $${producto.precio.toLocaleString('es-AR')}</p>
                </div>
                <div class="producto-resumen-total">
                    $${(producto.precio * producto.cantidad).toLocaleString('es-AR')}
                </div>
            `;
            productosResumen.appendChild(productoElement);
        });
    }
    
    function calcularTotales() {
        subtotal = carrito.reduce((sum, producto) => {
            return sum + (producto.precio * producto.cantidad);
        }, 0);
        
        envio = subtotal > 5000 ? 0 : 500;
        total = subtotal + envio;
        
        if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
        if (resumenEnvio) resumenEnvio.textContent = envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-AR')}`;
        if (resumenTotal) resumenTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    }
    
    function cargarDatosUsuario() {
        if (usuarioActual) {
            const emailInput = document.getElementById('email');
            if (emailInput && usuarioActual.email) {
                emailInput.value = usuarioActual.email;
            }
            
            if (usuarioActual.nombre_completo) {
                const nombres = usuarioActual.nombre_completo.split(' ');
                const nombreInput = document.getElementById('nombre');
                const apellidoInput = document.getElementById('apellido');
                
                if (nombreInput) nombreInput.value = nombres[0] || '';
                if (apellidoInput && nombres.length > 1) {
                    apellidoInput.value = nombres.slice(1).join(' ');
                }
            }
        }
    }
    
    // ===========================================
    // VALIDACIONES
    // ===========================================
    
    function validarFormulario() {
        let isValid = true;
        resetErrors();
        
        const camposRequeridos = formularioCompra.querySelectorAll('[required]');
        camposRequeridos.forEach(campo => {
            if (!validarCampo(campo)) {
                isValid = false;
            }
        });
        
        if (metodoPagoSelect.value === 'tarjeta' || metodoPagoSelect.value === 'debito') {
            if (!validarInfoTarjeta()) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validarCampo(campo) {
        const value = campo.value.trim();
        
        if (!value && campo.hasAttribute('required')) {
            mostrarError(campo, 'Este campo es obligatorio');
            return false;
        }
        
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
        
        switch (campo.id) {
            case 'numero-tarjeta':
                if (infoTarjeta.style.display !== 'none' && !isValidCardNumber(value)) {
                    mostrarError(campo, 'Número de tarjeta inválido');
                    return false;
                }
                break;
                
            case 'fecha-expiracion':
                if (infoTarjeta.style.display !== 'none' && !isValidExpiryDate(value)) {
                    mostrarError(campo, 'Fecha de expiración inválida');
                    return false;
                }
                break;
                
            case 'cvv':
                if (infoTarjeta.style.display !== 'none' && !isValidCVV(value)) {
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
        
        const camposTarjeta = ['numero-tarjeta', 'fecha-expiracion', 'cvv', 'nombre-tarjeta'];
        
        camposTarjeta.forEach(id => {
            const campo = document.getElementById(id);
            if (campo && !validarCampo(campo)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // ===========================================
    // FINALIZAR COMPRA
    // ===========================================
    
    async function finalizarCompra() {
        if (!btnFinalizarCompra) return;
        
        btnFinalizarCompra.disabled = true;
        btnFinalizarCompra.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        // Preparar datos de la compra
        const datosCompra = {
            id_usuario: usuarioActual.id,
            productos: carrito,
            nombre_cliente: document.getElementById('nombre').value.trim(),
            apellido_cliente: document.getElementById('apellido').value.trim(),
            email_cliente: document.getElementById('email').value.trim(),
            telefono_cliente: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            ciudad: document.getElementById('ciudad').value.trim(),
            codigo_postal: document.getElementById('codigo-postal').value.trim(),
            pais: document.getElementById('pais').value,
            metodo_pago: document.getElementById('metodo-pago').value,
            subtotal: subtotal,
            envio: envio,
            total: total
        };
        
        // Enviar pedido al backend
        const resultado = await crearPedido(datosCompra);
        
        if (resultado.success) {
            mostrarModalConfirmacion(resultado.pedido);
        } else {
            mostrarNotificacion(resultado.message || 'Error al procesar el pedido', true);
            btnFinalizarCompra.disabled = false;
            btnFinalizarCompra.innerHTML = '<img src="imagenes/iconos/check2.png" alt="Listo" class="icono-comprar"> Finalizar Compra';
        }
    }
    
    function mostrarModalConfirmacion(pedido) {
        const modalMensaje = document.getElementById('modal-mensaje');
        if (modalMensaje) {
            modalMensaje.textContent = `Tu pedido #${pedido.numero_pedido} ha sido procesado correctamente. Total: $${pedido.total.toLocaleString('es-AR')}`;
        }
        
        if (modalConfirmacion) {
            modalConfirmacion.style.display = 'flex';
        }
    }
    
    // ===========================================
    // FUNCIONES DE UTILIDAD
    // ===========================================
    
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
});