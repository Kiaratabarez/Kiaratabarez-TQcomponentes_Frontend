-- Base de datos para TQComponents
CREATE DATABASE IF NOT EXISTS tqcomponents_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tqcomponents_db;


CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) /*ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;*/

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255),
    id_categoria INT NOT NULL,
    stock INT DEFAULT 0,/*producto historial para los productos de alta o baja*/
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    INDEX idx_categoria (id_categoria),
    INDEX idx_destacado (destacado),
    INDEX idx_precio (precio)
) /*ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;*/


CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--PRODUCTOS
-- Placas
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado) VALUES
('Arduino Uno R3', 'Placa de desarrollo original Arduino Uno Rev3 con microcontrolador ATmega328P, ideal para principiantes y proyectos avanzados.', 36003.00, 'imagenes/Placas/PlacaUNO-R3.jpg', 1, 50, TRUE),
('Arduino Mega 2560', 'Placa con más memoria y pines, ideal para proyectos grandes.', 15000.00, 'imagenes/Placas/Arduino-mega2560.jpg', 1, 30, TRUE),
('Arduino Nano', 'Versión compacta del UNO, perfecta para proyectos portátiles.', 8000.00, 'imagenes/Placas/PlacaNano.jpg', 1, 75, TRUE),
('Shield L298', 'Shield controlador de motores doble puente H L298P.', 25262.00, 'imagenes/Placas/shieldparamotoresL298p.png', 1, 20, FALSE),
('Motor Shield / Driver L293D', 'Controlador de motores DC y paso a paso compatible con Arduino.', 14500.00, 'imagenes/Placas/Placaontrolador-L293D.jpg', 1, 25, FALSE),
('Controlador de Motor L298N', 'Módulo puente H doble para control de motores DC o paso a paso.', 9900.00, 'imagenes/Placas/ControladordeMotor-L298NDriver.jpg', 1, 40, FALSE),
('Placa Microcontrolador Genérica', 'Placa económica compatible con chips AVR y PIC.', 6000.00, 'imagenes/Placas/placademicrocontrolador.png', 1, 60, FALSE),
('Placa Mega Compatible 2560 R3', 'Versión compatible del Arduino Mega con el mismo rendimiento.', 14000.00, 'imagenes/Placas/PlacaMega-Compatible-2560R3.jpg', 1, 35, FALSE),
('Arduino Nano RP2040', 'Placa moderna con procesador RP2040, rápida y eficiente.', 11000.00, 'imagenes/Placas/ArduinoNanoRP2040.png', 1, 28, FALSE),
('Placa NodeMCU ESP8266', 'Placa WiFi ideal para proyectos IoT.', 13500.00, 'imagenes/Placas/placanodemcu-Esp8266Wifi.png', 1, 45, TRUE),
('Arduino Pro Mini ATmega328', 'Versión reducida de Arduino con bajo consumo.', 7000.00, 'imagenes/Placas/placapromini-Atmega328.png', 1, 50, FALSE),
('Arduino MKR GSM 1400', 'Placa con conectividad GSM integrada para proyectos móviles.', 25000.00, 'imagenes/Placas/ArduinoMKR-GSM1400.png', 1, 15, FALSE),
('Arduino MKR Vidor 4000', 'Placa con FPGA integrada para proyectos avanzados.', 28000.00, 'imagenes/Placas/ArduinoMKR-Vidor4000.png', 1, 10, FALSE),
('Arduino Nano con Carrier Motor', 'Versión Nano con controlador de motores integrado.', 15000.00, 'imagenes/Placas/Arduinonano-MotorCarrier.png', 1, 20, FALSE),
('Nano ESP32', 'Placa con Bluetooth y WiFi integrada, potente y compacta.', 17000.00, 'imagenes/Placas/NanoESP32.png', 1, 30, TRUE);

-- Actuadores
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado) VALUES
('Servo Motor MG995 180°', 'Servomotor de alta calidad con torque de 10kg/cm, perfecto para proyectos de robótica y automatización.', 8509.00, 'imagenes/Actuadores/Servomotor-MG995-180grados.jpg', 4, 80, TRUE),
('Joystick Shield', 'Shield con joystick analógico y pulsadores para control.', 15000.00, 'imagenes/Actuadores/joystickshield-7Pulsadores.png', 4, 25, TRUE),
('Servo Metálico MG90S Pro 180°', 'Servo compacto con engranajes metálicos.', 4200.00, 'imagenes/Actuadores/Servodeengranajemetalico-MG90SPro-180grados.jpg', 4, 60, FALSE),
('Servo Metálico MG90S 360°', 'Servo metálico con rotación continua.', 5000.00, 'imagenes/Actuadores/Servometalico-MG90S-360.jpg', 4, 45, FALSE);

-- Módulos
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado) VALUES
('Módulo Bluetooth HC-05', 'Módulo Bluetooth para comunicación serial, permite conectar dispositivos Arduino con smartphones y otros dispositivos Bluetooth.', 2500.00, 'imagenes/Modulos/ModuloBluetooth_HC-05.jpg', 3, 100, TRUE),
('Pantalla LCD', 'Pantalla LCD 16x2 con interfaz I2C.', 5000.00, 'imagenes/Modulos/DisplayLCD-azul-1602.jpg', 3, 55, TRUE),
('Módulo Bluetooth HC-06 / RF', 'Versión esclavo de Bluetooth, fácil de configurar.', 2800.00, 'imagenes/Modulos/ModuloRFBluetooth_HC-06.jpg', 3, 90, FALSE),
('Módulo Relé Óptoacoplado 4 Canales', 'Control de cargas de alto voltaje con aislamiento.', 3800.00, 'imagenes/Modulos/modulo-releOptoacoplado-4Canales.png', 3, 40, FALSE),
('Módulo Ethernet ENC28J60', 'Permite conectar Arduino a una red LAN cableada.', 8800.00, 'imagenes/Modulos/modulodeRedEthernetLan-Enc28j60.png', 3, 25, FALSE),
('Módulo Sensor MQ-2', 'Detecta gas, humo y monóxido de carbono.', 4800.00, 'imagenes/Modulos/modulosensormq2-DetectorGasHumoMonoxido.png', 3, 50, FALSE),
('Módulo Sensor de Luz LM393', 'Sensor de luz con salida digital y analógica.', 1700.00, 'imagenes/Modulos/modulosensordeluz-FotodiodoLm393.png', 3, 70, FALSE),
('Pantalla Táctil 2.8"', 'Display táctil TFT para interfaz gráfica.', 9500.00, 'imagenes/Modulos/pantalladisplay-Tactil2.8p.png', 3, 20, FALSE),
('Módulo RFID / NFC PN532', 'Lector de tarjetas NFC y RFID por proximidad.', 8500.00, 'imagenes/Modulos/modulolector-RfidNfcPn532.png', 3, 30, FALSE);

-- Sensores
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado) VALUES
('Sensor Ultrasonido HC-SR04', 'Mide distancias mediante ultrasonido.', 2000.00, 'imagenes/Sensores/sensordistanciaUltrasonico-HcSr04.png', 2, 120, TRUE),
('Sensor Infrarrojo', 'Sensor de proximidad infrarrojo.', 7000.00, 'imagenes/Sensores/sensorinfrarrojo.png', 2, 85, FALSE),
('Sensor de Luz (LDR)', 'Fotoresistor que detecta la intensidad lumínica.', 1200.00, 'imagenes/Sensores/sensordeluz-conLdrFotoresistor.png', 2, 150, FALSE),
('Sensor Infrarrojo Detector de Flama', 'Detecta fuego o fuentes de radiación infrarroja.', 4500.00, 'imagenes/Sensores/sensorinfrarrojo-Detectorflama.png', 2, 40, FALSE),
('Sensor PIR SR501', 'Detecta movimiento por radiación infrarroja.', 5300.00, 'imagenes/Sensores/SensorDetectorMovimineto-PirSr501.png', 2, 65, FALSE),
('Sensor de Sonido KY-037', 'Detecta niveles de sonido mediante micrófono electret.', 1500.00, 'imagenes/Sensores/Arduino-Ky037.png', 2, 80, FALSE),
('Módulo Cámara Arduino', 'Cámara digital compatible con microcontroladores.', 12000.00, 'imagenes/Sensores/Arduinocamara.png', 2, 15, FALSE),
('Sensor de Lluvia', 'Detecta la presencia de agua o humedad en superficie.', 1600.00, 'imagenes/Sensores/sensorarduino-Rain.png', 2, 90, FALSE),
('Sensor de Humedad de Suelo', 'Mide humedad en tierra para riego automático.', 2200.00, 'imagenes/Sensores/sensorarduino-Tierra.png', 2, 75, FALSE);

-- Accesorios
INSERT INTO productos (nombre, descripcion, precio, imagen, id_categoria, stock, destacado) VALUES
('Cables Dupont H-H 40 und', 'Cables hembra-hembra para conexión rápida.', 1000.00, 'imagenes/Accesorios/CablesDupont_H-H40und.jpg', 5, 200, TRUE),
('Pack de LEDs Rojos', 'Pack de LEDs rojos brillantes de 5mm.', 1500.00, 'imagenes/Accesorios/LedsRojos.png', 5, 180, TRUE),
('Cables Dupont M-H 40 und', 'Cables macho-hembra para conexión entre módulos.', 1500.00, 'imagenes/Accesorios/CablesDupontM-H40und.jpg', 5, 190, FALSE),
('Batería LiPo 22.2V 6S 5000mAh', 'Batería de alto rendimiento para proyectos de potencia.', 32000.00, 'imagenes/Accesorios/BateriaLipo-Turnigy22.2v6s5000Mah.png', 5, 10, FALSE),
('Batería LiPo 4000mAh 4S', 'Batería de polímero de litio de alto rendimiento.', 19000.00, 'imagenes/Accesorios/BateriaLipo-Turnigy4000mah4s30c.png', 5, 18, FALSE),
('Cables Dupont M-M 40 und', 'Set de cables macho-macho para protoboard.', 1100.00, 'imagenes/Accesorios/CablesDupontM-M_40und.jpg', 5, 195, FALSE),
('Cable USB A-B 30 cm', 'Cable de conexión USB tipo A a tipo B.', 900.00, 'imagenes/Accesorios/CableUsbAUsbB_30cm.jpg', 5, 160, FALSE),
('Display LED 3 Dígitos', 'Display LED de 7 segmentos con 3 dígitos.', 2500.00, 'imagenes/Accesorios/DisplayLed-3Digitos.jpg', 5, 50, FALSE),
('LEDs Amarillos (pack)', 'LEDs de color amarillo brillante.', 1200.00, 'imagenes/Accesorios/LedsAmarillo.png', 5, 170, FALSE),
('LEDs Azules (pack)', 'LEDs azules de alta intensidad.', 1200.00, 'imagenes/Accesorios/LedsAzul.png', 5, 165, FALSE),
('LEDs Verdes (pack)', 'LEDs verdes comunes para proyectos.', 1200.00, 'imagenes/Accesorios/LedsVerdes.png', 5, 175, FALSE),
('Pinzas de Prueba Electrónica', 'Pinzas tipo cocodrilo con cable para pruebas.', 3500.00, 'imagenes/Accesorios/Pinzasdepruebaelectronica.jpg', 5, 85, FALSE),
('Motor DC Caja de Cambios 6V 50rpm', 'Motor con engranajes, ideal para robótica.', 3800.00, 'imagenes/Accesorios/Motordecajacambiosengranajes-3Va6V50rpmDC.jpg', 5, 60, FALSE),
('Conector Alimentación 9V', 'Adaptador de batería 9V a pin tipo jack.', 800.00, 'imagenes/Accesorios/PlugAlimentacion-JackConectorBateria9v.png', 5, 140, FALSE),
('Porta Pilas 4x18650', 'Soporte para 4 baterías 18650 con salida cable.', 1700.00, 'imagenes/Accesorios/Portapila4Pila-Bateria18650SalidaCablesArduino.png', 5, 55, FALSE),
('Porta Pila 18650', 'Soporte para una batería 18650.', 900.00, 'imagenes/Accesorios/PortapilasPortaPilas-1PilaBateria18650.png', 5, 100, FALSE),
('Potenciómetro Lineal 10kΩ', 'Control de resistencia variable para ajustes.', 500.00, 'imagenes/Accesorios/potenciometroLineal10k.png', 5, 125, FALSE),
('Protoboard 400 Puntos', 'Placa de pruebas mediana para circuitos.', 1400.00, 'imagenes/Accesorios/Protoboard-400Puntos.jpg', 5, 95, FALSE),
('Protoboard 830 Puntos', 'Placa de pruebas grande para proyectos extensos.', 2200.00, 'imagenes/Accesorios/Protoboard-830Puntos.jpg', 5, 70, FALSE),
('Resistencias 10kΩ / 220Ω (Pack)', 'Resistencias comunes para electrónica básica.', 1200.00, 'imagenes/Accesorios/Resistencias-10k-220ohm.png', 5, 200, FALSE),
('Rueda Goma para Motor DC', 'Rueda con eje compatible con motor DC 3-6V.', 1800.00, 'imagenes/Accesorios/ruedagoma-MotorDc.png', 5, 80, FALSE);
