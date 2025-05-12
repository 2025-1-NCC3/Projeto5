const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Banco de Dados
const db = new sqlite3.Database("banco.db");

// Cria a tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    sobrenome TEXT,
    email TEXT,
    senha TEXT,
    cidade TEXT,
    codigo_indicacao TEXT
  )
`);

// 🧾 Rota para listar todos os usuários
app.get("/usuarios", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.send(err);
    res.send(rows);
  });
});

// 🔎 Rota para buscar por ID
app.get("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return res.send(err);
    if (!row) return res.send({ mensagem: "Usuário não encontrado." });
    res.send(row);
  });
});

// 📝 Rota para inserir novo usuário
app.post("/usuarios", (req, res) => {
  const { nome, sobrenome, email, senha, cidade, codigo_indicacao } = req.body;
  db.run(
    `INSERT INTO users (nome, sobrenome, email, senha, cidade, codigo_indicacao) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, sobrenome, email, senha, cidade, codigo_indicacao],
    function (err) {
      if (err) return res.status(500).send(err);
      res.send({ id: this.lastID, mensagem: "Usuário criado com sucesso!" });
    }
  );
});

// 🌐 Rota padrão
app.get("/", (req, res) => {
  res.send("API de Usuários no ar! 🚀");
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
