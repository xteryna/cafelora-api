const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Statické soubory (pro obrázky)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Cesta k JSON souboru
const dataPath = path.join(__dirname, 'api/drinks.json');

// Načtení JSON dat
const getDrinksData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Endpoint pro získání všech nápojů
app.get('/api/drinks', (req, res) => {
  const drinks = getDrinksData();
  res.json(drinks);
});

// Endpoint pro získání nápojů podle filtru
app.get('/api/drinks/filter', (req, res) => {
  const { ordered } = req.query; // Příklad: /api/drinks/filter?ordered=true
  const drinks = getDrinksData();
  const filteredDrinks = drinks.filter((item) => String(item.ordered) === ordered);
  res.json(filteredDrinks);
});

// Endpoint pro aktualizaci hodnoty "ordered"
app.post('/api/drinks/:id', (req, res) => {
  const drinks = getDrinksData();
  const { id } = req.params;
  const { ordered } = req.body;

  const drink = drinks.find((item) => item.id === parseInt(id, 10));
  if (!drink) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  drink.ordered = ordered;

  // Uložit zpět do souboru
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));

  res.json({ message: 'Drink updated successfully', drink });
});

// Start serveru
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
