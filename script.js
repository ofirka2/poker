document.addEventListener("DOMContentLoaded", () => {
    const playerTable = document.querySelector("#player-table tbody");
    const addPlayerButton = document.querySelector("#add-player");
    const manageMoneyButton = document.querySelector("#manage-money");
    const chipsRatioInput = document.querySelector("#chips-ratio");
    const buyInAmountInput = document.querySelector("#buy-in-amount");
  
    let balances = []; // Array to store player balances
  
    const createPlayerRow = (playerNumber, playerName = `Player ${playerNumber}`, chips = '', buyIns = 0) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${playerName}" /></td>
        <td>
          <button class="decrease">-</button>
          <span class="buy-ins">${buyIns}</span>
          <button class="increase">+</button>
        </td>
        <td><input type="text" class="jackpot" value="${chips}" placeholder="Chips" /></td>
        <td><button class="remove-player">Remove</button></td>
      `;
      return row;
    };
  
    // Restore game data on load
    const restoreGameData = () => {
      const savedGameData = JSON.parse(localStorage.getItem("gameData"));
      if (savedGameData) {
        chipsRatioInput.value = savedGameData.chipsRatio || '';
        buyInAmountInput.value = savedGameData.buyInAmount || '';
        playerTable.innerHTML = '';
        savedGameData.players.forEach((player, index) => {
          playerTable.appendChild(createPlayerRow(index + 1, player.name, player.chips, player.buyIns));
        });
      } else {
        for (let i = 1; i <= 5; i++) {
          playerTable.appendChild(createPlayerRow(i));
        }
      }
    };
  
    const saveGameData = () => {
      const players = Array.from(playerTable.querySelectorAll("tr")).map((row) => ({
        name: row.querySelector("input[type='text']").value,
        chips: row.querySelector(".jackpot").value,
        buyIns: parseInt(row.querySelector(".buy-ins").textContent) || 0,
      }));
  
      const gameData = {
        chipsRatio: chipsRatioInput.value,
        buyInAmount: buyInAmountInput.value,
        players,
      };
  
      localStorage.setItem("gameData", JSON.stringify(gameData));
    };
  
    const calculateBalances = () => {
      const chipsRatio = parseFloat(chipsRatioInput.value);
      const buyInAmount = parseFloat(buyInAmountInput.value);
  
      if (!chipsRatio || chipsRatio <= 0 || !buyInAmount || buyInAmount <= 0) {
        alert("Please fill in valid values for Chips-to-Money Ratio and Buy-In Amount.");
        return false;
      }
  
      const rows = document.querySelectorAll("#player-table tbody tr");
      balances = []; // Reset balances
  
      rows.forEach((row, index) => {
        const playerName = row.querySelector("input[type='text']").value || `Player ${index + 1}`;
        const chips = parseFloat(row.querySelector(".jackpot").value) || 0;
        const buyIns = parseInt(row.querySelector(".buy-ins").textContent) || 0;
  
        const money = chips / chipsRatio;
        const balance = money - buyIns * buyInAmount;
        balances.push({ playerName, chips, money: money.toFixed(2), balance });
      });
  
      return true;
    };
  
    restoreGameData();
  
    addPlayerButton.addEventListener("click", () => {
      const playerCount = playerTable.querySelectorAll("tr").length + 1;
      playerTable.appendChild(createPlayerRow(playerCount));
    });
  
    playerTable.addEventListener("click", (event) => {
      if (event.target.classList.contains("increase")) {
        const buyInsSpan = event.target.previousElementSibling;
        buyInsSpan.textContent = parseInt(buyInsSpan.textContent) + 1;
      } else if (event.target.classList.contains("decrease")) {
        const buyInsSpan = event.target.nextElementSibling;
        if (parseInt(buyInsSpan.textContent) > 0) {
          buyInsSpan.textContent = parseInt(buyInsSpan.textContent) - 1;
        }
      } else if (event.target.classList.contains("remove-player")) {
        const row = event.target.closest("tr");
        row.remove();
      }
    });
  
    manageMoneyButton.addEventListener("click", () => {
      if (!calculateBalances()) return;
  
      const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);
      const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
  
      let transfers = [];
      while (creditors.length > 0 && debtors.length > 0) {
        const creditor = creditors[0];
        const debtor = debtors[0];
  
        const transferAmount = Math.min(creditor.balance, Math.abs(debtor.balance));
  
        transfers.push({
          from: debtor.playerName,
          to: creditor.playerName,
          amount: transferAmount.toFixed(2),
        });
  
        creditor.balance -= transferAmount;
        debtor.balance += transferAmount;
  
        if (creditor.balance === 0) creditors.shift();
        if (debtor.balance === 0) debtors.shift();
      }
  
      saveGameData();
      localStorage.setItem("moneyTransfers", JSON.stringify({ transfers, balances }));
      window.location.href = "money-management.html";
    });
  });
  