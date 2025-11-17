<?php
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*Procesar login de usuario*/
function processLogin($username, $password) {
    try {
        $db = getDB();
        
        $sql = "SELECT id_usuario, username, email, password, nombre_completo, is_admin, activo 
                FROM usuarios 
                WHERE (username = ? OR email = ?) 
                AND activo = TRUE 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([trim($username), trim($username)]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Usuario no encontrado o inactivo'
            ];
        }
        
        // Verificar contraseña
        if (!password_verify($password, $user['password'])) {
            return [
                'success' => false,
                'message' => 'Contraseña incorrecta'
            ];
        }
        
        // Actualizar último login
        $updateSql = "UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?";
        $updateStmt = $db->prepare($updateSql);
        $updateStmt->execute([$user['id_usuario']]);
        
        // Convertir is_admin a boolean estricto
        $isAdmin = ($user['is_admin'] == 1 || $user['is_admin'] === true || $user['is_admin'] === '1');
        
        // Crear sesión
        $_SESSION['user_id'] = $user['id_usuario'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['nombre_completo'] = $user['nombre_completo'];
        $_SESSION['is_admin'] = $isAdmin;
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        
        return [
            'success' => true,
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user['id_usuario'],
                'username' => $user['username'],
                'email' => $user['email'],
                'nombre_completo' => $user['nombre_completo'],
                'is_admin' => $isAdmin
            ]
        ];
        
    } catch(Exception $e) {
        error_log("Error en login: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error en el servidor'
        ];
    }
}

/*Verificar sesión activa*/
function checkSession() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['logged_in'])) {
        return [
            'success' => false,
            'message' => 'No hay sesión activa',
            'authenticated' => false
        ];
    }
    
    // Verificar tiempo de sesión 
    if (isset($_SESSION['login_time'])) {
        $sessionDuration = time() - $_SESSION['login_time'];
        if ($sessionDuration > 86400) {
            session_destroy();
            return [
                'success' => false,
                'message' => 'Sesión expirada',
                'authenticated' => false
            ];
        }
    }
    
    $isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
    
    return [
        'success' => true,
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'] ?? '',
            'nombre_completo' => $_SESSION['nombre_completo'] ?? '',
            'is_admin' => $isAdmin
        ]
    ];
}

/*Verifica si es administrador*/
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
        'success' => $isAdmin,
        'is_admin' => $isAdmin,
        'user' => $sessionCheck['user'],
        'message' => $isAdmin ? 'Usuario administrador' : 'Usuario sin permisos de administrador'
    ];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data === null) {
        $data = $_POST;
    }
    
    if (empty($action)) {
        $action = $data['action'] ?? '';
    }
    
    switch($action) {
        case 'login':
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Usuario y contraseña son obligatorios'
                ]);
            }
            
            $result = processLogin($username, $password);
            jsonResponse($result);
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
            ]);
    }
    
} elseif ($method === 'GET') {
    
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
                'message' => 'Acción GET no especificada'
            ]);
    }
    
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}