<?php
/**
 * PROBLEMAS ENCONTRADOS Y CORREGIDOS:
 * 1. El ordenamiento con prefijo 'p.' no funcionaba correctamente
 * 2. Faltaba validación de campos NULL en imagen
 * 3. El filtro destacado no manejaba valores booleanos correctamente
 * 4. No se validaba la existencia de la categoría antes de crear producto
 */

require_once 'conexion.php';

// Configurar cabeceras
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Obtener todos los productos con filtros opcionales
 */
function getProductos($filters = []) {
    try {
        $db = getDB();
        
        $sql = "SELECT p.*, c.nombre_categoria 
                FROM productos p 
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
                WHERE p.activo = TRUE";
        
        $params = [];
        
        // Filtro por categoría
        if (!empty($filters['categoria'])) {
            $sql .= " AND c.nombre_categoria = :categoria";
            $params['categoria'] = $filters['categoria'];
        }
        
        // Filtro por ID de categoría
        if (!empty($filters['id_categoria'])) {
            $sql .= " AND p.id_categoria = :id_categoria";
            $params['id_categoria'] = $filters['id_categoria'];
        }
        
        // Filtro por destacado - CORREGIDO
        if (isset($filters['destacado'])) {
            $sql .= " AND p.destacado = :destacado";
            $params['destacado'] = ($filters['destacado'] === 'true' || $filters['destacado'] === true || $filters['destacado'] === 1) ? 1 : 0;
        }
        
        // Filtro por rango de precio
        if (!empty($filters['precio_min'])) {
            $sql .= " AND p.precio >= :precio_min";
            $params['precio_min'] = $filters['precio_min'];
        }
        
        if (!empty($filters['precio_max'])) {
            $sql .= " AND p.precio <= :precio_max";
            $params['precio_max'] = $filters['precio_max'];
        }
        
        // Búsqueda por nombre
        if (!empty($filters['search'])) {
            $sql .= " AND (p.nombre LIKE :search OR p.descripcion LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        // Ordenamiento - CORREGIDO
        $orderBy = $filters['order_by'] ?? 'id_producto';
        $orderDir = strtoupper($filters['order_dir'] ?? 'ASC');
        
        // Validar dirección de ordenamiento
        if (!in_array($orderDir, ['ASC', 'DESC'])) {
            $orderDir = 'ASC';
        }
        
        $allowedOrders = ['id_producto', 'nombre', 'precio', 'stock', 'fecha_creacion'];
        if (in_array($orderBy, $allowedOrders)) {
            $sql .= " ORDER BY p.$orderBy $orderDir";
        } else {
            $sql .= " ORDER BY p.id_producto ASC";
        }
        
        // Límite y paginación
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT :limit";
            $params['limit'] = intval($filters['limit']);
            
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET :offset";
                $params['offset'] = intval($filters['offset']);
            }
        }
        
        $stmt = $db->prepare($sql);
        
        // Bind de parámetros con tipos específicos para LIMIT y OFFSET
        foreach ($params as $key => $value) {
            if ($key === 'limit' || $key === 'offset') {
                $stmt->bindValue(':' . $key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $value);
            }
        }
        
        $stmt->execute();
        $productos = $stmt->fetchAll();
        
        return [
            'success' => true,
            'productos' => $productos,
            'total' => count($productos)
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo productos: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener productos: ' . $e->getMessage()
        ];
    }
}

/**
 * Obtener un producto por ID
 */
function getProducto($id) {
    try {
        $db = getDB();
        
        $sql = "SELECT p.*, c.nombre_categoria 
                FROM productos p 
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
                WHERE p.id_producto = :id AND p.activo = TRUE 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $producto = $stmt->fetch();
        
        if ($producto) {
            return [
                'success' => true,
                'producto' => $producto
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Producto no encontrado'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error obteniendo producto: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener el producto'
        ];
    }
}

/**
 * Crear nuevo producto (requiere autenticación admin)
 */
function createProducto($data) {
    try {
        // Validar datos
        if (empty($data['nombre']) || empty($data['precio']) || empty($data['id_categoria'])) {
            return [
                'success' => false,
                'message' => 'Faltan campos obligatorios: nombre, precio, categoría'
            ];
        }
        
        $db = getDB();
        
        // CORREGIDO: Verificar que la categoría existe
        $checkCat = $db->prepare("SELECT id_categoria FROM categorias WHERE id_categoria = :id AND activo = TRUE");
        $checkCat->execute(['id' => $data['id_categoria']]);
        if (!$checkCat->fetch()) {
            return [
                'success' => false,
                'message' => 'La categoría especificada no existe o está inactiva'
            ];
        }
        
        $sql = "INSERT INTO productos 
                (nombre, descripcion, precio, imagen, id_categoria, stock, destacado, activo, fecha_creacion) 
                VALUES 
                (:nombre, :descripcion, :precio, :imagen, :id_categoria, :stock, :destacado, TRUE, NOW())";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'nombre' => sanitizeInput($data['nombre']),
            'descripcion' => sanitizeInput($data['descripcion'] ?? ''),
            'precio' => floatval($data['precio']),
            'imagen' => !empty($data['imagen']) ? sanitizeInput($data['imagen']) : null,
            'id_categoria' => intval($data['id_categoria']),
            'stock' => intval($data['stock'] ?? 0),
            'destacado' => isset($data['destacado']) && ($data['destacado'] === true || $data['destacado'] === 1 || $data['destacado'] === '1') ? 1 : 0
        ]);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'id_producto' => $db->lastInsertId()
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al crear el producto'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error creando producto: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al crear el producto: ' . $e->getMessage()
        ];
    }
}

/**
 * Actualizar producto (requiere autenticación admin)
 */
function updateProducto($id, $data) {
    try {
        $db = getDB();
        
        // Verificar que el producto existe
        $check = $db->prepare("SELECT id_producto FROM productos WHERE id_producto = :id");
        $check->execute(['id' => $id]);
        if (!$check->fetch()) {
            return [
                'success' => false,
                'message' => 'Producto no encontrado'
            ];
        }
        
        // Construir SQL dinámicamente
        $fields = [];
        $params = ['id' => $id];
        
        $allowedFields = ['nombre', 'descripcion', 'precio', 'imagen', 'id_categoria', 'stock', 'destacado', 'activo'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                
                if ($field === 'precio') {
                    $params[$field] = floatval($data[$field]);
                } elseif (in_array($field, ['id_categoria', 'stock'])) {
                    $params[$field] = intval($data[$field]);
                } elseif (in_array($field, ['destacado', 'activo'])) {
                    $params[$field] = ($data[$field] === true || $data[$field] === 1 || $data[$field] === '1') ? 1 : 0;
                } else {
                    $params[$field] = sanitizeInput($data[$field]);
                }
            }
        }
        
        if (empty($fields)) {
            return [
                'success' => false,
                'message' => 'No hay campos para actualizar'
            ];
        }
        
        $sql = "UPDATE productos SET " . implode(', ', $fields) . ", fecha_modificacion = NOW() 
                WHERE id_producto = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Producto actualizado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al actualizar el producto'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error actualizando producto: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar el producto: ' . $e->getMessage()
        ];
    }
}

/**
 * Eliminar producto (soft delete)
 */
function deleteProducto($id) {
    try {
        $db = getDB();
        
        $sql = "UPDATE productos SET activo = FALSE, fecha_modificacion = NOW() 
                WHERE id_producto = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute(['id' => $id]);
        
        if ($result && $stmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Producto no encontrado o ya eliminado'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error eliminando producto: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al eliminar el producto'
        ];
    }
}

// Procesar peticiones
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = getProducto($_GET['id']);
        } else {
            $filters = [
                'categoria' => $_GET['categoria'] ?? null,
                'id_categoria' => $_GET['id_categoria'] ?? null,
                'destacado' => $_GET['destacado'] ?? null,
                'precio_min' => $_GET['precio_min'] ?? null,
                'precio_max' => $_GET['precio_max'] ?? null,
                'search' => $_GET['search'] ?? null,
                'order_by' => $_GET['order_by'] ?? 'id_producto',
                'order_dir' => $_GET['order_dir'] ?? 'ASC',
                'limit' => $_GET['limit'] ?? null,
                'offset' => $_GET['offset'] ?? null
            ];
            
            $result = getProductos($filters);
        }
        jsonResponse($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $result = createProducto($data);
        jsonResponse($result, $result['success'] ? 201 : 400);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? $data['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID de producto requerido'], 400);
        }
        
        $result = updateProducto($id, $data);
        jsonResponse($result);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID de producto requerido'], 400);
        }
        
        $result = deleteProducto($id);
        jsonResponse($result);
        break;
        
    default:
        jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}