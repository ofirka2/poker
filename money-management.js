document.addEventListener("DOMContentLoaded", () => {
  const transfersTable = document.getElementById("transfers-table");
  const transfersDiv = document.getElementById("transfer-details");
  const backButton = document.getElementById("back-button");

  // Retrieve data from localStorage
  const gameData = JSON.parse(localStorage.getItem("gameData"));
  const transfers = JSON.parse(localStorage.getItem("moneyTransfers")) || [];
  const { players } = gameData;
  const buyInAmount = gameData.buyInAmount;

  // Find the most losing player
  let mostLosingPlayer = null;
  let maxLoss = -Infinity;

  players.forEach((player) => {
    const totalBuyIn = player.buyIns * buyInAmount;
    const profitLoss = (player.chips / gameData.chipsRatio - totalBuyIn).toFixed(2);

    if (profitLoss < maxLoss) {
      maxLoss = profitLoss;
      mostLosingPlayer = player.name;
    }
  });

  // Display player balances in the table
  players.forEach((player) => {
    const totalBuyIn = player.buyIns * buyInAmount;
    const profitLoss = (player.chips / gameData.chipsRatio - totalBuyIn).toFixed(2);
    const isMostLosing = player.name === mostLosingPlayer;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.name} ${isMostLosing ? '🐑' : ''}</td>
      <td>${player.chips}</td>
      <td>$${(player.chips / gameData.chipsRatio).toFixed(2)}</td>
      <td>$${totalBuyIn.toFixed(2)}</td>
      <td>${profitLoss >= 0 ? `+$${profitLoss}` : `-$${Math.abs(profitLoss)}`}</td>
    `;
    transfersTable.appendChild(row);
  });

  // Display transfers summary
  if (transfers.length > 0) {
    transfers.forEach((transfer) => {
      const transferElement = document.createElement("p");
      transferElement.textContent = `${transfer.from} pays $${transfer.amount} to ${transfer.to}`;
      transfersDiv.appendChild(transferElement);
    });
  } else {
    const noTransfersMessage = document.createElement("p");
    noTransfersMessage.textContent = "No transfers required.";
    transfersDiv.appendChild(noTransfersMessage);
  }

  // Handle back button
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
