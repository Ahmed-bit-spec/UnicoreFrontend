import { io } from "socket.io-client";

// Same-origin connection through Vite proxy (/socket.io → backend).
// Do NOT hardcode localhost:3000 — cookies and proxy must match the app origin.
const socket = io({
  path:            "/socket.io",
  withCredentials: true,
  transports:      ["websocket", "polling"],
  autoConnect:     true,
});

export default socket;
