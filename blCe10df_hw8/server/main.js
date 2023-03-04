"use strict";

import express from 'express';
const app = express();

app.get('/api', (request, response) => {
  response.json({ message: 'working' });
});

app.listen(8081, () => { console.log('app started'); });
