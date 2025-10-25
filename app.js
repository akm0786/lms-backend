import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
const app = express();
app.use(express.json());

app.use(cors(
    {
        origin: [process.env.FRONTEND_URL],
        credentials: true
    }
));

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/courses', courseRoutes);

app.use('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/ping', (req, res) => {
    res.send('pong');
});


app.use(errorMiddleware);

export default app;