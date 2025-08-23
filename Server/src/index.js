require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const Main = require("./config/DataBase");
const Auth = require("./Routes/AuthRoutes");
const CartRouter = require("./Routes/CartRoutes");
const AdminRoutes = require("./Routes/AdminRoutes");
const getdata = require("./Routes/getDataRoutes")

app.use(express.json());
app.use(cookieParser());

// CORS setup for frontend
const allowedOrigins = ['https://ghar-ka-achar-nine.vercel.app',"http://localhost:5173"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Error: Origin not allowed - " + origin));
    }
  },
  credentials: true
})); 
 
// Routes
app.use('/user', Auth);
app.use('/cart', CartRouter);
app.use('/admin',AdminRoutes);
app.use('/getdata',getdata);

// Start server
async function connection() {
  try {
    await Main();
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server listening at ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

connection();
