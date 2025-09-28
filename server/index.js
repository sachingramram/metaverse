const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*"; // set this in Render to your frontend URL

const server = http.createServer();

let corsOrigin;
if (FRONTEND_ORIGIN === "*" || FRONTEND_ORIGIN === "all") {
  corsOrigin = "*";
} else {
  corsOrigin = FRONTEND_ORIGIN.split(",").map(s => s.trim());
}

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"]
  }
});

const players = {}; // id -> player

function randomSpawn() {
  return { x: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 10 };
}

io.on("connection", (socket) => {
  console.log("conn", socket.id);

  socket.on("join", ({ name, color }) => {
    const spawn = randomSpawn();
    players[socket.id] = {
      id: socket.id,
      name: name || "Guest",
      color: color || "#ff4d4f",
      x: spawn.x,
      z: spawn.z,
      lastSeen: Date.now()
    };
    io.emit("players", players);
    io.emit("playerJoined", players[socket.id]);
    console.log("player joined:", players[socket.id]);
  });

  socket.on("move", ({ dx = 0, dz = 0 }) => {
    const p = players[socket.id];
    if (!p) return;
    p.x += dx * 0.8;
    p.z += dz * 0.8;
    p.lastSeen = Date.now();
    io.emit("playerMoved", p);
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    delete players[socket.id];
    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
