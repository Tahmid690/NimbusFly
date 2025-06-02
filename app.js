const express = require('express')
const cors = require('cors');
const airline = require('./routes/airlines')
const flight = require('./routes/flights')
const airport = require('./routes/airports');
const aircraft = require('./routes/aircrafts');
const authRoutes = require('./routes/auth');
const passenger=require('./routes/passenger')
const app = express()

app.listen(3000)
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use('/auth', authRoutes);
app.use('/airlines',airline);
app.use('/flights',flight);
app.use('/airports', airport);
app.use('/aircraft', aircraft);
app.use('/passenger',passenger);


app.get('/',(req,res)=>{
    res.send('<h1> NimbusFly </h1>'+'<p> We Lift, You Fly </p>');
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});
 



