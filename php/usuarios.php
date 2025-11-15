// ============= usuarios.php (CORREGIDO) =============
<?php
/**
 * PROBLEMAS ENCONTRADOS Y CORREGIDOS:
 * 1. session_start() duplicado
 * 2. No se validaba correctamente el email al actualizar
 * 3. Faltaba verificar que no se pueda desactivar el propio usuario
 */

require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function getUsuarios($filters = []) {
    try {
        $db = getDB();
        
        $sql = "SELECT id_usuario, username, email, nombre_completo, telefono, 
                fecha_registro, ultimo_login, activo
                FROM usuarios 
                WHERE 1=1";
        
        $params = [];
        
        if (isset($filters['activo'])) {
            $sql .= " AND activo = :activo";
            $params['activo'] = $filters['activo'] ? 1 : 0;
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (username LIKE :search OR email LIKE :search OR nombre_completo LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        $sql .= " ORDER BY fecha_registro DESC";
        
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
        $usuarios = $stmt->fetchAll();
        
        return [
            'success' => true,
            'usuarios' => $usuarios,
            'total' => count($usuarios)
        ];
        
    } catch(Exception $e) {
        error_log("Error obteniendo usuarios: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener usuarios: ' . $e->getMessage()
        ];
    }
}

function getUsuario($id) {
    try {
        $db = getDB();
        
        $sql = "SELECT id_usuario, username, email, nombre_completo, telefono, 
                fecha_registro, ultimo_login, activo
                FROM usuarios 
                WHERE id_usuario = :id 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $usuario = $stmt->fetch();
        
        if ($usuario) {
            return [
                'success' => true,
                'usuario' => $usuario
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Usuario no encontrado'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error obteniendo usuario: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener el usuario'
        ];
    }
}

function updateUsuario($id, $data) {
    try {
        $db = getDB();
        
        $fields = [];
        $params = ['id' => $id];
        
        $allowedFields = ['email', 'nombre_completo', 'telefono', 'activo'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                
                if ($field === 'activo') {
                    $params[$field] = ($data[$field] === true || $data[$field] === 1 || $data[$field] === '1') ? 1 : 0;
                } elseif ($field === 'email') {
                    if (!isValidEmail($data[$field])) {
                        return [
                            'success' => false,
                            'message' => 'Email no válido'
                        ];
                    }
                    $params[$field] = sanitizeInput($data[$field]);
                } else {
                    $params[$field] = sanitizeInput($data[$field]);
                }
            }
        }
        
        if (!empty($data['new_password'])) {
            if (strlen($data['new_password']) < 6) {
                return [
                    'success' => false,
                    'message' => 'La contraseña debe tener al menos 6 caracteres'
                ];
            }
            $fields[] = "password = :password";
            $params['password'] = hashPassword($data['new_password']);
        }
        
        if (empty($fields)) {
            return [
                'success' => false,
                'message' => 'No hay campos para actualizar'
            ];
        }
        
        $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id_usuario = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);
        
        if ($result) {
            return [
                'success' => true,
                'message' => 'Usuario actualizado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al actualizar el usuario'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error actualizando usuario: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar el usuario: ' . $e->getMessage()
        ];
    }
}

function deleteUsuario($id) {
    try {
        // CORREGIDO: Verificar que no sea el usuario actual
        if (isAuthenticated() && $_SESSION['user_id'] == $id) {
            return [
                'success' => false,
                'message' => 'No puedes eliminar tu propio usuario'
            ];
        }
        
        $db = getDB();
        
        $sql = "UPDATE usuarios SET activo = FALSE WHERE id_usuario = :id";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute(['id' => $id]);
        
        if ($result && $stmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Usuario no encontrado o ya eliminado'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error eliminando usuario: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al eliminar el usuario'
        ];
    }
}

function getProfile() {
    if (!isAuthenticated()) {
        return [
            'success' => false,
            'message' => 'No autenticado'
        ];
    }
    
    return getUsuario($_SESSION['user_id']);
}

function updateProfile($data) {
    if (!isAuthenticated()) {
        return [
            'success' => false,
            'message' => 'No autenticado'
        ];
    }
    
    if (!empty($data['new_password'])) {
        if (empty($data['current_password'])) {
            return [
                'success' => false,
                'message' => 'Debe proporcionar la contraseña actual'
            ];
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT password FROM usuarios WHERE id_usuario = :id");
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!verifyPassword($data['current_password'], $user['password'])) {
            return [
                'success' => false,
                'message' => 'Contraseña actual incorrecta'
            ];
        }
    }
    
    return updateUsuario($_SESSION['user_id'], $data);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($method) {
    case 'GET':
        if ($action === 'profile') {
            $result = getProfile();
        } elseif (isset($_GET['id'])) {
            $result = getUsuario($_GET['id']);
        } else {
            $filters = [
                'activo' => isset($_GET['activo']) ? ($_GET['activo'] === 'true') : null,
                'search' => $_GET['search'] ?? null,
                'limit' => $_GET['limit'] ?? null,
                'offset' => $_GET['offset'] ?? null
            ];
            $result = getUsuarios($filters);
        }
        jsonResponse($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        if ($action === 'profile') {
            $result = updateProfile($data);
        } else {
            jsonResponse(['success' => false, 'message' => 'Acción no válida'], 400);
        }
        jsonResponse($result);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($action === 'profile') {
            $result = updateProfile($data);
        } else {
            $id = $_GET['id'] ?? $data['id'] ?? null;
            
            if (!$id) {
                jsonResponse(['success' => false, 'message' => 'ID de usuario requerido'], 400);
            }
            
            $result = updateUsuario($id, $data);
        }
        jsonResponse($result);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID de usuario requerido'], 400);
        }
        
        $result = deleteUsuario($id);
        jsonResponse($result);
        break;
        
    default:
        jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}