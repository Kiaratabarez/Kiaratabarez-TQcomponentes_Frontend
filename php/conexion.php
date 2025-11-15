<?php
/**
 * PROBLEMAS ENCONTRADOS Y CORREGIDOS:
 * 1. La contraseña estaba vacía ('') pero en XAMPP por defecto es '' o sin password
 * 2. Faltaba validación de conexión antes de usar
 * 3. El charset debe especificarse correctamente en el DSN
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'tqcomponents_db');
define('DB_USER', 'root');
define('DB_PASS', '');  // XAMPP usa password vacío por defecto
define('DB_CHARSET', 'utf8mb4');

// Configuración de la zona horaria
date_default_timezone_set('America/Argentina/Buenos_Aires');

// Configuración de errores (cambiar a false en producción)
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

/**
 * Clase para gestionar la conexión a la base de datos
 */
class Database {
    private static $instance = null;
    private $conn;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch(PDOException $e) {
            if (DEBUG_MODE) {
                die("Error de conexión: " . $e->getMessage());
            } else {
                die("Error al conectar con la base de datos. Por favor, contacte al administrador.");
            }
        }
    }
    
    /**
     * Obtener instancia única de la conexión (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Obtener la conexión PDO
     */
    public function getConnection() {
        return $this->conn;
    }
    
    /**
     * Prevenir clonación del objeto
     */
    private function __clone() {}
    
    /**
     * Prevenir deserialización del objeto
     */
    public function __wakeup() {
        throw new Exception("No se puede deserializar un singleton.");
    }
}

/**
 * Función helper para obtener la conexión
 */
function getDB() {
    return Database::getInstance()->getConnection();
}

/**
 * Función para ejecutar consultas preparadas de forma segura
 */
function executeQuery($sql, $params = []) {
    try {
        $db = getDB();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch(PDOException $e) {
        if (DEBUG_MODE) {
            die("Error en consulta: " . $e->getMessage());
        } else {
            error_log("Error SQL: " . $e->getMessage());
            return false;
        }
    }
}

/**
 * Función para sanitizar datos de entrada
 */
function sanitizeInput($data) {
    if ($data === null) return null;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Función para validar email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Función para generar hash de contraseña seguro
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Función para verificar contraseña
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Función para generar token de sesión seguro
 */
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Función para responder con JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Función para verificar si el usuario está autenticado
 */
function isAuthenticated() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

/**
 * Función para verificar si el usuario es administrador
 */
function isAdmin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

/**
 * Configuración de sesión segura
 */
function secureSessionStart() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); // Cambiar a 1 si usas HTTPS
        ini_set('session.cookie_samesite', 'Strict');
        
        session_name('TQCOMPONENTS_SESSION');
        session_start();
        
        // Regenerar ID de sesión periódicamente
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// Iniciar sesión segura automáticamente
secureSessionStart();