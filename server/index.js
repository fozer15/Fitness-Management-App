const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;
const login = require("./routers/login");
const register = require("./routers/register");
const member = require("./routers/user");
const verifyToken = require("./routers/verify");

app.use(express.json());
app.use(cors());
app.use(login);
app.use(register);
app.use("/member", member);
app.use(verifyToken);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
