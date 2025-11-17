<?php
require_once 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function getDashboardStats() {
    try {
        $db = getDB();
        
        $stmtProductos = $db->query("SELECT COUNT(*) as total, 
                                    SUM(CASE WHEN destacado = TRUE THEN 1 ELSE 0 END) as destacados,
                                    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock
                                    FROM productos WHERE activo = TRUE");
        $productos = $stmtProductos->fetch();
        
        $stmtCategorias = $db->query("SELECT COUNT(*) as total FROM categorias WHERE activo = TRUE");
        $categorias = $stmtCategorias->fetch();
        
        $stmtUsuarios = $db->query("SELECT COUNT(*) as total,
                                    SUM(CASE WHEN ultimo_login IS NOT NULL THEN 1 ELSE 0 END) as activos
                                    FROM usuarios WHERE activo = TRUE");
        $usuarios = $stmtUsuarios->fetch();
        
        $pedidosStats = ['total' => 0, 'pendientes' => 0, 'completados' => 0, 'total_ventas' => 0];
        
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
        
        $productosMasVendidos = [];
        try {
            $stmtTop = $db->query("SELECT p.nombre, SUM(dp.cantidad) as total_vendido
                                FROM detalles_pedido dp
                                JOIN productos p ON dp.id_producto = p.id_producto
                                GROUP BY dp.id_producto
                                ORDER BY total_vendido DESC
                                LIMIT 5");
            $productosMasVendidos = $stmtTop->fetchAll();
        } catch(Exception $e) {
        }
        
        $stmtStockBajo = $db->query("SELECT id_producto, nombre, stock 
                                    FROM productos 
                                    WHERE activo = TRUE AND stock < 10 
                                    ORDER BY stock ASC 
                                    LIMIT 10");
        $stockBajo = $stmtStockBajo->fetchAll();
        
        $ultimosPedidos = [];
        try {
            $stmtUltimosPedidos = $db->query("SELECT id_pedido, numero_pedido, fecha_pedido, estado_pedido, total
                                            FROM pedidos
                                            ORDER BY fecha_pedido DESC
                                            LIMIT 10");
            $ultimosPedidos = $stmtUltimosPedidos->fetchAll();
        } catch(Exception $e) {
        }
        
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
        error_log("Error obteniendo estadísticas: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
        ];
    }
}

function initializeDatabase() {
    try {
        $db = getDB();
        
        $stmt = $db->query("SELECT COUNT(*) FROM categorias WHERE activo = TRUE");
        if ($stmt->fetchColumn() > 0) {
            return [
                'success' => true,
                'message' => 'Base de datos ya inicializada'
            ];
        }
        
        $categorias = [
            ['Placas', 'Placas y controladoras Arduino'],
            ['Sensores', 'Sensores de todo tipo'],
            ['Módulos', 'Módulos y componentes electrónicos'],
            ['Actuadores', 'Servos, motores y actuadores'],
            ['Accesorios', 'Cables, LEDs y accesorios varios']
        ];
        
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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    switch($action) {
        case 'stats':
        case 'dashboard':
            $result = getDashboardStats();
            break;
            
        case 'system':
            $result = getSystemInfo();
            break;
            
        default:
            $result = getDashboardStats();
    }
    
    jsonResponse($result);
    
} elseif ($method === 'POST') {
    switch($action) {
        case 'init':
            $result = initializeDatabase();
            break;
            
        default:
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