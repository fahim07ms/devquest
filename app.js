import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express()
const port = process.env.PORT || 4000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";


// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/comments', commentRoutes);

app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => {
    res.json({message: "Hello World!"})
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
