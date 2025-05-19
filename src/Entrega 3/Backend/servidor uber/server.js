const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const db = new sqlite3.Database('./uber.db');

app.use(cors());
app.use(bodyParser.json());


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        sobrenome TEXT,
        telefone TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL
    )`);
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', email, senha);
    db.get(
        'SELECT * FROM users WHERE email = ? AND senha = ?',
        [email, senha],
        (err, row) => {
            if (err) {
                console.error('Erro no banco de dados:', err); // 👈 Log de erro
                return res.status(500).json({ success: false });
            }
            
            if (row) {
                console.log('Login bem-sucedido para:', email);
                res.json({ success: true, user: row });
            } else {
                console.log('Credenciais inválidas para:', email);
                res.status(401).json({ success: false });
            }
        }
    );
});

// REGISTRO
app.post('/register', (req, res) => {
    const { nome, sobrenome, telefone, email, senha } = req.body;
    db.run('INSERT INTO users (nome, sobrenome, telefone, email, senha) VALUES (?, ?, ?, ?, ?)',
        [nome, sobrenome, telefone, email, senha],
        function(err) {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.json({ success: true, id: this.lastID });
        });
});

// VERIFICAÇÃO DE EMAIL
app.get('/email-exists/:email', (req, res) => {
    db.get('SELECT 1 FROM users WHERE email = ?', [req.params.email], (err, row) => {
        res.json({ exists: !!row });
    });
});

// ATUALIZAÇÃO DE USUÁRIO
app.put('/update', (req, res) => {
    const { email, nome, sobrenome, telefone } = req.body;
    db.run('UPDATE users SET nome = ?, sobrenome = ?, telefone = ? WHERE email = ?',
        [nome, sobrenome, telefone, email],
        function(err) {
            if (err) return res.status(400).json({ success: false });
            res.json({ success: this.changes > 0 });
        });
});

// DELETAR USUÁRIO
app.delete('/delete/:email', (req, res) => {
    db.run('DELETE FROM users WHERE email = ?', [req.params.email],
        function(err) {
            if (err) return res.status(400).json({ success: false });
            res.json({ success: this.changes > 0 });
        });
});

// USUÁRIO SIMPLES
app.post('/usuario-simples', (req, res) => {
    const { nome, email } = req.body;
    db.run('INSERT INTO usuario (nome, email) VALUES (?, ?)',
        [nome, email],
        function(err) {
            if (err) return res.status(400).json({ success: false });
            res.json({ success: true, id: this.lastID });
        });
});

// LISTAR TODOS OS USUÁRIOS
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
        res.json({ success: true, users: rows });
    });
});

// INICIALIZA O SERVIDOR
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
