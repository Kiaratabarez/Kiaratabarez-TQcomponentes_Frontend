<?php
require_once 'conexion.php';
// Configurar cabeceras CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
/*Obtener carrito del usuario actual*/
function obtenerCarrito($idUsuario = null) {
    try {
        $db = getDB();
        
        // Si no hay usuario logueado, devolver carrito vacío
        if (!$idUsuario) {
            return [
                'success' => true,
                'carrito' => [],
                'total' => 0,
                'subtotal' => 0,
                'envio' => 0
            ];
        }
        
        $sql = "SELECT 
                    c.id_carrito,
                    c.id_producto,
                    c.cantidad,
                    c.fecha_agregado,
                    p.nombre,
                    p.precio,
                    p.imagen,
                    p.stock,
                    (p.precio * c.cantidad) as subtotal_producto
                FROM carrito c
                INNER JOIN productos p ON c.id_producto = p.id_producto
                WHERE c.id_usuario = :id_usuario 
                AND p.activo = TRUE
                ORDER BY c.fecha_agregado DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id_usuario' => $idUsuario]);
        $items = $stmt->fetchAll();
        
        // Calcular totales
        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += $item['subtotal_producto'];
        }
        
        // Calcular envío (gratis sobre $5000)
        $envio = $subtotal > 5000 ? 0 : 500;
        $total = $subtotal + $envio;
        
        return [
            'success' => true,
            'carrito' => $items,
            'subtotal' => $subtotal,
            'envio' => $envio,
            'total' => $total,
            'cantidad_items' => count($items)
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo carrito: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener el carrito'
        ];
    }
}

/*Agregar producto al carrito o actualizar cantidad*/
function agregarAlCarrito($data) {
    try {
        if (empty($data['id_usuario']) || empty($data['id_producto'])) {
            return [
                'success' => false,
                'message' => 'Faltan datos: id_usuario y id_producto son requeridos'
            ];
        }
        
        $idUsuario = intval($data['id_usuario']);
        $idProducto = intval($data['id_producto']);
        $cantidad = isset($data['cantidad']) ? intval($data['cantidad']) : 1;
        
        if ($cantidad < 1) {
            return [
                'success' => false,
                'message' => 'La cantidad debe ser mayor a 0'
            ];
        }
        
        $db = getDB();
        
        // Verificar que el producto existe y está activo
        $sqlProducto = "SELECT id_producto, nombre, stock FROM productos 
                    WHERE id_producto = :id AND activo = TRUE";
        $stmtProducto = $db->prepare($sqlProducto);
        $stmtProducto->execute(['id' => $idProducto]);
        $producto = $stmtProducto->fetch();
        
        if (!$producto) {
            return [
                'success' => false,
                'message' => 'Producto no encontrado o no disponible'
            ];
        }
        
        // Verificar stock disponible
        if ($producto['stock'] < $cantidad) {
            return [
                'success' => false,
                'message' => 'Stock insuficiente. Disponible: ' . $producto['stock']
            ];
        }
        
        // Verificar si el producto ya está en el carrito
        $sqlCheck = "SELECT id_carrito, cantidad FROM carrito 
                    WHERE id_usuario = :id_usuario AND id_producto = :id_producto";
        $stmtCheck = $db->prepare($sqlCheck);
        $stmtCheck->execute([
            'id_usuario' => $idUsuario,
            'id_producto' => $idProducto
        ]);
        $itemExistente = $stmtCheck->fetch();
        
        if ($itemExistente) {
            // Actualizar cantidad
            $nuevaCantidad = $itemExistente['cantidad'] + $cantidad;
            
            // Verificar stock nuevamente
            if ($producto['stock'] < $nuevaCantidad) {
                return [
                    'success' => false,
                    'message' => 'Stock insuficiente. Disponible: ' . $producto['stock']
                ];
            }
            
            $sqlUpdate = "UPDATE carrito 
                        SET cantidad = :cantidad, 
                            fecha_actualizacion = NOW() 
                        WHERE id_carrito = :id_carrito";
            $stmtUpdate = $db->prepare($sqlUpdate);
            $stmtUpdate->execute([
                'cantidad' => $nuevaCantidad,
                'id_carrito' => $itemExistente['id_carrito']
            ]);
            
            return [
                'success' => true,
                'message' => 'Cantidad actualizada en el carrito',
                'action' => 'updated',
                'producto' => $producto['nombre']
            ];
        } else {
            $sqlInsert = "INSERT INTO carrito (id_usuario, id_producto, cantidad, fecha_agregado) 
                        VALUES (:id_usuario, :id_producto, :cantidad, NOW())";
            $stmtInsert = $db->prepare($sqlInsert);
            $stmtInsert->execute([
                'id_usuario' => $idUsuario,
                'id_producto' => $idProducto,
                'cantidad' => $cantidad
            ]);
            
            return [
                'success' => true,
                'message' => 'Producto agregado al carrito',
                'action' => 'added',
                'producto' => $producto['nombre'],
                'id_carrito' => $db->lastInsertId()
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error agregando al carrito: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al agregar el producto al carrito'
        ];
    }
}

/*Actualizar cantidad de un producto en el carrito*/
function actualizarCantidad($data) {
    try {
        if (empty($data['id_usuario']) || empty($data['id_producto'])) {
            return [
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ];
        }
        
        $idUsuario = intval($data['id_usuario']);
        $idProducto = intval($data['id_producto']);
        $cantidad = intval($data['cantidad']);
        
        if ($cantidad < 1) {
            return [
                'success' => false,
                'message' => 'La cantidad debe ser mayor a 0'
            ];
        }
        
        $db = getDB();
        
        // Verificar stock
        $sqlStock = "SELECT stock FROM productos WHERE id_producto = :id";
        $stmtStock = $db->prepare($sqlStock);
        $stmtStock->execute(['id' => $idProducto]);
        $producto = $stmtStock->fetch();
        
        if (!$producto || $producto['stock'] < $cantidad) {
            return [
                'success' => false,
                'message' => 'Stock insuficiente'
            ];
        }
        
        // Actualizar cantidad
        $sql = "UPDATE carrito 
                SET cantidad = :cantidad, 
                    fecha_actualizacion = NOW() 
                WHERE id_usuario = :id_usuario 
                AND id_producto = :id_producto";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'cantidad' => $cantidad,
            'id_usuario' => $idUsuario,
            'id_producto' => $idProducto
        ]);
        
        if ($result && $stmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => 'Cantidad actualizada'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Producto no encontrado en el carrito'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error actualizando cantidad: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar la cantidad'
        ];
    }
}

/*Elimina producto del carrito*/
function eliminarDelCarrito($data) {
    try {
        if (empty($data['id_usuario']) || empty($data['id_producto'])) {
            return [
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ];
        }
        
        $db = getDB();
        
        $sql = "DELETE FROM carrito 
                WHERE id_usuario = :id_usuario 
                AND id_producto = :id_producto";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'id_usuario' => intval($data['id_usuario']),
            'id_producto' => intval($data['id_producto'])
        ]);
        
        if ($result && $stmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => 'Producto eliminado del carrito'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Producto no encontrado en el carrito'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error eliminando del carrito: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al eliminar el producto'
        ];
    }
}

/*Vaciar todo el carrito del usuario*/
function vaciarCarrito($idUsuario) {
    try {
        if (empty($idUsuario)) {
            return [
                'success' => false,
                'message' => 'ID de usuario requerido'
            ];
        }
        
        $db = getDB();
        
        $sql = "DELETE FROM carrito WHERE id_usuario = :id_usuario";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute(['id_usuario' => intval($idUsuario)]);
        
        return [
            'success' => true,
            'message' => 'Carrito vaciado correctamente',
            'items_eliminados' => $stmt->rowCount()
        ];
        
    } catch(Exception $e) {
        error_log("Error vaciando carrito: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al vaciar el carrito'
        ];
    }
}

/*Sincronizar carrito desde localStorage al iniciar sesión*/
function sincronizarCarrito($data) {
    try {
        if (empty($data['id_usuario']) || empty($data['productos'])) {
            return [
                'success' => false,
                'message' => 'Datos incompletos para sincronización'
            ];
        }
        
        $db = getDB();
        $idUsuario = intval($data['id_usuario']);
        $productos = $data['productos'];
        
        $agregados = 0;
        $actualizados = 0;
        $errores = [];
        
        foreach ($productos as $prod) {
            $resultado = agregarAlCarrito([
                'id_usuario' => $idUsuario,
                'id_producto' => $prod['id'],
                'cantidad' => $prod['cantidad']
            ]);
            
            if ($resultado['success']) {
                if ($resultado['action'] === 'added') {
                    $agregados++;
                } else {
                    $actualizados++;
                }
            } else {
                $errores[] = $prod['nombre'] . ': ' . $resultado['message'];
            }
        }
        
        return [
            'success' => true,
            'message' => 'Carrito sincronizado',
            'agregados' => $agregados,
            'actualizados' => $actualizados,
            'errores' => $errores
        ];
        
    } catch(Exception $e) {
        error_log("Error sincronizando carrito: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al sincronizar el carrito'
        ];
    }
}

// PROCESO PETICIONES

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($method) {
    case 'GET':
        // Obtener carrito del usuario
        $idUsuario = $_GET['id_usuario'] ?? null;
        $result = obtenerCarrito($idUsuario);
        jsonResponse($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        switch($action) {
            case 'agregar':
                $result = agregarAlCarrito($data);
                break;
                
            case 'sincronizar':
                $result = sincronizarCarrito($data);
                break;
                
            case 'vaciar':
                $idUsuario = $data['id_usuario'] ?? null;
                $result = vaciarCarrito($idUsuario);
                break;
                
            default:
                $result = agregarAlCarrito($data);
        }
        
        jsonResponse($result, $result['success'] ? 200 : 400);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        switch($action) {
            case 'actualizar':
            case 'cantidad':
                $result = actualizarCantidad($data);
                break;
                
            default:
                $result = [
                    'success' => false,
                    'message' => 'Acción no válida para PUT'
                ];
        }
        
        jsonResponse($result);
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            $data = [
                'id_usuario' => $_GET['id_usuario'] ?? null,
                'id_producto' => $_GET['id_producto'] ?? null
            ];
        }
        
        if ($action === 'vaciar') {
            $result = vaciarCarrito($data['id_usuario']);
        } else {
            $result = eliminarDelCarrito($data);
        }
        
        jsonResponse($result);
        break;
        
    default:
        jsonResponse([
            'success' => false,
            'message' => 'Método no permitido'
        ], 405);
}
?>