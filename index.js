const express = require('express');
const connectDB = require('./Config/db');
const cors = require('cors');
const dotenv = require("dotenv").config();
const app = express();

connectDB();



app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("hello working fine");
})

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoute'));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
