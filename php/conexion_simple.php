<?php
/**
 * ARCHIVO DE CONEXIÓN SIMPLIFICADO
 * Si el archivo principal no funciona, prueba con este
 */

// Mostrar TODOS los errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración básica
define('DB_HOST', 'localhost');
define('DB_NAME', 'tqcomponents_db');
define('DB_USER', 'root');
define('DB_PASS', ''); // Vacío para XAMPP por defecto

// Zona horaria
date_default_timezone_set('America/Argentina/Buenos_Aires');

// Variable global para la conexión
$GLOBALS['db_connection'] = null;

/**
 * Función simple para obtener la conexión
 */
function getDB() {
    // Si ya existe la conexión, devolverla
    if ($GLOBALS['db_connection'] !== null) {
        return $GLOBALS['db_connection'];
    }
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        
        $options = array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        );
        
        $GLOBALS['db_connection'] = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $GLOBALS['db_connection'];
        
    } catch(PDOException $e) {
        die("<h1>Error de Conexión</h1><p>" . $e->getMessage() . "</p>");
    }
}

/**
 * Limpiar texto
 */
function sanitizeInput($data) {
    if ($data === null) return null;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validar email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Hash de contraseña
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, array('cost' => 12));
}

/**
 * Verificar contraseña
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Responder con JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Verificar autenticación
 */
function isAuthenticated() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

/**
 * Iniciar sesión si no está iniciada
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Probar conexión al cargar el archivo
try {
    $test_connection = getDB();
    // Si llegamos aquí, la conexión funciona
} catch (Exception $e) {
    // Si hay error, se mostrará por el die() en getDB()
}
?>