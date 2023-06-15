var http = require("http");
var fs = require("fs");
var path = require("path");
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const serverApp = http.createServer(responseHandler);

serverApp.listen(SERVER_PORT);
console.log(`🖥 Server is running on port ${SERVER_PORT}`);

function responseHandler(request, response) {
  console.log(`🖥 Received request for ${request.url}`);
  var filePath = "./custom-client" + request.url;
  if (filePath === "./custom-client/") {
    filePath = "./custom-client/index.html";
  }
  var fileExtension = String(path.extname(filePath)).toLowerCase();
  console.log(`🖥 Serving ${filePath}`);
  var mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  var contentType = mimeTypes[fileExtension] || "application/octet-stream";
  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile("./custom-client/404.html", function (error, content) {
          response.writeHead(404, { "Content-Type": contentType });
          response.end(content, "utf-8");
        });
      } else {
        response.writeHead(500);
        response.end("Sorry, there was an error: " + error.code + " ..\n");
      }
    } else {
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    }
  });
}

const io = require("socket.io")(serverApp, {
  path: "/custom-socket.io",
});

io.attach(serverApp, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

var activeUsers = {};

io.on("connection", (socket) => {
  console.log("👾 New custom socket connected! >>", socket.id);

  socket.on("userConnected", (data) => {
    console.log(`userConnected event received`, data);
    activeUsers[socket.id] = data.username;
    console.log("activeUsers :>> ", activeUsers);
    socket.emit("greetUser", {
      user: "server",
      message: `Welcome ${data.username}! There are ${
        Object.keys(activeUsers).length
      } users connected`,
    });
  });

  socket.on("userMessage", (data) => {
    console.log(`👾 userMessage from ${data.username}`);
    socket.broadcast.emit("broadcastMessage", {
      user: activeUsers[data.username],
      message: data.message,
    });
  });
});
