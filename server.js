const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Conexión a la base de datos
const db = new Database("rifa.db");

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tickets TEXT NOT NULL,
    estado TEXT NOT NULL,
    total_pagado REAL NOT NULL
  )
`).run();

// 🎟 Ruta para registrar tickets
app.post("/api/registro", (req, res) => {
  const { nombre, apellido, cedula, telefono, cantidad, total } = req.body;

  if (!nombre || !apellido || !cedula || !telefono || !cantidad || !total) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  const rows = db.prepare("SELECT tickets FROM registros").all();
  const ocupados = rows.flatMap(row => row.tickets.split(",").map(t => t.trim()));

  const nuevosTickets = [];
  while (nuevosTickets.length < cantidad) {
    const num = String(Math.floor(Math.random() * 10000 + 1)).padStart(5, "0");
    if (!ocupados.includes(num) && !nuevosTickets.includes(num)) {
      nuevosTickets.push(num);
    }
  }

  const ticketsStr = nuevosTickets.join(", ");

  db.prepare(`
    INSERT INTO registros (nombre, apellido, cedula, telefono, tickets, estado, total_pagado)
    VALUES (?, ?, ?, ?, ?, 'En espera', ?)
  `).run(nombre, apellido, cedula, telefono, ticketsStr, total);

  res.json({ success: true, tickets: nuevosTickets });
});

// 📄 Obtener todos los registros
app.get("/api/registros", (req, res) => {
  const registros = db.prepare("SELECT * FROM registros ORDER BY id DESC").all();
  res.json({ success: true, registros });
});

// ✅ Verificar pago
app.post("/api/verificar/:id", (req, res) => {
  const id = req.params.id;
  db.prepare("UPDATE registros SET estado = 'Verificado' WHERE id = ?").run(id);
  res.json({ success: true });
});

// ❌ Eliminar registro
app.delete("/api/eliminar/:id", (req, res) => {
  const id = req.params.id;
  db.prepare("DELETE FROM registros WHERE id = ?").run(id);
  res.json({ success: true });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});

