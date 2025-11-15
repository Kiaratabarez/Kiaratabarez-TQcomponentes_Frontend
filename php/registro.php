<?php
/**
 * PROBLEMAS ENCONTRADOS Y CORREGIDOS:
 * 1. session_start() se llamaba antes de require conexion.php que ya inicia sesión
 * 2. No se validaba correctamente el formato del email
 * 3. No se manejaban campos opcionales (telefono) correctamente
 */

require_once 'conexion.php';

// Configurar cabeceras
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Validar datos de registro
 */
function validateRegistrationData($data) {
    $errors = [];
    
    // Validar username
    if (empty($data['username'])) {
        $errors[] = 'El nombre de usuario es obligatorio';
    } elseif (strlen($data['username']) < 3) {
        $errors[] = 'El nombre de usuario debe tener al menos 3 caracteres';
    } elseif (strlen($data['username']) > 50) {
        $errors[] = 'El nombre de usuario no puede tener más de 50 caracteres';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
        $errors[] = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    
    // Validar email - CORREGIDO
    if (empty($data['email'])) {
        $errors[] = 'El email es obligatorio';
    } elseif (!isValidEmail($data['email'])) {
        $errors[] = 'El formato del email no es válido';
    } elseif (strlen($data['email']) > 100) {
        $errors[] = 'El email no puede tener más de 100 caracteres';
    }
    
    // Validar contraseña
    if (empty($data['password'])) {
        $errors[] = 'La contraseña es obligatoria';
    } elseif (strlen($data['password']) < 6) {
        $errors[] = 'La contraseña debe tener al menos 6 caracteres';
    } elseif (strlen($data['password']) > 100) {
        $errors[] = 'La contraseña no puede tener más de 100 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (empty($data['confirm_password'])) {
        $errors[] = 'Debe confirmar la contraseña';
    } elseif ($data['password'] !== $data['confirm_password']) {
        $errors[] = 'Las contraseñas no coinciden';
    }
    
    // Validar nombre completo (opcional)
    if (!empty($data['nombre_completo']) && strlen($data['nombre_completo']) > 150) {
        $errors[] = 'El nombre completo no puede tener más de 150 caracteres';
    }
    
    // Validar teléfono (opcional) - CORREGIDO
    if (!empty($data['telefono'])) {
        if (strlen($data['telefono']) > 20) {
            $errors[] = 'El teléfono no puede tener más de 20 caracteres';
        }
        if (!preg_match('/^[0-9\s\+\-\(\)]+$/', $data['telefono'])) {
            $errors[] = 'El formato del teléfono no es válido';
        }
    }
    
    return $errors;
}

/**
 * Verificar si el usuario o email ya existe
 */
function checkUserExists($username, $email) {
    try {
        $db = getDB();
        
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN username = :username THEN 1 ELSE 0 END) as username_exists,
                    SUM(CASE WHEN email = :email THEN 1 ELSE 0 END) as email_exists
                FROM usuarios 
                WHERE (username = :username OR email = :email) AND activo = TRUE";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'username' => $username,
            'email' => $email
        ]);
        
        return $stmt->fetch();
        
    } catch(Exception $e) {
        error_log("Error verificando usuario: " . $e->getMessage());
        return null;
    }
}

/**
 * Registrar nuevo usuario
 */
function registerUser($data) {
    try {
        // Validar datos
        $errors = validateRegistrationData($data);
        if (!empty($errors)) {
            return [
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $errors
            ];
        }
        
        $username = sanitizeInput($data['username']);
        $email = sanitizeInput($data['email']);
        $password = $data['password'];
        $nombre_completo = !empty($data['nombre_completo']) ? sanitizeInput($data['nombre_completo']) : '';
        $telefono = !empty($data['telefono']) ? sanitizeInput($data['telefono']) : null;
        
        // Verificar si el usuario ya existe
        $exists = checkUserExists($username, $email);
        
        if ($exists === null) {
            return [
                'success' => false,
                'message' => 'Error al verificar la disponibilidad del usuario'
            ];
        }
        
        if ($exists['username_exists'] > 0) {
            return [
                'success' => false,
                'message' => 'El nombre de usuario ya está registrado'
            ];
        }
        
        if ($exists['email_exists'] > 0) {
            return [
                'success' => false,
                'message' => 'El email ya está registrado'
            ];
        }
        
        // Hash de la contraseña
        $hashedPassword = hashPassword($password);
        
        // Insertar nuevo usuario
        $db = getDB();
        $sql = "INSERT INTO usuarios (username, email, password, nombre_completo, telefono, fecha_registro, activo) 
                VALUES (:username, :email, :password, :nombre_completo, :telefono, NOW(), TRUE)";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword,
            'nombre_completo' => $nombre_completo,
            'telefono' => $telefono
        ]);
        
        if ($result) {
            $userId = $db->lastInsertId();
            
            // Iniciar sesión automáticamente
            $_SESSION['user_id'] = $userId;
            $_SESSION['username'] = $username;
            $_SESSION['email'] = $email;
            $_SESSION['nombre_completo'] = $nombre_completo;
            $_SESSION['logged_in'] = true;
            $_SESSION['login_time'] = time();
            
            return [
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => [
                    'id' => $userId,
                    'username' => $username,
                    'email' => $email,
                    'nombre_completo' => $nombre_completo
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error al registrar el usuario'
            ];
        }
        
    } catch(Exception $e) {
        error_log("Error en registro: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al procesar el registro: ' . $e->getMessage()
        ];
    }
}

// Procesar peticiones POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Si no hay JSON, intentar con POST normal
    if ($data === null) {
        $data = $_POST;
    }
    
    $result = registerUser($data);
    jsonResponse($result, $result['success'] ? 201 : 400);
    
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido. Use POST'
    ], 405);
}