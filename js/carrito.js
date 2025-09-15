// carrito.js - Funcionalidad específica para el carrito de compras

// Variables globales
let carrito = [];
let total = 0;

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito desde localStorage
    cargarCarrito();
    
    // Configurar evento para vaciar carrito
    const btnVaciar = document.getElementById('vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', mostrarModalVaciarCarrito);
    }
    
    // Configurar evento para finalizar compra
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarCompra);
    }
    
    // Actualizar interfaz
    actualizarInterfazCarrito();
});

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        calcularTotal();
    }
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Calcular el total del carrito
function calcularTotal() {
    total = carrito.reduce((sum, producto) => {
        return sum + (producto.precio * producto.cantidad);
    }, 0);
}

// Actualizar la interfaz del carrito
function actualizarInterfazCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const carritoProductos = document.getElementById('carrito-productos');
    const subtotalElement = document.getElementById('subtotal');
    const envioElement = document.getElementById('envio');
    const totalElement = document.getElementById('total-general');
    
    // Mostrar estado vacío o con productos
    if (carrito.length === 0) {
        carritoVacio.style.display = 'block';
        carritoContenido.style.display = 'none';
    } else {
        carritoVacio.style.display = 'none';
        carritoContenido.style.display = 'block';
        
        // Limpiar productos existentes
        carritoProductos.innerHTML = '';
        
        // Agregar productos al carrito
        carrito.forEach((producto, index) => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-carrito';
            productoElement.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p class="precio-unitario">$${producto.precio} c/u</p>
                    <div class="contador-cantidad">
                        <button class="disminuir" data-index="${index}">-</button>
                        <input type="number" value="${producto.cantidad}" min="1" data-index="${index}">
                        <button class="aumentar" data-index="${index}">+</button>
                    </div>
                    <p class="producto-total">Total: $${producto.precio * producto.cantidad}</p>
                </div>
                <button class="eliminar-producto" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            carritoProductos.appendChild(productoElement);
        });
        
        // Calcular envío (ejemplo: gratis sobre $5000, sino $500)
        const costoEnvio = total > 5000 ? 0 : 500;
        const totalConEnvio = total + costoEnvio;
        
        // Actualizar totales
        subtotalElement.textContent = `$${total}`;
        envioElement.textContent = costoEnvio === 0 ? 'Gratis' : `$${costoEnvio}`;
        totalElement.textContent = `$${totalConEnvio}`;
        
        // Agregar event listeners a los botones de los productos
        agregarEventListenersProductos();
    }
    
    // Actualizar contador en el header
    actualizarContadorCarrito();
}

// Agregar event listeners a los botones de los productos
function agregarEventListenersProductos() {
    // Botones de aumentar cantidad
    document.querySelectorAll('.aumentar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            aumentarCantidad(index);
        });
    });
    
    // Botones de disminuir cantidad
    document.querySelectorAll('.disminuir').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            disminuirCantidad(index);
        });
    });
    
    // Inputs de cantidad
    document.querySelectorAll('.contador-cantidad input').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const nuevaCantidad = parseInt(this.value);
            
            if (nuevaCantidad > 0) {
                cambiarCantidad(index, nuevaCantidad);
            } else {
                this.value = carrito[index].cantidad;
            }
        });
    });
    
    // Botones de eliminar producto
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            eliminarProducto(index);
        });
    });
}

// Aumentar cantidad de un producto
function aumentarCantidad(index) {
    carrito[index].cantidad++;
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion('Cantidad actualizada');
}

// Disminuir cantidad de un producto
function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        guardarCarrito();
        calcularTotal();
        actualizarInterfazCarrito();
        mostrarNotificacion('Cantidad actualizada');
    }
}

// Cambiar cantidad de un producto
function cambiarCantidad(index, nuevaCantidad) {
    carrito[index].cantidad = nuevaCantidad;
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion('Cantidad actualizada');
}

// Eliminar producto del carrito
function eliminarProducto(index) {
    const productoEliminado = carrito[index].nombre;
    carrito.splice(index, 1);
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion(`"${productoEliminado}" eliminado del carrito`);
}

// Mostrar modal de confirmación para vaciar carrito
function mostrarModalVaciarCarrito() {
    // Crear modal si no existe
    if (!document.getElementById('modal-vaciar-carrito')) {
        const modal = document.createElement('div');
        modal.id = 'modal-vaciar-carrito';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido">
                <h3>¿Vaciar carrito?</h3>
                <p>¿Estás seguro de que quieres eliminar todos los productos del carrito?</p>
                <div class="modal-acciones">
                    <button id="confirmar-vaciar" class="btn btn-peligro">Sí, vaciar</button>
                    <button id="cancelar-vaciar" class="btn btn-secundario">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners para los botones del modal
        document.getElementById('confirmar-vaciar').addEventListener('click', vaciarCarrito);
        document.getElementById('cancelar-vaciar').addEventListener('click', function() {
            document.getElementById('modal-vaciar-carrito').style.display = 'none';
        });
    }
    
    // Mostrar modal
    document.getElementById('modal-vaciar-carrito').style.display = 'flex';
}

// Vaciar carrito
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    
    // Ocultar modal
    document.getElementById('modal-vaciar-carrito').style.display = 'none';
    
    mostrarNotificacion('Carrito vaciado');
}

// Finalizar compra
function finalizarCompra(e) {
    // Verificar si el usuario está logueado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        e.preventDefault();
        mostrarNotificacion('Debes iniciar sesión para finalizar la compra', true);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
    // Si está logueado, la redirección a comprar.html ocurre naturalmente
}

// Actualizar contador de carrito en el header
function actualizarContadorCarrito() {
    const contador = document.querySelector('.carrito-count');
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

// Función para agregar producto al carrito (desde otras páginas)
function agregarAlCarrito(id) {
    // Buscar el producto en la lista de productos disponibles
    const producto = productos.find(p => p.id === id);
    
    if (producto) {
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
        
        // Guardar y actualizar
        guardarCarrito();
        calcularTotal();
        mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
    }
}