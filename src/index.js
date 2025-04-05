const express = require('express');
const { healtcheck } = require('./controllers/healtcheck.controller');
const { crearReserva, obtenerTodasLasReservas } = require('./controllers/reservas.controller');
const reservasRouter = require('./routes/reservas.routes');
require('dotenv').config();

const app = express();
app.use( express.json() );

app.get('/', healtcheck);

app.use('/reserva', reservasRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Escuchando reservas en el puerto ${port}`);
});