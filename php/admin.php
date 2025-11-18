<?php
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/*Obtiene todas las métricas y estadísticas clave para el Dashboard del Administrador*/
function getDashboardStats() {
    try {
        $db = getDB();
        
        // Estadísticas de Productos
        $stmtProductos = $db->query("SELECT COUNT(*) as total, 
                                    SUM(CASE WHEN destacado = TRUE THEN 1 ELSE 0 END) as destacados,
                                    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock
                                    FROM productos WHERE activo = TRUE");
        $productos = $stmtProductos->fetch();
        
        // Estadísticas de Categorías
        $stmtCategorias = $db->query("SELECT COUNT(*) as total FROM categorias WHERE activo = TRUE");
        $categorias = $stmtCategorias->fetch();
        
        // Estadísticas de Usuarios
        $stmtUsuarios = $db->query("SELECT COUNT(*) as total,
                                    SUM(CASE WHEN ultimo_login IS NOT NULL THEN 1 ELSE 0 END) as activos
                                    FROM usuarios WHERE activo = TRUE");
        $usuarios = $stmtUsuarios->fetch();
        
        $pedidosStats = ['total' => 0, 'pendientes' => 0, 'completados' => 0, 'total_ventas' => 0];
        
        //Estadísticas de Pedidos y Ventas
        try {
            $stmtPedidos = $db->query("SELECT 
                                        COUNT(*) as total,
                                        SUM(CASE WHEN estado_pedido = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                                        SUM(CASE WHEN estado_pedido = 'entregado' THEN 1 ELSE 0 END) as completados,
                                        SUM(CASE WHEN estado_pedido = 'entregado' THEN total ELSE 0 END) as total_ventas
                                        FROM pedidos");
            $pedidosStats = $stmtPedidos->fetch();
        } catch(Exception $e) {
        }
        
        //Productos Más Vendidos
        $productosMasVendidos = [];
        try {
            // Une detalle para sumar la cantidad vendida de cada uno
            $stmtTop = $db->query("SELECT p.nombre, SUM(dp.cantidad) as total_vendido
                                FROM detalles_pedido dp
                                JOIN productos p ON dp.id_producto = p.id_producto
                                GROUP BY dp.id_producto
                                ORDER BY total_vendido DESC
                                LIMIT 5");
            $productosMasVendidos = $stmtTop->fetchAll();
        } catch(Exception $e) {
        }
        
        //Productos Stock Bajo 
        $stmtStockBajo = $db->query("SELECT id_producto, nombre, stock 
                                    FROM productos 
                                    WHERE activo = TRUE AND stock < 10 
                                    ORDER BY stock ASC 
                                    LIMIT 10");
        $stockBajo = $stmtStockBajo->fetchAll();
        
        //10 Pedidos Recientes
        $ultimosPedidos = [];
        try {
            $stmtUltimosPedidos = $db->query("SELECT id_pedido, numero_pedido, fecha_pedido, estado_pedido, total
                                            FROM pedidos
                                            ORDER BY fecha_pedido DESC
                                            LIMIT 10");
            $ultimosPedidos = $stmtUltimosPedidos->fetchAll();
        } catch(Exception $e) {
        }
        
        // Retorna todas las estadísticas juntas para el front
        return [
            'success' => true,
            'stats' => [
                'productos' => $productos,
                'categorias' => $categorias,
                'usuarios' => $usuarios,
                'pedidos' => $pedidosStats,
                'productos_mas_vendidos' => $productosMasVendidos,
                'stock_bajo' => $stockBajo,
                'ultimos_pedidos' => $ultimosPedidos
            ]
        ];
        
    } catch(Exception $e) {
        // En caso de error en la DB, registra el error y retorna error
        error_log("Error obteniendo estadísticas: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
        ];
    }
}

/*Inserta categoría si la base de datos está vacía*/
function initializeDatabase() {
    try {
        $db = getDB();
        
        // verifica si ya hay categorías activas
        $stmt = $db->query("SELECT COUNT(*) FROM categorias WHERE activo = TRUE");
        if ($stmt->fetchColumn() > 0) {
            return [
                'success' => true,
                'message' => 'Base de datos ya inicializada'
            ];
        }
        
        //categorías predeterminadas
        $categorias = [
            ['Placas', 'Placas y controladoras Arduino'],
            ['Sensores', 'Sensores de todo tipo'],
            ['Módulos', 'Módulos y componentes electrónicos'],
            ['Actuadores', 'Servos, motores y actuadores'],
            ['Accesorios', 'Cables, LEDs y accesorios varios']
        ];
        
        //insertar categorías
        $sql = "INSERT INTO categorias (nombre_categoria, descripcion, activo) VALUES (:nombre, :descripcion, TRUE)";
        $stmt = $db->prepare($sql);
        
        foreach ($categorias as $cat) {
            $stmt->execute([
                'nombre' => $cat[0],
                'descripcion' => $cat[1]
            ]);
        }
        
        return [
            'success' => true,
            'message' => 'Base de datos inicializada correctamente'
        ];
        
    } catch(Exception $e) {
        // Maneja el error de inserción o conexión
        error_log("Error inicializando base de datos: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al inicializar la base de datos'
        ];
    }
}

function getSystemInfo() {
    try {
        
        return [
            'success' => true,
            'system' => [
                'php_version' => phpversion(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'database' => DB_NAME,
                'max_upload_size' => ini_get('upload_max_filesize'),
                'max_execution_time' => ini_get('max_execution_time'),
                'memory_limit' => ini_get('memory_limit'),
                'timezone' => date_default_timezone_get()
            ]
        ];
    } catch(Exception $e) {
        return [
            'success' => false,
            'message' => 'Error obteniendo información del sistema'
        ];
    }
}

$method = $_SERVER['REQUEST_METHOD']; // Obtiene el metodo HTTP
$action = $_GET['action'] ?? ''; // Obtiene el parametro de acción de la URL

if ($method === 'GET') {
    switch($action) {
        case 'stats':
        case 'dashboard':
            // Endpoint para obtener todas las estadísticas del dashboard
            $result = getDashboardStats();
            break;
            
        case 'system':
            // Endpoint para obtener información del sistema
            $result = getSystemInfo();
            break;
            
        default:
            // si GET no tiene accion, devuelve las estadisticas
            $result = getDashboardStats();
    }
    
    jsonResponse($result);
    
} elseif ($method === 'POST') {
    switch($action) {
        case 'init':
            // Endpoint para inicializar las categorías
            $result = initializeDatabase();
            break;
            
        default:
            // Si la acción POST no es valida, error
            $result = [
                'success' => false,
                'message' => 'Acción no válida'
            ];
    }
    
    jsonResponse($result);
    
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}