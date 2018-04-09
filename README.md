# be-assessment-2 Horeca Dating

![Screenshot](https://image.ibb.co/nQdPwc/image.png)

## Table of Contents
* [What is Horeca Dating](#app)
* [Installation](#install)
  * [Setting up NodeJS & MongoDB](#install1)
  * [Cloning this repository](#install2)
  * [Install all dependencies](#install3)
* [Node Dependencies Used](#dependencies)
* [Shortcuts](#shortcuts)
* [Documentation on Horeca Dating](#documenting)

## Horeca Dating :beers: <a name="app"></a>
The new dating app for Horeca personnel. Say goodbye to missing each other out. Meet people that have the same days off and spend some quality time with them on those days!

## Installation: <a name="install"></a>
Here is a step by step guideline to install this app.

#### 1. Setting up NodeJs & MongoDB: <a name="install1"></a>

**_These steps can be skipped if you already have NodeJS and MongoDB installed._**

1. Make sure nodeJS is installed, check in terminal with:`node -v`
if it is installed it will return a value which is the version. :thumbsup:.  
If it is not installed go to [NodeJS](https://nodejs.org/en/) and download Node.
2. Let's install [MongoDB](https://www.mongodb.com/), first make sure [Homebrew](https://brew.sh/) is installed, follow the installation guide on their website.
3. To install MongoDB, copy this into the terminal:  
```bash
brew install mongodb
```

#### 2. Installing this repository: <a name="install2"></a>
1. Open the terminal.
2. Make the desired folder where you wish this repository to be.
3. `cd` into the folder, like so:  
```bash
cd Documents/~path
```

4. Install this repository by copying this into the terminal:  
``` bash
git clone https://github.com/gijslaarman/be-assessment-2.git
```

5. To use MongoDB we have to make a database folder:  
``` bash
mkdir db
```
6. Then tell Mongo to use that path for the database:  
```bash
mongod --dbpath db
```
7. Start up MongoDB:  
```bash
mongo
```
You are now in the mongo shell, here you can access your locally stored databases. Use [MongoDB Compass](https://www.mongodb.com/products/compass) if you want a more visual UI.

8. Let's make the database:  
```bash
use horecadating
```
```bash
db.runCommand({ create: "users" })
```

9. Exit out of the mongoDB shell `CMD + .`, we need to make a new file .env (you can add this to your .gitignore file.)
```bash
touch .env
```
```bash
echo "DB_HOST=localhost
DB_PORT=27017
DB_NAME=horecadating
DB_USER=root
SESSION_SECRET=ilovehoreca" >> .env
```

Here we will save the database name (DB_NAME) you should keep the HOST, PORT & ROOT as it is, if you want to run this app on your localhost. Or adjust it if you know what you're doing.


#### 3. Install all dependencies: <a name="install3"></a>
Almost there!
1. Install all the dependencies:  
```bash
 npm install
```
2. Start the server up:  
``` bash
npm start
```
3. Browse to `localhost:3000` to view the dating app!

## Dependencies Used <a name="dependencies"></a>

For this project I used:
* [NodeJS](Nodejs.org): which I used to following packages for:
  * [argon2](https://www.npmjs.com/package/argon2): To hash the passwords, because privacy is a sensitive thing.
  * [body-parser](https://www.npmjs.com/package/body-parser): body-parser is a middleware that handles incoming HTTP POST requests for [express.js](https://www.npmjs.com/package/express)
  * [dotenv](https://www.npmjs.com/package/dotenv): Keeps the sensitive database keys in a seperate hidden file.
  * [ejs](https://www.npmjs.com/package/ejs): I used ejs to render my templates, since I am more familiar with this than I am with f.e: [handlebars](https://www.npmjs.com/package/handlebars).
  * [express](https://www.npmjs.com/package/express): A framework build upon NodeJS. It's fast and minimalistic.
  * [express-session](https://www.npmjs.com/package/express-session): To keep users logged in I used the express-session package. Express-sesssion sends cookies to the client for you.
  * [mongodb](https://www.npmjs.com/package/mongodb): To create a connection between MongoDB and NodeJS
  * [multer](https://www.npmjs.com/package/multer): For uploading photo's to the app.
  * [nodemon](https://www.npmjs.com/package/nodemon): Because manually restarting is lame.
* [MongoDB](mongodb.com): To store my data in a database. I used mongo instead of MYSQL because:
  * I think making queries in Mongo is easier.
  * A better overview of the database with MongoDB Compass

## Shortcuts <a name="shortcuts"></a>
To start up the server:
```bash
npm start
```

Start up nodemon, so everytime you save the index.js the server will restart with the applied changes:
```bash
npm test
```

## Documentation on Horeca Dating <a name="documenting"></a>

Horeca Dating contains the following pages:
* **Login / '/'**: This is where the client will be directed to if he/she is not logged in. I wanted to make the start page and login into one page.
* **Register**: Directed to '/signup' accessible through login. A user has to fill in a form, with plenty of error handling:
  * If email already exists.
  * If the email is a valid email adres.
  * If passwords do not match.
  * If the minimum age is not higher than the maximum age.   
  **When one of the above is true, the page will be rendered with an error message and most of the data is put back in as a value, for user convenience.**
* **Dashboard**: This page is actually still a work in progress, currently it only links to your potential matches, _later I am adding a chatting system as well._
* **Matches**: Here all your potential matches shown, these are based on your preferred gender, age and the key function what days you are off work.
* **Detail of matches**: Renders a detail page of one of your matches. _I want to add a send message function from here._
* **My account**: Get an overview of your details. _Adding editing account details later_.
* **Error page**: Renders error with a picture with the corresponding error code.
