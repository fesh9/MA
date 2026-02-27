const express = require('express');
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
    res.send(`Hello from Service 5 (Cluster Mode) on port ${PORT}`);
});
app.listen(PORT, () => console.log(`Service 5 running on port ${PORT}`));