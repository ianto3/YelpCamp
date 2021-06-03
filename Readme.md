# YelpCamp

## Description

This project is part of ["The Web Developer Bootcamp 2021"](https://www.udemy.com/course/the-web-developer-bootcamp/) by Colt Steele.

During the development of this project i get to get hands on practice with technologies used during the course and build up my first full-stack application and learn to deploy in Heroku.

YelpCamp is an APP that allows users to post, search, view and rate campgrounds.


## Technologies used
- MongoDB (Using Mongoose)
- Node.js
- Express
- EJS
- Bootstrap
- Passport
- Cloudinary
- Mapbox


## Usage

### Env Variables

Create an .env file in the root folder and fill in the following variables:

```
CLOUDINARY_CLOUD_NAME= your cloudinary name
CLOUDINARY_KEY= your cloudinary key
CLOUDINARY_SECRET= your cloudinary secret

MAPBOX_TOKEN= token from mapbox
DB_URL= URL where your MongoDB is hosted, in my case through Mongo Atlas
```


### Installing dependencies

You must install the dependencies required, to do so exectue the following command in the root folder.

```
npm install
```


### Execution

You can run the application with the following command:

```
npm start
```


# Seeds

You have at your disposal a folder called "seeds" with which you may populate your mongo database.