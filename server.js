const app = require("./app");
const db = process.env.DATABASE_URL;
const connectDB = require("./db");

connectDB(db);

app.listen(4000, () => console.log("Server running on 4000"));
