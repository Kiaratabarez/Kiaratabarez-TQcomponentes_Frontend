<?php
/**
 * ARCHIVO DE DIAGNÓSTICO COMPLETO
 * Guarda este archivo como: test_diagnostico.php
 * Accede a: http://localhost/tqcomponents/test_diagnostico.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Diagnóstico del Sistema TQComponents</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .ok { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .warning { color: orange; font-weight: bold; }
    .section { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    pre { background: #f0f0f0; padding: 10px; border-radius: 3px; }
</style>";

// ============================================
// 1. VERIFICAR PHP
// ============================================
echo "<div class='section'>";
echo "<h2>1️⃣ Verificación de PHP</h2>";
echo "Versión de PHP: <span class='ok'>" . phpversion() . "</span><br>";
echo "Sistema Operativo: " . PHP_OS . "<br>";

$required_extensions = ['pdo', 'pdo_mysql', 'mysqli', 'json', 'session'];
echo "<h3>Extensiones Requeridas:</h3>";
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ <span class='ok'>$ext</span> - Instalada<br>";
    } else {
        echo "❌ <span class='error'>$ext</span> - NO INSTALADA<br>";
    }
}
echo "</div>";

// ============================================
// 2. VERIFICAR RUTAS Y ARCHIVOS
// ============================================
echo "<div class='section'>";
echo "<h2>2️⃣ Verificación de Archivos</h2>";
echo "Directorio actual: <code>" . __DIR__ . "</code><br>";
echo "Ruta completa de este archivo: <code>" . __FILE__ . "</code><br><br>";

$archivos_requeridos = [
    'conexion.php',
    'productos.php',
    'categorias.php',
    'login.php',
    'registro.php',
    'usuarios.php',
    'pedidos.php',
    'admin.php',
    'logout.php'
];

echo "<h3>Archivos PHP del proyecto:</h3>";
foreach ($archivos_requeridos as $archivo) {
    $ruta = __DIR__ . '/' . $archivo;
    if (file_exists($ruta)) {
        echo "✅ <span class='ok'>$archivo</span> - Encontrado<br>";
    } else {
        echo "❌ <span class='error'>$archivo</span> - NO ENCONTRADO en: $ruta<br>";
    }
}
echo "</div>";

// ============================================
// 3. PROBAR CONEXIÓN A MYSQL (SIN INCLUIR ARCHIVOS)
// ============================================
echo "<div class='section'>";
echo "<h2>3️⃣ Prueba de Conexión MySQL Directa</h2>";

// Configuración de base de datos
$db_configs = [
    ['host' => 'localhost', 'user' => 'root', 'pass' => '', 'name' => 'tqcomponents_db'],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => '', 'name' => 'tqcomponents_db'],
    ['host' => 'localhost', 'user' => 'root', 'pass' => '1234', 'name' => 'tqcomponents_db'],
];

$conexion_exitosa = false;
$config_correcta = null;

foreach ($db_configs as $config) {
    echo "<h3>Probando: {$config['user']}@{$config['host']} con password: '" . ($config['pass'] ? '****' : 'vacío') . "'</h3>";
    
    try {
        $dsn = "mysql:host={$config['host']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['user'], $config['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        echo "✅ <span class='ok'>Conexión a MySQL exitosa</span><br>";
        
        // Verificar si existe la base de datos
        $stmt = $pdo->query("SHOW DATABASES LIKE '{$config['name']}'");
        if ($stmt->rowCount() > 0) {
            echo "✅ <span class='ok'>Base de datos '{$config['name']}' existe</span><br>";
            
            // Conectar a la base de datos
            $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4", $config['user'], $config['pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Verificar tablas
            $stmt = $pdo->query("SHOW TABLES");
            $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (count($tablas) > 0) {
                echo "✅ <span class='ok'>Tablas encontradas (" . count($tablas) . "):</span><br>";
                echo "<pre>" . implode("\n", $tablas) . "</pre>";
                
                $conexion_exitosa = true;
                $config_correcta = $config;
                break; // Salir del loop, encontramos la configuración correcta
            } else {
                echo "⚠️ <span class='warning'>Base de datos existe pero no tiene tablas. Necesitas importar el SQL.</span><br>";
            }
        } else {
            echo "❌ <span class='error'>Base de datos '{$config['name']}' NO existe</span><br>";
            echo "👉 Debes crearla en phpMyAdmin primero<br>";
        }
        
    } catch (PDOException $e) {
        echo "❌ <span class='error'>Error de conexión:</span> " . $e->getMessage() . "<br>";
    }
    
    echo "<hr>";
}

if ($conexion_exitosa && $config_correcta) {
    echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;'>";
    echo "<h3 style='color: #155724;'>✅ CONFIGURACIÓN CORRECTA ENCONTRADA</h3>";
    echo "<p>Usa estos valores en tu conexion.php:</p>";
    echo "<pre>define('DB_HOST', '{$config_correcta['host']}');
define('DB_NAME', '{$config_correcta['name']}');
define('DB_USER', '{$config_correcta['user']}');
define('DB_PASS', '{$config_correcta['pass']}');</pre>";
    echo "</div>";
}

echo "</div>";

// ============================================
// 4. PROBAR ARCHIVO conexion.php
// ============================================
echo "<div class='section'>";
echo "<h2>4️⃣ Prueba del archivo conexion.php</h2>";

if (file_exists(__DIR__ . '/conexion.php')) {
    echo "Intentando incluir conexion.php...<br>";
    
    try {
        require_once __DIR__ . '/conexion.php';
        echo "✅ <span class='ok'>Archivo conexion.php cargado correctamente</span><br>";
        
        // Probar función getDB()
        if (function_exists('getDB')) {
            echo "✅ <span class='ok'>Función getDB() existe</span><br>";
            
            try {
                $db = getDB();
                echo "✅ <span class='ok'>Conexión mediante getDB() exitosa</span><br>";
                
                // Probar una consulta
                $stmt = $db->query("SELECT 1 as test");
                $result = $stmt->fetch();
                if ($result['test'] == 1) {
                    echo "✅ <span class='ok'>Query de prueba exitosa</span><br>";
                }
                
            } catch (Exception $e) {
                echo "❌ <span class='error'>Error al usar getDB():</span> " . $e->getMessage() . "<br>";
            }
        } else {
            echo "❌ <span class='error'>Función getDB() no existe</span><br>";
        }
        
    } catch (Exception $e) {
        echo "❌ <span class='error'>Error al cargar conexion.php:</span> " . $e->getMessage() . "<br>";
        echo "<pre>" . $e->getTraceAsString() . "</pre>";
    }
} else {
    echo "❌ <span class='error'>Archivo conexion.php NO encontrado</span><br>";
}

echo "</div>";

// ============================================
// 5. INFORMACIÓN DEL SERVIDOR
// ============================================
echo "<div class='section'>";
echo "<h2>5️⃣ Información del Servidor</h2>";
echo "Document Root: <code>" . $_SERVER['DOCUMENT_ROOT'] . "</code><br>";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "Script Filename: <code>" . $_SERVER['SCRIPT_FILENAME'] . "</code><br>";
echo "PHP Self: <code>" . $_SERVER['PHP_SELF'] . "</code><br>";
echo "</div>";

// ============================================
// 6. VERIFICAR XAMPP
// ============================================
echo "<div class='section'>";
echo "<h2>6️⃣ Verificación de XAMPP</h2>";

$xampp_paths = [
    'C:/xampp/htdocs',
    'C:/xampp/mysql/bin/mysql.exe',
    'C:/xampp/apache/bin/httpd.exe'
];

foreach ($xampp_paths as $path) {
    if (file_exists($path)) {
        echo "✅ <span class='ok'>$path</span> - Encontrado<br>";
    } else {
        echo "❌ <span class='error'>$path</span> - NO encontrado<br>";
    }
}

echo "</div>";

// ============================================
// 7. RECOMENDACIONES
// ============================================
echo "<div class='section'>";
echo "<h2>7️⃣ Pasos a Seguir</h2>";
echo "<ol>";
echo "<li>Verifica que MySQL esté corriendo en XAMPP Control Panel</li>";
echo "<li>Abre phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
echo "<li>Crea la base de datos 'tqcomponents_db' si no existe</li>";
echo "<li>Importa el archivo TQcomponents.sql</li>";
echo "<li>Verifica que todos los archivos PHP estén en: <code>C:/xampp/htdocs/tqcomponents/</code></li>";
echo "<li>Actualiza DB_PASS en conexion.php según la configuración correcta mostrada arriba</li>";
echo "</ol>";
echo "</div>";

echo "<div class='section'>";
echo "<h2>📋 Información para Soporte</h2>";
echo "<p>Si necesitas ayuda, copia toda esta página y compártela.</p>";
echo "</div>";
?>