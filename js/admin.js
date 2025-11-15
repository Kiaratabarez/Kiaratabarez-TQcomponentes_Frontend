// admin.js - Panel de Administración TQComponents
const API_URL = '../php/'; // Ajusta según estructura

let categoriasCache = [];

// ===========================================
// INICIALIZACIÓN
// ===========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Iniciando Panel de Administración...');
    
    // Cargar datos iniciales
    await cargarEstadisticas();
    await cargarCategorias();
    await cargarProductos();
    
    // Configurar formularios
    document.getElementById('form-producto').addEventListener('submit', guardarProducto);
    document.getElementById('form-categoria').addEventListener('submit', guardarCategoria);
});

// ===========================================
// NAVEGACIÓN TABS
// ===========================================
function cambiarTab(tab) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // Cargar datos del tab
    switch(tab) {
        case 'productos':
            cargarProductos();
            break;
        case 'categorias':
            cargarCategorias();
            break;
        case 'usuarios':
            cargarUsuarios();
            break;
        case 'pedidos':
            cargarPedidos();
            break;
    }
}

// ===========================================
// ESTADÍSTICAS
// ===========================================
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}admin.php?action=stats`);
        const data = await response.json();
        
        if (data.success && data.stats) {
            document.getElementById('stat-productos').textContent = data.stats.productos?.total || 0;
            document.getElementById('stat-categorias').textContent = data.stats.categorias?.total || 0;
            document.getElementById('stat-usuarios').textContent = data.stats.usuarios?.total || 0;
            document.getElementById('stat-pedidos').textContent = data.stats.pedidos?.total || 0;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ===========================================
// PRODUCTOS
// ===========================================
async function cargarProductos() {
    const contenedor = document.getElementById('productos-lista');
    contenedor.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Cargando...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}productos.php`);
        const data = await response.json();
        
        if (!data.success || !data.productos || data.productos.length === 0) {
            contenedor.innerHTML = '<p>No hay productos.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Destacado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.productos.forEach(producto => {
            html += `
                <tr>
                    <td>${producto.id_producto}</td>
                    <td><img src="../${producto.imagen}" alt="${producto.nombre}"></td>
                    <td>${producto.nombre}</td>
                    <td>$${parseFloat(producto.precio).toLocaleString('es-AR')}</td>
                    <td>${producto.stock}</td>
                    <td>${producto.nombre_categoria || '-'}</td>
                    <td>${producto.destacado ? '⭐ Sí' : 'No'}</td>
                    <td class="action-buttons">
                        <button class="action-btn edit" onclick="editarProducto(${producto.id_producto})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="eliminarProducto(${producto.id_producto}, '${producto.nombre}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contenedor.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        contenedor.innerHTML = '<p class="error">Error al cargar productos</p>';
    }
}

function abrirModalProducto(id = null) {
    const modal = document.getElementById('modal-producto');
    const form = document.getElementById('form-producto');
    
    // Cargar categorías en select
    const select = document.getElementById('producto-categoria');
    select.innerHTML = '<option value="">Seleccione...</option>';
    categoriasCache.forEach(cat => {
        select.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre_categoria}</option>`;
    });
    
    if (id) {
        // Modo edición
        document.getElementById('modal-producto-title').textContent = 'Editar Producto';
        cargarDatosProducto(id);
    } else {
        // Modo nuevo
        document.getElementById('modal-producto-title').textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('producto-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').style.display = 'none';
}

async function cargarDatosProducto(id) {
    try {
        const response = await fetch(`${API_URL}productos.php?id=${id}`);
        const data = await response.json();
        
        if (data.success && data.producto) {
            const p = data.producto;
            document.getElementById('producto-id').value = p.id_producto;
            document.getElementById('producto-nombre').value = p.nombre;
            document.getElementById('producto-descripcion').value = p.descripcion || '';
            document.getElementById('producto-precio').value = p.precio;
            document.getElementById('producto-categoria').value = p.id_categoria;
            document.getElementById('producto-stock').value = p.stock || 0;
            document.getElementById('producto-imagen').value = p.imagen || '';
            document.getElementById('producto-destacado').checked = p.destacado == 1;
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
        mostrarNotificacion('Error al cargar producto', true);
    }
}

async function guardarProducto(e) {
    e.preventDefault();
    
    const id = document.getElementById('producto-id').value;
    const datos = {
        nombre: document.getElementById('producto-nombre').value,
        descripcion: document.getElementById('producto-descripcion').value,
        precio: parseFloat(document.getElementById('producto-precio').value),
        id_categoria: parseInt(document.getElementById('producto-categoria').value),
        stock: parseInt(document.getElementById('producto-stock').value),
        imagen: document.getElementById('producto-imagen').value,
        destacado: document.getElementById('producto-destacado').checked
    };
    
    try {
        let response;
        if (id) {
            // Actualizar
            response = await fetch(`${API_URL}productos.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            // Crear
            response = await fetch(`${API_URL}productos.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion(id ? 'Producto actualizado' : 'Producto creado');
            cerrarModalProducto();
            cargarProductos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message || 'Error al guardar', true);
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarNotificacion('Error al guardar producto', true);
    }
}

async function editarProducto(id) {
    abrirModalProducto(id);
}

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Eliminar producto "${nombre}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}productos.php?id=${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Producto eliminado');
            cargarProductos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message || 'Error al eliminar', true);
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        mostrarNotificacion('Error al eliminar producto', true);
    }
}

// ===========================================
// CATEGORÍAS
// ===========================================
async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-lista');
    contenedor.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Cargando...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}categorias.php`);
        const data = await response.json();
        
        if (!data.success || !data.categorias) {
            contenedor.innerHTML = '<p>No hay categorías.</p>';
            return;
        }
        
        // Guardar en caché
        categoriasCache = data.categorias;
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Productos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.categorias.forEach(cat => {
            html += `
                <tr>
                    <td>${cat.id_categoria}</td>
                    <td>${cat.nombre_categoria}</td>
                    <td>${cat.descripcion || '-'}</td>
                    <td>${cat.total_productos || 0}</td>
                    <td class="action-buttons">
                        <button class="action-btn edit" onclick="editarCategoria(${cat.id_categoria})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="eliminarCategoria(${cat.id_categoria}, '${cat.nombre_categoria}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contenedor.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        contenedor.innerHTML = '<p class="error">Error al cargar categorías</p>';
    }
}

function abrirModalCategoria(id = null) {
    const modal = document.getElementById('modal-categoria');
    const form = document.getElementById('form-categoria');
    
    if (id) {
        cargarDatosCategoria(id);
    } else {
        form.reset();
        document.getElementById('categoria-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalCategoria() {
    document.getElementById('modal-categoria').style.display = 'none';
}

async function cargarDatosCategoria(id) {
    try {
        const response = await fetch(`${API_URL}categorias.php?id=${id}`);
        const data = await response.json();
        
        if (data.success && data.categoria) {
            const c = data.categoria;
            document.getElementById('categoria-id').value = c.id_categoria;
            document.getElementById('categoria-nombre').value = c.nombre_categoria;
            document.getElementById('categoria-descripcion').value = c.descripcion || '';
        }
    } catch (error) {
        console.error('Error cargando categoría:', error);
    }
}

async function guardarCategoria(e) {
    e.preventDefault();
    
    const id = document.getElementById('categoria-id').value;
    const datos = {
        nombre_categoria: document.getElementById('categoria-nombre').value,
        descripcion: document.getElementById('categoria-descripcion').value
    };
    
    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}categorias.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            response = await fetch(`${API_URL}categorias.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion(id ? 'Categoría actualizada' : 'Categoría creada');
            cerrarModalCategoria();
            cargarCategorias();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message || 'Error al guardar', true);
        }
    } catch (error) {
        console.error('Error guardando categoría:', error);
        mostrarNotificacion('Error al guardar categoría', true);
    }
}

async function editarCategoria(id) {
    abrirModalCategoria(id);
}

async function eliminarCategoria(id, nombre) {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}categorias.php?id=${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Categoría eliminada');
            cargarCategorias();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message || 'Error al eliminar', true);
        }
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        mostrarNotificacion('Error al eliminar categoría', true);
    }
}

// ===========================================
// USUARIOS
// ===========================================
async function cargarUsuarios() {
    const contenedor = document.getElementById('usuarios-lista');
    contenedor.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Cargando...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}usuarios.php`);
        const data = await response.json();
        
        if (!data.success || !data.usuarios || data.usuarios.length === 0) {
            contenedor.innerHTML = '<p>No hay usuarios.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Nombre</th>
                        <th>Registro</th>
                        <th>Último Login</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.usuarios.forEach(user => {
            html += `
                <tr>
                    <td>${user.id_usuario}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.nombre_completo || '-'}</td>
                    <td>${new Date(user.fecha_registro).toLocaleDateString('es-AR')}</td>
                    <td>${user.ultimo_login ? new Date(user.ultimo_login).toLocaleDateString('es-AR') : 'Nunca'}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contenedor.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        contenedor.innerHTML = '<p class="error">Error al cargar usuarios</p>';
    }
}

// ===========================================
// PEDIDOS
// ===========================================
async function cargarPedidos() {
    const contenedor = document.getElementById('pedidos-lista');
    contenedor.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Cargando...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}pedidos.php`);
        const data = await response.json();
        
        if (!data.success || !data.pedidos || data.pedidos.length === 0) {
            contenedor.innerHTML = '<p>No hay pedidos.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.pedidos.forEach(pedido => {
            const estadoColor = {
                'pendiente': 'orange',
                'procesando': 'blue',
                'enviado': 'cyan',
                'entregado': 'green',
                'cancelado': 'red'
            };
            
            html += `
                <tr>
                    <td>${pedido.numero_pedido}</td>
                    <td>${pedido.nombre_cliente || pedido.username || '-'}</td>
                    <td>${new Date(pedido.fecha_pedido).toLocaleDateString('es-AR')}</td>
                    <td>$${parseFloat(pedido.total).toLocaleString('es-AR')}</td>
                    <td style="color: ${estadoColor[pedido.estado_pedido] || 'black'}">
                        ${pedido.estado_pedido}
                    </td>
                    <td>${pedido.total_items || 0}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contenedor.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        contenedor.innerHTML = '<p class="error">Error al cargar pedidos</p>';
    }
}

// ===========================================
// UTILIDADES
// ===========================================
function mostrarNotificacion(mensaje, esError = false) {
    const notif = document.createElement('div');
    notif.className = `notification ${esError ? 'error' : ''}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

async function cerrarSesion() {
    if (!confirm('¿Cerrar sesión?')) return;
    
    try {
        await fetch(`${API_URL}logout.php`, { method: 'POST' });
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    }
}