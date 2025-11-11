// Productos disponibles con categorías
const productos = [
    { id: 1, nombre: "Arduino Uno R3", precio: 36003, imagen: "imagenes/Placas/PlacaUNO-R3.jpg", categoria: "placas" },
    { id: 2, nombre: "Servo motor MG995 180 grados", precio: 8509, imagen: "imagenes/Actuadores/Servomotor-MG995-180grados.jpg", categoria: "actuadores" },
    { id: 3, nombre: "Módulo Bluetooth HC-05", precio: 2500, imagen: "imagenes/Modulos/MóduloBluetooth_HC-05.jpg", categoria: "modulos" },
    { id: 4, nombre: "Cables Dupont H-H 40 und", precio: 1000, imagen: "imagenes/Accesorios/CablesDupont_H-H40und.jpg", categoria: "accesorios" },
    { id: 5, nombre: "Sensor Ultrasonido", precio: 2000, imagen: "imagenes/Sensores/sensordistanciaUltrasonico-HcSr04.png", categoria: "sensores" },
    { id: 6, nombre: "Arduino Mega 2560", precio: 15000, imagen: "imagenes/Placas/Arduino-mega2560.jpg", categoria: "placas" },
    { id: 7, nombre: "Pack de LEDs Rojos", precio: 1500, imagen: "imagenes/Accesorios/LedsRojos.png", categoria: "accesorios" },
    { id: 8, nombre: "Joystick Shield", precio: 15000, imagen: "imagenes/Actuadores/joystickshield-7Pulsadores.png", categoria: "actuadores" },
    { id: 9, nombre: "Pantalla LCD", precio: 5000, imagen: "imagenes/Modulos/DisplayLCD-azul-1602.jpg", categoria: "modulos" },
    { id: 10, nombre: "Cables Dupont M-H 40 und", precio: 1500, imagen: "imagenes/Accesorios/CablesDupontM-H40und.jpg", categoria: "accesorios" },
    { id: 11, nombre: "Sensor Infrarojo", precio: 7000, imagen: "imagenes/Sensores/sensorinfrarojo.png", categoria: "sensores" },
    { id: 12, nombre: "Arduino Nano", precio: 8000, imagen: "imagenes/Placas/PlacaNano.jpg", categoria: "placas" },
    { id: 13, nombre: "Shield L298", precio: 25262, imagen: "imagenes/Placas/shieldparamotoresL298p.png", categoria: "placas" },
    { id: 14, nombre: "Servo metálico MG90S Pro 180°", precio: 4200, imagen: "imagenes/Actuadores/Servodeengranajemetálico-MG90SPro-180grados.jpg", categoria: "actuadores" },
    { id: 15, nombre: "Módulo relé óptoacoplado 4 canales", precio: 3800, imagen: "imagenes/Modulos/modulo-releOptoacoplado-4Canales.png", categoria: "modulos" },
    { id: 16, nombre: "Sensor de luz (LDR / fotoresistor)", precio: 1200, imagen: "imagenes/Sensores/sensordeluz-conLdrFotoresistor.png", categoria: "sensores" },
    { id: 17, nombre: "Batería LiPo 22,2 V 6S 5000 mAh", precio: 32000, imagen: "imagenes/Accesorios/BateriaLipo-Turnigy22.2v6s5000Mah.png", categoria: "accesorios" },
    { id: 18, nombre: "Motor Shield / driver L293D (Arduino)", precio: 14500, imagen: "imagenes/Placas/Placaontrolador-L293D.jpg", categoria: "placas" },
    { id: 19, nombre: "Módulo Bluetooth HC-06 / RF", precio: 2800, imagen: "imagenes/Modulos/MóduloRF Bluetooth_HC-06.jpg", categoria: "modulos" },
    { id: 20, nombre: "Sensor infrarrojo detector de flama", precio: 4500, imagen: "imagenes/Sensores/sensorinfrarrojo-Detectorflama.png", categoria: "sensores" },
    { id: 21, nombre: "Batería LiPo 4000 mAh 4S", precio: 19000, imagen: "imagenes/Accesorios/BateriaLipo-Turnigy4000mah4s30c.png", categoria: "accesorios" },
    { id: 22, nombre: "Controlador de motor L298N", precio: 9900, imagen: "imagenes/Placas/ControladordeMotor-L298NDriver.jpg", categoria: "placas" },
    { id: 23, nombre: "Servo metálico MG90S 360°", precio: 5000, imagen: "imagenes/Actuadores/Servometálico-MG90S-360°.jpg", categoria: "actuadores" },
    { id: 24, nombre: "Sensor PIR (detector de movimiento) SR501", precio: 5300, imagen: "imagenes/Sensores/SensorDetectorMovimineto-PirSr501.png", categoria: "sensores" },
    { id: 25, nombre: "Cables Dupont M-M 40 und", precio: 1100, imagen: "imagenes/Accesorios/CablesDupontM-M_40und.jpg", categoria: "accesorios" },
    { id: 26, nombre: "Placa microcontrolador genérica", precio: 6000, imagen: "imagenes/Placas/placademicrocontrolador.png", categoria: "placas" },
    { id: 27, nombre: "Módulo Ethernet ENC28J60", precio: 8800, imagen: "imagenes/Modulos/modulodeRedEthernetLan-Enc28j60 .png", categoria: "modulos" },
    { id: 28, nombre: "Sensor de sonido KY-037", precio: 1500, imagen: "imagenes/Sensores/Arduino-Ky037.png", categoria: "sensores" },
    { id: 29, nombre: "Cable USB A-B 30 cm", precio: 900, imagen: "imagenes/Accesorios/CableUsbAUsbB_30cm.jpg", categoria: "accesorios" },
    { id: 30, nombre: "Placa Mega compatible 2560 R3", precio: 14000, imagen: "imagenes/Placas/PlacaMega-Compatible-2560R3.jpg", categoria: "placas" },
    { id: 31, nombre: "Módulo sensor MQ-2 / gas / humo / CO", precio: 4800, imagen: "imagenes/Modulos/modulosensormq2-DetectorGasHumoMonoxido.png", categoria: "modulos" },
    { id: 32, nombre: "Cámara / módulo cámara para Arduino", precio: 12000, imagen: "imagenes/Sensores/Arduinocamara.png", categoria: "sensores" },
    { id: 33, nombre: "Display LED 3 dígitos", precio: 2500, imagen: "imagenes/Accesorios/DisplayLed-3Digitos.jpg", categoria: "accesorios" },
    { id: 34, nombre: "Arduino Nano RP2040", precio: 11000, imagen: "imagenes/Placas/ArduinoNanoRP2040.png", categoria: "placas" },
    { id: 35, nombre: "Módulo sensor de luz / fotodiodo LM393", precio: 1700, imagen: "imagenes/Modulos/modulosensordeluz-FotodiodoLm393.png", categoria: "modulos" },
    { id: 36, nombre: "Sensor de lluvia / lluvia Arduino", precio: 1600, imagen: "imagenes/Sensores/sensorarduino-Rain.png", categoria: "sensores" },
    { id: 37, nombre: "LEDs amarillos (pack)", precio: 1200, imagen: "imagenes/Accesorios/LedsAmarillo.png", categoria: "accesorios" },
    { id: 38, nombre: "Placa NodeMCU / ESP8266", precio: 13500, imagen: "imagenes/Placas/placanodemcu-Esp8266Wifi.png", categoria: "placas" },
    { id: 39, nombre: "Pantalla táctil 2.8″", precio: 9500, imagen: "imagenes/Modulos/pantalladisplay-Tactil2.8p.png", categoria: "modulos" },
    { id: 40, nombre: "Sensor de tierra / humedad de suelo", precio: 2200, imagen: "imagenes/Sensores/sensorarduino-Tierra.png", categoria: "sensores" },
    { id: 41, nombre: "LEDs azules (pack)", precio: 1200, imagen: "imagenes/Accesorios/LedsAzul.png", categoria: "accesorios" },
    { id: 42, nombre: "Placa Pro Mini ATmega328", precio: 7000, imagen: "imagenes/Placas/placapromini-Atmega328.png", categoria: "placas" },
    { id: 43, nombre: "Módulo RFID / NFC PN532", precio: 8500, imagen: "imagenes/Modulos/modulolector-RfidNfcPn532 .png", categoria: "modulos" },
    { id: 44, nombre: "LEDs verdes (pack)", precio: 1200, imagen: "imagenes/Accesorios/LedsVerdes.png", categoria: "accesorios" },
    { id: 45, nombre: "Pinzas de prueba electrónica", precio: 3500, imagen: "imagenes/Accesorios/Pinzasdepruebaelectronica.jpg", categoria: "accesorios" },
    { id: 46, nombre: "Motor DC 3 V-6 V caja de cambios 50 rpm", precio: 3800, imagen: "imagenes/Accesorios/Motordecajacambiosengranajes-3Va6V50rpmDC.jpg", categoria: "accesorios" },
    { id: 47, nombre: "Conector de alimentación / jack 9 V", precio: 800, imagen: "imagenes/Accesorios/PlugAlimentacion-JackConectorBatería9v.png", categoria: "accesorios" },
    { id: 48, nombre: "Porta pilas 4 × 18650 + cables", precio: 1700, imagen: "imagenes/Accesorios/Portapila4Pila-Bateria18650 SalidaCablesArduino.png", categoria: "accesorios" },
    { id: 49, nombre: "Porta 1 pila 18650", precio: 900, imagen: "imagenes/Accesorios/PortapilasPortaPilas-1PilaBateria18650.png", categoria: "accesorios" },
    { id: 50, nombre: "Potenciómetro lineal 10 k", precio: 500, imagen: "imagenes/Accesorios/potenciometroLineal10k.png", categoria: "accesorios" },
    { id: 51, nombre: "Protoboard 400 puntos", precio: 1400, imagen: "imagenes/Accesorios/Protoboard-400Puntos.jpg", categoria: "accesorios" },
    { id: 52, nombre: "Protoboard 830 puntos", precio: 2200, imagen: "imagenes/Accesorios/Protoboard-830Puntos.jpg", categoria: "accesorios" },
    { id: 53, nombre: "Resistencias (10k, 220Ω, etc.) pack", precio: 1200, imagen: "imagenes/Accesorios/Resistencias-10k-220ohm.png", categoria: "accesorios" },
    { id: 54, nombre: "Rueda goma para motor DC", precio: 1800, imagen: "imagenes/Accesorios/ruedagoma-MotorDc .png", categoria: "accesorios" },
    { id: 55, nombre: "Arduino MKR GSM 1400", precio: 25000, imagen: "imagenes/Placas/ArduinoMKR-GSM1400.png", categoria: "placas" },
    { id: 56, nombre: "Arduino MKR Vidor 4000", precio: 28000, imagen: "imagenes/Placas/ArduinoMKR-Vidor4000.png", categoria: "placas" },
    { id: 57, nombre: "Arduino Nano con Carrier Motor", precio: 15000, imagen: "imagenes/Placas/Arduinonano-MotorCarrier.png", categoria: "placas" },
    { id: 58, nombre: "Nano ESP32", precio: 17000, imagen: "imagenes/Placas/NanoESP32.png", categoria: "placas" }
];

// Inicializacion cuando el DOM estÃ© cargado
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar parametros de URL si viene desde login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Actualizar estado de sesiÃ³n en el header
    actualizarEstadoSesion();
    
        /*Mostrar productos SOLO en listado_box.html o listado_tabla.html
const paginaActual = window.location.pathname.split("/").pop();
if (paginaActual === "listado_box.html" || paginaActual === "listado_tabla.html") {
    const categoria = obtenerCategoriaDeURL();
    cargarProductosPorCategoria(categoria || "todos");
}*/
// Mostrar productos si existe el contenedor .productos-grid (funciona con .html o "pretty" URLs)
const productosGridElement = document.querySelector('.productos-grid');
if (productosGridElement) {
    const categoria = obtenerCategoriaDeURL();
    cargarProductosPorCategoria(categoria || "todos");
}


    setupFiltrosCategoria();
    setupMobileDropdown();
    setupVerProductosBtn();
    setupBotonesAgregarCarrito();
    actualizarContadorCarrito();
});

function actualizarEstadoSesion() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;

    if (isLoggedIn === 'true' && username) {
        // Mostrar usuario + icono salir
        loginBtn.innerHTML = `
            <div class="user-simple">
                <span class="user-name">¡Hola, ${username}!</span>
                <a href="imagenes/iconos/cerrar-sesion.png" id="cerrar-sesion" title="Cerrar sesión">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>
        `;

        // Evento de cierre de sesión
        const cerrarSesionBtn = document.getElementById('cerrar-sesion');
        if (cerrarSesionBtn) {
            cerrarSesionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cerrarSesion();
            });
        }

    } else {
        loginBtn.innerHTML = '<a href="login.html">Login</a>';
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    mostrarNotificacion('Sesión cerrada correctamente');
    setTimeout(() => window.location.reload(), 1000);
}


// Funcion para cargar productos por categoria
function cargarProductosPorCategoria(categoria) {
    const productosGrid = document.querySelector('.productos-grid');
    const productosTabla = document.querySelector('.tabla-productos tbody');
    let productosFiltrados = [...productos]; // Copiar el array
    
    // Limpiar nombres de imagenes
    productosFiltrados = productosFiltrados.map(p => {
        let imagenLimpia = p.imagen
            .normalize("NFD")                   
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")                 
            .replace(/[Â°Âº]/g, "");                
        return { ...p, imagen: imagenLimpia };
    });
    
    // Filtrar por categoria si se especifica
    if (categoria && categoria !== 'todos') {
        productosFiltrados = productosFiltrados.filter(producto => producto.categoria === categoria);
    }
    
    // MOSTRAR EN GRID (listado_box.html)
    if (productosGrid) {
        productosGrid.innerHTML = '';
        
        if (productosFiltrados.length === 0) {
            productosGrid.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No hay productos en esta categorÃ­a</p>';
            return;
        }
        
        productosFiltrados.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto';
            productoElement.setAttribute('data-categoria', producto.categoria);
            productoElement.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
                <h3>${producto.nombre}</h3>
                <p>${obtenerDescripcionCorta(producto.nombre)}</p>
                <p class="precio">$${producto.precio.toLocaleString()}</p>
                <button class="btn btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
            `;
            productosGrid.appendChild(productoElement);
        });
        setupBotonesAgregarCarrito();
    }
    
    // MOSTRAR TABLA (listado_tabla.html)
    if (productosTabla) {
        productosTabla.innerHTML = '';
        
        productosFiltrados.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td data-label="Imagen"><img src="${producto.imagen}" alt="${producto.nombre}" class="img-producto"></td>
                <td data-label="Nombre">${producto.nombre}</td>
                <td data-label="Descripcion">${obtenerDescripcionLarga(producto.nombre)}</td>
                <td data-label="Precio">$${producto.precio.toLocaleString()}</td>
            `;
            productosTabla.appendChild(fila);
        });
    }
}

// Configura boton Agregar al Carrito
function setupBotonesAgregarCarrito() {
    const botones = document.querySelectorAll('.btn-agregar');
    
    botones.forEach(btn => {
        // Clonamos el botón para eliminar cualquier listener anterior
        const nuevoBoton = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBoton, btn);

        nuevoBoton.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            agregarAlCarrito(id);
        });
    });
}


// Funcion para agregar producto al carrito
function agregarAlCarrito(id) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return; 
    }

    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.findIndex(item => item.id === id);

    if (productoExistente !== -1) {
        carrito[productoExistente].cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
    actualizarContadorCarrito();
}


// Actualizar contador de carrito en el header
function actualizarContadorCarrito() {
    const contador = document.querySelector('.carrito-count');
    let carrito = [];
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    
    const totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);
    
    if (contador) {
        if (totalItems > 0) {
            contador.textContent = totalItems;
            contador.style.display = 'inline-block';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Mostrar notificacion
function mostrarNotificacion(mensaje, esError = false) {
    const notificacionExistente = document.querySelector('.notificacion');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${esError ? 'error' : ''}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

function obtenerDescripcionCorta(nombreProducto) {
    const descripciones = {
        "Arduino Uno R3": "Placa de desarrollo con microcontrolador ATmega328P",
        "Servo motor MG995 180 grados": "Servomotor de alta calidad con torque de 10kg/cm",
        "Modulo Bluetooth HC-05": "Modulo Bluetooth para comunicacion serial",
        "Arduino Mega 2560": "Placa con mas pines y memoria que Arduino Uno",
        "Sensor Ultrasonido": "Sensor de distancia por ultrasonido HC-SR04",
        "Pack de LEDs": "Set de 50 LEDs de diferentes colores",
        "Pantalla LCD": "Pantalla LCD 16x2 con interfaz I2C",
        "Cables Dupont H-H 40 und": "Cables hembra-hembra para prototipado",
        "Cables Dupont M-H 40 und": "Cables macho-hembra para conexiones",
        "Cables Dupont M-M 40 und": "Cables macho-macho para breadboard",
        "Arduino Nano": "Version compacta del Arduino UNO"
    };
    
    return descripciones[nombreProducto] || "Producto de calidad para tus proyectos Arduino";
}

function obtenerDescripcionLarga(nombreProducto) {
    const descripciones = {
        "Arduino Uno R3": "Placa de desarrollo original Arduino Uno Rev3 con microcontrolador ATmega328P, ideal para principiantes y proyectos avanzados.",
        "Servo motor MG995 180 grados": "Servomotor de alta calidad con torque de 10kg/cm, perfecto para proyectos de robotica y automatizacin.",
        "Modulo Bluetooth HC-05": "Modulo Bluetooth para comunicacion serial, permite conectar dispositivos Arduino con smartphones y otros dispositivos Bluetooth.",
    };
    
    return descripciones[nombreProducto] || obtenerDescripcionCorta(nombreProducto);
}
function obtenerCategoriaDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria');
}
function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}
function setupFiltrosCategoria() {
}
function setupMobileDropdown() {
}

function setupVerProductosBtn() {
    const verProductosBtn = document.getElementById('ver-productos-btn');
    if (verProductosBtn) {
        verProductosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'listado_box.html';
        });
    }
}

// prueba del menu responsive
document.addEventListener("DOMContentLoaded", () => {
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("nav ul");

if (menuToggle && navMenu) {
menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});
}

// Boton Volver en las paginas internas
const botonVolver = document.querySelector(".btn-volver");
const paginaActual = window.location.pathname.split("/").pop();
if (botonVolver) {
if (paginaActual === "" || paginaActual === "index.html") {
    botonVolver.style.display = "none";
} else {
    botonVolver.style.display = "flex";
}
}
});





// Función para cargar productos destacados en la página de inicio
function cargarProductosDestacados() {
    const productosGrid = document.querySelector('.destacados .productos-grid');
    
    // Verificar si estamos en la página de inicio y existe el contenedor
    if (!productosGrid) return;
    
    // Limpiar el contenedor
    productosGrid.innerHTML = '';
    
    // Tomar solo los primeros 12 productos
    const productosDestacados = productos.slice(0, 12);
    
    // Limpiar nombres de imágenes y crear elementos
    productosDestacados.forEach(producto => {
        let imagenLimpia = producto.imagen
            .normalize("NFD")                   
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")                 
            .replace(/[°º]/g, "");
        
        const productoElement = document.createElement('div');
        productoElement.className = 'producto';
        productoElement.setAttribute('data-categoria', producto.categoria);
        productoElement.innerHTML = `
            <img src="${imagenLimpia}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
            <h3>${producto.nombre}</h3>
            <p>${obtenerDescripcionCorta(producto.nombre)}</p>
            <p class="precio">$${producto.precio.toLocaleString()}</p>
            <button class="btn btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
        `;
        productosGrid.appendChild(productoElement);
    });
    
    // Configurar botones de agregar al carrito
    setupBotonesAgregarCarrito();
}

// Modificar el DOMContentLoaded existente para incluir la carga de productos destacados
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar parámetros de URL si viene desde login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Actualizar estado de sesión en el header
    actualizarEstadoSesion();
    
    // Verificar si estamos en index.html y cargar productos destacados
    const paginaActual = window.location.pathname.split("/").pop();
    /*if (paginaActual === "" || paginaActual === "index.html") {
        cargarProductosDestacados();*/
    if (paginaActual === "" || paginaActual === "index.html") {
    cargarProductosDestacadosCarousel(); // AA19
    }
    
    // Mostrar productos si existe el contenedor .productos-grid (para listado_box.html)
    const productosGridElement = document.querySelector('.productos-grid');
    const destacadosSection = document.querySelector('.destacados');
    
    // Solo cargar productos por categoría si NO estamos en la página de inicio
    if (productosGridElement && destacadosSection && (paginaActual !== "" && paginaActual !== "index.html")) {
        const categoria = obtenerCategoriaDeURL();
        cargarProductosPorCategoria(categoria || "todos");
    }

    setupFiltrosCategoria();
    setupMobileDropdown();
    setupVerProductosBtn();
    setupBotonesAgregarCarrito();
    actualizarContadorCarrito();
});

/*SOLO PARA PROBAR */
// Solo para desarrollador o administrador
window.borrarUsuarios = function() {
    localStorage.removeItem('users');
    console.log('Usuarios eliminados');
    location.reload();
};
/*No olvidarme que tengo que poner en la consola de inspeccionar:
borrarUsuarios(); */ 

/*AA19 */
function cargarProductosDestacadosCarousel() {
    const carousel = $('.productos-carousel');
    
    if (!carousel.length) return;
    
    carousel.html('');
    
    const productosDestacados = productos.slice(0, 12);
    
    productosDestacados.forEach(producto => {
        let imagenLimpia = producto.imagen
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .replace(/[°º]/g, "");
        
        const productoHTML = `
            <div class="producto-item">
                <div class="producto">
                    <img src="${imagenLimpia}" alt="${producto.nombre}" onerror="this.src='imagenes/iconos/no-image.png'">
                    <h3>${producto.nombre}</h3>
                    <p>${obtenerDescripcionCorta(producto.nombre)}</p>
                    <p class="precio">$${producto.precio.toLocaleString()}</p>
                    <button class="btn btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
                </div>
            </div>
        `;
        
        carousel.append(productoHTML);
    });
    
    carousel.owlCarousel({
        loop: true,
        margin: 25,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            900: {
                items: 3
            },
            1200: {
                items: 4
            }
        }
    });
    
    setupBotonesAgregarCarrito();
}
