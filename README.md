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
* [What I thought](#WIT)

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
* **Login & '/'**: This is where the client will be directed to if he/she is not logged in. I wanted to make the start page and login into one page.
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

How the user schema looks, this gets filled in through the registration:
```
"_id": "5aca516db2a67048f2cd3cff",
"firstname": "Gijs",
"lastname": "Laarman",
"age": "21",
"gender": "male",
"place": "Amsterdam",
"email": "gijslaarman@live.nl",
"password":"$argon2i$v=19$m=4096,t=3,p=1$vaUGQtKcBRJfzxWsjCOJ+Q$vB35lQDf4X1Qr4XhU9c49+39bYhpYInFD+s/dO4brNY",
"preference": {
  "genderPref": "female",
  "minAge": "18",
  "maxAge": "22",
  "drink": "bier",
  "person": "avond",
  "days":["maandag","dinsdag"]
},
"userPhoto": "ff4e2601b696610e878932777f4cfcdd", // This is the file name.
"bio": "Ik ben Gijs"}
```

This is one row in the 'users' database. If the user does not fill in the non required fields it will stay empty, and the User will get the placeholder photo. When the user logs in it will make a req.session.user filled with this data. From there the EJS template get their data.

**Small overview of things I still intended to do:**
- [ ] Add chat system
- [ ] Edit data of your Account
- [ ] Make the dashboard show all the chats you currently have with a person.
- [ ] ~ Being able to send a person a "like"

'~' = Not a must

## What I thought <a name="WIT"></a>
I found this a very very though project, but also very informative. I learned a lot, not only a new way of creating websites but also how to better think like a programmer. I got more patient with coding and understand that Rome is not build in a one day. I definitely feel like front-end is my thing, I enjoy coding and solving my problems gives a me happy boost (as my friends and housemates might have noticed, I do shout very loud when it works.)

This project helped my improve my knowledge, it had a very steep learning curve, which demotivated me for a week, I started trailing behind, but spending long days on improving this knowledge helped me come back into the project. I do think that I could have done a lot more if I had one more week, but I suppose you could say that after that one week as well.

Overall I was very happy with my teachers, they helped me motivate me and show that this is fun. This project is not for everyone and only people that actually dare to invest time in learning how to code.

****
