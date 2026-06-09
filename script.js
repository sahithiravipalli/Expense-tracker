const balance = document.getElementById("balance");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const count = document.getElementById("count");
const savings = document.getElementById("savings");
const budget = document.getElementById("budget");
const progressBar = document.getElementById("progressBar");
const budgetText = document.getElementById("budgetText");
const empty = document.getElementById("empty");
const exportBtn = document.getElementById("exportBtn");
const chartCanvas = document.getElementById("expenseChart");
const themeBtn = document.getElementById("themeBtn");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;
let expenseChart;

addBtn.addEventListener("click", addTransaction);

function addTransaction() {

    if (
        text.value.trim() === "" ||
        amount.value.trim() === ""
    ) {
        alert("Enter valid details");
        return;
    }

    if (editId !== null) {

        transactions = transactions.map(t =>
            t.id === editId
                ? {
                    ...t,
                    text: text.value,
                    amount: Number(amount.value),
                    category: category.value
                }
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

        li.classList.add(
            t.amount < 0 ? "expense" : "income"
        );

        li.innerHTML = `
            <div>
                <strong>${t.text}</strong>
                (${t.category})
                <br>
                <small>${t.date}</small>
            </div>

            <div>
                ${t.amount < 0
                    ? "-₹" + Math.abs(t.amount)
                    : "₹" + t.amount
                }

                <button onclick="editTransaction(${t.id})">
                    Edit
                </button>

                <button onclick="deleteTransaction(${t.id})">
                    X
                </button>
            </div>
        `;

        list.appendChild(li);

    });
}

function editTransaction(id) {

    const t = transactions.find(
        item => item.id === id
    );

    text.value = t.text;
    amount.value = t.amount;
    category.value = t.category;

    editId = id;
}

function deleteTransaction(id) {

    transactions =
    transactions.filter(
        t => t.id !== id
    );

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

        if (t.amount > 0) {
            inc += t.amount;
        } else {
            exp += t.amount;
        }

    });

    balance.innerText = total;
    income.innerText = "₹" + inc;
    expense.innerText = "₹" + Math.abs(exp);

    count.innerText =
    transactions.length;

    savings.innerText =
    "₹" + total;

    if (budget.value > 0) {

        let percentage =
            (Math.abs(exp) /
            Number(budget.value)) * 100;

        percentage =
        Math.min(percentage, 100);

        progressBar.style.width =
        percentage + "%";

        budgetText.innerText =
        "Budget Used: " +
        percentage.toFixed(1) +
        "%";

        if (percentage < 80) {
            progressBar.style.background =
            "green";
        }

        if (percentage >= 80) {
            progressBar.style.background =
            "orange";
        }

        if (percentage >= 100) {
            progressBar.style.background =
            "red";
        }

        if (
            Math.abs(exp) >
            Number(budget.value)
        ) {

            alert(
                "⚠️ Budget exceeded!"
            );

        }

    }

    updateChart();
}


function updateLocalStorage() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


themeBtn.addEventListener(
    "click",
    () => {

        document.body
        .classList
        .toggle("dark");

    }
);


document.getElementById("search").addEventListener("input",
function(){

    const value =
    this.value.toLowerCase();

    const items =
    document.querySelectorAll("#list li");

    items.forEach(item => {

        item.style.display =

        item.innerText
        .toLowerCase()
        .includes(value)

        ? "flex"
        : "none";

    });

});

budget.value =
localStorage.getItem("budget")
|| "";

budget.addEventListener(
    "input",
    () => {

        localStorage.setItem(
            "budget",
            budget.value
        );

        updateBalance();

    }
);



exportBtn.addEventListener(
    "click",
    exportCSV
);

function exportCSV() {

    let csv =
    "Description,Amount,Category,Date\n";

    transactions.forEach(t => {

        csv +=
        `${t.text},${t.amount},${t.category},${t.date}\n`;

    });

    const blob =
    new Blob(
        [csv],
        { type: "text/csv" }
    );

    const link =
    document.createElement("a");

    link.href =
    URL.createObjectURL(blob);

    link.download =
    "transactions.csv";

    link.click();
}

function updateChart() {

    let categories = {};

    transactions.forEach(t => {

        if (t.amount < 0) {

            const cat =
            t.category;

            categories[cat] =
            (categories[cat] || 0)
            +
            Math.abs(t.amount);

        }

    });

    const labels =
    Object.keys(categories);

    const values =
    Object.values(categories);

    if (labels.length === 0) {
        return;
    }

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart =
    new Chart(
        chartCanvas,
        {
            type: "pie",

            data: {

                labels: labels,

                datasets: [{
                    data: values
                }]

            }
        }
    );
}
displayTransactions();
updateBalance();
