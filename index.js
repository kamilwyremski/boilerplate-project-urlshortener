require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

let urlDatabase = {};
let counter = 1;
const loadDatabase = () => {
  try {
    const data = fs.readFileSync('urlDatabase.json', 'utf8');
    urlDatabase = JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error.message);
  }
};

loadDatabase();

const saveDatabase = () => {
  try {
    const data = JSON.stringify(urlDatabase, null, 2);
    fs.writeFileSync('urlDatabase.json', data, 'utf8');
  } catch (error) {
    console.error('Error saving database:', error.message);
  }
};
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  const urlObject = new URL(originalUrl);
  if (!urlObject.hostname) {
    return res.json({ error: 'invalid url' });
  }

  const shortUrl = counter++;
  urlDatabase[shortUrl] = originalUrl;

  saveDatabase();

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });
});


app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'short url not found' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
