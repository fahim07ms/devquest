import express from 'express';
import cookieParser from 'cookie-parser';

const app = express()
const port = 3000


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Routes
import authRoutes from './routes/authRoutes.js';
import tagRoutes from './routes/tagRoutes.js';


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);

app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => {
    res.json({message: "Hello World!"})
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
