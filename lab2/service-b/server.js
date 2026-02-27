const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send(`Hello from Service B on port ${PORT}`);
});

app.listen(PORT, () => console.log(`Service B running on port ${PORT}`));
