<?php
require_once "conexion.php";

try {
    $db = getDB();
    echo "Conexión OK";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
