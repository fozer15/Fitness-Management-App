const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "test7",
  password: "2231223122",
  port: 5432,
});

client
  .connect()
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.error("Connection error", err.stack));

module.exports = client;
