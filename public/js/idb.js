// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called "budget_tracker"
let request = indexedDB.open('budget_tracker', 2);

// this event will emit if the database version changes
request.onupgradeneeded = function (event) {
  // save a reference to the database
  db = event.target.result;
  // create an object store(table) called new_transaction and set it to have an auto incrementing primary key of sorts
  db.createObjectStore('new_transaction', { autoIncrement: true });
};
// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;
  // check if app is online, if yes run uploadTranscation() function to send all local db data to api
  if (navigator.onLine) {
    uploadTranscation();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// when there is no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  let transaction = db.transaction(['new_transaction'], 'readwrite');
  // access the object store for "new_transaction"
  let transactionObjectStore = transaction.objectStore('new_transaction');
  // add record to your store with add method
  transactionObjectStore.add(record);
}

// upload all offline data to MongoDB
function uploadTranscation() {
  // open a new transaction with the database with read and write permissions
  let transaction = db.transaction(['new_transaction'], 'readwrite');
  // access object store of indexdDB
  let transactionObjectStore = transaction.objectStore('new_transaction');
  // get all records from store and set to a variable
  const getAll = transactionObjectStore.getAll();
  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in the indexedDB's store, send it to api server
    if (getAll.result.length > 0) {
      // also send to server
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.errors) {
            errorEl.textContent = 'Missing Information';
          } else {
            // open one more transaction
            let transaction = db.transaction(['new_transaction'], 'readwrite');
            // access the new_transaction object store
            let transactionObjectStore = transaction.objectStore(
              'new_transaction',
            );
            // clear object store
            transactionObjectStore.clear();
            nameEl.value = '';
            amountEl.value = '';
            alter('local stored transactions has been updated to the server');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadTranscation);
