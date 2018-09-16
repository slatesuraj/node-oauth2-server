# Node oAUth2 Server

This is a oAuth2 server implementation in nodejs using Sequalise ORM for postgres database.

# Setup

Install Postgres and create database

    create database oauthdb;
    CREATE USER oauth WITH PASSWORD '12345678oauth' ;
    grant all privileges on database oauthdb to oauth ;

Install npm packages

    npm install

# Running Server

    npm start

Server will be available on port [http://localhost:3000](http://localhost:3000). The web framework is provided via [express](https://expressjs.com/) package.

Note: There is a file called ".env". You can modify that file according to the need.
