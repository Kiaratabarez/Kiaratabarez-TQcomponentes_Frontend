//CONFIGURACIÓN
const API_URL = 'php/';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModeBtn = document.getElementById('login-mode-btn');
    const registerModeBtn = document.getElementById('register-mode-btn');
    // Verifica si ya hay sesión activa
    checkExistingSession();
    
    // Cambiar entre login y registro
    loginModeBtn.addEventListener('click', () => {
        loginModeBtn.classList.add('active');
        registerModeBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerModeBtn.addEventListener('click', () => {
        registerModeBtn.classList.add('active');
        loginModeBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // FORMULARIO DE LOGIN
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            mostrarError('Por favor completa todos los campos');
            return;
        }
        
        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Iniciando sesión...';
        
        try {
            console.log('Enviando petición de login...');
            
            const response = await fetch(`${API_URL}login.php?action=login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            const data = await response.json();
            console.log('Respuesta recibida:', data);
            
            if (data.success) {
                console.log('Login exitoso');
                mostrarExito('¡Bienvenido! Redirigiendo...');
                await handleSuccessfulLogin(data.user);
            } else {
                console.log('Login fallido:', data.message);
                mostrarError(data.message || 'Usuario o contraseña incorrectos');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        } catch (error) {
            console.error('Error en login:', error);
            mostrarError('Error al conectar con el servidor');
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        }
    });
    
    // REGISTRO
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const confirmPassword = document.getElementById('reg-confirm-password').value.trim();
        const fullname = document.getElementById('reg-fullname').value.trim();
        const terms = document.getElementById('terms').checked;
        
        // Validacions
        if (!username || !email || !password || !confirmPassword) {
            mostrarError('Por favor completa todos los campos obligatorios');
            return;
        }
        
        if (password !== confirmPassword) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        if (!terms) {
            mostrarError('Debes aceptar los términos y condiciones');
            return;
        }
        
        const btnSubmit = registerForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
        
        try {
            console.log('Enviando datos de registro:', {
                username,
                email,
                nombre_completo: fullname
            });
            
            const response = await fetch(`${API_URL}registro.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword,
                    nombre_completo: fullname
                })
            });
            
            console.log('Respuesta del servidor:', response.status);
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            if (data.success) {
                mostrarExito('¡Registro exitoso! Redirigiendo...');
                // Registrar y loguear automáticamente
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Mostrar errores específicos
                let errorMsg = data.message || 'Error en el registro';
                if (data.errors && data.errors.length > 0) {
                    errorMsg += ':\n' + data.errors.join('\n');
                }
                mostrarError(errorMsg);
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        } catch (error) {
            console.error('💥 Error en registro:', error);
            mostrarError('Error al conectar con el servidor. Verifica la consola.');
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        }
    });
});

/*MANEJAR LOGIN EXITOSO*/
async function handleSuccessfulLogin(user) {
    console.log('🎉 Manejando login exitoso para:', user);
    // Sincronizar carrito si existe
    await sincronizarCarritoLocal(user.id);
    // Redirigir según tipo de usuario
    setTimeout(() => {
        // Verificar explícitamente si es admin
        const esAdmin = user.is_admin === true || user.is_admin === 1 || user.is_admin === '1';
        
        if (esAdmin) {
            console.log('Usuario ADMINISTRADOR detectado');
            console.log('Redirigiendo a admin.html...');
            window.location.href = 'admin.html';
        } else {
            console.log('Usuario NORMAL detectado');
            console.log('Redirigiendo a index.html...');
            window.location.href = 'index.html?login=success';
        }
    }, 1000);
}

/*SINCRONIZAR CARRITO*/
async function sincronizarCarritoLocal(idUsuario) {
    try {
        const carritoLocal = localStorage.getItem('carrito');
        
        if (carritoLocal) {
            const productos = JSON.parse(carritoLocal);
            
            if (productos.length > 0) {
                await fetch(`${API_URL}carrito.php?action=sincronizar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_usuario: idUsuario,
                        productos: productos
                    })
                });
                
                localStorage.removeItem('carrito');
            }
        }
    } catch (error) {
        console.error('Error sincronizando carrito:', error);
    }
}

/*VERIFICAR SESIÓN EXISTENTE*/
async function checkExistingSession() {
    try {
        const response = await fetch(`${API_URL}login.php?action=check_session`);
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            console.log('✅ Sesión activa detectada:', data.user);
            
            // Verificar si es admin
            const esAdmin = data.user.is_admin === true || data.user.is_admin === 1;
            
            if (esAdmin) {
                console.log('Redirigiendo a panel admin...');
                window.location.href = 'admin.html';
            } else {
                console.log('Redirigiendo a inicio...');
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

function mostrarError(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion error';
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 4000);
}

function mostrarExito(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion exito';
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}