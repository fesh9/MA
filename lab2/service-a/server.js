const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`Hello from Service A on port ${PORT}`);
});

app.listen(PORT, () => console.log(`Service A running on port ${PORT}`));