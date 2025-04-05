const fs = require('fs');
const path = require('path');
const rutaDatas =  path.join(__dirname, '../../src/data')
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const mediosDePago = require('../data/medios-de-pago');

const canchasDisponibles = JSON.parse(fs.readFileSync(`${rutaDatas}/canchas-disponibles.json`, 'utf-8'));

const reservas = JSON.parse(fs.readFileSync(`${rutaDatas}/reservas.json`, 'utf-8'));

const crearReserva = (req, res) => {
  // Obtenemos los datos de la reserva del cuerpo de la solicitud
  const { cancha, fecha, hora, idCliente: cliente } = req.body;
  // La fecha llega en formato DD/MM/YYYY
  // La hora llega en formato HH:mm

  // Validamos que los datos necesarios estén presentes
  if (!cancha || !fecha || !hora || !cliente) {
    return res.status(400).send('Faltan datos para la reserva');
  }

  //Validamos que la cancha exista en nuestro complejo deportivo
  const canchaExiste = Object.keys(canchasDisponibles).includes(cancha);
  if (!canchaExiste) {
    return res.status(400).send('El tipo de cancha solicitada no existe');
  }

  // Validamos que la cancha solicitada esté disponible en la fecha y hora solicitadas
  const fechaHoraReserva = moment(`${fecha} ${hora}`, 'DD/MM/YYYY HH:mm');

  const reservasCanchaExistente = reservas
        .filter(reserva => reserva.cancha === cancha)
        .filter(reserva => moment(reserva.fecha_hora).isSame(fechaHoraReserva));

  if (reservasCanchaExistente.length > 0) {
    return res.status(400).send('La cancha solicitada no está disponible en la fecha y hora solicitadas');
  };

  const reserva = {
    id: uuidv4(), 
    cancha: cancha,
    fecha_hora: fechaHoraReserva.format('YYYY-MM-DDTHH:mmZ'),
    cliente: cliente,
    estado: 'confirmada',
    monto: canchasDisponibles[cancha].precio,
  }

  // Guardamos la reserva en el archivo JSON
  reservas.push(reserva);
  guardarEnLaBaseDeDatos();

  res.status(201).send(`Reserva de ${cancha} recibida`);
}

const obtenerTodasLasReservas = (req, res) => {
  res.status(200).json(reservas);
}

const obtenerReservasPorQuery = (req, res) => {
  const { fecha, cliente, estado } = req.query;
  let reservasFiltradas = reservas;
  if (fecha) {
    const fechaConsulta = moment(fecha, 'DD/MM/YYYY');
    reservasFiltradas = reservasFiltradas.filter(
      reserva => moment(reserva.fecha_hora).isSame(fechaConsulta, 'day')
    );
  }

  if (cliente) {
    reservasFiltradas = reservasFiltradas.filter( reserva => reserva.cliente === cliente);
  }

  if (estado) {
    reservasFiltradas = reservasFiltradas.filter( reserva => reserva.estado === estado);
  }

  return res.status(200).json(reservasFiltradas);
}

const pagarReserva = (req, res) => {
  // ir a buscar si la reserva existe
  const idReserva = req.params.id;

  const reserva = reservas.find(reserva => reserva.id === idReserva);
  if (!reserva) {
    return res.status(404).send('Reserva no encontrada');
  }

  // verificar si el medio de pago es correcto
  const { medio, monto } = req.body;

  const medioDePago = mediosDePago.includes(medio);
  if (!medioDePago) {
    return res.status(400).send('El medio de pago no es correcto');
  }

  // verificar si el monto es correcto
  if (monto !== reserva.monto) {
    return res.status(400).send('El monto no es correcto');
  }

  // verificar si la reserva ya fue pagada
  if (reserva.estado === 'pagada') {
    return res.status(400).send('La reserva ya fue pagada con anterioridad');
  }

  // cambiar el estado de la reserva a pagada
  reserva.estado = 'pagada';

  // guardar la reserva en el archivo JSON
  const posicionEnElArreglo = reservas.findIndex(reserva => reserva.id === idReserva);
  reservas[posicionEnElArreglo] = reserva;

  guardarEnLaBaseDeDatos();

  res.status(200).send('Reserva pagada');
}

const guardarEnLaBaseDeDatos = () => {
  fs.writeFileSync(`${rutaDatas}/reservas.json`, JSON.stringify(reservas, null, 2), 'utf-8');
}

module.exports = {
  crearReserva,
  obtenerTodasLasReservas,
  obtenerReservasPorQuery,
  pagarReserva
}