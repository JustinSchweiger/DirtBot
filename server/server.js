import express from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

const app = express();

app.get('/', (req, res) => {
    const transcript = req.query.transcript;

    if (!transcript || !existsSync(resolve(`./transcripts/${transcript}.html`))) {
        return res.sendFile(resolve('./server/templates/page-not-found.html'));
    }

    return res.sendFile(resolve(`./transcripts/${transcript}.html`));
});

app.listen(1234, () => {
    console.log(`Server listening at ${process.env.FRONTEND_URL}`);
});