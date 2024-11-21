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

// Cesta k JSON souboru
const dataPath = path.join(__dirname, 'api/drinks.json');

// Načtení JSON dat
const getDrinksData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Uložení JSON dat
const saveDrinksData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// 1. Endpoint: Získání všech nápojů
app.get('/api/drinks', (req, res) => {
  const drinks = getDrinksData();
  res.json(drinks);
});

// 2. Endpoint: Vytvoření nového nápoje
app.post('/api/drinks', (req, res) => {
  const drinks = getDrinksData();
  const newDrink = {
    id: drinks.length ? drinks[drinks.length - 1].id + 1 : 1,
    ...req.body,
  };
  drinks.push(newDrink);
  saveDrinksData(drinks);
  res.status(201).json(newDrink);
});

// 3. Endpoint: Aktualizace libovolné vlastnosti nápoje
app.patch('/api/drinks/:id', (req, res) => {
  const drinks = getDrinksData();
  const { id } = req.params;
  const drink = drinks.find((item) => item.id === parseInt(id, 10));

  if (!drink) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  Object.assign(drink, req.body);
  saveDrinksData(drinks);
  res.json(drink);
});

// 4. Endpoint: Smazání nápoje
app.delete('/api/drinks/:id', (req, res) => {
  let drinks = getDrinksData();
  const { id } = req.params;

  drinks = drinks.filter((item) => item.id !== parseInt(id, 10));
  saveDrinksData(drinks);
  res.json({ message: 'Drink deleted successfully' });
});

// Start serveru
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
