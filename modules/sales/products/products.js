/* ==========================================
   Smart ERP Pro
   Product Management JS v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const productName = document.getElementById("productName");
    const category = document.getElementById("category");
    const sku = document.getElementById("sku");
    const barcode = document.getElementById("barcode");
    const unit = document.getElementById("unit");
    const costPrice = document.getElementById("costPrice");
    const sellingPrice = document.getElementById("sellingPrice");
    const openingStock = document.getElementById("openingStock");
    const minStock = document.getElementById("minStock");
    const expiryDays = document.getElementById("expiryDays");
    const status = document.getElementById("status");
    const notes = document.getElementById("notes");
    const editIndex = document.getElementById("editIndex");

    const saveProduct = document.getElementById("saveProduct");
    const clearForm = document.getElementById("clearForm");
    const searchProduct = document.getElementById("searchProduct");
    const productTable = document.getElementById("productTable");
    const backSales = document.getElementById("backSales");

    let products = JSON.parse(localStorage.getItem("erpProducts")) || [];

    function saveToLocalStorage() {
        localStorage.setItem("erpProducts", JSON.stringify(products));
    }

    function renderProducts(list = products) {
        productTable.innerHTML = "";

        if (list.length === 0) {
            productTable.innerHTML = `
                <tr>
                    <td colspan="10">No products found</td>
                </tr>
            `;
            return;
        }

        list.forEach((p, index) => {
            const stockClass = Number(p.openingStock) <= Number(p.minStock) ? "inactive" : "active";
            const statusClass = p.status === "Active" ? "active" : "inactive";

            productTable.innerHTML += `
                <tr>
                    <td>${p.productName}</td>
                    <td>${p.category}</td>
                    <td>${p.sku}</td>
                    <td>${p.unit}</td>
                    <td>Rs. ${Number(p.costPrice).toFixed(2)}</td>
                    <td>Rs. ${Number(p.sellingPrice).toFixed(2)}</td>
                    <td class="${stockClass}">${p.openingStock}</td>
                    <td>${p.minStock}</td>
                    <td class="${statusClass}">${p.status}</td>
                    <td>
                        <button class="editBtn" onclick="editProduct(${index})">Edit</button>
                        <button class="deleteBtn" onclick="deleteProduct(${index})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    function resetForm() {
        editIndex.value = "";
        productName.value = "";
        category.value = "Dessert";
        sku.value = "";
        barcode.value = "";
        unit.value = "Cup";
        costPrice.value = "";
        sellingPrice.value = "";
        openingStock.value = "";
        minStock.value = "";
        expiryDays.value = "";
        status.value = "Active";
        notes.value = "";
        saveProduct.textContent = "Save Product";
    }

    saveProduct.addEventListener("click", () => {

        if (productName.value.trim() === "") {
            alert("Please enter product name");
            productName.focus();
            return;
        }

        if (sku.value.trim() === "") {
            alert("Please enter SKU / Code");
            sku.focus();
            return;
        }

        if (sellingPrice.value === "" || Number(sellingPrice.value) <= 0) {
            alert("Please enter selling price");
            sellingPrice.focus();
            return;
        }

        const productData = {
            productName: productName.value.trim(),
            category: category.value,
            sku: sku.value.trim(),
            barcode: barcode.value.trim(),
            unit: unit.value,
            costPrice: Number(costPrice.value) || 0,
            sellingPrice: Number(sellingPrice.value) || 0,
            openingStock: Number(openingStock.value) || 0,
            minStock: Number(minStock.value) || 0,
            expiryDays: Number(expiryDays.value) || 0,
            status: status.value,
            notes: notes.value.trim(),
            createdAt: new Date().toLocaleString()
        };

        const currentEditIndex = editIndex.value === "" ? -1 : Number(editIndex.value);

        const duplicateSku = products.find((p, i) =>
            p.sku === productData.sku && i !== currentEditIndex
        );

        if (duplicateSku) {
            alert("This SKU already exists");
            return;
        }

        if (productData.barcode !== "") {
            const duplicateBarcode = products.find((p, i) =>
                p.barcode === productData.barcode && i !== currentEditIndex
            );

            if (duplicateBarcode) {
                alert("This barcode already exists");
                return;
            }
        }

        if (editIndex.value === "") {
            products.push(productData);
            alert("Product saved successfully!");
        } else {
            products[Number(editIndex.value)] = productData;
            alert("Product updated successfully!");
        }

        saveToLocalStorage();
        renderProducts();
        resetForm();
    });

    window.editProduct = function(index) {
        const p = products[index];

        editIndex.value = index;
        productName.value = p.productName;
        category.value = p.category;
        sku.value = p.sku;
        barcode.value = p.barcode;
        unit.value = p.unit;
        costPrice.value = p.costPrice;
        sellingPrice.value = p.sellingPrice;
        openingStock.value = p.openingStock;
        minStock.value = p.minStock;
        expiryDays.value = p.expiryDays;
        status.value = p.status;
        notes.value = p.notes;

        saveProduct.textContent = "Update Product";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    window.deleteProduct = function(index) {
        if (confirm("Delete this product?")) {
            products.splice(index, 1);
            saveToLocalStorage();
            renderProducts();
            resetForm();
        }
    };

    searchProduct.addEventListener("input", () => {
        const keyword = searchProduct.value.toLowerCase();

        const filtered = products.filter(p =>
            p.productName.toLowerCase().includes(keyword) ||
            p.category.toLowerCase().includes(keyword) ||
            p.sku.toLowerCase().includes(keyword) ||
            p.barcode.toLowerCase().includes(keyword) ||
            p.status.toLowerCase().includes(keyword)
        );

        renderProducts(filtered);
    });

    clearForm.addEventListener("click", resetForm);

    backSales.addEventListener("click", () => {
        window.location.href = "../sales.html";
    });

    renderProducts();

});
