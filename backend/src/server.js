import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { errorHandler } from './utils/middlewares/errorHandler.js';
import authRoutes from "./routes/authRoutes.js";
import axios from "axios";

const requiredEnvironmentVariables = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (variable) => !process.env[variable],
);

if (missingEnvironmentVariables.length > 0) {
    throw new Error(
        `Variaveis de ambiente obrigatorias ausentes: ${missingEnvironmentVariables.join(', ')}`,
    );
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.set('X-Pod-Name', process.env.HOSTNAME || 'local');
    res.status(200).json({ status: 'ok' });
});

app.use('/users', userRoutes);
app.use('/contacts', contactRoutes);
app.use('/auth', authRoutes);

const port = process.env.PORT || 3000;

app.get('/validate-phone', async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.status(400).json({ error: 'O numero de telefone e obrigatorio.' });
    }

    if (!process.env.NUMVERIFY_API_KEY) {
        return res.status(503).json({ error: 'O servico de validacao de telefone nao esta configurado.' });
    }

    try {
        const response = await axios.get(
            process.env.NUMVERIFY_API_URL || 'https://api.apilayer.com/number_verification/validate',
            {
                params: {
                    number: number,
                },
                headers: {
                    apikey: process.env.NUMVERIFY_API_KEY,
                },
                timeout: 10000,
            },
        );

        if (response.data.success === false) {
            throw new Error(response.data.error?.info || 'Erro na API NumVerify');
        }

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao validar o número:', error.message || error);
        res.status(500).send('Erro ao validar o número');
    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
