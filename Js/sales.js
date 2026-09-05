let lastCreatedBill = null;

window.addSalesItemRow = function(itemData = null) {
    const container = document.getElementById('sales-items-container');
    const rowId = 'sale_row_' + Date.now() + '_' + Math.floor(Math.random()*1000);

    let prodOptions = '';
    let availableProds = Object.keys(productsMap);

    availableProds.forEach(p => {
        const sel = (itemData && itemData.item === p) ? 'selected' : '';
        prodOptions += `<option value="${p}" ${sel}>${p}</option>`;
    });

    const div = document.createElement('div');
    div.className = 'card sales-item-row';
    div.id = rowId;
    div.style.padding = '10px';
    div.style.marginBottom = '10px';

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <select class="s-prod-select" onchange="onSalesRowItemChange('${rowId}')" style="width:45%;">${prodOptions}</select>
            <select class="s-size-select" onchange="updateLiveTotal()" style="width:30%;"></select>
            <span class="s-stock-indicator" style="font-size:0.75rem; font-weight:bold; color:#0288d1; width:20%;">ඉතිරි: 0</span>
            <span class="delete-btn" onclick="document.getElementById('${rowId}').remove(); updateLiveTotal();">✖</span>
        </div>
        <div class="form-group-row">
            <div class="form-group" style="flex:1;">
                <label>දැමූ Qty:</label>
                <input type="number" class="s-qty" min="0" value="${itemData ? itemData.qty : 0}" oninput="validateRowQty('${rowId}')">
            </div>
            <div class="form-group" style="flex:1;">
                <label>Return Qty:</label>
                <input type="number" class="s-ret" min="0" value="${itemData ? itemData.retQty : 0}" oninput="updateLiveTotal()">
            </div>
            <div class="form-group" style="flex:1;">
                <label>Free Qty:</label>
                <input type="number" class="s-free" min="0" value="${itemData ? itemData.freeQty : 0}" oninput="updateLiveTotal()">
            </div>
        </div>
        <div style="text-align:right; font-size:0.85rem; font-weight:bold; color:var(--primary-color);" class="s-row-subtotal">එකතුව: රු. 0.00 (@ 0.00)</div>
    `;

    container.appendChild(div);
    onSalesRowItemChange(rowId, itemData ? itemData.size : null);
};

window.onSalesRowItemChange = function(rowId, selectedSize = null) {
    const row = document.getElementById(rowId);
    if(!row) return;
    const sizeSelect = row.querySelector('.s-size-select');
    sizeSelect.innerHTML = '';

    const sizes = ['Small', 'Medium', 'Large'];
    sizes.forEach(sz => {
        const isSel = (selectedSize === sz);
        sizeSelect.add(new Option(sz, sz, isSel, isSel));
    });

    updateLiveTotal();
};

window.validateRowQty = function(rowId) {
    const row = document.getElementById(rowId);
    if(!row) return;
    const prod = row.querySelector('.s-prod-select').value;
    const size = row.querySelector('.s-size-select').value;
    const currentStock = calculateCurrentStock();
    const availableQty = (currentStock[prod] && currentStock[prod][size] !== undefined) ? currentStock[prod][size] : 0;
    
    // 5. ඉතිරි 0 නම් ප්‍රමාණය සටහන් වීමට ඉඩ නොදීම
    const qtyInput = row.querySelector('.s-qty');
    const enteredQty = parseInt(qtyInput.value) || 0;
    if (availableQty <= 0 && enteredQty > 0) {
        alert(`⚠️ '${prod} (${size})' තොගයේ ඉතිරි ප්‍රමාණය 0 කි!`);
        qtyInput.value = '0';
    }
    updateLiveTotal();
};

document.getElementById('shop-select').addEventListener('change', () => {
    updateLiveTotal();
});

function getItemPrice(shopName, prodName, size) {
    const shopObj = shopDirectory.find(s => s.name === shopName);
    if (shopObj && shopObj.specials && shopObj.specials[prodName] && shopObj.specials[prodName].prices && shopObj.specials[prodName].prices[size]) {
        return shopObj.specials[prodName].prices[size];
    }
    if (productsMap[prodName] && productsMap[prodName].prices && productsMap[prodName].prices[size]) {
        return productsMap[prodName].prices[size];
    }
    return 0;
}

window.updateLiveTotal = function() {
    const shopName = document.getElementById('shop-select').value;
    let grandTotal = 0;
    const currentStock = calculateCurrentStock();

    document.querySelectorAll('.sales-item-row').forEach(row => {
        const prod = row.querySelector('.s-prod-select').value;
        const size = row.querySelector('.s-size-select').value;
        const qty = parseInt(row.querySelector('.s-qty').value) || 0;
        const ret = parseInt(row.querySelector('.s-ret').value) || 0;
        const free = parseInt(row.querySelector('.s-free').value) || 0;

        const availableQty = (currentStock[prod] && currentStock[prod][size] !== undefined) ? currentStock[prod][size] : 0;
        const stockIndicator = row.querySelector('.s-stock-indicator');
        if(stockIndicator) stockIndicator.textContent = `ඉතිරි: ${availableQty}`;

        const unitPrice = getItemPrice(shopName, prod, size);
        const netQty = Math.max(0, qty - ret - free);
        const rowTotal = netQty * unitPrice;

        row.querySelector('.s-row-subtotal').textContent = `එකතුව: රු. ${rowTotal.toFixed(2)} (@ ${unitPrice.toFixed(2)})`;
        grandTotal += rowTotal;
    });

    document.getElementById('total-price-display').textContent = `රු. ${grandTotal.toFixed(2)}`;
};

// SUBMIT SALES
document.getElementById('sales-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('sales-date').value;
    // 5. Button එක click කරන මොහොතේ current live time එක ලබා ගැනීම
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const shop = document.getElementById('shop-select').value;
    const batchNo = document.getElementById('sales-batch-no').value;
    const note = document.getElementById('sales-note').value;
    const payment = document.querySelector('input[name="payment-method"]:checked').value;
    const editId = document.getElementById('edit-sale-id').value;

    let items = [];
    let grandTotal = 0;
    let hasOutOfStock = false;
    const currentStock = calculateCurrentStock();

    document.querySelectorAll('.sales-item-row').forEach(row => {
        const item = row.querySelector('.s-prod-select').value;
        const size = row.querySelector('.s-size-select').value;
        const qty = parseInt(row.querySelector('.s-qty').value) || 0;
        const retQty = parseInt(row.querySelector('.s-ret').value) || 0;
        const freeQty = parseInt(row.querySelector('.s-free').value) || 0;

        const availableQty = (currentStock[item] && currentStock[item][size] !== undefined) ? currentStock[item][size] : 0;
        
        // 5. ඉතිරි 0 නම් බිල හැදීම නැවැත්වීම
        if (availableQty <= 0 && qty > 0 && !editId) {
            hasOutOfStock = true;
        }

        const unitPrice = getItemPrice(shop, item, size);
        const netQty = Math.max(0, qty - retQty - freeQty);
        const total = netQty * unitPrice;

        items.push({ item, size, qty, retQty, freeQty, unitPrice, total });
        grandTotal += total;
    });

    if (hasOutOfStock) {
        alert("⚠️ තොගයේ ඉතිරි නොමැති (Stock 0) භාණ්ඩ ඇතුළත් කර ඇති බැවින් බිල සෑදිය නොහැක!");
        return;
    }

    const record = { id: editId ? parseInt(editId) : Date.now(), date, time: currentTime, shop, batchNo, note, payment, items, total: grandTotal };

    if (editId) {
        const idx = salesData.findIndex(s => s.id === parseInt(editId));
        if (idx >= 0) salesData[idx] = record;
    } else {
        salesData.push(record);
    }

    lastCreatedBill = record;
    localStorage.setItem('watalappan_sales', JSON.stringify(salesData));

    renderSalesTable();
    renderCreditTable();
    renderStockOverview();
    updateFilteredAnalytics();
    renderLiveBill(lastCreatedBill);
    resetSalesForm();
    alert("✅ අලෙවි සටහන සහ බිල සාර්ථකව සාදන ලදී!");
});

function resetSalesForm() {
    document.getElementById('edit-sale-id').value = '';
    document.getElementById('sales-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('sales-batch-no').value = '';
    document.getElementById('sales-note').value = '';
    document.getElementById('sales-items-container').innerHTML = '';
    document.getElementById('sales-submit-btn').textContent = 'දත්ත ඇතුළත් කර බිල සාදන්න';
    document.getElementById('sales-cancel-btn').classList.add('hidden');
    addSalesItemRow();
    updateLiveTotal();
}

function renderLiveBill(bill) {
    const wrapper = document.getElementById('bill-preview-wrapper');
    const container = document.getElementById('printable-bill');
    wrapper.classList.remove('hidden');

    let itemsHtml = '';
    bill.items.forEach(i => {
        itemsHtml += `<div><b>${i.item} (${i.size})</b>: Qty:${i.qty} | Ret:${i.retQty} | Free:${i.freeQty} = රු. ${i.total.toFixed(2)} (@ ${i.unitPrice.toFixed(2)})</div>`;
    });

    container.innerHTML = `
        <div class="invoice-title">SMART ENTERPRISE ERP INVOICE</div>
        <div style="display:flex; justify-content:space-between;"><span><b>දිනය:</b> ${bill.date}</span> <span><b>වේලාව:</b> ${bill.time || ''}</span></div>
        <div><b>කඩය:</b> ${bill.shop} (${bill.payment})</div>
        <div><b>Batch No:</b> ${bill.batchNo || '-'} | <b>සටහන:</b> ${bill.note || '-'}</div>
        <hr style="border-top:1px dashed #aaa; margin:5px 0;">
        ${itemsHtml}
        <hr style="border-top:1px dashed #aaa; margin:5px 0;">
        <div style="font-size:1.1rem; font-weight:bold; text-align:right; color:#2e7d32;">මුළු එකතුව: රු. ${bill.total.toFixed(2)}</div>
    `;
}

function shareBillWA() {
    if(!lastCreatedBill) return;
    let text = `*SMART ENTERPRISE INVOICE*\nදිනය: ${lastCreatedBill.date} (${lastCreatedBill.time || ''})\nකඩය: ${lastCreatedBill.shop}\n---\n`;
    lastCreatedBill.items.forEach(i => {
        text += `${i.item} (${i.size}) x ${i.qty - i.retQty - i.freeQty} = රු. ${i.total.toFixed(2)}\n`;
    });
    text += `*මුළු මුදල: රු. ${lastCreatedBill.total.toFixed(2)}*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

function shareBillSMS() {
    if(!lastCreatedBill) return;
    let text = `SMART ERP BILL: ${lastCreatedBill.shop} | Date: ${lastCreatedBill.date} ${lastCreatedBill.time || ''} | Total: Rs. ${lastCreatedBill.total.toFixed(2)}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`);
}

function downloadBillPDF() {
    window.print();
}

function printBillDirect() {
    window.print();
}

// EDIT SALES
window.editSale = function(id) {
    const sale = salesData.find(s => s.id === id);
    if(!sale) return;
    document.getElementById('edit-sale-id').value = sale.id;
    document.getElementById('sales-date').value = sale.date;
    document.getElementById('shop-select').value = sale.shop;
    document.getElementById('sales-batch-no').value = sale.batchNo || '';
    document.getElementById('sales-note').value = sale.note || '';

    const container = document.getElementById('sales-items-container');
    container.innerHTML = '';
    sale.items.forEach(it => {
        addSalesItemRow(it);
    });

    document.getElementById('sales-submit-btn').textContent = 'වෙනස්කම් සුරකින්න';
    document.getElementById('sales-cancel-btn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSale = function(id) {
    if(confirm("මෙම සටහන ඉවත් කිරීමට අවශ්‍යද?")) {
        salesData = salesData.filter(s => s.id !== id);
        localStorage.setItem('watalappan_sales', JSON.stringify(salesData));
        renderSalesTable();
        renderCreditTable();
        renderStockOverview();
        updateFilteredAnalytics();
    }
};

function renderSalesTable() {
    const tbody = document.getElementById('sales-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    salesData.slice().reverse().forEach(s => {
        let summary = s.items.map(i => `${i.item}(${i.size}):${i.qty}`).join(', ');
        let totalRet = s.items.reduce((sum, i) => sum + (i.retQty || 0), 0);
        let totalFree = s.items.reduce((sum, i) => sum + (i.freeQty || 0), 0);

        tbody.innerHTML += `
            <tr>
                <td>${s.date}</td>
                <td>${s.time || '-'}</td>
                <td>${s.shop}</td>
                <td><small>${summary}</small></td>
                <td>${totalRet}</td>
                <td>${totalFree}</td>
                <td>රු. ${s.total.toFixed(2)}</td>
                <td>
                    <span class="edit-btn" onclick="editSale(${s.id})">✏️</span>
                    <span class="delete-btn" onclick="deleteSale(${s.id})">❌</span>
                </td>
            </tr>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('sales-date').value = new Date().toISOString().split('T')[0];
    addSalesItemRow();
    renderSalesTable();
});