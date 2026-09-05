function renderMonthlyPnL() {
    const container = document.getElementById('pnl-report-container');
    if(!container) return;
    let totalSales = salesData.reduce((sum, s) => sum + s.total, 0);
    let totalExp = expenses.reduce((sum, ex) => sum + ex.amount, 0);
    let net = totalSales - totalExp;

    container.innerHTML = `
        <table style="margin-top:10px;">
            <tr><th>මුළු විකුණුම් ආදායම:</th><td>රු. ${totalSales.toFixed(2)}</td></tr>
            <tr><th>මුළු වියදම්:</th><td>රු. ${totalExp.toFixed(2)}</td></tr>
            <tr style="background:#e8f5e9;"><th>ශුද්ධ ලාභය (Net Profit):</th><td style="font-weight:bold; color:green;">රු. ${net.toFixed(2)}</td></tr>
        </table>
    `;
}

// 6. කඩවල් සහ ලාභ විශ්ලේෂණය (Filter අනුව නිවැරදි දත්ත ලබා දීම)
function updateFilteredAnalytics() {
    const selectedShop = document.getElementById('filter-shop-select') ? document.getElementById('filter-shop-select').value : 'ALL';
    const selectedProd = document.getElementById('filter-product-select') ? document.getElementById('filter-product-select').value : 'ALL';
    const timeFrame = document.getElementById('filter-time-select') ? document.getElementById('filter-time-select').value : 'daily';

    const todayStr = new Date().toISOString().split('T')[0];
    const currDate = new Date();

    let soldQty = 0;
    let totalIncome = 0;
    let returnQty = 0;
    let returnLoss = 0;
    let outstandingCredit = 0;

    salesData.forEach(s => {
        // Shop Filter
        if (selectedShop !== 'ALL' && s.shop !== selectedShop) return;

        // Time Filter
        const sDate = new Date(s.date);
        if (timeFrame === 'daily' && s.date !== todayStr) return;
        if (timeFrame === 'weekly') {
            const diffDays = (currDate - sDate) / (1000 * 60 * 60 * 24);
            if (diffDays > 7 || diffDays < 0) return;
        }
        if (timeFrame === 'monthly') {
            if (sDate.getMonth() !== currDate.getMonth() || sDate.getFullYear() !== currDate.getFullYear()) return;
        }
        if (timeFrame === 'yearly') {
            if (sDate.getFullYear() !== currDate.getFullYear()) return;
        }

        // Calculate Items
        s.items.forEach(i => {
            if (selectedProd !== 'ALL' && i.item !== selectedProd) return;
            soldQty += (i.qty || 0);
            returnQty += (i.retQty || 0);
            returnLoss += ((i.retQty || 0) * (i.unitPrice || 0));
            totalIncome += (i.total || 0);
        });

        if (s.payment === 'Credit' && (selectedProd === 'ALL')) {
            outstandingCredit += s.total;
        }
    });

    let totalExp = expenses.reduce((sum, ex) => sum + ex.amount, 0);

    const elSold = document.getElementById('f-sold-qty');
    const elIncome = document.getElementById('f-total-income');
    const elReturn = document.getElementById('f-return-qty');
    const elReturnLoss = document.getElementById('f-return-loss');
    const elCredit = document.getElementById('f-total-outstanding');
    const elNet = document.getElementById('f-net-profit');

    if(elSold) elSold.textContent = soldQty;
    if(elIncome) elIncome.textContent = `රු. ${totalIncome.toFixed(2)}`;
    if(elReturn) elReturn.textContent = returnQty;
    if(elReturnLoss) elReturnLoss.textContent = `අලාභය: රු. ${returnLoss.toFixed(2)}`;
    if(elCredit) elCredit.textContent = `රු. ${outstandingCredit.toFixed(2)}`;
    if(elNet) elNet.textContent = `රු. ${(totalIncome - totalExp).toFixed(2)}`;
}

function renderExpiryAlerts() {
    const tbody = document.getElementById('expiry-alerts-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    const today = new Date();

    stockHistory.forEach(s => {
        if(s.expDate) {
            const exp = new Date(s.expDate);
            const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            
            let color = '#2e7d32'; // Green
            if (diffDays <= 3) color = '#c62828'; // Red
            else if (diffDays <= 7) color = '#ef6c00'; // Orange

            tbody.innerHTML += `
                <tr style="color: ${color}; font-weight: bold;">
                    <td>${s.batchNo || '-'}</td>
                    <td>${s.item}</td>
                    <td>${s.expDate}</td>
                    <td>${diffDays <= 0 ? 'කල් ඉකුත් වී ඇත' : diffDays + ' දින'}</td>
                </tr>
            `;
        }
    });
}

function renderUpcomingOrdersInAnalytics() {
    const container = document.getElementById('analytics-upcoming-orders');
    if(!container) return;
    const orders = JSON.parse(localStorage.getItem('watalappan_orders')) || [];
    const today = new Date().toISOString().split('T')[0];

    const upcoming = orders.filter(o => o.reqDate >= today).sort((a, b) => new Date(a.reqDate) - new Date(b.reqDate));

    if(upcoming.length === 0) {
        container.innerHTML = `<small style="color:gray;">ළඟ එන ඇණවුම් නොමැත.</small>`;
        return;
    }

    let cardsHtml = '';
    upcoming.slice(0, 3).forEach(o => {
        cardsHtml += `
            <div style="background:white; padding:8px; border-radius:6px; margin-top:5px; border-left:4px solid #0288d1; font-size:0.85rem;">
                <b>📅 ${o.reqDate}</b> - ${o.customer} (${o.product}) | Phone: ${o.phone || '-'} | S:${o.qty.Small} M:${o.qty.Medium} L:${o.qty.Large} Tray:${o.qty.Tray}
            </div>`;
    });
    container.innerHTML = cardsHtml;
}

['filter-shop-select', 'filter-product-select', 'filter-time-select'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('change', updateFilteredAnalytics);
});