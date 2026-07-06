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
    // ==========================================
    // Render Recipe Table
    // ==========================================

    function renderRecipes(list = recipes){

        recipeTable.innerHTML = "";

        if(list.length === 0){

            recipeTable.innerHTML = `
                <tr>
                    <td colspan="6">No recipes found</td>
                </tr>
            `;

            updateSummary(list);
            return;

        }

        list.forEach((recipe,index)=>{

            recipeTable.innerHTML += `

                <tr>

                    <td>${recipe.recipeName}</td>

                    <td>${recipe.productName}</td>

                    <td>${recipe.batchSize}</td>

                    <td>${money(recipe.recipeCost)}</td>

                    <td>${money(recipe.costPerCup)}</td>

                    <td>

                        <button
                            class="editBtn"
                            onclick="editRecipe(${index})">

                            Edit

                        </button>

                        <button
                            class="deleteBtn"
                            onclick="deleteRecipe(${index})">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

        updateSummary(list);

    }

    // ==========================================
    // Save Recipe
    // ==========================================

    saveRecipe.addEventListener("click",()=>{

        if(recipeName.value.trim()===""){
            alert("Please enter recipe name");
            recipeName.focus();
            return;
        }

        if(batchSize.value===""){
            alert("Please enter batch size");
            batchSize.focus();
            return;
        }

        const recipeData={

            recipeName:recipeName.value.trim(),

            productName:productName.value,

            batchSize:Number(batchSize.value)||0,

            materialCost:Number(materialCost.value)||0,

            labourCost:Number(labourCost.value)||0,

            packagingCost:Number(packagingCost.value)||0,

            otherCost:Number(otherCost.value)||0,

            recipeCost:Number(recipeCost.value)||0,

            costPerCup:Number(costPerCup.value)||0,

            notes:notes.value.trim(),

            createdAt:new Date().toLocaleString()

        };

        if(editIndex.value===""){

            recipes.push(recipeData);

            alert("Recipe saved successfully!");

        }else{

            recipes[Number(editIndex.value)] = recipeData;

            alert("Recipe updated successfully!");

        }

        saveRecipes();

        renderRecipes();

        resetForm();

    });
       // ==========================================
    // Edit Recipe
    // ==========================================

    window.editRecipe = function(index){

        const recipe = recipes[index];

        editIndex.value = index;

        recipeName.value = recipe.recipeName;
        productName.value = recipe.productName;
        batchSize.value = recipe.batchSize;

        materialCost.value = recipe.materialCost;
        labourCost.value = recipe.labourCost;
        packagingCost.value = recipe.packagingCost;
        otherCost.value = recipe.otherCost;

        recipeCost.value = Number(recipe.recipeCost).toFixed(2);
        costPerCup.value = Number(recipe.costPerCup).toFixed(2);

        notes.value = recipe.notes;

        saveRecipe.textContent = "Update Recipe";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

    // ==========================================
    // Delete Recipe
    // ==========================================

    window.deleteRecipe = function(index){

        if(confirm("Delete this recipe?")){

            recipes.splice(index,1);

            saveRecipes();

            renderRecipes();

            resetForm();

        }

    };

    // ==========================================
    // Search Recipe
    // ==========================================

    searchRecipe.addEventListener("input",()=>{

        const keyword = searchRecipe.value.toLowerCase();

        const filtered = recipes.filter(recipe =>
            String(recipe.recipeName).toLowerCase().includes(keyword) ||
            String(recipe.productName).toLowerCase().includes(keyword) ||
            String(recipe.batchSize).toLowerCase().includes(keyword)
        );

        renderRecipes(filtered);

    });
