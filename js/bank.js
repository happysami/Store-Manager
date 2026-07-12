let localTransactionsCache = []; 

document.addEventListener("DOMContentLoaded", () => {
    const bankForm = document.getElementById("bankTransactionForm");
    if (bankForm) {
        bankForm.addEventListener("submit", handleBankSubmit);
    }
    
    // Event listener to monitor selection changes
    const transTypeSelect = document.getElementById("transType");
    if (transTypeSelect) {
        transTypeSelect.addEventListener("change", handleTypeSelectionToggle);
    }
    
    // Initial load of data
    loadBankTransactions();
});

/**
 * Resets the date picker input to today's date
 */
function resetBankDateField() {
    const dateInput = document.getElementById("transDate");
    if (dateInput) {
        // Standard YYYY-MM-DD format for date inputs
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

/**
 * Toggles visibility of the method input based on transaction type
 */
function handleTypeSelectionToggle() {
    const typeValue = document.getElementById("transType").value;
    const methodWrapper = document.getElementById("methodInputWrapper");
    const methodInput = document.getElementById("transMethod");

    if (typeValue === "cash") {
        methodWrapper.style.display = "none";
        methodInput.required = false;
        methodInput.value = "Cash"; 
    } else {
        methodWrapper.style.display = "flex";
        methodInput.required = true;
        if (methodInput.value === "Cash") {
            methodInput.value = ""; 
        }
    }
}

async function handleBankSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById("transDate").value;
    const type = document.getElementById("transType").value;
    const method = document.getElementById("transMethod").value.trim();
    const amount = parseFloat(document.getElementById("transAmount").value);
    const submitBtn = e.target.querySelector("button[type='submit']");

    if (!date || !type || !method || isNaN(amount)) {
        alert("Please fill in all fields accurately.");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving...";

        await db.collection("bankTransactions").add({
            date: date,
            type: type,
            method: method,
            amount: amount,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear fields explicitly to prevent breaking layout states or form validations
        document.getElementById("transAmount").value = "";
        document.getElementById("transType").value = "";
        document.getElementById("transMethod").value = "";
        
        // Ensure standard visibility constraints and dates refresh correctly
        handleTypeSelectionToggle();
        resetBankDateField();
        
        alert("Transaction logged successfully!");
        
    } catch (error) {
        console.error("Error logging bank transaction: ", error);
        alert("Failed to save transaction.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Log Transaction";
    }
}

function loadBankTransactions() {
    db.collection("bankTransactions")
        .orderBy("date", "desc")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
            const tbody = document.getElementById("bankTableBody");
            if (!tbody) return;
            
            tbody.innerHTML = "";
            localTransactionsCache = []; 

            if (snapshot.empty) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;" class="muted-text">No transaction history found.</td></tr>`;
                return;
            }

            snapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id; 
                localTransactionsCache.push(data);

                const tr = document.createElement("tr");
                const typeStyle = data.type === 'cash' ? 'color: #20c997; font-weight: bold; text-transform: capitalize;' : 'color: #007bff; text-transform: capitalize;';

                tr.innerHTML = `
                    <td>${data.date}</td>
                    <td style="${typeStyle}">${data.type}</td>
                    <td><strong>${data.method}</strong></td>
                    <td>$${data.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn-danger" style="padding: 2px 8px; font-size: 0.8rem;" onclick="deleteBankTransaction('${doc.id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Automatically updates the display cards whenever data syncs live
            calculateBankBalance();
        }, (error) => {
            console.error("Failed to stream bank data: ", error);
        });
}

function calculateBankBalance() {
    let totalCash = 0;
    let totalTransfer = 0;

    localTransactionsCache.forEach(trans => {
        // Group amounts strictly by their type label
        if (trans.type === "cash") {
            totalCash += trans.amount;
        } else if (trans.type === "Transfer") {
            totalTransfer += trans.amount;
        }
    });

    // Sum both structures together for the grand total
    const grandTotal = totalCash + totalTransfer;

    // 1. Display Total Cash
    const cashElement = document.getElementById("bankTotalCash");
    if (cashElement) {
        cashElement.innerText = "$" + totalCash.toFixed(2);
    }

    // 2. Display Total Transfer
    const transferElement = document.getElementById("bankTotalTransfer");
    if (transferElement) {
        transferElement.innerText = "$" + totalTransfer.toFixed(2);
    }

    // 3. Display Combined Grand Total Balance
    const displayElement = document.getElementById("bankTotalBalance");
    if (displayElement) {
        displayElement.innerText = (grandTotal >= 0 ? "" : "-") + "$" + Math.abs(grandTotal).toFixed(2);
        displayElement.style.color = grandTotal >= 0 ? "#28a745" : "#dc3545"; 
    }
}

async function deleteBankTransaction(docId) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        try {
            await db.collection("bankTransactions").doc(docId).delete();
        } catch (error) {
            console.error("Error deleting transaction: ", error);
        }
    }
}