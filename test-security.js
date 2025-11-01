// Test file with CRITICAL security issues
// This should BLOCK the commit!

const mysql = require('mysql');
const express = require('express');
const app = express();

// 🔴 CRITICAL: SQL Injection vulnerability
app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + userId; // BAD!
  
  connection.query(query, (err, results) => {
    res.json(results);
  });
});

// 🔴 CRITICAL: eval() usage
app.post('/calculate', (req, res) => {
  const expression = req.body.expr;
  const result = eval(expression); // DANGEROUS!
  res.json({ result });
});

// 🔴 CRITICAL: Hardcoded credentials
const DB_PASSWORD = "admin123"; // EXPOSED SECRET!
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: DB_PASSWORD
});

// 🔴 CRITICAL: Command injection
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec(`ping ${host}`, (err, stdout) => { // COMMAND INJECTION!
    res.send(stdout);
  });
});

app.listen(3000);

