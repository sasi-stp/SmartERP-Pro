/*=========================================
 Smart ERP Pro
 Dashboard JavaScript v1.0
=========================================*/

document.addEventListener("DOMContentLoaded", function () {

    //=========================
    // Login Check
    //=========================

    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    //=========================
    // Sidebar
    //=========================

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    //=========================
    // Dark Mode
    //=========================

    const themeBtn = document.getElementById("themeBtn");

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = "☀️";
    }

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");
            themeBtn.innerHTML = "☀️";

        } else {

            localStorage.setItem("theme", "light");
            themeBtn.innerHTML = "🌙";

        }

    });

    //=========================
    // Logout
    //=========================

    document.getElementById("logoutBtn").addEventListener("click", () => {

        if (confirm("Do you want to logout?")) {

            localStorage.removeItem("loggedIn");
            localStorage.removeItem("currentUser");

            window.location.href = "login.html";

        }

    });

    //=========================
    // Sidebar Modules
    //=========================

    const moduleView = document.getElementById("moduleView");

    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {

        item.addEventListener("click", function () {

            menuItems.forEach(btn => btn.classList.remove("active"));

            this.classList.add("active");

            let module = this.dataset.page;

            loadModule(module);

        });

    });

    //=========================
    // Module Loader
    //=========================

    function loadModule(module){

        switch(module){

            case "dashboard":

                moduleView.innerHTML = `
                    <h2>Dashboard</h2>
                    <p>Business Overview</p>
                `;

            break;

            case "sales":

        window.location.href = "modules/sales/sales.html";

    break;

            case "inventory":

                moduleView.innerHTML = `
                    <h2>Inventory Module</h2>

                    <p>
                    Raw Materials<br>
                    Stock Management<br>
                    Low Stock Alerts
                    </p>
                `;

            break;

            case "purchase":

                moduleView.innerHTML = `
                    <h2>Purchase Module</h2>

                    <p>
                    Purchase Orders<br>
                    Suppliers
                    </p>
                `;

            break;

            case "customers":

                moduleView.innerHTML = `
                    <h2>Customers</h2>

                    <p>
                    Customer List<br>
                    Outstanding Payments
                    </p>
                `;

            break;

            case "finance":

                moduleView.innerHTML = `
                    <h2>Finance</h2>

                    <p>
                    Income<br>
                    Expenses<br>
                    Profit & Loss
                    </p>
                `;

            break;

            case "production":

                moduleView.innerHTML = `
                    <h2>Production</h2>

                    <p>
                    Production Schedule<br>
                    Batch Tracking
                    </p>
                `;

            break;

            case "employees":

                moduleView.innerHTML = `
                    <h2>Employees</h2>

                    <p>
                    Employee Management
                    </p>
                `;

            break;

            case "delivery":

                moduleView.innerHTML = `
                    <h2>Delivery</h2>

                    <p>
                    Delivery Planning
                    </p>
                `;

            break;

            case "reports":

                moduleView.innerHTML = `
                    <h2>Reports</h2>

                    <p>
                    Daily Reports<br>
                    Monthly Reports
                    </p>
                `;

            break;

            case "settings":

                moduleView.innerHTML = `
                    <h2>Settings</h2>

                    <p>
                    System Configuration
                    </p>
                `;

            break;

        }

    }

    //=========================
    // Load Dashboard
    //=========================

    loadModule("dashboard");

});
