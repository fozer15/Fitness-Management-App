# Project Setup Instructions

## Installing Node.js and NPM

Install Node.js from the official website:[ Node.js.](https://nodejs.org/en/download) (Don't worry, NPM will be included)

Once Node is downloaded, please check the installed Node version by running the following command in terminal:

- node -v

( it should show the current version of Node being used. I recommend using VScode )

## Installing Dependencies

Go into the client folder of the project and install dependencies using the following commands:

- cd client
- npm install

(It may take a while to download all the dependencies)

Go into the server folder of the project and install dependencies using the following commands:

- cd ../server
- npm install

## Running the Application

Open two separate terminals.

In the first terminal, go into the client directory and start the client application using the following commands:

- cd client
- npm start

(React Server will get started automatically on Port 3000. You can access it through this url http://localhost:3000/. It may take a while to render the UI)

In the second terminal, go into the server directory and start the server application using the following commands:

- cd ../server
- npm start

(Node Server will get started on Port 3001. Client will make requests to the the endpoint http://localhost:3001/).

All endpoints are written in the "user.js" file under the server folder.

## Database Setup

The DDL and DML files are located in the SQL folder.
Make sure to run these SQL queries before starting the application to set up the database.

### Note:


Go into the directory: 

- server/db

Open the file 

- pgDB.js

And make sure to replace any paths with the correct ones for your PostgreSQL Database.



