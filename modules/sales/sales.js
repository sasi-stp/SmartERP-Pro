/* ==========================================
   Smart ERP Pro
   Sales Module JS v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const invoiceNo = document.getElementById("invoiceNo");
    const invoiceDate = document.getElementById("invoiceDate");
    const product = document.getElementById("product");
    const qty = document.getElementById("qty");
    const price = document.getElementById("price");
    const total = document.getElementById("total");
    const grandTotal = document.getElementById("grandTotal");
    const paid = document.getElementById("paid");
    const balance = document.getElementById("balance");

    const customer = document.getElementById("customer");
    const phone = document.getElementById("phone");

    const saveBtn = document.getElementById("saveBtn");
    const printBtn = document.getElementById("printBtn");
    const clearBtn = document.getElementById("clearBtn");
    const whatsappBtn = document.getElementById("whatsappBtn");
    const backDashboard = document.getElementById("backDashboard");

    const prices = {
        "Watalappan": 120,
        "Yogurt": 80,
        "Caramel Pudding": 150,
        "Jelly Yogurt": 100
    };

    const customers = [
        { name: "Cash Customer", phone: "" },
        { name: "Shop 01", phone: "0770000001" },
        { name: "Shop 02", phone: "0770000002" }
    ];

    function init() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];

        loadCustomers();
        setProductPrice();
        calculateTotal();
    }

    function generateInvoiceNo() {
        const invoices = JSON.parse(localStorage.getItem("salesInvoices")) || [];
        return "INV-" + String(invoices.length + 1).padStart(5, "0");
    }

    function loadCustomers() {
        customer.innerHTML = "";
        customers.forEach(c => {
            const option = document.createElement("option");
            option.value = c.name;
            option.textContent = c.name;
            customer.appendChild(option);
        });
        phone.value = customers[0].phone;
    }

    function setProductPrice() {
        price.value = prices[product.value] || 0;
        calculateTotal();
    }

    function calculateTotal() {
        const q = Number(qty.value) || 0;
        const p = Number(price.value) || 0;
        const t = q * p;

        total.value = t.toFixed(2);
        grandTotal.value = t.toFixed(2);

        const paidAmount = Number(paid.value) || 0;
        balance.value = (paidAmount - t).toFixed(2);
    }

    product.addEventListener("change", setProductPrice);
    qty.addEventListener("input", calculateTotal);
    price.addEventListener("input", calculateTotal);
    paid.addEventListener("input", calculateTotal);

    customer.addEventListener("change", () => {
        const selected = customers.find(c => c.name === customer.value);
        phone.value = selected ? selected.phone : "";
    });

    saveBtn.addEventListener("click", () => {
        const invoice = {
            invoiceNo: invoiceNo.value,
            date: invoiceDate.value,
            customer: customer.value,
            phone: phone.value,
            product: product.value,
            qty: Number(qty.value),
            price: Number(price.value),
            total: Number(total.value),
            paid: Number(paid.value) || 0,
            balance: Number(balance.value),
            createdAt: new Date().toLocaleString()
        };

        const invoices = JSON.parse(localStorage.getItem("salesInvoices")) || [];
        invoices.push(invoice);
        localStorage.setItem("salesInvoices", JSON.stringify(invoices));

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
        const msg =
`Smart ERP Invoice
Invoice No: ${invoiceNo.value}
Date: ${invoiceDate.value}
Customer: ${customer.value}
Product: ${product.value}
Qty: ${qty.value}
Total: Rs. ${grandTotal.value}
Paid: Rs. ${paid.value || 0}
Balance: Rs. ${balance.value}`;

        window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
    });

    backDashboard.addEventListener("click", () => {
        window.location.href = "../../dashboard.html";
    });

    function clearForm() {
        invoiceNo.value = generateInvoiceNo();
        invoiceDate.value = new Date().toISOString().split("T")[0];
        product.value = "Watalappan";
        qty.value = 1;
        paid.value = "";
        setProductPrice();
    }

    init();
});
