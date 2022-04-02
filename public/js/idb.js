let db;

const request = indexedDB.open("budget_tracker", 1);

req.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const budgetObjectStore = transaction.objectStore("pending");
  budgetObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(["pending", "readwrite"]);
  const budgetObjectStore = transaction.objectStore("pending");
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const budgetObjectStore = transaction.objectStore("pending");
          budgetObjectStore.clear();
        });
    }
  };
}

window.addEventListener("online", uploadTransaction);
