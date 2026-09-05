document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('remember-me');
    const loginError = document.getElementById('login-error');

    // Check remembered user
    if (localStorage.getItem('erp_remember_user')) {
        usernameInput.value = localStorage.getItem('erp_remember_user');
        rememberMe.checked = true;
    }

    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Default password check
        if (passwordInput.value === APP_PASSWORD) {
            if (rememberMe.checked) {
                localStorage.setItem('erp_remember_user', usernameInput.value);
            } else {
                localStorage.removeItem('erp_remember_user');
            }
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            initApp();
        } else {
            loginError.textContent = "❌ වැරදි මුරපදයක් හෝ Username එකක්!";
            passwordInput.value = "";
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        appContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        passwordInput.value = "";
    });

    setInterval(updateClock, 1000);
    updateClock();
});

window.socialAuth = function(provider) {
    alert(`🌐 ${provider} ගිණුම හරහා සාර්ථකව Login විය!`);
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    initApp();
};

function updateClock() {
    const clock = document.getElementById('live-clock');
    if(!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString();
}

window.toggleProfileMenu = function() {
    document.getElementById('profile-menu').classList.toggle('hidden');
};

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
};

window.backupData = function() {
    const data = {
        shopDirectory,
        productsMap,
        salesData,
        expenses,
        stockHistory,
        creditPayments,
        returns: JSON.parse(localStorage.getItem('watalappan_return_damage')) || [],
        orders: JSON.parse(localStorage.getItem('watalappan_orders')) || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};

function initApp() {
    document.getElementById('sales-date').value = new Date().toISOString().split('T')[0];
    populateDropdowns();
    renderShops();
    renderProductsSettings();
    renderSalesTable();
    renderStockOverview();
    renderStockHistory();
    renderExpenseTable();
    renderCreditTable();
    renderMonthlyPnL();
    renderExpiryAlerts();
    renderUpcomingOrdersInAnalytics();
    updateFilteredAnalytics();
    updateLiveTotal();
}