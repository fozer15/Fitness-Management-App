Link To Demonstration Video: https://www.youtube.com/watch?v=elnUu6WJPMw. 
(ER diagram and Relation Schema looked blury for somereason but you can find the high resolution versions in the Report PDF )

# Project Setup Instructions

## Installing Node.js and NPM

Install Node.js from the official website:[ Node.js.](https://nodejs.org/en/download) (Don't worry, NPM will be included)

Once Node is downloaded, please check the installed Node version by running the following command in terminal:

- node -v

( it should show the current version of Node being used)

## Installing Dependencies (I highly recommend using VScode)

Go into the client folder of the project and install dependencies using the following commands:

- cd client
- npm install

(Downloading all dependencies may take some time. During this process, the installation may appear to be frozen for a moment. Please be patient and allow it to complete.)

Go into the server folder of the project and install dependencies using the following commands:

- cd ../server
- npm install

## Running the Application

Open two separate terminals.

In the first terminal, go into the client directory and start the client application using the following commands:

- cd client
- npm start

(React Server will get started automatically on Port 3000. You can access it through this url http://localhost:3000/. It may take a while to render the UI, please be patient)

All the components that make requests to the server are under the "client/src/pages/home" folder. If you go into this folder, you can see that each user type (member, trainer, admin) has its own folder.
 
In the second terminal, go into the server directory and start the server application using the following commands:

- cd ../server
- npm start

(Node Server will get started on Port 3001. Client will make requests to the the endpoint http://localhost:3001/).

All the endpoints that the client makes requests to are written in the "user.js" file under the "server/routers" folder. This is the file where you should look for function implementations and their corresponding SQL queries.

## Database Setup

The DDL and DML files are located in the SQL folder.
Make sure to run these SQL queries before starting the application to set up the database.

##  Notes:

Please make sure to replace any paths with the correct ones for your PostgreSQL Database.

Go into the directory: 

- server/db

Open the file

- pgDB.js
  
And set the values (user, host, database, password, port).




