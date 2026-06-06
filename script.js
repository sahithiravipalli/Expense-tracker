const balance = document.getElementById("balance");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const empty = document.getElementById("empty");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

addBtn.addEventListener("click", addTransaction);

function addTransaction() {
    if (text.value.trim() === "" || amount.value.trim() === "") {
        alert("Enter valid details");
        return;
    }

    if (editId !== null) {
        transactions = transactions.map(t => 
            t.id === editId 
            ? { ...t, text: text.value, amount: Number(amount.value), category: category.value }
            : t
        );
        editId = null;
    } else {
        const transaction = {
            id: Date.now(),
            text: text.value,
            amount: Number(amount.value),
            category: category.value,
            date: new Date().toLocaleDateString()
        };
        transactions.push(transaction);
    }

    updateLocalStorage();
    displayTransactions();
    updateBalance();

    text.value = "";
    amount.value = "";
}

function displayTransactions() {
    list.innerHTML = "";

    if (transactions.length === 0) {
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
    }

    transactions.forEach(t => {
        const li = document.createElement("li");
        li.classList.add(t.amount < 0 ? "expense" : "income");

        li.innerHTML = `
            <div>
                ${t.text} (${t.category}) <br>
                <small>${t.date}</small>
            </div>
            <div>
                ${t.amount < 0 ? "-₹" + Math.abs(t.amount) : "₹" + t.amount}
                <button onclick="editTransaction(${t.id})">Edit</button>
                <button onclick="deleteTransaction(${t.id})">X</button>
            </div>
        `;

        list.appendChild(li);
    });
}

function editTransaction(id) {
    const t = transactions.find(item => item.id === id);

    text.value = t.text;
    amount.value = t.amount;
    category.value = t.category;

    editId = id;
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);

    updateLocalStorage();
    displayTransactions();
    updateBalance();
}

function updateBalance() {
    let total = 0;
    let inc = 0;
    let exp = 0;

    transactions.forEach(t => {
        total += t.amount;

        if (t.amount > 0) inc += t.amount;
        else exp += t.amount;
    });

    balance.innerText = total;
    income.innerText = "₹" + inc;
    expense.innerText = "₹" + Math.abs(exp);

    if (Math.abs(exp) > 5000) {
        alert("⚠️ Budget exceeded!");
    }
}

function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

displayTransactions();
updateBalance();