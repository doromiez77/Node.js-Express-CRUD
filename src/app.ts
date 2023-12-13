import cors from 'cors';
import morgan from 'morgan';
import express from 'express';

// import module from '@routes/User';

//import UserRoutes from './routes/User';

//import UserRoutes from '@routes/User';

import AuthRoutes from './routes/Auth';
import UserRoutes from './routes/User';
import { MAuth } from './middlewares/auth';
import swaggerUi, { swaggerSpecs } from './swagger';

const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.static(__dirname + 'src/public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

// /api 엔드포인트에 swaggerUi 제공 ,
// explore : true -> swagger UI api 탐색기 활성화
// swaggerUi : 사용자 인터페이스 제공
// swaggerSpecs :

app.get('/', (req, res) => {
  res.status(200).send('Hello!');
});

app.post('/login', AuthRoutes.login);

app.post('/register', UserRoutes.register);
app.patch('/user', MAuth, UserRoutes.updateUser);
app.delete('/user', UserRoutes.deleteUser);
app.get('/user/:id', UserRoutes.findUser);

export default app;
