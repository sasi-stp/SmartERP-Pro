/* Smart ERP Pro - Sales Module v2 */

document.addEventListener("DOMContentLoaded", () => {
    const invoiceNo = document.getElementById("invoiceNo");
    const invoiceDate = document.getElementById("invoiceDate");
    const customer = document.getElementById("customer");
    const phone = document.getElementById("phone");
    const itemsBody = document.getElementById("itemsBody");
    const addRowBtn = document.getElementById("addRowBtn");
    const grandTotal = document.getElementById("grandTotal");
    const paid = document.getElementById("paid");
    const balance = document.getElementById("balance");

    const saveBtn = document.getElementById("saveBtn");
    const printBtn = document.getElementById("printBtn");
    const clearBtn = document.getElementById("clearBtn");
    const whatsappBtn = document.getElementById("whatsappBtn");

    const backDashboard = document.getElementById("backDashboard");
    const customerBtn = document.getElementById("customerBtn");
    const productBtn = document.getElementById("productBtn");
    const historyBtn = document.getElementById("historyBtn");

    let customers = JSON.parse(localStorage.getItem("erpCustomers")) || [];
    let products = JSON.parse(localStorage.getItem("erpProducts")) || [];

    function money(value) {
        return (Number(value) || 0).toFixed(2);
    }

    function generateInvoiceNo() {
        const invoices = JSON.parse(localStorage.getItem("erpInvoices")) || [];
        return "INV-" + String(invoices.length + 1).padStart(5, "0");
    }

    function loadCustomers() {
        customer.innerHTML = `<option value="">Select Customer</option>`;

        customers.forEach((c, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = c.customerName + (c.shopName ? " - " + c.shopName : "");
            customer.appendChild(option);
        });
    }

    function productOptions() {
        let html = `<option value="">Select Product</option>`;

        products.forEach((p, index) => {
            const status = String(p.status || "Active").toLowerCase();

            if (status === "active") {
                html += `<option value="${index}">${p.productName}</option>`;
            }
        });

        return html;
    }

    function loadProductsToRows() {
        document.querySelectorAll(".productSelect").forEach(select => {
            select.innerHTML = productOptions();
        });
    }

    function calculateRow(row) {
        const select = row.querySelector(".productSelect");
        const stockInput = row.querySelector(".stockInput");
        const qtyInput = row.querySelector(".qtyInput");
        const priceInput = row.querySelector(".priceInput");
        const rowTotalInput = row.querySelector(".rowTotalInput");

        const selectedProduct = products[select.value];

        if (selectedProduct) {
            stockInput.value = selectedProduct.openingStock || 0;
            priceInput.value = selectedProduct.sellingPrice || 0;
        } else {
            stockInput.value = "";
            priceInput.value = "";
        }

        const qty = Number(qtyInput.value) || 0;
        const price = Number(priceInput.value) || 0;
        rowTotalInput.value = money(qty * price);

        calculateGrandTotal();
    }

    function calculateGrandTotal() {
        let total = 0;

        document.querySelectorAll(".rowTotalInput").forEach(input => {
            total += Number(input.value) || 0;
        });

        grandTotal.value = money(total);

        const paidAmount = Number(paid.value) || 0;
        balance.value = money(paidAmount - total);
    }

    function bindRowEvents(row) {
        const select = row.querySelector(".productSelect");
        const qtyInput = row.querySelector(".qtyInput");
        const removeBtn = row.querySelector(".removeRowBtn");

        select.addEventListener("change", () => calculateRow(row));
        qtyInput.addEventListener("input", () => calculateRow(row));

        removeBtn.addEventListener("click", () => {
            const rows = document.querySelectorAll(".item-row");

            if (rows.length === 1) {
                alert("At least one product row is required");
                return;
            }

            row.remove();
            calculateGrandTotal();
        });
    }

    function addRow() {
        const row = document.createElement("tr");
        row.className = "item-row";

        row.innerHTML = `
            <td>
                <select class="productSelect">
                    ${productOptions()}
                </select>
            </td>
            <td>
                <input type="text" class="stockInput" readonly>
            </td>
            <td>
                <input type="number" class="qtyInput" value="1" min="1">
            </td>
            <td>
                <input type="number" class="priceInput" readonly>
            </td>
            <td>
                <input type="text" class="rowTotalInput" readonly>
            </td>
            <td>
                <button type="button" class="removeRowBtn">Remove</button>
            </td>
        `;

        itemsBody.appendChild(row);
        bindRowEvents(row);
    }

    function getInvoiceItems() {
        const rows = document.querySelectorAll(".item-row");
        const items = [];

        for (const row of rows) {
            const select = row.querySelector(".productSelect");
            const qtyInput = row.querySelector(".qtyInput");
            const priceInput = row.querySelector(".priceInput");
            const rowTotalInput = row.querySelector(".rowTotalInput");

            if (select.value === "") continue;

            const p = products[select.value];
            const qty = Number(qtyInput.value) || 0;

            if (!p || qty <= 0) continue;

            items.push({
                productIndex: Number(select.value),
                productName: p.productName,
                sku: p.sku || "",
                qty: qty,
                unitPrice: Number(priceInput.value) || 0,
                total: Number(rowTotalInput.value) || 0
            });
        }

        return items;
    }

    function clearForm() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];
        customer.value = "";
        phone.value = "";
        paid.value = "";

        itemsBody.innerHTML = "";
        addRow();

        calculateGrandTotal();
    }

    customer.addEventListener("change", () => {
        const selected = customers[customer.value];
        phone.value = selected ? selected.phone || "" : "";
    });

    addRowBtn.addEventListener("click", addRow);
    paid.addEventListener("input", calculateGrandTotal);

    saveBtn.addEventListener("click", () => {
        if (customer.value === "") {
            alert("Please select customer");
            return;
        }

        const selectedCustomer = customers[customer.value];
        const items = getInvoiceItems();

        if (items.length === 0) {
            alert("Please select at least one product");
            return;
        }

        for (const item of items) {
            const p = products[item.productIndex];
            const stock = Number(p.openingStock) || 0;

            if (item.qty > stock) {
                alert(`${p.productName} stock not enough`);
                return;
            }
        }

        const invoice = {
            invoiceNo: invoiceNo.value,
            date: invoiceDate.value,
            customerName: selectedCustomer.customerName,
            shopName: selectedCustomer.shopName || "",
            phone: selectedCustomer.phone || "",
            items: items,
            total: Number(grandTotal.value) || 0,
            paid: Number(paid.value) || 0,
            balance: Number(balance.value) || 0,
            createdAt: new Date().toLocaleString()
        };

        const invoices = JSON.parse(localStorage.getItem("erpInvoices")) || [];
        invoices.push(invoice);
        localStorage.setItem("erpInvoices", JSON.stringify(invoices));

        items.forEach(item => {
            products[item.productIndex].openingStock =
                (Number(products[item.productIndex].openingStock) || 0) - item.qty;
        });

        localStorage.setItem("erpProducts", JSON.stringify(products));

        alert("Invoice saved successfully");
        clearForm();
    });

    printBtn.addEventListener("click", () => {
        window.print();
    });

    clearBtn.addEventListener("click", () => {
        if (confirm("Clear invoice?")) {
            clearForm();
        }
    });

    whatsappBtn.addEventListener("click", () => {
        const selectedCustomer = customers[customer.value];
        const items = getInvoiceItems();

        if (!selectedCustomer || items.length === 0) {
            alert("Please select customer and products first");
            return;
        }

        let itemText = "";
        items.forEach(item => {
            itemText += `${item.productName} x ${item.qty} = Rs. ${money(item.total)}\n`;
        });

        const msg =
`Smart ERP Invoice
Invoice No: ${invoiceNo.value}
Date: ${invoiceDate.value}
Customer: ${selectedCustomer.customerName}
Phone: ${selectedCustomer.phone || "-"}
Items:
${itemText}
Grand Total: Rs. ${grandTotal.value}
Paid: Rs. ${paid.value || 0}
Balance: Rs. ${balance.value}`;

        window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
    });

    backDashboard.addEventListener("click", () => {
        window.location.href = "../../dashboard.html";
    });

    customerBtn.addEventListener("click", () => {
        window.location.href = "customers/customers.html";
    });

    productBtn.addEventListener("click", () => {
        window.location.href = "products/products.html";
    });

    historyBtn.addEventListener("click", () => {
        window.location.href = "history/history.html";
    });

    function init() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];

        loadCustomers();
        loadProductsToRows();

        document.querySelectorAll(".item-row").forEach(row => {
            row.querySelector(".productSelect").innerHTML = productOptions();
            bindRowEvents(row);
        });

        calculateGrandTotal();
    }

    init();
});
