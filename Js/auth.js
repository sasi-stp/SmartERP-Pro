const APP_PASSWORD = typeof APP_PASSWORD !== 'undefined' ? APP_PASSWORD : "1234";

function setupAuth() {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('remember-me');
    const loginError = document.getElementById('login-error');

    if (!loginForm) return;

    if (localStorage.getItem('erp_remember_user') && usernameInput) {
        usernameInput.value = localStorage.getItem('erp_remember_user');
        if (rememberMe) rememberMe.checked = true;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPass = passwordInput.value.trim();

        // Check Password (Default: 1234)
        if (enteredPass === "1234" || (typeof APP_PASSWORD !== 'undefined' && enteredPass === APP_PASSWORD)) {
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('erp_remember_user', usernameInput.value);
            } else {
                localStorage.removeItem('erp_remember_user');
            }

            // Hide login, show dashboard
            loginContainer.classList.add('hidden');
            loginContainer.style.display = 'none'; // Force hide

            appContainer.classList.remove('hidden');
            appContainer.style.display = 'block'; // Force show

            try {
                initApp();
            } catch (err) {
                console.error("initApp error:", err);
            }
        } else {
            loginError.textContent = "❌ වැරදි මුරපදයක්! (Default Password එක 1234 වේ)";
            passwordInput.value = "";
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            appContainer.classList.add('hidden');
            appContainer.style.display = 'none';
            loginContainer.classList.remove('hidden');
            loginContainer.style.display = 'block';
            if (passwordInput) passwordInput.value = "";
        });
    }

    setInterval(updateClock, 1000);
    updateClock();
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", setupAuth);
} else {
    setupAuth();
}

window.socialAuth = function(provider) {
    alert(`🌐 ${provider} හරහා සාර්ථකව Login විය!`);
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    loginContainer.classList.add('hidden');
    loginContainer.style.display = 'none';
    appContainer.classList.remove('hidden');
    appContainer.style.display = 'block';
    try {
        initApp();
    } catch(err) {
        console.error(err);
    }
};

function updateClock() {
    const clock = document.getElementById('live-clock');
    if(!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString();
}

window.toggleProfileMenu = function() {
    const menu = document.getElementById('profile-menu');
    if(menu) menu.classList.toggle('hidden');
};

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
};

function initApp() {
    const sDate = document.getElementById('sales-date');
    if (sDate) sDate.value = new Date().toISOString().split('T')[0];

    const safeRun = (fn) => {
        try { if (typeof fn === 'function') fn(); } catch(e) { console.warn("Error running function:", e); }
    };

    safeRun(populateDropdowns);
    safeRun(renderShops);
    safeRun(renderProductsSettings);
    safeRun(renderSalesTable);
    safeRun(window.renderStockOverview);
    safeRun(window.renderStockHistory);
    safeRun(renderExpenseTable);
    safeRun(renderCreditTable);
    safeRun(renderMonthlyPnL);
    safeRun(renderExpiryAlerts);
    safeRun(renderUpcomingOrdersInAnalytics);
    safeRun(updateFilteredAnalytics);
    safeRun(window.updateLiveTotal);
}
