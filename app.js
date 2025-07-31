const express = require('express')
const cors = require('cors');
const airline = require('./routes/airlines')
const flight = require('./routes/flights')
const airport = require('./routes/airports');
const aircraft = require('./routes/aircrafts');
const authRoutes = require('./routes/auth');
const passenger=require('./routes/passenger')
const bookings=require('./routes/bookings');
const customer=require('./routes/customer');
const ticket=require('./routes/ticket')
const payment=require('./routes/payment')
const seat=require('./routes/seat')
const admin=require('./routes/airline_admin')
const contact=require('./routes/contact')
require('dotenv').config();
const app = express()

app.use(cors({
  origin: [process.env.FRONTEND_SERVER, "https://nimbus-fly.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors({
  origin: "https://nimbus-fly.vercel.app",
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


console.log('Your SMTP_HOST:', process.env.SMTP_HOST);
app.use('/auth', authRoutes);
app.use('/airlines',airline);
app.use('/flights',flight);
app.use('/airports', airport);
app.use('/aircraft', aircraft);
app.use('/passenger',passenger);
app.use('/bookings',bookings);
app.use('/customer',customer);
app.use('/tickets',ticket);
app.use('/payments',payment);
app.use('/seats',seat);
app.use('/admin',admin)
app.use('/contact',contact);
app.get('/',(req,res)=>{
    res.send('<h1> NimbusFly </h1>'+'<p> We Lift, You Fly </p>');
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
 



