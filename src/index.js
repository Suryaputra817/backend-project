import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
// in connectDB we only connected database but then we have to tell that what we want to do with the connected database like here we are lintening to the port
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB failed !!", err);
  });
