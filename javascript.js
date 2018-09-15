function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return yyyy + '-' + mm + '-' + dd;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

//$('#indication').hide()

$( document ).ready(function() {
    var target = $('#value')[0];

    target.focus();
    target.click();
});



var req = indexedDB.open('spreadsheets', 4)

 req.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (event.oldVersion !== 0 && event.oldVersion !== 4) {
            db.deleteObjectStore("transactions");
        }

        var objectStore = db.createObjectStore("transactions", { keyPath: "key" });
        var dataStore = db.createObjectStore("data", { keyPath: "key" });
    };

req.onerror = console.error;

if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register("sw.js")
        .then(msg => console.log("SW registered"))
        .catch(console.error)
}
    
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function sendData(){

    var req = indexedDB.open('spreadsheets', 4);

    req.onupgradeneeded = function (event) {
        var db = event.target.result;
        db.deleteObjectStore(transactions)
        var objectStore = db.createObjectStore("transactions", { keyPath: "key" });
        var dataStore = db.createObjectStore("data", { keyPath: "key" });
    };

    req.onsuccess = evt => {
        var transactions = evt.target.result.transaction(['transactions'], 'readwrite').objectStore('transactions');
        var val = {
            key: guid(),
            isSync: false,
            value: $("#value").val(),
            type: $("#type").val(),
            date: getDate(),
            timestamp: Date.now()
        };

        $("#value").val('');

        var operation = transactions.put(val);

        operation.onsuccess = () => {
            navigator.serviceWorker.ready.then(sw => {
                return sw.sync.register('sync-transactions');
            });
        };      
    };    
}