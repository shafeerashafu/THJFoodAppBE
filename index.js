const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const imageRoute = require("./routes/image");
const userRoute = require("./routes/user");
const foodRoute = require("./routes/food");
const orderRoute = require("./routes/order");

const app = express();

const cors = require("cors");
app.use(express.json());

dotenv.config();
const port = process.env.PORT || 8000;
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello world");
});

//connect db

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("connected to db")
    
  } catch (error) {
    console.log("error connecting to db")
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  
});
mongoose.connection.on("connected", () => {
  
});
app.use("/api/v1/all", imageRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/food", foodRoute);
app.use("/api/v1/order", orderRoute);

app.use(express.json({ limit: "2mb" }));

app.listen(port, () => {
  console.log(`Port listening on ${port}`);
  connect();
 
});
