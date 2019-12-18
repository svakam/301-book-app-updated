'use strict';

const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
require('ejs');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  console.error(err);
});

function getHome(request, response) {
  let sql = 'SELECT * FROM books';
  client.query(sql)
    .then(results => {
      let bookshelf = results.rows;
      console.log(bookshelf);
      response.render('pages/index', { bookArray: bookshelf });
    })
    .catch(error => console.error(error));
};

app.get('/', getHome); // index.ejs

// connect and start server
client.connect(() => {
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});

