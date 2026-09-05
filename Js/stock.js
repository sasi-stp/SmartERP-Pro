function calculateCurrentStock() {
    let stock = {};
    Object.keys(productsMap).forEach(p => {
        stock[p] = { Small: 0, Medium: 0, Large: 0 };
    });

    stockHistory.forEach(h => {
        if(stock[h.item]) {
            stock[h.item].Small += (h.qty ? (parseInt(h.qty.Small) || 0) : 0);
            stock[h.item].Medium += (h.qty ? (parseInt(h.qty.Medium) || 0) : 0);
            stock[h.item].Large += (h.qty ? (parseInt(h.qty.Large) || 0) : 0);

            if(h.sample) {
                stock[h.item].Small -= (parseInt(h.sample.Small) || 0);
                stock[h.item].Medium -= (parseInt(h.sample.Medium) || 0);
                stock[h.item].Large -= (parseInt(h.sample.Large) || 0);
            }
        }
    });

    salesData.forEach(s => {
        if (s.items && Array.isArray(s.items)) {
            s.items.forEach(i => {
                if(stock[i.item] && stock[i.item][i.size] !== undefined) {
                    stock[i.item][i.size] -= ((parseInt(i.qty) || 0) - (parseInt(i.retQty) || 0));
                }
            });
        }
    });

    let returnDamageList = JSON.parse(localStorage.getItem('watalappan_return_damage')) || [];
    returnDamageList.forEach(rd => {
        if(stock[rd.product] && rd.qty) {
            if(rd.type === 'Damage') {
                stock[rd.product].Small -= (parseInt(rd.qty.Small) || 0);
                stock[rd.product].Medium -= (parseInt(rd.qty.Medium) || 0);
                stock[rd.product].Large -= (parseInt(rd.qty.Large) || 0);
            }
        }
    });

    return stock;
}

window.onStockItemSelectChange = function() {
    const item = document.getElementById('stock-item-select') ? document.getElementById('stock-item-select').value : '';
    const dateInput = document.getElementById('stock-date') ? document.getElementById('stock-date').value : new Date().toISOString().split('T')[0];
    
    if (document.getElementById('stock-qty-s')) document.getElementById('stock-qty-s').value = '0';
    if (document.getElementById('stock-qty-m')) document.getElementById('stock-qty-m').value = '0';
    if (document.getElementById('stock-qty-l')) document.getElementById('stock-qty-l').value = '0';
    if (document.getElementById('stock-cost')) document.getElementById('stock-cost').value = '0';
    if (document.getElementById('stock-dmg-qty')) document.getElementById('stock-dmg-qty').value = '0';
    if (document.getElementById('stock-sample-s')) document.getElementById('stock-sample-s').value = '0';
    if (document.getElementById('stock-sample-m')) document.getElementById('stock-sample-m').value = '0';
    if (document.getElementById('stock-sample-l')) document.getElementById('stock-sample-l').value = '0';

    if (productsMap[item] && productsMap[item].expiry && document.getElementById('stock-exp-date')) {
        let d = new Date(dateInput);
        d.setDate(d.getDate() + parseInt(productsMap[item].expiry));
        document.getElementById('stock-exp-date').value = d.toISOString().split('T')[0];
    }
};

document.getElementById('stock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('stock-date').value;
    const batchNo = document.getElementById('stock-batch-no') ? document.getElementById('stock-batch-no').value : '-';
    const item = document.getElementById('stock-item-select').value;
    const expDate = document.getElementById('stock-exp-date') ? document.getElementById('stock-exp-date').value : '-';
    const s = parseInt(document.getElementById('stock-qty-s').value) || 0;
    const m = parseInt(document.getElementById('stock-qty-m').value) || 0;
    const l = parseInt(document.getElementById('stock-qty-l').value) || 0;
    const cost = document.getElementById('stock-cost') ? (parseFloat(document.getElementById('stock-cost').value) || 0) : 0;
    const dmg = document.getElementById('stock-dmg-qty') ? (parseInt(document.getElementById('stock-dmg-qty').value) || 0) : 0;
    const sampleS = document.getElementById('stock-sample-s') ? (parseInt(document.getElementById('stock-sample-s').value) || 0) : 0;
    const sampleM = document.getElementById('stock-sample-m') ? (parseInt(document.getElementById('stock-sample-m').value) || 0) : 0;
    const sampleL = document.getElementById('stock-sample-l') ? (parseInt(document.getElementById('stock-sample-l').value) || 0) : 0;
    const editId = document.getElementById('edit-stock-id').value;

    const record = { 
        id: editId ? parseInt(editId) : Date.now(), 
        date, 
        batchNo, 
        item, 
        expDate, 
        qty: { Small: s, Medium: m, Large: l },
        cost,
        dmgQty: dmg,
        sample: { Small: sampleS, Medium: sampleM, Large: sampleL }
    };

    if(editId) {
        const idx = stockHistory.findIndex(st => st.id === parseInt(editId));
        if(idx >= 0) stockHistory[idx] = record;
    } else {
        stockHistory.push(record);
    }

    localStorage.setItem('watalappan_stock_history', JSON.stringify(stockHistory));
    renderStockOverview();
    renderStockHistory();
    if (typeof renderExpiryAlerts === 'function') renderExpiryAlerts();
    resetStockForm();
    alert(`✅ '${item}' තොගය සාර්ථකව ඇතුළත් විය!`);
});

function resetStockForm() {
    document.getElementById('edit-stock-id').value = '';
    document.getElementById('stock-date').value = new Date().toISOString().split('T')[0];
    if (document.getElementById('stock-batch-no')) document.getElementById('stock-batch-no').value = '';
    document.getElementById('stock-qty-s').value = '0';
    document.getElementById('stock-qty-m').value = '0';
    document.getElementById('stock-qty-l').value = '0';
    if (document.getElementById('stock-cost')) document.getElementById('stock-cost').value = '0';
    if (document.getElementById('stock-dmg-qty')) document.getElementById('stock-dmg-qty').value = '0';
    if (document.getElementById('stock-sample-s')) document.getElementById('stock-sample-s').value = '0';
    if (document.getElementById('stock-sample-m')) document.getElementById('stock-sample-m').value = '0';
    if (document.getElementById('stock-sample-l')) document.getElementById('stock-sample-l').value = '0';
    document.getElementById('stock-submit-btn').textContent = 'තොගය එකතු කරන්න';
    document.getElementById('stock-cancel-btn').classList.add('hidden');
    onStockItemSelectChange();
}

function renderStockOverview() {
    const tbody = document.getElementById('stock-overview-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    const stock = calculateCurrentStock();

    Object.keys(stock).forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><b>${p}</b></td>
                <td>${stock[p].Small}</td>
                <td>${stock[p].Medium}</td>
                <td>${stock[p].Large}</td>
            </tr>`;
    });
}

function renderStockHistory() {
    const tbody = document.getElementById('stock-history-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    stockHistory.slice().reverse().forEach(h => {
        const s = (h.qty && h.qty.Small !== undefined) ? h.qty.Small : 0;
        const m = (h.qty && h.qty.Medium !== undefined) ? h.qty.Medium : 0;
        const l = (h.qty && h.qty.Large !== undefined) ? h.qty.Large : 0;
        tbody.innerHTML += `
            <tr>
                <td>${h.date}</td>
                <td>${h.batchNo || '-'}</td>
                <td>${h.item}</td>
                <td>${h.expDate || '-'}</td>
                <td>S:${s} | M:${m} | L:${l}</td>
                <td>
                    <span class="edit-btn" onclick="editStock(${h.id})">✏️</span>
                    <span class="delete-btn" onclick="deleteStock(${h.id})">❌</span>
                </td>
            </tr>`;
    });
}

window.editStock = function(id) {
    const h = stockHistory.find(s => s.id === id);
    if(!h) return;
    document.getElementById('edit-stock-id').value = h.id;
    document.getElementById('stock-date').value = h.date;
    if (document.getElementById('stock-batch-no')) document.getElementById('stock-batch-no').value = h.batchNo || '';
    document.getElementById('stock-item-select').value = h.item;
    if (document.getElementById('stock-exp-date')) document.getElementById('stock-exp-date').value = h.expDate || '';
    document.getElementById('stock-qty-s').value = (h.qty && h.qty.Small !== undefined) ? h.qty.Small : 0;
    document.getElementById('stock-qty-m').value = (h.qty && h.qty.Medium !== undefined) ? h.qty.Medium : 0;
    document.getElementById('stock-qty-l').value = (h.qty && h.qty.Large !== undefined) ? h.qty.Large : 0;
    if (document.getElementById('stock-cost')) document.getElementById('stock-cost').value = h.cost || 0;
    if (document.getElementById('stock-dmg-qty')) document.getElementById('stock-dmg-qty').value = h.dmgQty || 0;
    if (document.getElementById('stock-sample-s')) document.getElementById('stock-sample-s').value = h.sample ? h.sample.Small : 0;
    if (document.getElementById('stock-sample-m')) document.getElementById('stock-sample-m').value = h.sample ? h.sample.Medium : 0;
    if (document.getElementById('stock-sample-l')) document.getElementById('stock-sample-l').value = h.sample ? h.sample.Large : 0;

    document.getElementById('stock-submit-btn').textContent = 'වෙනස්කම් සුරකින්න';
    document.getElementById('stock-cancel-btn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteStock = function(id) {
    if(confirm("මෙම සටහන ඉවත් කිරීමට අවශ්‍යද?")) {
        stockHistory = stockHistory.filter(s => s.id !== id);
        localStorage.setItem('watalappan_stock_history', JSON.stringify(stockHistory));
        renderStockOverview();
        renderStockHistory();
        if (typeof renderExpiryAlerts === 'function') renderExpiryAlerts();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('stock-date').value = new Date().toISOString().split('T')[0];
    renderStockOverview();
    renderStockHistory();
    onStockItemSelectChange();
});