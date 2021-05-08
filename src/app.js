/**
 * Archivo principal que contiene la configuración del servidor, middlewares y rutas
 *
 * @author llira
 * @version 1.0
 * @since 03/05/2021
 */
// Dependencies
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
// Local variables
require('./util/passport-config');
const app = express();
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const menuRouter = require('./routes/menu');
const orderRouter = require('./routes/order');

/**
 * Middlewares
 */
app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(cors());
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});
app.use(multer({ storage }).single('image'));

/**
 * Connect to the database
 */
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => console.log('Database connected'));
mongoose.connection.once('error', (err) => console.error('Error: ', err));

/**
 * Routes
 */
app.use('/api', authRouter);
app.use('/api/users', userRouter);
app.use('/api/menus/', menuRouter);
app.use('/api/orders', orderRouter);

module.exports = app;
