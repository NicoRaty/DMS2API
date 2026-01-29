import express from 'express';
import {verifyToken} from './middleware/verifytoken.js'
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import index from './api/index.js';
import data from './api/data.js';
import login from './api/login.js';

const swaggerDocument = YAML.load('./openapi/api.yaml');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/doc', swaggerUi.serve,   swaggerUi.setup(swaggerDocument));

// app.use('/data', data);
app.use('/login', login);
app.use('/', index);
app.use('/data', verifyToken, data);
export default app;