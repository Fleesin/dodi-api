const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./database/index');
const routes = require('./routes/routes');

const { log } = console;

const app = express();

// Esto es para evitar un error que evita la coneccion. Básicamente CORS es seguridad.
app.use(cors());

// Configure express to recieve JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Esto es para evitar que hagan infinitas peticiones al servidor, evitando que colapse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again after 15 minutes',
});

app.use(limiter);

// Aqui se agregan las rutas.
app.use('/', routes);

app.get('/', (req, res) => res.send('⭐'));

// Se hace la conección con la base de datos.
db.connect();
// Se inicia el servidor.
app.listen(process.env.PORT || 5000, () => log('Server running'));

module.exports = app;
