/**
 * DriveEase — Authentication Interface Toggle Scripts
 * Handles switching between Sign In and Register views smoothly.
 */
document.addEventListener("DOMContentLoaded", function () {
    const loginSec  = document.getElementById('login-section');
    const regSec    = document.getElementById('register-section');
    const tabLogin  = document.getElementById('tab-login');
    const tabReg    = document.getElementById('tab-register');

    const goToRegisterBtn = document.getElementById('go-to-register');
    const goToLoginBtn    = document.getElementById('go-to-login');

    function showLogin() {
        if (regSec && loginSec && tabLogin && tabReg) {
            regSec.classList.add('d-none');
            loginSec.classList.remove('d-none');
            tabLogin.classList.add('active');
            tabReg.classList.remove('active');
        }
    }

    function showRegister() {
        if (loginSec && regSec && tabReg && tabLogin) {
            loginSec.classList.add('d-none');
            regSec.classList.remove('d-none');
            tabReg.classList.add('active');
            tabLogin.classList.remove('active');
        }
    }

    // Assign event listeners if elements exist safely
    if (tabLogin) tabLogin.addEventListener('click', showLogin);
    if (tabReg) tabReg.addEventListener('click', showRegister);
    if (goToRegisterBtn) goToRegisterBtn.addEventListener('click', showRegister);
    if (goToLoginBtn) goToLoginBtn.addEventListener('click', showLogin);
});