<?php
/**
 * PROBLEMAS ENCONTRADOS Y CORREGIDOS:
 * 1. No se validaba si la categoría existe antes de actualizar/eliminar
 * 2. La verificación de productos asociados no consideraba soft-delete
 * 3. Faltaba manejo de errores más específico
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
 * Obtener todas las categorías
 */
function getCategorias($includeInactive = false) {
    try {
        $db = getDB();
        
        $sql = "SELECT c.*, 
                COUNT(p.id_producto) as total_productos
                FROM categorias c
                LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = TRUE";
        
        if (!$includeInactive) {
            $sql .= " WHERE c.activo = TRUE";
        }
        
        $sql .= " GROUP BY c.id_categoria 
                ORDER BY c.nombre_categoria ASC";
        
        $stmt = $db->query($sql);
        $categorias = $stmt->fetchAll();
        
        return [
            'success' => true,
            'categorias' => $categorias,
            'total' => count($categorias)
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo categorías: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener categorías: ' . $e->getMessage()
        ];
    }
}

/**
 * Obtener una categoría por ID
 */
function getCategoria($id) {
    try {
        $db = getDB();
        
        $sql = "SELECT c.*, 
                COUNT(p.id_producto) as total_productos
                FROM categorias c
                LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = TRUE
                WHERE c.id_categoria = :id
                GROUP BY c.id_categoria
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $categoria = $stmt->fetch();
        
        if ($categoria) {
            return [
                'success' => true,
                'categoria' => $categoria
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Categoría no encontrada'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error obteniendo categoría: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener la categoría'
        ];
    }
}

/**
 * Crear nueva categoría
 */
function createCategoria($data) {
    try {
        // Validar datos
        if (empty($data['nombre_categoria'])) {
            return [
                'success' => false,
                'message' => 'El nombre de la categoría es obligatorio'
            ];
        }
        
        $db = getDB();
        
        // Verificar si ya existe - CORREGIDO: considerar solo activas
        $checkSql = "SELECT COUNT(*) FROM categorias WHERE nombre_categoria = :nombre AND activo = TRUE";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute(['nombre' => $data['nombre_categoria']]);
        
        if ($checkStmt->fetchColumn() > 0) {
            return [
                'success' => false,
                'message' => 'Ya existe una categoría activa con ese nombre'
            ];
        }
        
        $sql = "INSERT INTO categorias 
                (nombre_categoria, descripcion, activo, fecha_creacion) 
                VALUES 
                (:nombre_categoria, :descripcion, TRUE, NOW())";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'nombre_categoria' => sanitizeInput($data['nombre_categoria']),
            'descripcion' => sanitizeInput($data['descripcion'] ?? '')
        ]);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Categoría creada exitosamente',
                'id_categoria' => $db->lastInsertId()
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al crear la categoría'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error creando categoría: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al crear la categoría: ' . $e->getMessage()
        ];
    }
}

/**
 * Actualizar categoría
 */
function updateCategoria($id, $data) {
    try {
        $db = getDB();
        
        // CORREGIDO: Verificar que la categoría existe
        $check = $db->prepare("SELECT id_categoria FROM categorias WHERE id_categoria = :id");
        $check->execute(['id' => $id]);
        if (!$check->fetch()) {
            return [
                'success' => false,
                'message' => 'Categoría no encontrada'
            ];
        }
        
        // Construir SQL dinámicamente
        $fields = [];
        $params = ['id' => $id];
        
        if (isset($data['nombre_categoria'])) {
            // Verificar que el nuevo nombre no exista en otra categoría
            $checkName = $db->prepare("SELECT COUNT(*) FROM categorias WHERE nombre_categoria = :nombre AND id_categoria != :id AND activo = TRUE");
            $checkName->execute(['nombre' => $data['nombre_categoria'], 'id' => $id]);
            if ($checkName->fetchColumn() > 0) {
                return [
                    'success' => false,
                    'message' => 'Ya existe otra categoría con ese nombre'
                ];
            }
            
            $fields[] = "nombre_categoria = :nombre_categoria";
            $params['nombre_categoria'] = sanitizeInput($data['nombre_categoria']);
        }
        
        if (isset($data['descripcion'])) {
            $fields[] = "descripcion = :descripcion";
            $params['descripcion'] = sanitizeInput($data['descripcion']);
        }
        
        if (isset($data['activo'])) {
            $fields[] = "activo = :activo";
            $params['activo'] = ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
        }
        
        if (empty($fields)) {
            return [
                'success' => false,
                'message' => 'No hay campos para actualizar'
            ];
        }
        
        $sql = "UPDATE categorias SET " . implode(', ', $fields) . ", fecha_modificacion = NOW() 
                WHERE id_categoria = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Categoría actualizada exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al actualizar la categoría'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error actualizando categoría: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar la categoría: ' . $e->getMessage()
        ];
    }
}

/**
 * Eliminar categoría (soft delete)
 */
function deleteCategoria($id) {
    try {
        $db = getDB();
        
        // Verificar si tiene productos activos - CORREGIDO
        $checkSql = "SELECT COUNT(*) FROM productos WHERE id_categoria = :id AND activo = TRUE";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute(['id' => $id]);
        
        if ($checkStmt->fetchColumn() > 0) {
            return [
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene productos activos asociados'
            ];
        }
        
        $sql = "UPDATE categorias SET activo = FALSE, fecha_modificacion = NOW() 
                WHERE id_categoria = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute(['id' => $id]);
        
        if ($result && $stmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => 'Categoría eliminada exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Categoría no encontrada o ya eliminada'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error eliminando categoría: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al eliminar la categoría'
        ];
    }
}

// Procesar peticiones
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = getCategoria($_GET['id']);
        } else {
            $includeInactive = isset($_GET['include_inactive']) && $_GET['include_inactive'] === 'true';
            $result = getCategorias($includeInactive);
        }
        jsonResponse($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $result = createCategoria($data);
        jsonResponse($result, $result['success'] ? 201 : 400);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? $data['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID de categoría requerido'], 400);
        }
        
        $result = updateCategoria($id, $data);
        jsonResponse($result);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID de categoría requerido'], 400);
        }
        
        $result = deleteCategoria($id);
        jsonResponse($result);
        break;
        
    default:
        jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}