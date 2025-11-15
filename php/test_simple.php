<?php
/**
 * TEST SIMPLE - Sin incluir otros archivos
 * Guarda como: test_simple.php
 * Accede: http://localhost/tqcomponents/test_simple.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Test Simple de Conexión</h1>";

// 1. Verificar PHP
echo "<h2>1. PHP</h2>";
echo "Versión: " . phpversion() . "<br>";
echo "PDO instalado: " . (extension_loaded('pdo') ? 'SÍ ✅' : 'NO ❌') . "<br>";
echo "PDO MySQL instalado: " . (extension_loaded('pdo_mysql') ? 'SÍ ✅' : 'NO ❌') . "<br>";

// 2. Intentar conexión directa
echo "<h2>2. Conexión MySQL</h2>";

$configs = [
    ['host' => 'localhost', 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => ''],
    ['host' => 'localhost', 'user' => 'root', 'pass' => '1234'],
];

foreach ($configs as $config) {
    echo "<p>Probando: {$config['user']}@{$config['host']} pass: '" . ($config['pass'] ?: 'vacío') . "'</p>";
    
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};charset=utf8mb4",
            $config['user'],
            $config['pass']
        );
        
        echo "<div style='background: lightgreen; padding: 10px;'>";
        echo "✅ <strong>CONEXIÓN EXITOSA</strong><br>";
        
        // Verificar base de datos
        $stmt = $pdo->query("SHOW DATABASES LIKE 'tqcomponents_db'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Base de datos 'tqcomponents_db' existe<br>";
            
            // Conectar a la base de datos y ver tablas
            $pdo = new PDO(
                "mysql:host={$config['host']};dbname=tqcomponents_db;charset=utf8mb4",
                $config['user'],
                $config['pass']
            );
            
            $stmt = $pdo->query("SHOW TABLES");
            $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            echo "✅ Tablas encontradas: " . count($tablas) . "<br>";
            if (count($tablas) > 0) {
                echo "<ul>";
                foreach ($tablas as $tabla) {
                    echo "<li>$tabla</li>";
                }
                echo "</ul>";
            }
            
            echo "<h3>🎉 TODO CORRECTO - Usa esta configuración:</h3>";
            echo "<pre>DB_HOST = '{$config['host']}'
DB_USER = '{$config['user']}'
DB_PASS = '{$config['pass']}'
DB_NAME = 'tqcomponents_db'</pre>";
            
            echo "</div>";
            break; // Salir, ya encontramos la correcta
            
        } else {
            echo "⚠️ Base de datos 'tqcomponents_db' NO existe<br>";
            echo "👉 Debes crearla en phpMyAdmin<br>";
            echo "</div>";
        }
        
    } catch (PDOException $e) {
        echo "<div style='background: #ffcccc; padding: 10px;'>";
        echo "❌ Error: " . $e->getMessage();
        echo "</div>";
    }
    
    echo "<hr>";
}

// 3. Verificar ubicación de archivos
echo "<h2>3. Ubicación de Archivos</h2>";
echo "Este archivo está en: <code>" . __DIR__ . "</code><br>";
echo "Document Root: <code>" . $_SERVER['DOCUMENT_ROOT'] . "</code><br>";

echo "<h3>Archivos en este directorio:</h3>";
$archivos = scandir(__DIR__);
echo "<ul>";
foreach ($archivos as $archivo) {
    if ($archivo != '.' && $archivo != '..') {
        echo "<li>$archivo</li>";
    }
}
echo "</ul>";

// 4. Instrucciones
echo "<h2>4. Instrucciones</h2>";
echo "<ol>";
echo "<li>Abre XAMPP Control Panel</li>";
echo "<li>Asegúrate que Apache y MySQL estén corriendo (verde)</li>";
echo "<li>Abre phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
echo "<li>Crea la base de datos 'tqcomponents_db' si no existe</li>";
echo "<li>Importa el archivo TQcomponents.sql</li>";
echo "<li>Actualiza los valores en conexion.php con los que funcionaron arriba</li>";
echo "</ol>";
?>