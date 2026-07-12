const form = document.getElementById('addItemForm');
const formHeading = document.getElementById('formHeading');
const submitFormBtn = document.getElementById('submitFormBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tableBody = document.getElementById('inventoryTableBody');
const dateInput = document.getElementById('itemDate');
const itemSelect = document.getElementById('itemName');
const quantityInput = document.getElementById('itemQuantity');
const buyPriceInput = document.getElementById('itemPrice');
const sellPriceInput = document.getElementById('sellPrice');

function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return yyyy + '-' + mm + '-' + dd;
}

function setDefaultDate() {
    dateInput.value = getTodayDateString();
}

function populatePriceSuggestions(selectedItem) {
    if (priceSuggestions && priceSuggestions[selectedItem]) {
        buyPriceInput.value = priceSuggestions[selectedItem].buy;
        sellPriceInput.value = priceSuggestions[selectedItem].sell;
        quantityInput.value = 1;
    } else {
        buyPriceInput.value = '';
        sellPriceInput.value = '';
        quantityInput.value = '';
    }
}

function resetFormState() {
    editModeId = null;
    formHeading.innerText = 'Add New Income Item';
    submitFormBtn.innerText = 'Add to Inventory';
    cancelEditBtn.style.display = 'none';
    form.reset();
    setDefaultDate();
}

function handleInventorySnapshot(snapshot) {
    inventory = [];
    snapshot.forEach((doc) => {
        inventory.push({ id: doc.id, ...doc.data() });
    });
    updateTable();
}

function sellItem(id) {
    const item = inventory.find((entry) => entry.id === id);
    if (!item) return;

    const sellQty = parseInt(document.getElementById(`qtyInput-${id}`).value, 10);
    const remark = document.getElementById(`remarkInput-${id}`).value.trim();

    if (isNaN(sellQty) || sellQty <= 0 || sellQty > item.stockQty) {
        alert('Invalid transaction quantity context volume.');
        return;
    }

    const saleData = {
        itemName: item.name,
        quantity: sellQty,
        unitPrice: Number(item.sellPrice) || 0,
        totalAmount: (Number(item.sellPrice) || 0) * sellQty,
        date: getTodayDateString(),
        remark: remark || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('inventory').doc(id).update({
        stockQty: item.stockQty - sellQty,
        soldQty: item.soldQty + sellQty
    }).then(() => {
        db.collection('salesHistory').add(saleData).catch((err) => alert(err.message));
    }).catch((err) => alert(err.message));
}

function startEditItem(id) {
    const item = inventory.find((entry) => entry.id === id);
    if (!item) return;

    editModeId = id;
    formHeading.innerText = 'Edit Inventory Item';
    submitFormBtn.innerText = 'Update Item';
    cancelEditBtn.style.display = 'inline-block';
    itemSelect.value = item.name;
    quantityInput.value = item.stockQty;
    buyPriceInput.value = item.buyPrice;
    sellPriceInput.value = item.sellPrice;
    dateInput.value = item.date;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteItem(id) {
    if (confirm('Permanently drop entry record?')) {
        if (editModeId === id) resetFormState();
        db.collection('inventory').doc(id).delete().catch((err) => alert(err.message));
    }
}

function updateTable() {
    tableBody.innerHTML = '';
    inventory.forEach((item) => {
        const row = document.createElement('tr');
        const stock = Number(item.stockQty);
        const sold = Number(item.soldQty);
        const statusText = stock === 0 ? 'Sold Out' : (sold > 0 ? 'Partial' : 'In Stock');
        const statusClass = stock === 0 ? 'status-sold' : (sold > 0 ? 'status-partial' : 'status-stock');
        const disabled = stock === 0 ? 'disabled' : '';

        row.innerHTML = `
            <td>${item.date}</td>
            <td><strong>${item.name}</strong></td>
            <td>${stock}</td>
            <td>${sold}</td>
            <td>$${item.buyPrice}</td>
            <td>$${item.sellPrice}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-cells" style="align-items: center;">
                    <input type="number" id="qtyInput-${item.id}" value="1" min="1" max="${stock}" style="width: 60px;" ${disabled}>
                    <input type="text" id="remarkInput-${item.id}" placeholder="Remark" style="width: 120px;" ${disabled}>
                    <button class="sell-btn" onclick="sellItem('${item.id}')" ${disabled}>${stock === 0 ? 'Sold' : 'Sell'}</button>
                    <button class="edit-btn" onclick="startEditItem('${item.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            </td>`;
        tableBody.appendChild(row);
    });
    if (typeof updateDashboard === 'function') updateDashboard();
}

function exportToExcel() {
    if (!inventory.length) return alert('No active ledger available.');

    const formattedData = inventory.map((item) => ({
        'Date Added': item.date,
        'Selling Date': item.sellingDate || item.date,
        'Item Name': item.name,
        'Qty In Stock': Number(item.stockQty),
        'Qty Sold': Number(item.soldQty),
        'Cost Price': Number(item.buyPrice),
        'Selling Price': Number(item.sellPrice),
        'Remark': item.remark || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report');
    XLSX.writeFile(workbook, getTodayDateString() + '.xlsx');
}

// Initialize default date
setDefaultDate();

itemSelect.addEventListener('change', function () {
    if (editModeId) return;
    populatePriceSuggestions(itemSelect.value);
});

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = itemSelect.value;
    const qty = parseInt(quantityInput.value, 10);
    const buyPrice = Number(buyPriceInput.value);
    const sellPrice = Number(sellPriceInput.value);
    const date = dateInput.value;

    if (editModeId) {
        db.collection('inventory').doc(editModeId).update({
            name, stockQty: qty, buyPrice, sellPrice, date
        }).then(() => resetFormState()).catch((err) => alert(err.message));
    } else {
        db.collection('inventory').add({
            name, stockQty: qty, soldQty: 0, buyPrice, sellPrice, date
        }).then(() => {
            form.reset();
            setDefaultDate();
        }).catch((err) => alert(err.message));
    }
});

db.collection('inventory').orderBy('date', 'desc').onSnapshot((snapshot) => {
    handleInventorySnapshot(snapshot);
}, (error) => {
    console.error('Database error: ', error);
});

function showView(viewId) {
    // 1. Hide all view panels and remove active states
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
    });
    
    // 2. Remove the "active" highlight styling from all menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show the requested view panel
    const currentView = document.getElementById(viewId);
    if (currentView) {
        currentView.style.display = 'block';
        currentView.classList.add('active');
    }

    // 4. Highlight the clicked sidebar button
    const matchingBtn = document.querySelector(`[data-target="${viewId}"]`);
    if (matchingBtn) {
        matchingBtn.classList.add('active');
    }

    // 5. CRITICAL: If they click Bank Transactions, load the ledger data
    if (viewId === 'bankView' && typeof loadBankTransactions === 'function') {
        loadBankTransactions();
    }

    // 6. AUTO-CLOSE MOBILE MENU
    const sideMenu = document.querySelector('.side-menu');
    if (sideMenu && window.innerWidth < 768) {
        sideMenu.classList.remove('active'); 
        // Reminder: If your CSS uses a different toggle class name (like 'open' or 'show') 
        // to display the side-menu on phones, replace 'active' with that class name.
    }
}