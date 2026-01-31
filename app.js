const express = require('express')
const app = express()
const port = 3000

app.use(express.json());



// Routes
const tagRoutes = require('./routes/tagRoutes');


// API Routes
app.use('/api/tags', tagRoutes);

app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => {
    res.json({message: "Hello World!"})
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
