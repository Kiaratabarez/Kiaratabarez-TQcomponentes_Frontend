<?php
/**
 * GENERA HASH CORRECTO PARA LA CONTRASEÑA
 * Ejecuta: http://localhost/tqcomponents/php/generar_hash.php
 */

$password = 'Admin123';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

echo "<h2>Hash Generado</h2>";
echo "<p>Contraseña: <strong>$password</strong></p>";
echo "<p>Hash:</p>";
echo "<pre style='background:#f4f4f4; padding:10px; word-wrap:break-word;'>$hash</pre>";
echo "<hr>";
echo "<h3>Copia este SQL y ejecútalo en phpMyAdmin:</h3>";
echo "<pre style='background:#f4f4f4; padding:10px;'>
UPDATE usuarios 
SET password = '$hash'
WHERE username = 'admin';
</pre>";
?>