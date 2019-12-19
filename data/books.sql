DROP TABLE IF EXISTS books;

CREATE TABLE books
(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  image_url TEXT,
  description TEXT,
  bookshelf TEXT,
  publisher VARCHAR
  (255),
  publisheddate VARCHAR
  (30),
  pagecount VARCHAR
  (5),
  averagerating VARCHAR
  (5)
);
