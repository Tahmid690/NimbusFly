const express = require('express')
const airline = require('./routes/airlines')
const flight = require('./routes/flights')
const airport = require('./routes/airports');
const aircraft = require('./routes/aircrafts');
const authRoutes = require('./routes/auth');

const app = express()

app.listen(3000)
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/airlines',airline);
app.use('/flights',flight);
app.use('/airports', airport);
app.use('/aircraft', aircraft);

app.get('/',(req,res)=>{
    res.send('<h1> NimbusFly </h1>'+'<p> We Lift, You Fly </p>');
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});
 



