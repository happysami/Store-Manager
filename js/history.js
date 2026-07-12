let salesHistory = [];

function showView(viewId) {
    document.querySelectorAll('.view-panel').forEach((panel) => panel.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelector(`[data-target="${viewId}"]`).classList.add('active');
}

function deleteHistoryItem(id) {
    if (!id || !confirm('Delete this sale from history?')) return;
    db.collection('salesHistory').doc(id).delete().catch((err) => alert(err.message));
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (!salesHistory.length) {
        historyList.innerHTML = '<div class="empty-state">No sales recorded yet.</div>';
        return;
    }

    historyList.innerHTML = salesHistory.map((item) => `
        <div class="history-card">
            <div class="history-top">
                <strong>${item.itemName}</strong>
                <span class="history-total">$${item.totalAmount}</span>
            </div>
            <div>Qty: ${item.quantity}</div>
            <div>Unit Price: $${item.unitPrice}</div>
            <div>Date: ${item.date}</div>
            ${item.remark ? `<div>Remark: ${item.remark}</div>` : ''}
            <div style="margin-top: 10px;">
                <button class="delete-btn" onclick="deleteHistoryItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function handleHistorySnapshot(snapshot) {
    salesHistory = [];
    snapshot.forEach((doc) => {
        salesHistory.push({ id: doc.id, ...doc.data() });
    });
    renderHistory();
}

db.collection('salesHistory').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    handleHistorySnapshot(snapshot);
}, (error) => {
    console.error('History error: ', error);
});
