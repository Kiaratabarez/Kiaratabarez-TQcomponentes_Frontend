<?php
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*Generar número de pedido único*/
function generateOrderNumber() {
    return 'PED-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
}

/*Detectar tipo de tarjeta por número*/
function detectarTipoTarjeta($numero) {
    $numero = preg_replace('/\s+/', '', $numero);
    
    if (preg_match('/^4/', $numero)) return 'Visa';
    if (preg_match('/^5[1-5]/', $numero)) return 'Mastercard';
    if (preg_match('/^3[47]/', $numero)) return 'American Express';
    if (preg_match('/^6(?:011|5)/', $numero)) return 'Discover';
    
    return 'Desconocida';
}
function guardarDireccionEnvio($idUsuario, $datos) {
    try {
        if (!$idUsuario) return false; 
        
        $db = getDB();
        
        $checkSql = "SELECT id_direccion FROM direcciones_envio 
                    WHERE id_usuario = :id_usuario 
                    AND direccion = :direccion 
                    AND ciudad = :ciudad";
        
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([
            'id_usuario' => $idUsuario,
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad']
        ]);
        if ($checkStmt->fetch()) {
            return true;
        }
        
        // Insertar nueva dirección
        $sql = "INSERT INTO direcciones_envio 
                (id_usuario, direccion, ciudad, codigo_postal, pais, predeterminada, fecha_creacion)
                VALUES (:id_usuario, :direccion, :ciudad, :codigo_postal, :pais, :predeterminada, NOW())";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'id_usuario' => $idUsuario,
            'direccion' => sanitizeInput($datos['direccion']),
            'ciudad' => sanitizeInput($datos['ciudad']),
            'codigo_postal' => sanitizeInput($datos['codigo_postal'] ?? ''),
            'pais' => sanitizeInput($datos['pais'] ?? 'Argentina'),
            'predeterminada' => true 
        ]);
        
        return $result;
        
    } catch(Exception $e) {
        error_log("Error guardando dirección: " . $e->getMessage());
        return false;
    }
}

function guardarInfoPago($idPedido, $datosPago) {
    try {
        // Solo guardar si hay datos de tarjeta
        if (empty($datosPago['numero_tarjeta']) || empty($datosPago['metodo_pago'])) {
            return true; 
        }
        
        // Solo guardar para tarjetas (no para PayPal, transferencia)
        if (!in_array($datosPago['metodo_pago'], ['tarjeta', 'debito'])) {
            return true;
        }
        
        $db = getDB();
        
        // Limpiar número de tarjeta
        $numeroLimpio = preg_replace('/\s+/', '', $datosPago['numero_tarjeta']);
        
        // Enmascarar número (solo últimos 4 dígitos)
        $numeroEnmascarado = '**** **** **** ' . substr($numeroLimpio, -4);
        $tipoTarjeta = detectarTipoTarjeta($numeroLimpio);
        
        $sql = "INSERT INTO informacion_pago 
                (id_pedido, numero_tarjeta_enmascarado, nombre_tarjeta, fecha_expiracion, tipo_tarjeta, fecha_registro)
                VALUES (:id_pedido, :numero_enmascarado, :nombre, :fecha_exp, :tipo, NOW())";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'id_pedido' => $idPedido,
            'numero_enmascarado' => $numeroEnmascarado,
            'nombre' => sanitizeInput($datosPago['nombre_tarjeta'] ?? ''),
            'fecha_exp' => sanitizeInput($datosPago['fecha_expiracion'] ?? ''),
            'tipo' => $tipoTarjeta
        ]);
        
        return $result;
        
    } catch(Exception $e) {
        error_log("Error guardando info de pago: " . $e->getMessage());
        return false;
    }
}

/*Crear nuevo pedido */
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
            $subtotal = floatval($data['subtotal']);
            $costoEnvio = floatval($data['envio']);
            $total = floatval($data['total']);
            
            $numeroPedido = generateOrderNumber();
            
            // Obtener ID de usuario
            $idUsuario = null;
            if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['user_id'])) {
                $idUsuario = $_SESSION['user_id'];
            } elseif (!empty($data['id_usuario'])) {
                $idUsuario = intval($data['id_usuario']);
            }
            
            // Insertar pedido
            $sqlPedido = "INSERT INTO pedidos 
                        (id_usuario, numero_pedido, estado_pedido, estado_pago, subtotal, costo_envio, total,
                        nombre_cliente, apellido_cliente, email_cliente, telefono_cliente,
                        direccion_envio, ciudad, codigo_postal, pais, metodo_pago, notas, fecha_pedido)
                        VALUES 
                        (:id_usuario, :numero_pedido, 'pendiente', 'pendiente', :subtotal, :costo_envio, :total,
                        :nombre_cliente, :apellido_cliente, :email_cliente, :telefono_cliente,
                        :direccion_envio, :ciudad, :codigo_postal, :pais, :metodo_pago, :notas, NOW())";
            
            $stmtPedido = $db->prepare($sqlPedido);
            $stmtPedido->execute([
                'id_usuario' => $idUsuario,
                'numero_pedido' => $numeroPedido,
                'subtotal' => $subtotal,
                'costo_envio' => $costoEnvio,
                'total' => $total,
                'nombre_cliente' => sanitizeInput($data['nombre_cliente']),
                'apellido_cliente' => sanitizeInput($data['apellido_cliente'] ?? ''),
                'email_cliente' => sanitizeInput($data['email_cliente']),
                'telefono_cliente' => sanitizeInput($data['telefono_cliente'] ?? ''),
                'direccion_envio' => sanitizeInput($data['direccion']),
                'ciudad' => sanitizeInput($data['ciudad']),
                'codigo_postal' => sanitizeInput($data['codigo_postal'] ?? ''),
                'pais' => sanitizeInput($data['pais'] ?? 'Argentina'),
                'metodo_pago' => sanitizeInput($data['metodo_pago'] ?? ''),
                'notas' => sanitizeInput($data['notas'] ?? '')
            ]);
            
            $idPedido = $db->lastInsertId();
            
            // Insertar detalles del pedido
            $sqlDetalle = "INSERT INTO detalles_pedido 
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
                
                // Actualizar stock
                $sqlStock = "UPDATE productos SET stock = stock - :cantidad WHERE id_producto = :id";
                $stmtStock = $db->prepare($sqlStock);
                $stmtStock->execute([
                    'cantidad' => $cantidad,
                    'id' => intval($producto['id'])
                ]);
            }
            
            if ($idUsuario) {
                guardarDireccionEnvio($idUsuario, [
                    'direccion' => $data['direccion'],
                    'ciudad' => $data['ciudad'],
                    'codigo_postal' => $data['codigo_postal'] ?? '',
                    'pais' => $data['pais'] ?? 'Argentina'
                ]);
            }
            
            if (!empty($data['numero_tarjeta'])) {
                guardarInfoPago($idPedido, [
                    'numero_tarjeta' => $data['numero_tarjeta'],
                    'nombre_tarjeta' => $data['nombre_tarjeta'] ?? '',
                    'fecha_expiracion' => $data['fecha_expiracion'] ?? '',
                    'metodo_pago' => $data['metodo_pago']
                ]);
            }
            
            // Vaciar carrito
            if ($idUsuario) {
                $sqlVaciar = "DELETE FROM carrito WHERE id_usuario = :id_usuario";
                $stmtVaciar = $db->prepare($sqlVaciar);
                $stmtVaciar->execute(['id_usuario' => $idUsuario]);
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

/*Obtener pedidos con filtros*/
function getPedidos($filters = []) {
    try {
        $db = getDB();
        
        $sql = "SELECT p.*, 
                u.username,
                COUNT(dp.id_detalle) as total_items
                FROM pedidos p
                LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
                LEFT JOIN detalles_pedido dp ON p.id_pedido = dp.id_pedido
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['id_usuario'])) {
            $sql .= " AND p.id_usuario = :id_usuario";
            $params['id_usuario'] = $filters['id_usuario'];
        }
        
        if (!empty($filters['estado'])) {
            $sql .= " AND p.estado_pedido = :estado";
            $params['estado'] = $filters['estado'];
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND p.fecha_pedido >= :fecha_desde";
            $params['fecha_desde'] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND p.fecha_pedido <= :fecha_hasta";
            $params['fecha_hasta'] = $filters['fecha_hasta'];
        }
        
        $sql .= " GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC";
        
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

/*Obtener un pedido por ID*/
function getPedido($id) {
    try {
        $db = getDB();
        
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
        
        $sqlDetalles = "SELECT * FROM detalles_pedido WHERE id_pedido = :id";
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

/*Actualizar estado del pedid*/
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
        
        $sql = "UPDATE pedidos SET estado_pedido = :estado, fecha_actualizacion = NOW() 
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
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = getPedido($_GET['id']);
        } else {
            $filters = [
                'id_usuario' => $_GET['id_usuario'] ?? null,
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
?>