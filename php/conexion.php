<?php
//Acesos a la bd
define('DB_HOST', 'localhost');
define('DB_NAME', 'tqcomponents_db');
define('DB_USER', 'root');
define('DB_PASS', '');  
define('DB_CHARSET', 'utf8mb4');
date_default_timezone_set('America/Argentina/Buenos_Aires');
define('DEBUG_MODE', true); //mostrar errores en desarrollo

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

class Database { //singleton para conexión a la bd 
    private static $instance = null;
    private $conn; //inicia conexión
    
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
    
    public static function getInstance() {/*Obtiene instancia única de la conexión*/
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /*Obtener la conexión PDO*/
    public function getConnection() {
        return $this->conn;
    }
    
    /*Prevenir clonación del objet*/
    private function __clone() {}
    public function __wakeup() {
        throw new Exception("No se puede deserializar un singleton.");
    }
}

/*Función para obtener la conexión*/
function getDB() {
    return Database::getInstance()->getConnection();
}

function executeQuery($sql, $params = []) {/*Ejecuta consultas de forma segura. */
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

/*Limpiar datos entrada*/
function sanitizeInput($data) {
    if ($data === null) return null;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/*Función para validar email*/
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/*Función para generar hash de contraseña seguro*/
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/*verificar contraseña*/
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/*responder JSON*/
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/*verificar si el usuario está autenticado */
function isAuthenticated() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

/*verificar si el usuario es administrador*/
function isAdmin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

/*Configuración de sesión segura*/
function secureSessionStart() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); 
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
secureSessionStart();