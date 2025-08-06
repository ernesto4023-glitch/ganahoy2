// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('rifa.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      cedula TEXT NOT NULL,
      telefono TEXT NOT NULL,
      tickets TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'En espera',
      total_pagado REAL NOT NULL
    )
  `);
});

module.exports = db;
