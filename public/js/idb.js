// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called "budget_tracker"
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store(table) called new_transaction and set it to have an auto incrementing primary key of sorts
  db.createObjectStore('new_transcation', { autoIncrement: true });
};
// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  const db = event.target.result;
  // check if app is online, if yes run uploadTranscation() function to send all local db data to api
  if (navigator.onLine) {
    //uploadTranscation();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// when there is no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  console.log(db);
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access the object store for "new_transaction"
  const transactionObjectStore = transaction.ObjectStore('new_transaction');
  // add record to your store with add method
  transactionObjectStore.add(record);
}
