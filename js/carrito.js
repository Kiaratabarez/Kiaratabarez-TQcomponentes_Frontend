// CONFIGURACIÓN
const API_URL = 'php/';

let carrito = [];
let total = 0;
let usuarioActual = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar sesión del usuario
    usuarioActual = await obtenerUsuarioActual();
    
    if (!usuarioActual) {
        // Si no está logueado, redirigir al login
        mostrarNotificacion('Debes iniciar sesión para ver tu carrito', true);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Cargar carrito desde el backend
    await cargarCarritoDesdeAPI();
    
    // Configurar eventos
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

// FUNCIONES DE API

/*Obtener usuario actual*/
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

/*Cargar carrito desde el backend*/
async function cargarCarritoDesdeAPI() {
    try {
        const response = await fetch(`${API_URL}carrito.php?id_usuario=${usuarioActual.id}`);
        const data = await response.json();
        
        if (data.success) {
            // Convertir formato de API a formato del frontend
            carrito = data.carrito.map(item => ({
                id: item.id_producto,
                nombre: item.nombre,
                precio: parseFloat(item.precio),
                imagen: item.imagen,
                cantidad: parseInt(item.cantidad),
                stock: parseInt(item.stock)
            }));
            
            calcularTotal();
        } else {
            console.error('Error cargando carrito:', data.message);
            carrito = [];
        }
    } catch (error) {
        console.error('Error cargando carrito:', error);
        mostrarNotificacion('Error al cargar el carrito', true);
        carrito = [];
    }
}

/*Actualizar cantidad de un producto en el backend*/
async function actualizarCantidadAPI(idProducto, cantidad) {
    try {
        const response = await fetch(`${API_URL}carrito.php?action=actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuarioActual.id,
                id_producto: idProducto,
                cantidad: cantidad
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            mostrarNotificacion(data.message || 'Error al actualizar cantidad', true);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error actualizando cantidad:', error);
        mostrarNotificacion('Error al actualizar la cantidad', true);
        return false;
    }
}

/*Eliminar producto del backend*/
async function eliminarProductoAPI(idProducto) {
    try {
        const response = await fetch(`${API_URL}carrito.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuarioActual.id,
                id_producto: idProducto
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            mostrarNotificacion(data.message || 'Error al eliminar producto', true);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error eliminando producto:', error);
        mostrarNotificacion('Error al eliminar el producto', true);
        return false;
    }
}

/*Vaciar carrito en el backend*/
async function vaciarCarritoAPI() {
    try {
        const response = await fetch(`${API_URL}carrito.php?action=vaciar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuarioActual.id
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            mostrarNotificacion(data.message || 'Error al vaciar carrito', true);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        mostrarNotificacion('Error al vaciar el carrito', true);
        return false;
    }
}

// FUNCIONES DE CARRITO
/*Calcular total del carrito*/
function calcularTotal() {
    total = carrito.reduce((sum, producto) => {
        return sum + (producto.precio * producto.cantidad);
    }, 0);
}

/*Actualizar interfaz del carrito*/
function actualizarInterfazCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const carritoProductos = document.getElementById('carrito-productos');
    const subtotalElement = document.getElementById('subtotal');
    const envioElement = document.getElementById('envio');
    const totalElement = document.getElementById('total-general');
    
    if (carrito.length === 0) {
        if (carritoVacio) carritoVacio.style.display = 'block';
        if (carritoContenido) carritoContenido.style.display = 'none';
    } else {
        if (carritoVacio) carritoVacio.style.display = 'none';
        if (carritoContenido) carritoContenido.style.display = 'block';
        
        if (carritoProductos) {
            carritoProductos.innerHTML = '';
            
            carrito.forEach((producto, index) => {
                const productoElement = document.createElement('div');
                productoElement.className = 'producto-carrito';
                productoElement.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
                    <div class="producto-info">
                        <h3>${producto.nombre}</h3>
                        <p class="precio-unitario">$${producto.precio.toLocaleString('es-AR')} c/u</p>
                        <div class="contador-cantidad">
                            <button class="disminuir" data-index="${index}" data-id="${producto.id}">-</button>
                            <input type="number" value="${producto.cantidad}" min="1" max="${producto.stock}" data-index="${index}" data-id="${producto.id}">
                            <button class="aumentar" data-index="${index}" data-id="${producto.id}">+</button>
                        </div>
                        <p class="producto-total">Total: $${(producto.precio * producto.cantidad).toLocaleString('es-AR')}</p>
                    </div>
                    <button class="eliminar-producto" data-index="${index}" data-id="${producto.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                carritoProductos.appendChild(productoElement);
            });
            
            agregarEventListenersProductos();
        }
        
        // Calcular envío (gratis sobre $5000)
        const costoEnvio = total > 5000 ? 0 : 500;
        const totalConEnvio = total + costoEnvio;
        
        if (subtotalElement) subtotalElement.textContent = `$${total.toLocaleString('es-AR')}`;
        if (envioElement) envioElement.textContent = costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toLocaleString('es-AR')}`;
        if (totalElement) totalElement.textContent = `$${totalConEnvio.toLocaleString('es-AR')}`;
    }
    
    actualizarContadorCarrito();
}

/*Agrega event listeners a los productos*/
function agregarEventListenersProductos() {
    document.querySelectorAll('.aumentar').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            const id = parseInt(this.getAttribute('data-id'));
            await aumentarCantidad(index, id);
        });
    });
    
    document.querySelectorAll('.disminuir').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            const id = parseInt(this.getAttribute('data-id'));
            await disminuirCantidad(index, id);
        });
    });
    
    document.querySelectorAll('.contador-cantidad input').forEach(input => {
        input.addEventListener('change', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            const id = parseInt(this.getAttribute('data-id'));
            const nuevaCantidad = parseInt(this.value);
            
            if (nuevaCantidad > 0 && nuevaCantidad <= carrito[index].stock) {
                await cambiarCantidad(index, id, nuevaCantidad);
            } else {
                this.value = carrito[index].cantidad;
                if (nuevaCantidad > carrito[index].stock) {
                    mostrarNotificacion(`Stock máximo: ${carrito[index].stock}`, true);
                }
            }
        });
    });
    
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.getAttribute('data-index'));
            const id = parseInt(this.getAttribute('data-id'));
            await eliminarProducto(index, id);
        });
    });
}

/*Aumentar cantidad de un producto*/
async function aumentarCantidad(index, idProducto) {
    const producto = carrito[index];
    
    if (producto.cantidad >= producto.stock) {
        mostrarNotificacion(`Stock máximo alcanzado: ${producto.stock}`, true);
        return;
    }
    
    const nuevaCantidad = producto.cantidad + 1;
    const success = await actualizarCantidadAPI(idProducto, nuevaCantidad);
    
    if (success) {
        carrito[index].cantidad = nuevaCantidad;
        calcularTotal();
        actualizarInterfazCarrito();
        mostrarNotificacion('Cantidad actualizada');
    }
}

/*Disminuir cantidad de un producto*/
async function disminuirCantidad(index, idProducto) {
    if (carrito[index].cantidad > 1) {
        const nuevaCantidad = carrito[index].cantidad - 1;
        const success = await actualizarCantidadAPI(idProducto, nuevaCantidad);
        
        if (success) {
            carrito[index].cantidad = nuevaCantidad;
            calcularTotal();
            actualizarInterfazCarrito();
            mostrarNotificacion('Cantidad actualizada');
        }
    }
}

/*Cambiar cantidad de un producto*/
async function cambiarCantidad(index, idProducto, nuevaCantidad) {
    const success = await actualizarCantidadAPI(idProducto, nuevaCantidad);
    
    if (success) {
        carrito[index].cantidad = nuevaCantidad;
        calcularTotal();
        actualizarInterfazCarrito();
        mostrarNotificacion('Cantidad actualizada');
    }
}

/*Eliminar producto del carrito*/
async function eliminarProducto(index, idProducto) {
    const productoEliminado = carrito[index].nombre;
    const success = await eliminarProductoAPI(idProducto);
    
    if (success) {
        carrito.splice(index, 1);
        calcularTotal();
        actualizarInterfazCarrito();
        mostrarNotificacion(`"${productoEliminado}" eliminado del carrito`);
    }
}

/*Mostrar modal para vaciar carrito*/
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

/*Vaciar carrito*/
async function vaciarCarrito() {
    const success = await vaciarCarritoAPI();
    
    if (success) {
        carrito = [];
        calcularTotal();
        actualizarInterfazCarrito();
        
        document.getElementById('modal-vaciar-carrito').style.display = 'none';
        mostrarNotificacion('Carrito vaciado');
    }
}

/*Finalizar compra*/
function finalizarCompra(e) {
    if (carrito.length === 0) {
        e.preventDefault();
        mostrarNotificacion('El carrito está vacío', true);
        return;
    }
    
    // Redirigir a la página de compra
    window.location.href = 'comprar.html';
}

/*Actualizar contador de carrito*/
function actualizarContadorCarrito() {
    const contador = document.querySelector('.carrito-count');
    const totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);

    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

/*Mostrar la notificación*/
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