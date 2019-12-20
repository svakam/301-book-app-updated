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
      response.render('pages/index', { bookArray: bookshelf });
    })
    .catch(error => console.error(error));
};

let searchBookArray = [];

function getBookInfo(request, response) {
  searchBookArray = [];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  let typeOfSearch = request.body.search[1];
  let searchQuery = request.body.search[0];
  if (typeOfSearch === 'title') {
    url += `+intitle:${searchQuery}`;
  }
  if (typeOfSearch === 'author') {
    url += `+inauthor:${searchQuery}`;
  }

  superagent.get(url)
    .then(results => {
      if (results.body.items) {
        let bookArr = results.body.items.map((object) => {
          return new Book(object.volumeInfo);
        });
        response.render('pages/searches/show', { bookArray: bookArr });
      }
      else {
        response.render('pages/error');
      }
    })
    .catch(error => console.error(error));
}

// add https:// to links if not already https://
let addHttps = (string) => {
  let domain = string.substr(0, 5);
  let prefix = 'https';

  if (string.substr(0, prefix.length) !== prefix) {
    string = string.substr(4, string.length);
    string = prefix + string;
  }
  return string;
}

// constructor
function Book(bookObj) {
  this.title = bookObj.title || 'no title available';
  if (bookObj.authors) {
    this.author = bookObj.authors[0] || 'no author available';
  }
  this.publisher = bookObj.publisher;
  this.publishedDate = bookObj.publishedDate;
  this.description = bookObj.description || '(no description available)';
  this.isbn = bookObj.industryIdentifiers[0].identifier;
  this.pageCount = bookObj.pageCount;
  if (bookObj.categories) {
    this.bookshelf = bookObj.categories[0];
  }
  if (bookObj.averageRating) {
    this.averageRating = bookObj.averageRating;
  }
  if (bookObj.imageLinks) {
    this.image_url = addHttps(bookObj.imageLinks.thumbnail) || '(no image available)';
  }
  searchBookArray.push(this);
}

function getDetails(request, response) {
  let isbn = request.params.isbn;
  for (let i = 0; i < searchBookArray.length; i++) {
    if (searchBookArray[i].isbn === isbn) {
      response.render('pages/books/detail', { book: searchBookArray[i] });
    }
  }
}

function addBook(request, response) {
  let { title, author, publisher, publisheddate, description, isbn, pagecount, bookshelf, averagerating, image_url } = request.body;

  let sql = 'INSERT INTO books (title, author, publisher, publisheddate, description, isbn, pagecount, bookshelf, averagerating, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';
  let safeValues = [title, author, publisher, publisheddate, description, isbn, pagecount, bookshelf, averagerating, image_url];

  client.query(sql, safeValues);

  response.redirect('/');
}

function editDetails(request, response) {
  let { title, author, publisher, publisheddate, pagecount, bookshelf, averagerating } = request.body;
  console.log(request.params.id)
  let id = request.params.id
  let sql = "UPDATE books SET title=$1, author=$2, publisher=$3, publisheddate=$4, pagecount=$5 , bookshelf=$6, averagerating=$7 WHERE id=$8";
  let safeValues = [title, author, publisher, publisheddate, pagecount, bookshelf, averagerating, id];

  client.query(sql, safeValues);
  response.redirect('/');
}

function showEdit(request, response) {
  // console.log(request.params);
  // find book in database that matches request.params.isbn
  let isbn = request.params.isbn;
  let sql = "SELECT * FROM books WHERE isbn = $1;";
  let safeValues = [isbn];
  client.query(sql, safeValues)
    .then(results => {
      let selectedBook = results.rows[0];
      console.log(selectedBook)
      response.render('pages/books/edit', { book: selectedBook });
    }).catch(error => console.error(error));
}

app.get('/', getHome); // index.ejs
app.post('/searches', getBookInfo); // searches/show.ejs
app.get('/details/:isbn', getDetails); // pages/books/detail.ejs
app.post('/edit/:id', editDetails);
app.get('/edit/:isbn', showEdit);
app.post('/add', addBook);

// connect and start server
client.connect(() => {
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});

