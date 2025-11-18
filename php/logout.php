<?php
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*cierre de sesión*/
function logoutUser() {
    try {
        $_SESSION = [];
        
        if (isset($_COOKIE[session_name()])) {
            setcookie(
                session_name(), 
                '', 
                time() - 3600, 
                '/',           
                '',
                false,
                true         
            );
        }
        session_destroy();
        return [
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ];
        
    } catch(Exception $e) {
        error_log("Error en logout: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al cerrar la sesión'
        ];
    }
}
// Permite cerrar sesión 
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = logoutUser(); // Ejecuta la función de cierre de sesión.
    jsonResponse($result);  // Envía el resultado (éxito o fallo) como JSON.
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}