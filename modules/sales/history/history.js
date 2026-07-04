/* ==========================================
   Smart ERP Pro
   Invoice History JS v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const invoiceTable = document.getElementById("invoiceTable");
    const searchInvoice = document.getElementById("searchInvoice");
    const backSales = document.getElementById("backSales");
    const printAll = document.getElementById("printAll");

    const totalInvoices = document.getElementById("totalInvoices");
    const totalSales = document.getElementById("totalSales");
    const totalPaid = document.getElementById("totalPaid");
    const totalBalance = document.getElementById("totalBalance");

    let invoices = JSON.parse(localStorage.getItem("erpInvoices")) || [];

    function money(value){
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function renderSummary(list = invoices){
        const sales = list.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        const paid = list.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
        const balance = list.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);

        totalInvoices.textContent = list.length;
        totalSales.textContent = money(sales);
        totalPaid.textContent = money(paid);
        totalBalance.textContent = money(balance);
    }

    function renderInvoices(list = invoices){
        invoiceTable.innerHTML = "";

        if(list.length === 0){
            invoiceTable.innerHTML = `
                <tr>
                    <td colspan="9">No invoices found</td>
                </tr>
            `;
            renderSummary(list);
            return;
        }

        list.forEach((inv, index) => {
            invoiceTable.innerHTML += `
                <tr>
                    <td>${inv.invoiceNo}</td>
                    <td>${inv.date}</td>
                    <td>${inv.customerName}</td>
                    <td>${inv.productName}</td>
                    <td>${inv.qty}</td>
                    <td>${money(inv.total)}</td>
                    <td>${money(inv.paid)}</td>
                    <td>${money(inv.balance)}</td>
                    <td>
                        <button class="viewBtn" onclick="viewInvoice(${index})">View</button>
                        <button class="printBtn" onclick="printInvoice(${index})">Print</button>
                        <button class="deleteBtn" onclick="deleteInvoice(${index})">Delete</button>
                    </td>
                </tr>
            `;
        });

        renderSummary(list);
    }

    window.viewInvoice = function(index){
        const inv = invoices[index];

        alert(
`Invoice No: ${inv.invoiceNo}
Date: ${inv.date}
Customer: ${inv.customerName}
Shop: ${inv.shopName || "-"}
Phone: ${inv.phone || "-"}
Product: ${inv.productName}
SKU: ${inv.sku || "-"}
Qty: ${inv.qty}
Unit Price: ${money(inv.unitPrice)}
Total: ${money(inv.total)}
Paid: ${money(inv.paid)}
Balance: ${money(inv.balance)}
Created: ${inv.createdAt}`
        );
    };

    window.printInvoice = function(index){
        const inv = invoices[index];

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
            <html>
            <head>
                <title>${inv.invoiceNo}</title>
                <style>
                    body{
                        font-family:Arial,sans-serif;
                        padding:30px;
                        color:#111827;
                    }
                    .invoice{
                        max-width:700px;
                        margin:auto;
                        border:1px solid #ddd;
                        padding:25px;
                    }
                    h1{
                        text-align:center;
                        margin-bottom:5px;
                    }
                    .sub{
                        text-align:center;
                        margin-bottom:25px;
                        color:#666;
                    }
                    table{
                        width:100%;
                        border-collapse:collapse;
                        margin-top:20px;
                    }
                    td,th{
                        border:1px solid #ddd;
                        padding:10px;
                        text-align:left;
                    }
                    .total{
                        text-align:right;
                        font-size:20px;
                        font-weight:bold;
                        margin-top:20px;
                    }
                </style>
            </head>
            <body>
                <div class="invoice">
                    <h1>Smart ERP Pro</h1>
                    <p class="sub">Sales Invoice</p>

                    <p><strong>Invoice No:</strong> ${inv.invoiceNo}</p>
                    <p><strong>Date:</strong> ${inv.date}</p>
                    <p><strong>Customer:</strong> ${inv.customerName}</p>
                    <p><strong>Shop:</strong> ${inv.shopName || "-"}</p>
                    <p><strong>Phone:</strong> ${inv.phone || "-"}</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>${inv.productName}</td>
                                <td>${inv.sku || "-"}</td>
                                <td>${inv.qty}</td>
                                <td>${money(inv.unitPrice)}</td>
                                <td>${money(inv.total)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p class="total">Grand Total: ${money(inv.total)}</p>
                    <p><strong>Paid:</strong> ${money(inv.paid)}</p>
                    <p><strong>Balance:</strong> ${money(inv.balance)}</p>
                    <br>
                    <p>Thank you for your business.</p>
                </div>

                <script>
                    window.print();
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    window.deleteInvoice = function(index){
        if(confirm("Delete this invoice?")){
            invoices.splice(index, 1);
            localStorage.setItem("erpInvoices", JSON.stringify(invoices));
            renderInvoices();
        }
    };

    searchInvoice.addEventListener("input", () => {
        const keyword = searchInvoice.value.toLowerCase();

        const filtered = invoices.filter(inv =>
            String(inv.invoiceNo).toLowerCase().includes(keyword) ||
            String(inv.date).toLowerCase().includes(keyword) ||
            String(inv.customerName).toLowerCase().includes(keyword) ||
            String(inv.productName).toLowerCase().includes(keyword) ||
            String(inv.phone).toLowerCase().includes(keyword)
        );

        renderInvoices(filtered);
    });

    printAll.addEventListener("click", () => {
        window.print();
    });

    backSales.addEventListener("click", () => {
        window.location.href = "../sales.html";
    });

    renderInvoices();

});
