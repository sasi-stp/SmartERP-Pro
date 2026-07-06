/* ==========================================
   Smart ERP Pro
   Production Module JS v1.0
   Part 1 - Variables + Init + Summary
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const editIndex = document.getElementById("editIndex");

    const batchNo = document.getElementById("batchNo");
    const productionDate = document.getElementById("productionDate");
    const productName = document.getElementById("productName");
    const plannedQty = document.getElementById("plannedQty");
    const actualQty = document.getElementById("actualQty");
    const expiryDate = document.getElementById("expiryDate");

    const labourCost = document.getElementById("labourCost");
    const packagingCost = document.getElementById("packagingCost");
    const otherCost = document.getElementById("otherCost");
    const materialCost = document.getElementById("materialCost");

    const batchCost = document.getElementById("batchCost");
    const costPerUnit = document.getElementById("costPerUnit");
    const notes = document.getElementById("notes");

    const saveBatch = document.getElementById("saveBatch");
    const clearForm = document.getElementById("clearForm");
    const printProduction = document.getElementById("printProduction");
    const backDashboard = document.getElementById("backDashboard");

    const productionTable = document.getElementById("productionTable");
    const searchBatch = document.getElementById("searchBatch");

    const totalBatches = document.getElementById("totalBatches");
    const todayProduction = document.getElementById("todayProduction");
    const totalCost = document.getElementById("totalCost");
    const avgCost = document.getElementById("avgCost");

    let production = JSON.parse(localStorage.getItem("erpProduction")) || [];

    function saveProduction() {
        localStorage.setItem("erpProduction", JSON.stringify(production));
    }

    function money(value) {
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function generateBatchNo() {
        return "BAT-" + String(production.length + 1).padStart(5, "0");
    }

    function calculateCosts() {
        const m = Number(materialCost.value) || 0;
        const l = Number(labourCost.value) || 0;
        const p = Number(packagingCost.value) || 0;
        const o = Number(otherCost.value) || 0;

        const total = m + l + p + o;
        const qty = Number(actualQty.value) || 0;

        batchCost.value = total.toFixed(2);
        costPerUnit.value = qty > 0 ? (total / qty).toFixed(2) : "0.00";
    }

    function updateSummary(list = production) {
        const today = new Date().toISOString().split("T")[0];

        const totalBatchCount = list.length;

        const todayQty = list
            .filter(batch => batch.productionDate === today)
            .reduce((sum, batch) => sum + (Number(batch.actualQty) || 0), 0);

        const costTotal = list.reduce((sum, batch) => {
            return sum + (Number(batch.batchCost) || 0);
        }, 0);

        const qtyTotal = list.reduce((sum, batch) => {
            return sum + (Number(batch.actualQty) || 0);
        }, 0);

        totalBatches.textContent = totalBatchCount;
        todayProduction.textContent = todayQty;
        totalCost.textContent = money(costTotal);
        avgCost.textContent = qtyTotal > 0 ? money(costTotal / qtyTotal) : money(0);
    }
