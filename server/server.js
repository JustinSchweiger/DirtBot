import express from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

const app = express();
const port = 1234;

app.get('/', (req, res) => {
    const ticket = req.query.ticket;

    if (!ticket || !existsSync(resolve(`./tickets/${ticket}.html`))) {
        return res.sendFile(resolve('./server/templates/page-not-found.html'));
    }

    return res.sendFile(resolve(`./tickets/${ticket}.html`));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});