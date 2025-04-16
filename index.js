const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET = 'secret123';

app.use(cors());  
app.use(bodyParser.json());

let users = [{ username: 'user1', password: 'pass123' }];
let companies = [
  { id: 1, name: 'Company A', matchScore: 85, status: 'Not Target' },
  { id: 2, name: 'Company B', matchScore: 72, status: 'Not Target' }
];

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// Middleware to check token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// GET /accounts
app.get('/accounts', authenticateToken, (req, res) => {
  res.json(companies);
});

// POST /accounts/:id/status
app.post('/accounts/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const company = companies.find(c => c.id == id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  company.status = status;
  res.json({ message: 'Status updated', company });
});

app.get('/', (req, res) => {
    res.send('🎯 Target Account Matching API is running!');
  });
  
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
