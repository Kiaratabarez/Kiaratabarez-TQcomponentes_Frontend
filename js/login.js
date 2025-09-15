// NO TOCAR FUNCIONA
// auth.js - Maneja tanto login como registro
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModeBtn = document.getElementById('login-mode-btn');
    const registerModeBtn = document.getElementById('register-mode-btn');
    const authSubtitle = document.getElementById('auth-subtitle');
    const switchModeLinks = document.querySelectorAll('.switch-mode');
    
    // Campos de formulario
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const regUsernameInput = document.getElementById('reg-username');
    const regEmailInput = document.getElementById('reg-email');
    const regPasswordInput = document.getElementById('reg-password');
    const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
    
    // Inicializar usuarios si no existen
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Cambiar entre login y registro
    function switchToLogin() {
        loginModeBtn.classList.add('active');
        registerModeBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        authSubtitle.textContent = 'Inicia sesión en tu cuenta';
    }
    
    function switchToRegister() {
        registerModeBtn.classList.add('active');
        loginModeBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        authSubtitle.textContent = 'Crea una nueva cuenta';
    }
    
    // Event listeners para los botones de modo
    loginModeBtn.addEventListener('click', switchToLogin);
    registerModeBtn.addEventListener('click', switchToRegister);
    
    // Event listeners para los enlaces de cambio de modo
    switchModeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.textContent === 'Regístrate') {
                switchToRegister();
            } else {
                switchToLogin();
            }
        });
    });
    
    // Validación en tiempo real para el formulario de registro
    if (regPasswordInput) {
        regPasswordInput.addEventListener('input', validatePasswordStrength);
    }
    
    if (regConfirmPasswordInput) {
        regConfirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    // Manejar el envío del formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetErrors();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;
        
        if (!username) {
            showError(usernameInput, 'Por favor ingresa tu usuario');
            isValid = false;
        }
        
        if (!password) {
            showError(passwordInput, 'Por favor ingresa tu contraseña');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Verificar credenciales
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            handleSuccessfulLogin(username);
        } else {
            showError(loginForm, 'Usuario o contraseña incorrectos');
        }
    });
    
    // Manejar el envío del formulario de registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetErrors();
        
        const username = regUsernameInput.value.trim();
        const email = regEmailInput.value.trim();
        const password = regPasswordInput.value.trim();
        const confirmPassword = regConfirmPasswordInput.value.trim();
        const fullname = document.getElementById('reg-fullname').value.trim();
        const termsAccepted = document.getElementById('terms').checked;
        
        let isValid = true;
        
        // Validar usuario
        if (!username) {
            showError(regUsernameInput, 'El usuario es obligatorio');
            isValid = false;
        } else if (username.length < 3) {
            showError(regUsernameInput, 'El usuario debe tener al menos 3 caracteres');
            isValid = false;
        } else if (isUsernameTaken(username)) {
            showError(regUsernameInput, 'Este usuario ya está registrado');
            isValid = false;
        }
        
        // Validar email
        if (!email) {
            showError(regEmailInput, 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(regEmailInput, 'Ingresa un correo electrónico válido');
            isValid = false;
        } else if (isEmailTaken(email)) {
            showError(regEmailInput, 'Este correo electrónico ya está registrado');
            isValid = false;
        }
        
        // Validar contraseña
        if (!password) {
            showError(regPasswordInput, 'La contraseña es obligatoria');
            isValid = false;
        } else if (password.length < 6) {
            showError(regPasswordInput, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }
        
        // Validar confirmación de contraseña
        if (!confirmPassword) {
            showError(regConfirmPasswordInput, 'Confirma tu contraseña');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(regConfirmPasswordInput, 'Las contraseñas no coinciden');
            isValid = false;
        }
        
        // Validar términos y condiciones
        if (!termsAccepted) {
            showError(document.getElementById('terms'), 'Debes aceptar los términos y condiciones');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Registrar usuario
        registerUser(username, email, password, fullname);
    });
    
    // Función para validar fortaleza de contraseña
    function validatePasswordStrength() {
        const password = regPasswordInput.value;
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthMeter) {
            // Crear el medidor de fortaleza si no existe
            const passwordStrength = document.createElement('div');
            passwordStrength.className = 'password-strength';
            passwordStrength.innerHTML = `
                <div class="strength-meter"></div>
                <div class="strength-text"></div>
            `;
            regPasswordInput.parentNode.parentNode.appendChild(passwordStrength);
        }
        
        let strength = 0;
        let text = '';
        let className = '';
        
        if (password.length > 0) {
            // Calcular fortaleza
            if (password.length > 5) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/\d/)) strength++;
            if (password.match(/[^a-zA-Z\d]/)) strength++;
            
            // Asignar texto y clase según la fortaleza
            if (strength < 2) {
                text = 'Débil';
                className = 'strength-weak';
            } else if (strength < 4) {
                text = 'Media';
                className = 'strength-medium';
            } else {
                text = 'Fuerte';
                className = 'strength-strong';
            }
        }
        
        // Actualizar UI
        const meter = document.querySelector('.strength-meter');
        const textElement = document.querySelector('.strength-text');
        
        if (password.length > 0) {
            meter.className = 'strength-meter ' + className;
            textElement.textContent = text;
        } else {
            meter.className = 'strength-meter';
            textElement.textContent = '';
        }
    }
    
    // Función para validar coincidencia de contraseñas
    function validatePasswordMatch() {
        const password = regPasswordInput.value;
        const confirmPassword = regConfirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError(regConfirmPasswordInput, 'Las contraseñas no coinciden');
        } else if (confirmPassword && password === confirmPassword) {
            resetError(regConfirmPasswordInput);
        }
    }
    
    // Función para verificar si un usuario ya existe
    function isUsernameTaken(username) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.some(user => user.username === username);
    }
    
    // Función para verificar si un email ya existe
    function isEmailTaken(email) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.some(user => user.email === email);
    }
    
    // Función para validar formato de email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Función para registrar un nuevo usuario
    function registerUser(username, email, password, fullname) {
        const users = JSON.parse(localStorage.getItem('users'));
        const newUser = {
            username,
            email,
            password, // En un caso real, esto debería estar encriptado
            fullname,
            registerDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Mostrar mensaje de éxito
        showSuccess(registerForm, '¡Cuenta creada con éxito! Redirigiendo...');
        
        // Iniciar sesión automáticamente después del registro
        setTimeout(() => {
            handleSuccessfulLogin(username);
        }, 1500);
    }
    
    // Función para manejar login exitoso
    function handleSuccessfulLogin(username) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('loginTime', new Date().getTime());
        
        showSuccess(loginForm, '¡Inicio de sesión exitoso! Redirigiendo...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // Funciones auxiliares para mostrar/ocultar errores y mensajes
    function showError(input, message) {
        if (input.tagName === 'FORM') {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.display = 'block';
            errorDiv.textContent = message;
            errorDiv.style.marginTop = '10px';
            errorDiv.style.textAlign = 'center';
            input.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
            return;
        }
        
        input.classList.add('input-error');
        
        let errorElement = input.parentNode.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    function showSuccess(form, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
    
    function resetError(input) {
        input.classList.remove('input-error');
        const errorElement = input.parentNode.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.style.display = 'none';
        });
        
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
    }
    
    // Verificar si ya hay una sesión activa
    function checkExistingSession() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const loginTime = localStorage.getItem('loginTime');
        
        if (isLoggedIn && loginTime) {
            const currentTime = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (currentTime - loginTime > twentyFourHours) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('loginTime');
            } else {
                window.location.href = 'index.html';
            }
        }
    }
    
    // Inicializar
    checkExistingSession();
});
