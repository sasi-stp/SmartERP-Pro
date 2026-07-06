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
    function renderProduction(list = production) {

        productionTable.innerHTML = "";

        if (list.length === 0) {

            productionTable.innerHTML = `
                <tr>
                    <td colspan="9">No production batches found</td>
                </tr>
            `;

            updateSummary(list);
            return;
        }

        list.forEach((batch, index) => {

            productionTable.innerHTML += `
                <tr>

                    <td>${batch.batchNo}</td>

                    <td>${batch.productionDate}</td>

                    <td>${batch.productName}</td>

                    <td>${batch.plannedQty}</td>

                    <td>${batch.actualQty}</td>

                    <td>${batch.expiryDate || "-"}</td>

                    <td>${money(batch.batchCost)}</td>

                    <td>${money(batch.costPerUnit)}</td>

                    <td>

                        <button class="editBtn"
                            onclick="editBatch(${index})">

                            Edit

                        </button>

                        <button class="deleteBtn"
                            onclick="deleteBatch(${index})">

                            Delete

                        </button>

                    </td>

                </tr>
            `;

        });

        updateSummary(list);

    }

    // ==========================================
    // Auto Cost Calculation
    // ==========================================

    materialCost.addEventListener("input", calculateCosts);
    labourCost.addEventListener("input", calculateCosts);
    packagingCost.addEventListener("input", calculateCosts);
    otherCost.addEventListener("input", calculateCosts);
    actualQty.addEventListener("input", calculateCosts);

    // ==========================================
    // Save / Update Batch
    // ==========================================

    saveBatch.addEventListener("click", () => {

        if (plannedQty.value === "") {
            alert("Please enter planned quantity");
            plannedQty.focus();
            return;
        }

        if (actualQty.value === "") {
            alert("Please enter actual quantity");
            actualQty.focus();
            return;
        }

        const batchData = {

            batchNo: batchNo.value,

            productionDate: productionDate.value,

            productName: productName.value,

            plannedQty: Number(plannedQty.value) || 0,

            actualQty: Number(actualQty.value) || 0,

            expiryDate: expiryDate.value,

            materialCost: Number(materialCost.value) || 0,

            labourCost: Number(labourCost.value) || 0,

            packagingCost: Number(packagingCost.value) || 0,

            otherCost: Number(otherCost.value) || 0,

            batchCost: Number(batchCost.value) || 0,

            costPerUnit: Number(costPerUnit.value) || 0,

            notes: notes.value.trim(),

            createdAt: new Date().toLocaleString()

        };

        if (editIndex.value === "") {

            production.push(batchData);

            alert("Production batch saved successfully!");

        } else {

            production[Number(editIndex.value)] = batchData;

            alert("Production batch updated successfully!");

        }

        saveProduction();

        renderProduction();

        resetForm();

    });
