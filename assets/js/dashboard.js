/* ==========================================
   Smart ERP Pro Dashboard V2 JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const logoutBtn = document.getElementById("logoutBtn");
    const themeBtn = document.getElementById("themeBtn");
    const newInvoiceBtn = document.getElementById("newInvoiceBtn");

    const navItems = document.querySelectorAll(".nav-item");
    const quickButtons = document.querySelectorAll(".quick-actions button");

    const todaySales = document.getElementById("todaySales");
    const customerCount = document.getElementById("customerCount");
    const productCount = document.getElementById("productCount");
    const inventoryCount = document.getElementById("inventoryCount");
    const lowStockCount = document.getElementById("lowStockCount");
    const outstandingAmount = document.getElementById("outstandingAmount");
    const activityList = document.getElementById("activityList");

    function money(value) {
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function openPage(link) {
        if (!link || link === "dashboard") return;

        if (
            link === "production" ||
            link === "purchase" ||
            link === "delivery" ||
            link === "finance" ||
            link === "employees" ||
            link === "reports" ||
            link === "settings" ||
            link === "ai"
        ) {
            alert("This module will be added next: " + link);
            return;
        }

        window.location.href = link;
    }

    function updateDashboard() {
        const invoices = JSON.parse(localStorage.getItem("erpInvoices")) || [];
        const customers = JSON.parse(localStorage.getItem("erpCustomers")) || [];
        const products = JSON.parse(localStorage.getItem("erpProducts")) || [];
        const inventory = JSON.parse(localStorage.getItem("erpInventory")) || [];

        const today = new Date().toISOString().split("T")[0];

        const todayTotal = invoices
            .filter(inv => inv.date === today)
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const outstanding = invoices
            .reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);

        const lowStock = inventory.filter(item => {
            const stock = Number(item.currentStock) || 0;
            const min = Number(item.minStock) || 0;
            return stock > 0 && stock <= min;
        }).length;

        todaySales.textContent = money(todayTotal);
        customerCount.textContent = customers.length;
        productCount.textContent = products.length;
        inventoryCount.textContent = inventory.length;
        lowStockCount.textContent = lowStock;
        outstandingAmount.textContent = money(outstanding);

        activityList.innerHTML = "";

        const recentInvoices = invoices.slice(-5).reverse();

        if (recentInvoices.length === 0) {
            activityList.innerHTML = "<li>No recent invoices yet</li>";
        } else {
            recentInvoices.forEach(inv => {
                activityList.innerHTML += `
                    <li>
                        Invoice ${inv.invoiceNo} - ${inv.customerName}
                        <br>
                        <small>${money(inv.total)}</small>
                    </li>
                `;
            });
        }
    }

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(btn => btn.classList.remove("active"));
            item.classList.add("active");
            openPage(item.dataset.link);
        });
    });

    quickButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            openPage(btn.dataset.link);
        });
    });

    newInvoiceBtn.addEventListener("click", () => {
        window.location.href = "modules/sales/sales.html";
    });

    logoutBtn.addEventListener("click", () => {
        if (confirm("Do you want to logout?")) {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        }
    });

    themeBtn.addEventListener("click", () => {
        alert("Dark mode advanced version will be added later.");
    });

    updateDashboard();

});
