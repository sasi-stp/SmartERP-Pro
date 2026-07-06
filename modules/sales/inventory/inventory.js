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
    function renderInventory(list = inventory) {
        inventoryTable.innerHTML = "";

        if (list.length === 0) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="11">No inventory items found</td>
                </tr>
            `;
            updateSummary(list);
            return;
        }

        list.forEach((item, index) => {
            const stock = Number(item.currentStock) || 0;
            const min = Number(item.minStock) || 0;

            let stockClass = "goodStock";

            if (stock <= 0) {
                stockClass = "outStock";
            } else if (stock <= min) {
                stockClass = "lowStock";
            }

            const value = stock * (Number(item.unitCost) || 0);

            inventoryTable.innerHTML += `
                <tr>
                    <td>${item.itemName}</td>
                    <td>${item.itemType}</td>
                    <td>${item.category}</td>
                    <td>${item.unit}</td>
                    <td class="${stockClass}">${item.currentStock}</td>
                    <td>${item.minStock}</td>
                    <td>${money(item.unitCost)}</td>
                    <td>${money(value)}</td>
                    <td>${item.expiryDate || "-"}</td>
                    <td>${item.supplier || "-"}</td>
                    <td>
                        <button class="editBtn" onclick="editInventoryItem(${index})">Edit</button>
                        <button class="deleteBtn" onclick="deleteInventoryItem(${index})">Delete</button>
                    </td>
                </tr>
            `;
        });

        updateSummary(list);
    }

    saveItem.addEventListener("click", () => {

        if (itemName.value.trim() === "") {
            alert("Please enter item name");
            itemName.focus();
            return;
        }

        if (currentStock.value === "") {
            alert("Please enter current stock");
            currentStock.focus();
            return;
        }

        const itemData = {
            itemType: itemType.value,
            itemName: itemName.value.trim(),
            category: category.value,
            unit: unit.value,
            currentStock: Number(currentStock.value) || 0,
            minStock: Number(minStock.value) || 0,
            unitCost: Number(unitCost.value) || 0,
            expiryDate: expiryDate.value,
            supplier: supplier.value.trim(),
            notes: notes.value.trim(),
            createdAt: new Date().toLocaleString()
        };

        if (editIndex.value === "") {
            inventory.push(itemData);
            alert("Inventory item saved successfully!");
        } else {
            inventory[Number(editIndex.value)] = itemData;
            alert("Inventory item updated successfully!");
        }

        saveInventory();
        renderInventory();
        resetForm();
    });
    window.editInventoryItem = function(index) {
        const item = inventory[index];

        editIndex.value = index;
        itemType.value = item.itemType;
        itemName.value = item.itemName;
        category.value = item.category;
        unit.value = item.unit;
        currentStock.value = item.currentStock;
        minStock.value = item.minStock;
        unitCost.value = item.unitCost;
        expiryDate.value = item.expiryDate;
        supplier.value = item.supplier;
        notes.value = item.notes;

        saveItem.textContent = "Update Item";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    window.deleteInventoryItem = function(index) {
        if (confirm("Delete this inventory item?")) {
            inventory.splice(index, 1);
            saveInventory();
            renderInventory();
            resetForm();
        }
    };

    searchItem.addEventListener("input", () => {
        const keyword = searchItem.value.toLowerCase();

        const filtered = inventory.filter(item =>
            item.itemName.toLowerCase().includes(keyword) ||
            item.itemType.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword) ||
            item.unit.toLowerCase().includes(keyword) ||
            String(item.supplier).toLowerCase().includes(keyword)
        );

        renderInventory(filtered);
    });
       function resetForm() {

        editIndex.value = "";

        itemType.value = "Raw Material";
        itemName.value = "";
        category.value = "Food Material";
        unit.value = "Kg";

        currentStock.value = "";
        minStock.value = "";
        unitCost.value = "";

        expiryDate.value = "";
        supplier.value = "";
        notes.value = "";

        saveItem.textContent = "Save Item";
    }

    clearForm.addEventListener("click", () => {

        if(confirm("Clear all fields?")){
            resetForm();
        }

    });

    printInventory.addEventListener("click", () => {
        window.print();
    });

    backDashboard.addEventListener("click", () => {
        window.location.href = "../../dashboard.html";
    });

    // Initial Load

    renderInventory();

});   // <-- IMPORTANT: inventory.js ends here
