/* ==========================================
   Smart ERP Pro
   Customer Management JS v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const customerName = document.getElementById("customerName");
    const shopName = document.getElementById("shopName");
    const phone = document.getElementById("phone");
    const whatsapp = document.getElementById("whatsapp");
    const email = document.getElementById("email");
    const address = document.getElementById("address");
    const city = document.getElementById("city");
    const route = document.getElementById("route");
    const creditLimit = document.getElementById("creditLimit");
    const notes = document.getElementById("notes");
    const editIndex = document.getElementById("editIndex");

    const saveCustomer = document.getElementById("saveCustomer");
    const clearForm = document.getElementById("clearForm");
    const searchCustomer = document.getElementById("searchCustomer");
    const customerTable = document.getElementById("customerTable");
    const backSales = document.getElementById("backSales");

    let customers = JSON.parse(localStorage.getItem("erpCustomers")) || [];

    function renderCustomers(list = customers) {
        customerTable.innerHTML = "";

        if (list.length === 0) {
            customerTable.innerHTML = `
                <tr>
                    <td colspan="6">No customers found</td>
                </tr>
            `;
            return;
        }

        list.forEach((customer, index) => {
            customerTable.innerHTML += `
                <tr>
                    <td>${customer.customerName}</td>
                    <td>${customer.shopName}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.city}</td>
                    <td>${customer.route}</td>
                    <td>
                        <button class="editBtn" onclick="editCustomer(${index})">Edit</button>
                        <button class="deleteBtn" onclick="deleteCustomer(${index})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    function saveToLocalStorage() {
        localStorage.setItem("erpCustomers", JSON.stringify(customers));
    }

    function resetForm() {
        editIndex.value = "";
        customerName.value = "";
        shopName.value = "";
        phone.value = "";
        whatsapp.value = "";
        email.value = "";
        address.value = "";
        city.value = "";
        route.value = "";
        creditLimit.value = "";
        notes.value = "";
        saveCustomer.textContent = "Save Customer";
    }

    saveCustomer.addEventListener("click", () => {

        if (customerName.value.trim() === "") {
            alert("Please enter customer name");
            customerName.focus();
            return;
        }

        if (phone.value.trim() === "") {
            alert("Please enter phone number");
            phone.focus();
            return;
        }

        const customerData = {
            customerName: customerName.value.trim(),
            shopName: shopName.value.trim(),
            phone: phone.value.trim(),
            whatsapp: whatsapp.value.trim(),
            email: email.value.trim(),
            address: address.value.trim(),
            city: city.value.trim(),
            route: route.value.trim(),
            creditLimit: Number(creditLimit.value) || 0,
            notes: notes.value.trim(),
            createdAt: new Date().toLocaleString()
        };

        const duplicatePhone = customers.find((c, i) =>
            c.phone === customerData.phone && i !== Number(editIndex.value)
        );

        if (duplicatePhone) {
            alert("This phone number already exists");
            return;
        }

        if (editIndex.value === "") {
            customers.push(customerData);
            alert("Customer saved successfully!");
        } else {
            customers[Number(editIndex.value)] = customerData;
            alert("Customer updated successfully!");
        }

        saveToLocalStorage();
        renderCustomers();
        resetForm();
    });

    window.editCustomer = function(index) {
        const c = customers[index];

        editIndex.value = index;
        customerName.value = c.customerName;
        shopName.value = c.shopName;
        phone.value = c.phone;
        whatsapp.value = c.whatsapp;
        email.value = c.email;
        address.value = c.address;
        city.value = c.city;
        route.value = c.route;
        creditLimit.value = c.creditLimit;
        notes.value = c.notes;

        saveCustomer.textContent = "Update Customer";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    window.deleteCustomer = function(index) {
        if (confirm("Delete this customer?")) {
            customers.splice(index, 1);
            saveToLocalStorage();
            renderCustomers();
            resetForm();
        }
    };

    searchCustomer.addEventListener("input", () => {
        const keyword = searchCustomer.value.toLowerCase();

        const filtered = customers.filter(c =>
            c.customerName.toLowerCase().includes(keyword) ||
            c.shopName.toLowerCase().includes(keyword) ||
            c.phone.toLowerCase().includes(keyword) ||
            c.city.toLowerCase().includes(keyword) ||
            c.route.toLowerCase().includes(keyword)
        );

        renderCustomers(filtered);
    });

    clearForm.addEventListener("click", resetForm);

    backSales.addEventListener("click", () => {
        window.location.href = "../sales.html";
    });

    renderCustomers();

});
