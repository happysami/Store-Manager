function updateDashboard() {
    let totalSales = 0;
    let totalCostOfSold = 0;
    let remainingStockValue = 0;

    inventory.forEach(item => {
        const buy = Number(item.buyPrice) || 0;
        const sell = Number(item.sellPrice) || 0;
        const stock = Number(item.stockQty) || 0;
        const sold = Number(item.soldQty) || 0;

        totalSales += (sell * sold);
        totalCostOfSold += (buy * sold);
        remainingStockValue += (buy * stock);
    });

    const netProfit = totalSales - totalCostOfSold;

    document.getElementById('dashSales').innerText = '$' + totalSales;
    document.getElementById('dashCost').innerText = '$' + totalCostOfSold;
    document.getElementById('dashProfit').innerText = '$' + netProfit;
    document.getElementById('dashStock').innerText = '$' + remainingStockValue;
}
