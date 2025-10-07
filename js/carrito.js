let carrito = [];
let total = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito desde localStorage
    cargarCarrito();
    
    // Configurar evento para vaciar carrito
    const btnVaciar = document.getElementById('vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', mostrarModalVaciarCarrito);
    }
    
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarCompra);
    }
    
    actualizarInterfazCarrito();
});

// Carga carrito desde el localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        calcularTotal();
    }
}

// Guarda carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Calcula el total del carrito
function calcularTotal() {
    total = carrito.reduce((sum, producto) => {
        return sum + (producto.precio * producto.cantidad);
    }, 0);
}

function actualizarInterfazCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const carritoProductos = document.getElementById('carrito-productos');
    const subtotalElement = document.getElementById('subtotal');
    const envioElement = document.getElementById('envio');
    const totalElement = document.getElementById('total-general');
    
    if (carrito.length === 0) {
        carritoVacio.style.display = 'block';
        carritoContenido.style.display = 'none';
    } else {
        carritoVacio.style.display = 'none';
        carritoContenido.style.display = 'block';
        carritoProductos.innerHTML = '';
        
        // Agrega productos al carrito
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
        
        // Calcula envío (ejemplo: gratis sobre $5000, sino $500)
        const costoEnvio = total > 5000 ? 0 : 500;
        const totalConEnvio = total + costoEnvio;
        
        // Actualiza totales
        subtotalElement.textContent = `$${total}`;
        envioElement.textContent = costoEnvio === 0 ? 'Gratis' : `$${costoEnvio}`;
        totalElement.textContent = `$${totalConEnvio}`;
        
        agregarEventListenersProductos();
    }
    actualizarContadorCarrito();
}

function agregarEventListenersProductos() {
    document.querySelectorAll('.aumentar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            aumentarCantidad(index);
        });
    });
    
    document.querySelectorAll('.disminuir').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            disminuirCantidad(index);
        });
    });
    
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
    
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            eliminarProducto(index);
        });
    });
}

// Aumenta cantidad de un producto
function aumentarCantidad(index) {
    carrito[index].cantidad++;
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion('Cantidad actualizada');
}

// Disminuye cantidad de un producto
function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        guardarCarrito();
        calcularTotal();
        actualizarInterfazCarrito();
        mostrarNotificacion('Cantidad actualizada');
    }
}

// Cambia cantidad de un producto
function cambiarCantidad(index, nuevaCantidad) {
    carrito[index].cantidad = nuevaCantidad;
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion('Cantidad actualizada');
}

// Elimina producto 
function eliminarProducto(index) {
    const productoEliminado = carrito[index].nombre;
    carrito.splice(index, 1);
    guardarCarrito();
    calcularTotal();
    actualizarInterfazCarrito();
    mostrarNotificacion(`"${productoEliminado}" eliminado del carrito`);
}

function mostrarModalVaciarCarrito() {
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
        
        document.getElementById('confirmar-vaciar').addEventListener('click', vaciarCarrito);
        document.getElementById('cancelar-vaciar').addEventListener('click', function() {
            document.getElementById('modal-vaciar-carrito').style.display = 'none';
        });
    }
    
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
}

// Actualizar contador de carrito en el header
function actualizarContadorCarrito() {
    const contador = document.querySelector('.carrito-count');
    const totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);

    if (contador) {
        contador.textContent = totalItems; 
        contador.style.display = 'inline-flex'; // Siempre visible
    }
}


// Mostrar notificación
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

function agregarAlCarrito(id) {
    const now = Date.now();
    if (!window._ultimoAdd) window._ultimoAdd = {};
    if (window._ultimoAdd[id] && (now - window._ultimoAdd[id] < 500)) {
        console.warn('Ignorando add doble para id', id);
        return;
    }
    window._ultimoAdd[id] = now;

    const producto = productos.find(p => p.id === id);
    if (!producto) {
        console.error('Producto no encontrado para id', id);
        return;
    }

    const productoExistenteIdx = carrito.findIndex(p => p.id === id);

    if (productoExistenteIdx !== -1) {
        // existe -> aumentar cantidad en 1
        carrito[productoExistenteIdx].cantidad++;
    } else {
        // no existe -> agregar con cantidad 1
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    calcularTotal();
    mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
}
