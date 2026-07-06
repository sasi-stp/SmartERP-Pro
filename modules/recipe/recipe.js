/* ==========================================
   Smart ERP Pro
   Recipe Management JS v1.0
   Part 1
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const editIndex = document.getElementById("editIndex");

    const recipeName = document.getElementById("recipeName");
    const productName = document.getElementById("productName");
    const batchSize = document.getElementById("batchSize");

    const materialCost = document.getElementById("materialCost");
    const labourCost = document.getElementById("labourCost");
    const packagingCost = document.getElementById("packagingCost");
    const otherCost = document.getElementById("otherCost");

    const recipeCost = document.getElementById("recipeCost");
    const costPerCup = document.getElementById("costPerCup");

    const notes = document.getElementById("notes");

    const saveRecipe = document.getElementById("saveRecipe");
    const clearForm = document.getElementById("clearForm");
    const printRecipe = document.getElementById("printRecipe");
    const backDashboard = document.getElementById("backDashboard");

    const recipeTable = document.getElementById("recipeTable");
    const searchRecipe = document.getElementById("searchRecipe");

    const totalRecipes = document.getElementById("totalRecipes");
    const totalProducts = document.getElementById("totalProducts");
    const averageCost = document.getElementById("averageCost");
    const averageCupCost = document.getElementById("averageCupCost");

    let recipes = JSON.parse(localStorage.getItem("erpRecipes")) || [];

    function saveRecipes() {
        localStorage.setItem("erpRecipes", JSON.stringify(recipes));
    }

    function money(value) {
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function calculateCost() {

        const m = Number(materialCost.value) || 0;
        const l = Number(labourCost.value) || 0;
        const p = Number(packagingCost.value) || 0;
        const o = Number(otherCost.value) || 0;

        const total = m + l + p + o;

        recipeCost.value = total.toFixed(2);

        const cups = Number(batchSize.value) || 0;

        if(cups > 0){
            costPerCup.value = (total / cups).toFixed(2);
        }else{
            costPerCup.value = "0.00";
        }

    }

    function updateSummary(list = recipes){

        totalRecipes.textContent = list.length;

        const uniqueProducts = [...new Set(list.map(r => r.productName))];

        totalProducts.textContent = uniqueProducts.length;

        const totalRecipeCost = list.reduce((sum,r)=>sum + Number(r.recipeCost || 0),0);

        averageCost.textContent =
            money(list.length ? totalRecipeCost / list.length : 0);

        const totalCupCost = list.reduce((sum,r)=>sum + Number(r.costPerCup || 0),0);

        averageCupCost.textContent =
            money(list.length ? totalCupCost / list.length : 0);

    }

    materialCost.addEventListener("input",calculateCost);
    labourCost.addEventListener("input",calculateCost);
    packagingCost.addEventListener("input",calculateCost);
    otherCost.addEventListener("input",calculateCost);
    batchSize.addEventListener("input",calculateCost);
