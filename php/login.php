<?php
session_start(); 
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Procesar login de usuario
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function processLogin($username, $password) {
    try {
        $db = getDB();
        
        // CORREGIDO: Consulta sin ambigüedad en parámetros
        $sql = "SELECT id_usuario, username, email, password, nombre_completo, is_admin, activo 
                FROM usuarios 
                WHERE (username = ? OR email = ?) 
                AND activo = TRUE 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            sanitizeInput($username),
            sanitizeInput($username)
        ]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ];
        }
        
        // Verificar contraseña
        if (!verifyPassword($password, $user['password'])) {
            return [
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ];
        }
        
        // Actualizar último login
        $updateSql = "UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?";
        $db->prepare($updateSql)->execute([$user['id_usuario']]);
        
        // Crear sesión
        $_SESSION['user_id'] = $user['id_usuario'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['nombre_completo'] = $user['nombre_completo'];
        $_SESSION['is_admin'] = (bool)$user['is_admin'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        
        return [
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'user' => [
                'id' => $user['id_usuario'],
                'username' => $user['username'],
                'email' => $user['email'],
                'nombre_completo' => $user['nombre_completo'],
                'is_admin' => (bool)$user['is_admin']
            ]
        ];
        
    } catch(Exception $e) {
        error_log("Error en login: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al procesar el login: ' . $e->getMessage()
        ];
    }
}

/**
 * Verificar sesión activa
 */
function checkSession() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['logged_in'])) {
        return [
            'success' => false,
            'message' => 'No hay sesión activa',
            'authenticated' => false
        ];
    }
    
    // Verificar tiempo de sesión (24 horas)
    if (isset($_SESSION['login_time'])) {
        $sessionDuration = time() - $_SESSION['login_time'];
        if ($sessionDuration > 86400) {
            $_SESSION = [];
            session_destroy();
            
            return [
                'success' => false,
                'message' => 'Sesión expirada',
                'authenticated' => false
            ];
        }
    }
    
    return [
        'success' => true,
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'] ?? '',
            'nombre_completo' => $_SESSION['nombre_completo'] ?? '',
            'is_admin' => $_SESSION['is_admin'] ?? false
        ]
    ];
}

/**
 * Verificar si es administrador
 */
function checkAdmin() {
    $sessionCheck = checkSession();
    
    if (!$sessionCheck['success']) {
        return [
            'success' => false,
            'message' => 'No autenticado',
            'is_admin' => false
        ];
    }
    
    $isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
    
    return [
        'success' => true,
        'is_admin' => $isAdmin,
        'user' => $sessionCheck['user']
    ];
}

// Procesar peticiones
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data === null) {
        $data = $_POST;
    }
    
    $action = $data['action'] ?? $_GET['action'] ?? '';
    
    switch($action) {
        case 'login':
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Usuario y contraseña son obligatorios'
                ], 400);
            }
            
            $result = processLogin($username, $password);
            jsonResponse($result, $result['success'] ? 200 : 401);
            break;
            
        case 'check_session':
        case 'check':
            $result = checkSession();
            jsonResponse($result);
            break;
            
        case 'check_admin':
            $result = checkAdmin();
            jsonResponse($result);
            break;
            
        default:
            jsonResponse([
                'success' => false,
                'message' => 'Acción no válida'
            ], 400);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    $action = $_GET['action'] ?? '';
    
    switch($action) {
        case 'check_session':
        case 'check':
            $result = checkSession();
            jsonResponse($result);
            break;
            
        case 'check_admin':
            $result = checkAdmin();
            jsonResponse($result);
            break;
            
        default:
            jsonResponse([
                'success' => false,
                'message' => 'Acción no especificada'
            ], 400);
    }
    
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}
?>