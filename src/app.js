import express from 'express';
import cors from 'cors';
import taskRouter from './routes/task.route.js';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRouter);
api.use('/api/users', userRouter);


app.get('/', (req, res) => {
    res.send('Baba Ji ki booty!!');
})

app.use(globalErrorHandler)

export default app;

