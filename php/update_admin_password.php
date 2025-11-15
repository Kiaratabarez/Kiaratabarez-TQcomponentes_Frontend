<?php
/**
 * SCRIPT PARA CREAR/ACTUALIZAR USUARIO ADMINISTRADOR
 * Ejecuta este archivo UNA VEZ: http://localhost/tqcomponents/php/update_admin_password.php
 * Luego ELIMÍNALO por seguridad
 */

require_once 'conexion.php';

// Configuración del admin
$admin_username = 'admin';
$admin_email = 'admin@tqcomponents.com';
$admin_password = 'admin123';
$admin_nombre = 'Administrador del Sistema';

try {
    $db = getDB();
    
    // Generar hash de la contraseña
    $password_hash = hashPassword($admin_password);
    
    echo "<h2>🔐 Actualización de Usuario Administrador</h2>";
    echo "<style>body { font-family: Arial; padding: 20px; } .success { color: green; } .error { color: red; } pre { background: #f4f4f4; padding: 10px; }</style>";
    
    // Verificar si el usuario existe
    $check = $db->prepare("SELECT id_usuario, username, is_admin FROM usuarios WHERE username = :username");
    $check->execute(['username' => $admin_username]);
    $existing = $check->fetch();
    
    if ($existing) {
        // Actualizar usuario existente
        $sql = "UPDATE usuarios SET 
                email = :email,
                password = :password,
                nombre_completo = :nombre,
                is_admin = TRUE,
                activo = TRUE
                WHERE username = :username";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'email' => $admin_email,
            'password' => $password_hash,
            'nombre' => $admin_nombre,
            'username' => $admin_username
        ]);
        
        if ($result) {
            echo "<p class='success'>✅ Usuario administrador ACTUALIZADO correctamente</p>";
            echo "<p>Usuario actualizado: <strong>$admin_username</strong> (ID: {$existing['id_usuario']})</p>";
        } else {
            echo "<p class='error'>❌ Error al actualizar usuario</p>";
        }
        
    } else {
        // Crear nuevo usuario
        $sql = "INSERT INTO usuarios (username, email, password, nombre_completo, is_admin, activo) 
                VALUES (:username, :email, :password, :nombre, TRUE, TRUE)";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            'username' => $admin_username,
            'email' => $admin_email,
            'password' => $password_hash,
            'nombre' => $admin_nombre
        ]);
        
        if ($result) {
            $id = $db->lastInsertId();
            echo "<p class='success'>✅ Usuario administrador CREADO correctamente</p>";
            echo "<p>Nuevo usuario: <strong>$admin_username</strong> (ID: $id)</p>";
        } else {
            echo "<p class='error'>❌ Error al crear usuario</p>";
        }
    }
    
    // Mostrar información de login
    echo "<hr>";
    echo "<h3>📋 Credenciales de Acceso</h3>";
    echo "<pre>";
    echo "Usuario: <strong>$admin_username</strong>\n";
    echo "Contraseña: <strong>$admin_password</strong>\n";
    echo "Email: $admin_email\n";
    echo "</pre>";
    
    echo "<hr>";
    echo "<h3>🔐 Hash Generado</h3>";
    echo "<pre>$password_hash</pre>";
    
    echo "<hr>";
    echo "<h3>⚠️ IMPORTANTE</h3>";
    echo "<p style='color: red; font-weight: bold;'>ELIMINA ESTE ARCHIVO (update_admin_password.php) después de usarlo por seguridad.</p>";
    
    echo "<hr>";
    echo "<h3>🚀 Siguiente Paso</h3>";
    echo "<p>1. Ve a: <a href='../login.html'>login.html</a></p>";
    echo "<p>2. Ingresa con: <strong>admin</strong> / <strong>admin123</strong></p>";
    echo "<p>3. Deberías ser redirigido a <strong>admin.html</strong></p>";
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>