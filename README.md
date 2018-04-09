# be-assessment-2 Horeca Dating

![Screenshot](https://image.ibb.co/nQdPwc/image.png)

## Table of Contents
* [What is Horeca Dating](#app)
* [Installation](#install)
  * [Setting up NodeJS & MongoDB](#install1)
  * [Cloning this repository](#install2)
  * [Almost there](#install3)
* []

## <a name="app"></a> Horeca Dating :beers:
The new dating app for Horeca personnel. Say goodbye to missing each other out. Meet people that have the same days off and spend some quality time with them on those days!

## <a name="install"></a> Installation:
Here is a step by step guideline to install this app.

#### 1. <a name="install1"></a> Setting up NodeJs & MongoDB:

**_These steps can be skipped if you already have NodeJS and MongoDB installed._**

1. Make sure nodeJS is installed, check in terminal with:`node -v`
if it is installed it will return a value which is the version. :thumbsup:.  
If it is not installed go to [NodeJS](https://nodejs.org/en/) and download Node.
2. Let's install [MongoDB](https://www.mongodb.com/), first make sure [Homebrew](https://brew.sh/) is installed, follow the installation guide on their website.
3. To install MongoDB, copy this into the terminal:  
```bash
brew install mongodb
```

#### 2. <a name="install2"></a> Installing this repository:
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


#### 3. <a name="install3"></a> Install all dependencies:
Almost there!
1. Install all the dependencies:  
`` npm install ``
2. Start the server up:  
`` npm start ``
3. Browse to `localhost:3000` to view the dating app!
