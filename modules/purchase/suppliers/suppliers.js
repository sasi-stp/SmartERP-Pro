/* ==========================================
   Smart ERP Pro
   Supplier Management JS v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const editIndex = document.getElementById("editIndex");

    const supplierName = document.getElementById("supplierName");
    const companyName = document.getElementById("companyName");
    const phone = document.getElementById("phone");
    const whatsapp = document.getElementById("whatsapp");
    const email = document.getElementById("email");
    const address = document.getElementById("address");
    const city = document.getElementById("city");
    const paymentTerms = document.getElementById("paymentTerms");
    const openingBalance = document.getElementById("openingBalance");
    const notes = document.getElementById("notes");

    const saveSupplier = document.getElementById("saveSupplier");
    const clearForm = document.getElementById("clearForm");
    const backDashboard = document.getElementById("backDashboard");
    const searchSupplier = document.getElementById("searchSupplier");

    const supplierTable = document.getElementById("supplierTable");
    const totalSuppliers = document.getElementById("totalSuppliers");
    const totalOpeningBalance = document.getElementById("totalOpeningBalance");

    let suppliers = JSON.parse(localStorage.getItem("erpSuppliers")) || [];

    function money(value){
        return "Rs. " + (Number(value) || 0).toFixed(2);
    }

    function saveSuppliers(){
        localStorage.setItem("erpSuppliers", JSON.stringify(suppliers));
    }

    function updateSummary(list = suppliers){
        totalSuppliers.textContent = list.length;

        const balance = list.reduce((sum, supplier) => {
            return sum + (Number(supplier.openingBalance) || 0);
        }, 0);

        totalOpeningBalance.textContent = money(balance);
    }

    function renderSuppliers(list = suppliers){
        supplierTable.innerHTML = "";

        if(list.length === 0){
            supplierTable.innerHTML = `
                <tr>
                    <td colspan="7">No suppliers found</td>
                </tr>
            `;
            updateSummary(list);
            return;
        }

        list.forEach((supplier, index) => {
            supplierTable.innerHTML += `
                <tr>
                    <td>${supplier.supplierName}</td>
                    <td>${supplier.companyName || "-"}</td>
                    <td>${supplier.phone}</td>
                    <td>${supplier.city || "-"}</td>
                    <td>${supplier.paymentTerms}</td>
                    <td>${money(supplier.openingBalance)}</td>
                    <td>
                        <button class="editBtn" onclick="editSupplier(${index})">Edit</button>
                        <button class="deleteBtn" onclick="deleteSupplier(${index})">Delete</button>
                    </td>
                </tr>
            `;
        });

        updateSummary(list);
    }

    function resetForm(){
        editIndex.value = "";
        supplierName.value = "";
        companyName.value = "";
        phone.value = "";
        whatsapp.value = "";
        email.value = "";
        address.value = "";
        city.value = "";
        paymentTerms.value = "Cash";
        openingBalance.value = "";
        notes.value = "";
        saveSupplier.textContent = "Save Supplier";
    }

    saveSupplier.addEventListener("click", () => {

        if(supplierName.value.trim() === ""){
            alert("Please enter supplier name");
            supplierName.focus();
            return;
        }

        if(phone.value.trim() === ""){
            alert("Please enter phone number");
            phone.focus();
            return;
        }

        const supplierData = {
            supplierName: supplierName.value.trim(),
            companyName: companyName.value.trim(),
            phone: phone.value.trim(),
            whatsapp: whatsapp.value.trim(),
            email: email.value.trim(),
            address: address.value.trim(),
            city: city.value.trim(),
            paymentTerms: paymentTerms.value,
            openingBalance: Number(openingBalance.value) || 0,
            notes: notes.value.trim(),
            createdAt: new Date().toLocaleString()
        };

        const currentEditIndex = editIndex.value === "" ? -1 : Number(editIndex.value);

        const duplicatePhone = suppliers.find((supplier, index) =>
            supplier.phone === supplierData.phone && index !== currentEditIndex
        );

        if(duplicatePhone){
            alert("This supplier phone number already exists");
            return;
        }

        if(editIndex.value === ""){
            suppliers.push(supplierData);
            alert("Supplier saved successfully!");
        }else{
            suppliers[Number(editIndex.value)] = supplierData;
            alert("Supplier updated successfully!");
        }

        saveSuppliers();
        renderSuppliers();
        resetForm();
    });

    window.editSupplier = function(index){
        const supplier = suppliers[index];

        editIndex.value = index;
        supplierName.value = supplier.supplierName;
        companyName.value = supplier.companyName;
        phone.value = supplier.phone;
        whatsapp.value = supplier.whatsapp;
        email.value = supplier.email;
        address.value = supplier.address;
        city.value = supplier.city;
        paymentTerms.value = supplier.paymentTerms;
        openingBalance.value = supplier.openingBalance;
        notes.value = supplier.notes;

        saveSupplier.textContent = "Update Supplier";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    window.deleteSupplier = function(index){
        if(confirm("Delete this supplier?")){
            suppliers.splice(index, 1);
            saveSuppliers();
            renderSuppliers();
            resetForm();
        }
    };

    searchSupplier.addEventListener("input", () => {
        const keyword = searchSupplier.value.toLowerCase();

        const filtered = suppliers.filter(supplier =>
            String(supplier.supplierName).toLowerCase().includes(keyword) ||
            String(supplier.companyName).toLowerCase().includes(keyword) ||
            String(supplier.phone).toLowerCase().includes(keyword) ||
            String(supplier.city).toLowerCase().includes(keyword) ||
            String(supplier.paymentTerms).toLowerCase().includes(keyword)
        );

        renderSuppliers(filtered);
    });

    clearForm.addEventListener("click", () => {
        if(confirm("Clear all fields?")){
            resetForm();
        }
    });

    backDashboard.addEventListener("click", () => {
        window.location.href = "../../../dashboard.html";
    });

    renderSuppliers();

});
