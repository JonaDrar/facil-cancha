const { Router } = require('express');
const { crearReserva, obtenerTodasLasReservas, obtenerReservasPorQuery, pagarReserva } = require('../controllers/reservas.controller');
const reservasRouter = Router();

reservasRouter.get('/', obtenerTodasLasReservas);
reservasRouter.post('/', crearReserva);
reservasRouter.get('/query', obtenerReservasPorQuery);
reservasRouter.patch('/pagar/:id', pagarReserva);

module.exports = reservasRouter;