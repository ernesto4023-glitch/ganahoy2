const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // Para servir archivos HTML/CSS/JS desde /public

// Conexión a la base de datos
const db = new sqlite3.Database("./rifa.db", (err) => {
  if (err) return console.error("Error al abrir DB:", err.message);
  console.log("✅ Conectado a la base de datos SQLite");
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  cedula TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tickets TEXT NOT NULL,
  estado TEXT NOT NULL,
  total_pagado REAL NOT NULL
)`);

// 🎟 Ruta para registrar tickets
app.post("/api/registro", (req, res) => {
  const { nombre, apellido, cedula, telefono, cantidad, total } = req.body;

  if (!nombre || !apellido || !cedula || !telefono || !cantidad || !total) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  // Buscar tickets ya ocupados
  db.all("SELECT tickets FROM registros", [], (err, rows) => {
    if (err) return res.json({ success: false, message: "Error al buscar tickets" });

    const ocupados = rows.flatMap(row => row.tickets.split(",").map(t => t.trim()));
    const nuevosTickets = [];

    while (nuevosTickets.length < cantidad) {
      const num = String(Math.floor(Math.random() * 10000 + 1)).padStart(5, "0");
      if (!ocupados.includes(num) && !nuevosTickets.includes(num)) {
        nuevosTickets.push(num);
      }
    }

    const ticketsStr = nuevosTickets.join(", ");

    db.run(
      `INSERT INTO registros (nombre, apellido, cedula, telefono, tickets, estado, total_pagado)
       VALUES (?, ?, ?, ?, ?, 'En espera', ?)`,
      [nombre, apellido, cedula, telefono, ticketsStr, total],
      function (err) {
        if (err) return res.json({ success: false, message: "Error al guardar" });
        res.json({ success: true, tickets: nuevosTickets });
      }
    );
  });
});

// 📄 Ruta para obtener todos los registros
app.get("/api/registros", (req, res) => {
  db.all("SELECT * FROM registros ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.json({ success: false, message: "Error al consultar" });
    res.json({ success: true, registros: rows });
  });
});

// ✅ Ruta para verificar un registro
app.post("/api/verificar/:id", (req, res) => {
  const id = req.params.id;
  db.run(`UPDATE registros SET estado = 'Verificado' WHERE id = ?`, [id], function (err) {
    if (err) return res.json({ success: false, message: "Error al verificar" });
    res.json({ success: true });
  });
});

// ❌ Ruta para eliminar un registro
app.delete("/api/eliminar/:id", (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM registros WHERE id = ?`, [id], function (err) {
    if (err) return res.json({ success: false, message: "Error al eliminar" });
    res.json({ success: true });
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
