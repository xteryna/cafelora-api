const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();  // Inicializace Express aplikace
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

// Endpoint pro získání konkrétního nápoje podle ID
app.get('/api/drinks/:id', (req, res) => {
  const drinks = getDrinksData();
  const { id } = req.params;

  const drink = drinks.find((item) => item.id === parseInt(id, 10));
  if (!drink) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  res.json(drink);
});

// Endpoint pro přidání nového nápoje
app.post('/api/drinks', (req, res) => {
  const drinks = getDrinksData();
  const { name, image, layers, ordered = false } = req.body;

  if (!name || !image || !layers) {
    return res.status(400).json({ message: 'Name and image and layers are required' });
  }

  const newDrink = {
    id: drinks.length > 0 ? drinks[drinks.length - 1].id + 1 : 1,
    name,
    image,
    layers,
    ordered
  };

  drinks.push(newDrink);

  // Uložit zpět do souboru
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));

  res.status(201).json({ message: 'Drink added successfully', drink: newDrink });
});

// Endpoint pro aktualizaci konkrétního nápoje (jakékoli vlastnosti)
app.patch('/api/drinks/:id', (req, res) => {
  const drinks = getDrinksData();
  const { id } = req.params;
  const updates = req.body;

  const drink = drinks.find((item) => item.id === parseInt(id, 10));
  if (!drink) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  Object.keys(updates).forEach((key) => {
    if (key in drink) {
      drink[key] = updates[key];
    }
  });

  // Uložit zpět do souboru
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));

  // Vracíme status 204 bez těla
  res.status(204).send();
});


// Endpoint pro aktualizaci celého nápoje podle ID
app.put('/api/drinks/:id', (req, res) => {
  const drinks = getDrinksData();
  const { id } = req.params;
  const { name, image, ordered, layers } = req.body;

  const drinkIndex = drinks.findIndex((item) => item.id === parseInt(id, 10));
  if (drinkIndex === -1) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  // Ověření všech požadovaných polí
  if (!name || !image || !Array.isArray(layers) || layers.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid fields' });
  }

  // Nahrazení celého záznamu
  drinks[drinkIndex] = {
    id: parseInt(id, 10),
    name,
    image,
    ordered: ordered || false,
    layers,
  };

  // Uložení změn do souboru
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));

  // Vracíme status 204 bez těla
  res.status(204).send();
});



// Endpoint pro smazání konkrétního nápoje
app.delete('/api/drinks/:id', (req, res) => {
  let drinks = getDrinksData();
  const { id } = req.params;

  const drinkIndex = drinks.findIndex((item) => item.id === parseInt(id, 10));
  if (drinkIndex === -1) {
    return res.status(404).json({ message: 'Drink not found' });
  }

  drinks.splice(drinkIndex, 1); // Odstranění nápoje ze seznamu

  // Uložit zpět do souboru
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));

  // Odpověď s 204 No Content
  res.status(204).send();
});


// Start serveru
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
