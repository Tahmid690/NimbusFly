const express = require('express')
const airline = require('./routes/airlines')
const app = express()

app.listen(3000)
app.use(express.json());

app.use('/airlines',airline);

app.get('/',(req,res)=>{
    res.send('<h1> NimbusFly </h1>'+'<p> We Lift, You Fly </p>');
});


 



