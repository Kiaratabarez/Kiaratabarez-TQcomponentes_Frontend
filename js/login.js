// ===========================================
// CONFIGURACIÓN
// ===========================================
const API_URL = 'php/';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModeBtn = document.getElementById('login-mode-btn');
    const registerModeBtn = document.getElementById('register-mode-btn');
    
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
            alert('Por favor completa todos los campos');
            return;
        }
        
        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Iniciando sesión...';
        
        try {
            console.log('🔄 Enviando petición de login...');
            
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
            console.log('📥 Respuesta recibida:', data);
            
            if (data.success) {
                console.log('✅ Login exitoso');
                await handleSuccessfulLogin(data.user);
            } else {
                console.log('❌ Login fallido:', data.message);
                alert(data.message || 'Usuario o contraseña incorrectos');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        } catch (error) {
            console.error('💥 Error en login:', error);
            alert('Error al conectar con el servidor');
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        }
    });
    
    // REGISTRO (mantener funcionalidad básica)
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        alert('Funcionalidad de registro en desarrollo');
    });
});

/**
 * MANEJAR LOGIN EXITOSO
 */
async function handleSuccessfulLogin(user) {
    console.log('🎉 Manejando login exitoso para:', user);
    
    // Sincronizar carrito si existe
    await sincronizarCarritoLocal(user.id);
    
    // Redirigir según tipo de usuario
    setTimeout(() => {
        if (user.is_admin === true || user.is_admin === 1 || user.is_admin === '1') {
            console.log('🔐 Usuario ADMINISTRADOR detectado');
            console.log('➡️ Redirigiendo a admin.html...');
            window.location.href = 'admin.html';
        } else {
            console.log('👤 Usuario NORMAL detectado');
            console.log('➡️ Redirigiendo a index.html...');
            window.location.href = 'index.html?login=success';
        }
    }, 1000);
}

/**
 * SINCRONIZAR CARRITO
 */
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

/**
 * VERIFICAR SESIÓN EXISTENTE
 */
async function checkExistingSession() {
    try {
        const response = await fetch(`${API_URL}login.php?action=check_session`);
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            if (data.user.is_admin === true || data.user.is_admin === 1) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}
