#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('chat:server');
var http = require('http');

const Mensaje = require('../models/mensaje.model');

// carga datos .env
require('dotenv').config();

// Conectar con MongoDB
require('../config/db');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

// Socket.io config
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  // console.log('Se ha conectado un nuevo cliente');

  // io.engine.clientsCount
  // Cuando se conecte un nuevo cliente, enviar el evento 'usuarios_chat' con el número de clientes conectados
  // En el front recogemos este evento y mostramos el número de usuarios conectados.
  const clientCount = io.engine.clientsCount;
  io.emit('usuarios_conectados', clientCount);

  socket.broadcast.emit('mensaje_chat', {
    nombre: 'BOT',
    mensaje: 'Se ha conectado un nuevo usuario.'
  });

  socket.on('mensaje_chat', async (data) => {

    // GUARDAR MENSAJE EN LA DB
    await Mensaje.create(data);
    // emito el mensaje al resto
    io.emit('mensaje_chat', data);
  });

  // Si en el servidor SOBRE EL SOCKET capturamos el evento disconnect, nos enteramos cuando un usuario sale del chat
  // Cuando un usuario salga del chat, hay que enviar un mensaje comunicándolo y enviar el evento que actualiza el número de clientes conectados.

  socket.on('disconnect', () => {
    io.emit('mensaje_chat', {
      nombre: 'BOT',
      mensaje: 'Se ha desconectado un usuario.'
    });

    io.emit('usuarios_conectados', io.engine.clientsCount);

  });

});


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


// Antes de renderizar la vista index.pug en el manejador, recupera los últimos 5 mensajes del chat
// Mensaje.find().sort(PENSAR EL SORT).limit(5)
// Pasamos los mensajes a la vista y los mostramos

