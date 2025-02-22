import dotenv from "dotenv";
import connectDB from "./db/connectionDB.js";
import app from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch();
