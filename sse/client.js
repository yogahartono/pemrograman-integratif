var EventSource = require('eventsource');

var eventSource = new EventSource("http://localhost:5001");

function updateMessage1(message) {
    console.log("Message 1:", message);
}

function updateMessage2(message) {
    console.log("Message 2:", message);
}

eventSource.onmessage = function(event) {
    updateMessage1(event.data);
};

eventSource.onerror = function(error) {
    updateMessage1("Server error");
    eventSource.close();
};

// Contoh penggunaan variabel kedua
var eventSource2 = new EventSource("http://localhost:5002");

eventSource2.onmessage = function(event) {
    updateMessage2(event.data);
};

eventSource2.onerror = function(error) {
    updateMessage2("Server error");
    eventSource2.close();
};
