-- ============================================================================
--  BASE DE DATOS TQCOMPONENTS
-- ============================================================================

CREATE DATABASE IF NOT EXISTS tqcomponents_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tqcomponents_db;

-- ============================================================================
--  TABLA ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
--  TABLA CATEGORÍAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
--  TABLA USUARIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    id_rol INT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_username ON usuarios(username);
CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_is_admin ON usuarios(is_admin);

-- ============================================================================
--  TABLA PRODUCTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255),
    id_categoria INT NOT NULL,
    stock INT DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categoria ON productos(id_categoria);
CREATE INDEX idx_destacado ON productos(destacado);
CREATE INDEX idx_precio ON productos(precio);
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- ============================================================================
--  TABLA DIRECCIONES DE ENVÍO
-- ============================================================================
CREATE TABLE IF NOT EXISTS direcciones_envio (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    predeterminada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
--  TABLAS PEDIDOS, DETALLES, CARRITO, PAGO
-- ============================================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    id_usuario INT NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    apellido_cliente VARCHAR(100) NOT NULL,
    email_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    direccion_envio VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    costo_envio DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado_pago ENUM('pendiente','pagado','fallido','reembolsado') DEFAULT 'pendiente',
    estado_pedido ENUM('pendiente','procesando','enviado','entregado','cancelado') DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    fecha_envio TIMESTAMP NULL,
    fecha_entrega TIMESTAMP NULL,
    notas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

CREATE TABLE IF NOT EXISTS detalles_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_usuario_producto (id_usuario, id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS informacion_pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    numero_tarjeta_enmascarado VARCHAR(20),
    nombre_tarjeta VARCHAR(150),
    fecha_expiracion VARCHAR(7),
    tipo_tarjeta VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
--  INSERTAR ROLES
-- ============================================================================
INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
(1,'Administrador','Acceso completo al sistema'),
(2,'Usuario','Usuario regular de la tienda')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ============================================================================
--  INSERTAR USUARIO ADMIN
-- ============================================================================
INSERT INTO usuarios (username, email, password, nombre_completo, id_rol, is_admin, activo) VALUES
('admin','admin@tqcomponents.com',
'$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Administrador del Sistema',1,TRUE,TRUE)
ON DUPLICATE KEY UPDATE
password = VALUES(password),
id_rol = 1,
is_admin = TRUE,
activo = TRUE;

-- ============================================================================
--  CARGA DE 58 PRODUCTOS
-- ============================================================================
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado, activo) VALUES
('Arduino Uno R3','',36003,'imagenes/Placas/PlacaUNO-R3.jpg',1,50,TRUE,TRUE),
('Servo motor MG995 180 grados','',8509,'imagenes/Actuadores/Servomotor-MG995-180grados.jpg',4,50,TRUE,TRUE),
('Módulo Bluetooth HC-05','',2500,'imagenes/Modulos/MóduloBluetooth_HC-05.jpg',3,50,TRUE,TRUE),
('Cables Dupont H-H 40 und','',1000,'imagenes/Accesorios/CablesDupont_H-H40und.jpg',5,50,TRUE,TRUE),
('Sensor Ultrasonido','',2000,'imagenes/Sensores/sensordistanciaUltrasonico-HcSr04.png',2,50,TRUE,TRUE),
('Arduino Mega 2560','',15000,'imagenes/Placas/Arduino-mega2560.jpg',1,50,TRUE,TRUE),
('Pack de LEDs Rojos','',1500,'imagenes/Accesorios/LedsRojos.png',5,50,TRUE,TRUE),
('Joystick Shield','',15000,'imagenes/Actuadores/joystickshield-7Pulsadores.png',4,50,FALSE,TRUE),
('Pantalla LCD','',5000,'imagenes/Modulos/DisplayLCD-azul-1602.jpg',3,50,FALSE,TRUE),
('Cables Dupont M-H 40 und','',1500,'imagenes/Accesorios/CablesDupontM-H40und.jpg',5,50,FALSE,TRUE),
('Sensor Infrarojo','',7000,'imagenes/Sensores/sensorinfrarrojo.png',2,50,FALSE,TRUE),
('Arduino Nano','',8000,'imagenes/Placas/PlacaNano.jpg',1,50,TRUE,TRUE),
('Shield L298','',25262,'imagenes/Placas/shieldparamotoresL298p.png',1,50,FALSE,TRUE),
('Servo metálico MG90S Pro 180°','',4200,'imagenes/Actuadores/Servodeengranajemetálico-MG90SPro-180grados.jpg',4,50,FALSE,TRUE),
('Módulo relé óptoacoplado 4 canales','',3800,'imagenes/Modulos/modulo-releOptoacoplado-4Canales.png',3,50,FALSE,TRUE),
('Sensor de luz (LDR / fotoresistor)','',1200,'imagenes/Sensores/sensordeluz-conLdrFotoresistor.png',2,50,FALSE,TRUE),
('Batería LiPo 22,2 V 6S 5000 mAh','',32000,'imagenes/Accesorios/BateriaLipo-Turnigy22.2v6s5000Mah.png',5,50,FALSE,TRUE),
('Motor Shield / driver L293D (Arduino)','',14500,'imagenes/Placas/Placaontrolador-L293D.jpg',1,50,FALSE,TRUE),
('Módulo Bluetooth HC-06 / RF','',2800,'imagenes/Modulos/MóduloRF Bluetooth_HC-06.jpg',3,50,FALSE,TRUE),
('Sensor infrarrojo detector de flama','',4500,'imagenes/Sensores/sensorinfrarrojo-Detectorflama.png',2,50,FALSE,TRUE),
('Batería LiPo 4000 mAh 4S','',19000,'imagenes/Accesorios/BateriaLipo-Turnigy4000mah4s30c.png',5,50,FALSE,TRUE),
('Controlador de motor L298N','',9900,'imagenes/Placas/ControladordeMotor-L298NDriver.jpg',1,50,FALSE,TRUE),
('Servo metálico MG90S 360°','',5000,'imagenes/Actuadores/Servometálico-MG90S-360°.jpg',4,50,FALSE,TRUE),
('Sensor PIR (detector de movimiento) SR501','',5300,'imagenes/Sensores/SensorDetectorMovimineto-PirSr501.png',2,50,FALSE,TRUE),
('Cables Dupont M-M 40 und','',1100,'imagenes/Accesorios/CablesDupontM-M_40und.jpg',5,50,FALSE,TRUE),
('Placa microcontrolador genérica','',6000,'imagenes/Placas/placademicrocontrolador.png',1,50,FALSE,TRUE),
('Módulo Ethernet ENC28J60','',8800,'imagenes/Modulos/modulodeRedEthernetLan-Enc28j60 .png',3,50,FALSE,TRUE),
('Sensor de sonido KY-037','',1500,'imagenes/Sensores/Arduino-Ky037.png',2,50,FALSE,TRUE),
('Cable USB A-B 30 cm','',900,'imagenes/Accesorios/CableUsbAUsbB_30cm.jpg',5,50,FALSE,TRUE),
('Placa Mega compatible 2560 R3','',14000,'imagenes/Placas/PlacaMega-Compatible-2560R3.jpg',1,50,FALSE,TRUE),
('Módulo sensor MQ-2 / gas / humo / CO','',4800,'imagenes/Modulos/modulosensormq2-DetectorGasHumoMonoxido.png',3,50,FALSE,TRUE),
('Cámara / módulo cámara para Arduino','',12000,'imagenes/Sensores/Arduinocamara.png',2,50,FALSE,TRUE),
('Display LED 3 dígitos','',2500,'imagenes/Accesorios/DisplayLed-3Digitos.jpg',5,50,FALSE,TRUE),
('Arduino Nano RP2040','',11000,'imagenes/Placas/ArduinoNanoRP2040.png',1,50,FALSE,TRUE),
('Módulo sensor de luz / fotodiodo LM393','',1700,'imagenes/Modulos/modulosensordeluz-FotodiodoLm393.png',3,50,FALSE,TRUE),
('Sensor de lluvia / lluvia Arduino','',1600,'imagenes/Sensores/sensorarduino-Rain.png',2,50,FALSE,TRUE),
('LEDs amarillos (pack)','',1200,'imagenes/Accesorios/LedsAmarillo.png',5,50,FALSE,TRUE),
('Placa NodeMCU / ESP8266','',13500,'imagenes/Placas/placanodemcu-Esp8266Wifi.png',1,50,FALSE,TRUE),
('Pantalla táctil 2.8″','',9500,'imagenes/Modulos/pantalladisplay-Tactil2.8p.png',3,50,FALSE,TRUE),
('Sensor de tierra / humedad de suelo','',2200,'imagenes/Sensores/sensorarduino-Tierra.png',2,50,FALSE,TRUE),
('LEDs azules (pack)','',1200,'imagenes/Accesorios/LedsAzul.png',5,50,FALSE,TRUE),
('Placa Pro Mini ATmega328','',7000,'imagenes/Placas/placapromini-Atmega328.png',1,50,FALSE,TRUE),
('Módulo RFID / NFC PN532','',8500,'imagenes/Modulos/modulolector-RfidNfcPn532 .png',3,50,FALSE,TRUE),
('LEDs verdes (pack)','',1200,'imagenes/Accesorios/LedsVerdes.png',5,50,FALSE,TRUE),
('Pinzas de prueba electrónica','',3500,'imagenes/Accesorios/Pinzasdepruebaelectronica.jpg',5,50,FALSE,TRUE),
('Motor DC 3 V-6 V caja de cambios 50 rpm','',3800,'imagenes/Accesorios/Motordecajacambiosengranajes-3Va6V50rpmDC.jpg',5,50,FALSE,TRUE),
('Conector de alimentación / jack 9 V','',800,'imagenes/Accesorios/PlugAlimentacion-JackConectorBatería9v.png',5,50,FALSE,TRUE),
('Porta pilas 4 × 18650 + cables','',1700,'imagenes/Accesorios/Portapila4Pila-Bateria18650 SalidaCablesArduino.png',5,50,FALSE,TRUE),
('Porta 1 pila 18650','',900,'imagenes/Accesorios/PortapilasPortaPilas-1PilaBateria18650.png',5,50,FALSE,TRUE),
('Potenciómetro lineal 10 k','',500,'imagenes/Accesorios/potenciometroLineal10k.png',5,50,FALSE,TRUE),
('Protoboard 400 puntos','',1400,'imagenes/Accesorios/Protoboard-400Puntos.jpg',5,50,FALSE,TRUE),
('Protoboard 830 puntos','',2200,'imagenes/Accesorios/Protoboard-830Puntos.jpg',5,50,FALSE,TRUE),
('Resistencias (10k, 220Ω, etc.) pack','',1200,'imagenes/Accesorios/Resistencias-10k-220ohm.png',5,50,FALSE,TRUE),
('Rueda goma para motor DC','',1800,'imagenes/Accesorios/ruedagoma-MotorDc .png',5,50,FALSE,TRUE),
('Arduino MKR GSM 1400','',25000,'imagenes/Placas/ArduinoMKR-GSM1400.png',1,50,FALSE,TRUE),
('Arduino MKR Vidor 4000','',28000,'imagenes/Placas/ArduinoMKR-Vidor4000.png',1,50,FALSE,TRUE),
('Arduino Nano con Carrier Motor','',15000,'imagenes/Placas/Arduinonano-MotorCarrier.png',1,50,FALSE,TRUE),
('Nano ESP32','',17000,'imagenes/Placas/NanoESP32.png',1,50,FALSE,TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE;

-- ============================================================================
--  VERIFICACIÓN FINAL
-- ============================================================================
SELECT 'ROLES' AS Tabla, COUNT(*) AS Total FROM roles
UNION ALL
SELECT 'CATEGORÍAS', COUNT(*) FROM categorias WHERE activo = TRUE
UNION ALL
SELECT 'USUARIOS', COUNT(*) FROM usuarios WHERE activo = TRUE
UNION ALL
SELECT 'PRODUCTOS', COUNT(*) FROM productos WHERE activo = TRUE
UNION ALL
SELECT 'ADMIN', COUNT(*) FROM usuarios WHERE username = 'admin' AND is_admin = TRUE;
