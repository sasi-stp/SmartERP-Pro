/* ==========================================
   Smart ERP Pro
   Inventory Module JS v1.0
   Part 1 - Variables + Init + Summary
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Form fields
    const editIndex = document.getElementById("editIndex");
    const itemType = document.getElementById("itemType");
    const itemName = document.getElementById("itemName");
    const category = document.getElementById("category");
    const unit = document.getElementById("unit");
    const currentStock = document.getElementById("currentStock");
    const minStock = document.getElementById("minStock");
    const unitCost = document.getElementById("unitCost");
    const expiryDate = document.getElementById("expiryDate");
    const supplier = document.getElementById("supplier");
    const notes = document.getElementById("notes");

    // Buttons
    const saveItem = document.getElementById("saveItem");
    const clearForm = document.getElementById("clearForm");
    const printInventory = document.getElementById("printInventory");
    const backDashboard = document.getElementById("backDashboard");

    // Table and search
    const inventoryTable = document.getElementById("inventoryTable");
    const searchItem = document.getElementById("searchItem");

    // Summary cards
    const totalItems = document.getElementById("totalItems");
    const lowStock = document.getElementById("lowStock");
    const outOfStock = document.getElementById("outOfStock");
    const stockValue = document.getElementById("stockValue");

    // LocalStorage data
    let inventory = JSON.parse(localStorage.getItem("erpInventory")) || [];

    function saveInventory() {
        localStorage.setItem("erpInventory", JSON.stringify(inventory));
    }

    function money(value) {
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function updateSummary(list = inventory) {
        const total = list.length;

        const low = list.filter(item =>
            Number(item.currentStock) > 0 &&
            Number(item.currentStock) <= Number(item.minStock)
        ).length;

        const out = list.filter(item =>
            Number(item.currentStock) <= 0
        ).length;

        const value = list.reduce((sum, item) => {
            return sum + ((Number(item.currentStock) || 0) * (Number(item.unitCost) || 0));
        }, 0);

        totalItems.textContent = total;
        lowStock.textContent = low;
        outOfStock.textContent = out;
        stockValue.textContent = money(value);
    }
