const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = 3001;
const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database: 'product'
});
//----hash---
const dataToHash = 'hallotum';
const hash = crypto.createHash('sha256');
hash.update(dataToHash);
const hashedData = hash.digest('hex');

console.log('Original Data:', dataToHash);
console.log('Hashed Data:', hashedData);


//...env
const envPath = path.resolve(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf-8');
const regen = /API_KEY=.*/;
if (envContent.match(regen)) {
  envContent = envContent.replace(regen, `API_KEY=${hashedData}`);
} else {
  envContent += `\nAPI_KEY=${hashedData}\n`;
}
fs.writeFileSync(envPath, envContent);
console.log('.env updated successfully.');



//......apikey
dotenv.config();
process.env.API_KEY;
const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
  const providedKey = req.headers['api-key'];

  if (!providedKey || providedKey !== apiKey) {
    return res.status(401).json({ message: 'Invalid API key.' });
  }

  next();
};

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.use('/api', checkApiKey);

app.get('/api/product', (req, res) => {
  const sql = 'SELECT * FROM tb_products';

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      res.json(result);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
