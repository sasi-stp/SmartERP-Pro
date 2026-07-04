/* ==========================================
   Smart ERP Pro
   Sales Module JS v1.1
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const invoiceNo = document.getElementById("invoiceNo");
    const invoiceDate = document.getElementById("invoiceDate");

    const customer = document.getElementById("customer");
    const phone = document.getElementById("phone");

    const product = document.getElementById("product");
    const availableStock = document.getElementById("availableStock");
    const qty = document.getElementById("qty");
    const price = document.getElementById("price");
    const total = document.getElementById("total");

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

    function init() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];

        loadCustomers();
        loadProducts();
        calculateTotal();
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

    function loadProducts() {
        product.innerHTML = `<option value="">Select Product</option>`;

        products
            .filter(p => p.status === "Active")
            .forEach((p, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = p.productName;
                product.appendChild(option);
            });
    }

    customer.addEventListener("change", () => {
        const selectedCustomer = customers[customer.value];

        if (selectedCustomer) {
            phone.value = selectedCustomer.phone || "";
        } else {
            phone.value = "";
        }
    });

    product.addEventListener("change", () => {
        const selectedProduct = products[product.value];

        if (selectedProduct) {
            price.value = selectedProduct.sellingPrice || 0;
            availableStock.value = selectedProduct.openingStock || 0;
        } else {
            price.value = "";
            availableStock.value = "";
        }

        calculateTotal();
    });

    qty.addEventListener("input", calculateTotal);
    paid.addEventListener("input", calculateTotal);

    function calculateTotal() {
        const q = Number(qty.value) || 0;
        const p = Number(price.value) || 0;
        const t = q * p;

        total.value = t.toFixed(2);
        grandTotal.value = t.toFixed(2);

        const paidAmount = Number(paid.value) || 0;
        balance.value = (paidAmount - t).toFixed(2);
    }

    saveBtn.addEventListener("click", () => {

        if (customer.value === "") {
            alert("Please select customer");
            return;
        }

        if (product.value === "") {
            alert("Please select product");
            return;
        }

        const selectedProduct = products[product.value];
        const selectedCustomer = customers[customer.value];

        const saleQty = Number(qty.value) || 0;
        const stockQty = Number(selectedProduct.openingStock) || 0;

        if (saleQty <= 0) {
            alert("Please enter valid quantity");
            return;
        }

        if (saleQty > stockQty) {
            alert("Not enough stock available");
            return;
        }

        const invoice = {
            invoiceNo: invoiceNo.value,
            date: invoiceDate.value,
            customerName: selectedCustomer.customerName,
            shopName: selectedCustomer.shopName,
            phone: selectedCustomer.phone,
            productName: selectedProduct.productName,
            sku: selectedProduct.sku,
            qty: saleQty,
            unitPrice: Number(price.value),
            total: Number(grandTotal.value),
            paid: Number(paid.value) || 0,
            balance: Number(balance.value),
            createdAt: new Date().toLocaleString()
        };

        const invoices = JSON.parse(localStorage.getItem("erpInvoices")) || [];
        invoices.push(invoice);
        localStorage.setItem("erpInvoices", JSON.stringify(invoices));

        selectedProduct.openingStock = stockQty - saleQty;
        products[product.value] = selectedProduct;
        localStorage.setItem("erpProducts", JSON.stringify(products));

        alert("Invoice saved successfully!");
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
        const selectedProduct = products[product.value];

        if (!selectedCustomer || !selectedProduct) {
            alert("Please select customer and product first");
            return;
        }

        const msg =
`Smart ERP Invoice
Invoice No: ${invoiceNo.value}
Date: ${invoiceDate.value}
Customer: ${selectedCustomer.customerName}
Shop: ${selectedCustomer.shopName || "-"}
Phone: ${selectedCustomer.phone || "-"}
Product: ${selectedProduct.productName}
Qty: ${qty.value}
Unit Price: Rs. ${price.value}
Total: Rs. ${grandTotal.value}
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

    function clearForm() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];
        customer.value = "";
        phone.value = "";
        product.value = "";
        availableStock.value = "";
        qty.value = 1;
        price.value = "";
        paid.value = "";
        calculateTotal();
    }

    init();

});
