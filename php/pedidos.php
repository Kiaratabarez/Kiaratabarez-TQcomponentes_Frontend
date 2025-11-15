<?php
require_once 'conexion.php';

// Configurar cabeceras
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Crear tabla de pedidos si no existe
 */
function createPedidosTable() {
    try {
        $db = getDB();
        
        // Tabla de pedidos
        $sql1 = "CREATE TABLE IF NOT EXISTS pedidos (
            id_pedido INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT,
            numero_pedido VARCHAR(50) UNIQUE NOT NULL,
            fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
            subtotal DECIMAL(10, 2) NOT NULL,
            costo_envio DECIMAL(10, 2) DEFAULT 0,
            total DECIMAL(10, 2) NOT NULL,
            
            -- Datos del cliente
            nombre_cliente VARCHAR(150) NOT NULL,
            email_cliente VARCHAR(100) NOT NULL,
            telefono_cliente VARCHAR(20),
            
            -- Dirección de envío
            direccion VARCHAR(255) NOT NULL,
            ciudad VARCHAR(100) NOT NULL,
            codigo_postal VARCHAR(20),
            pais VARCHAR(100),
            
            -- Método de pago
            metodo_pago VARCHAR(50),
            
            notas TEXT,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
            INDEX idx_numero_pedido (numero_pedido),
            INDEX idx_estado (estado),
            INDEX idx_fecha (fecha_pedido)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($sql1);
        
        // Tabla de detalle de pedidos
        $sql2 = "CREATE TABLE IF NOT EXISTS detalle_pedidos (
            id_detalle INT AUTO_INCREMENT PRIMARY KEY,
            id_pedido INT NOT NULL,
            id_producto INT NOT NULL,
            nombre_producto VARCHAR(255) NOT NULL,
            precio_unitario DECIMAL(10, 2) NOT NULL,
            cantidad INT NOT NULL,
            subtotal DECIMAL(10, 2) NOT NULL,
            
            FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
            FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($sql2);
        
    } catch(Exception $e) {
        error_log("Error creando tablas de pedidos: " . $e->getMessage());
    }
}

// Crear tablas al cargar el archivo
createPedidosTable();

/**
 * Generar número de pedido único
 */
function generateOrderNumber() {
    return 'PED-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
}

/**
 * Crear nuevo pedido
 */
function createPedido($data) {
    try {
        // Validar datos obligatorios
        $requiredFields = ['productos', 'nombre_cliente', 'email_cliente', 'direccion', 'ciudad'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return [
                    'success' => false,
                    'message' => "Campo obligatorio faltante: $field"
                ];
            }
        }
        
        if (empty($data['productos']) || !is_array($data['productos'])) {
            return [
                'success' => false,
                'message' => 'El pedido debe contener al menos un producto'
            ];
        }
        
        $db = getDB();
        $db->beginTransaction();
        
        try {
            // Calcular totales
            $subtotal = 0;
            foreach ($data['productos'] as $producto) {
                $subtotal += floatval($producto['precio']) * intval($producto['cantidad']);
            }
            
            $costoEnvio = $subtotal > 5000 ? 0 : 500;
            $total = $subtotal + $costoEnvio;
            
            $numeroPedido = generateOrderNumber();
            $idUsuario = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
            
            // Insertar pedido
            $sqlPedido = "INSERT INTO pedidos 
                         (id_usuario, numero_pedido, estado, subtotal, costo_envio, total,
                          nombre_cliente, email_cliente, telefono_cliente,
                          direccion, ciudad, codigo_postal, pais, metodo_pago, notas)
                         VALUES 
                         (:id_usuario, :numero_pedido, 'pendiente', :subtotal, :costo_envio, :total,
                          :nombre_cliente, :email_cliente, :telefono_cliente,
                          :direccion, :ciudad, :codigo_postal, :pais, :metodo_pago, :notas)";
            
            $stmtPedido = $db->prepare($sqlPedido);
            $stmtPedido->execute([
                'id_usuario' => $idUsuario,
                'numero_pedido' => $numeroPedido,
                'subtotal' => $subtotal,
                'costo_envio' => $costoEnvio,
                'total' => $total,
                'nombre_cliente' => sanitizeInput($data['nombre_cliente']),
                'email_cliente' => sanitizeInput($data['email_cliente']),
                'telefono_cliente' => sanitizeInput($data['telefono_cliente'] ?? ''),
                'direccion' => sanitizeInput($data['direccion']),
                'ciudad' => sanitizeInput($data['ciudad']),
                'codigo_postal' => sanitizeInput($data['codigo_postal'] ?? ''),
                'pais' => sanitizeInput($data['pais'] ?? 'Argentina'),
                'metodo_pago' => sanitizeInput($data['metodo_pago'] ?? ''),
                'notas' => sanitizeInput($data['notas'] ?? '')
            ]);
            
            $idPedido = $db->lastInsertId();
            
            // Insertar detalles del pedido
            $sqlDetalle = "INSERT INTO detalle_pedidos 
                          (id_pedido, id_producto, nombre_producto, precio_unitario, cantidad, subtotal)
                          VALUES 
                          (:id_pedido, :id_producto, :nombre_producto, :precio_unitario, :cantidad, :subtotal)";
            
            $stmtDetalle = $db->prepare($sqlDetalle);
            
            foreach ($data['productos'] as $producto) {
                $cantidad = intval($producto['cantidad']);
                $precioUnitario = floatval($producto['precio']);
                $subtotalProducto = $precioUnitario * $cantidad;
                
                $stmtDetalle->execute([
                    'id_pedido' => $idPedido,
                    'id_producto' => intval($producto['id']),
                    'nombre_producto' => $producto['nombre'],
                    'precio_unitario' => $precioUnitario,
                    'cantidad' => $cantidad,
                    'subtotal' => $subtotalProducto
                ]);
                
                // Opcional: Actualizar stock del producto
                $sqlStock = "UPDATE productos SET stock = stock - :cantidad WHERE id_producto = :id";
                $stmtStock = $db->prepare($sqlStock);
                $stmtStock->execute([
                    'cantidad' => $cantidad,
                    'id' => intval($producto['id'])
                ]);
            }
            
            $db->commit();
            
            return [
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'pedido' => [
                    'id_pedido' => $idPedido,
                    'numero_pedido' => $numeroPedido,
                    'total' => $total
                ]
            ];
            
        } catch(Exception $e) {
            $db->rollBack();
            throw $e;
        }
        
    } catch(Exception $e) {
        error_log("Error creando pedido: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al crear el pedido: ' . $e->getMessage()
        ];
    }
}

/**
 * Obtener pedidos con filtros
 */
function getPedidos($filters = []) {
    try {
        $db = getDB();
        
        $sql = "SELECT p.*, 
                u.username,
                COUNT(dp.id_detalle) as total_items
                FROM pedidos p
                LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
                LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE 1=1";
        
        $params = [];
        
        // Filtro por usuario (si no es admin)
        if (!empty($filters['id_usuario'])) {
            $sql .= " AND p.id_usuario = :id_usuario";
            $params['id_usuario'] = $filters['id_usuario'];
        }
        
        // Filtro por estado
        if (!empty($filters['estado'])) {
            $sql .= " AND p.estado = :estado";
            $params['estado'] = $filters['estado'];
        }
        
        // Filtro por fecha
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND p.fecha_pedido >= :fecha_desde";
            $params['fecha_desde'] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND p.fecha_pedido <= :fecha_hasta";
            $params['fecha_hasta'] = $filters['fecha_hasta'];
        }
        
        $sql .= " GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC";
        
        // Paginación
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT :limit";
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET :offset";
            }
        }
        
        $stmt = $db->prepare($sql);
        
        foreach ($params as $key => $value) {
            if ($key === 'limit' || $key === 'offset') {
                $stmt->bindValue(':' . $key, intval($value), PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $value);
            }
        }
        
        $stmt->execute();
        $pedidos = $stmt->fetchAll();
        
        return [
            'success' => true,
            'pedidos' => $pedidos,
            'total' => count($pedidos)
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo pedidos: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener pedidos'
        ];
    }
}

/**
 * Obtener un pedido por ID
 */
function getPedido($id) {
    try {
        $db = getDB();
        
        // Obtener pedido
        $sqlPedido = "SELECT p.*, u.username
                      FROM pedidos p
                      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
                      WHERE p.id_pedido = :id
                      LIMIT 1";
        
        $stmtPedido = $db->prepare($sqlPedido);
        $stmtPedido->execute(['id' => $id]);
        $pedido = $stmtPedido->fetch();
        
        if (!$pedido) {
            return [
                'success' => false,
                'message' => 'Pedido no encontrado'
            ];
        }
        
        // Obtener detalles del pedido
        $sqlDetalles = "SELECT * FROM detalle_pedidos WHERE id_pedido = :id";
        $stmtDetalles = $db->prepare($sqlDetalles);
        $stmtDetalles->execute(['id' => $id]);
        $detalles = $stmtDetalles->fetchAll();
        
        $pedido['productos'] = $detalles;
        
        return [
            'success' => true,
            'pedido' => $pedido
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo pedido: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener el pedido'
        ];
    }
}

/**
 * Actualizar estado del pedido
 */
function updatePedidoEstado($id, $estado) {
    try {
        $estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
        
        if (!in_array($estado, $estadosValidos)) {
            return [
                'success' => false,
                'message' => 'Estado no válido'
            ];
        }
        
        $db = getDB();
        
        $sql = "UPDATE pedidos SET estado = :estado, fecha_actualizacion = NOW() 
                WHERE id_pedido = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'estado' => $estado,
            'id' => $id
        ]);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Estado actualizado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al actualizar el estado'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error actualizando estado: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar el estado'
        ];
    }
}

// Procesar peticiones
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = getPedido($_GET['id']);
        } else {
            $filters = [
                'id_usuario' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null,
                'estado' => $_GET['estado'] ?? null,
                'fecha_desde' => $_GET['fecha_desde'] ?? null,
                'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
                'limit' => $_GET['limit'] ?? null,
                'offset' => $_GET['offset'] ?? null
            ];
            
            $result = getPedidos($filters);
        }
        jsonResponse($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $result = createPedido($data);
        jsonResponse($result, $result['success'] ? 201 : 400);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? $data['id'] ?? null;
        $estado = $data['estado'] ?? null;
        
        if (!$id || !$estado) {
            jsonResponse(['success' => false, 'message' => 'ID y estado requeridos'], 400);
        }
        
        $result = updatePedidoEstado($id, $estado);
        jsonResponse($result);
        break;
        
    default:
        jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}