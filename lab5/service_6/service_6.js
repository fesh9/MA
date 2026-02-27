const express = require('express');
const app = express();
const PORT = 3001;
app.get('/', (req, res) => {
    res.send(`Hello from Service 6 (Cluster Mode) on port ${PORT}`);
});
app.listen(PORT, () => console.log(`Service 6 running on port ${PORT}`));