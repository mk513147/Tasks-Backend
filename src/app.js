import express from 'express';
import cors from 'cors';
import taskRouter from './routes/task.route.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/tasks', taskRouter);
app.get('/', (req, res) => {
    res.send('Baba Ji ki booty!!');
})

export default app;

