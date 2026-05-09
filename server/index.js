const express = require('express');
const cors = require('cors');
const data = require('./data.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.get('/api/all', (req, res) => {
  res.json(data);
});


app.get('/api/pincode/:code', (req, res) => {
  const code = req.params.code;

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid pincode format. Must be 6 digits.' });
  }

  const result = data.find(item => item.pincode === code);

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'No results found' });
  }
});


app.get('/api/area/:name', (req, res) => {
  const name = req.params.name.toLowerCase();

  if (!name) {
    return res.status(400).json({ error: 'Area name is required' });
  }

  const results = data.filter(item => item.area.toLowerCase().includes(name));

  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ error: 'No results found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
