DROP TABLE IF EXISTS books;

CREATE TABLE books
(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  image_url TEXT,
  description TEXT,
  bookshelf TEXT
);

-- INSERT INTO books
--   (title, author, isbn, image_url, description, bookshelf)
-- VALUES
--   ('titletest', 'authortest', 'isbntest', 'imagetest', 'descriptiontest', 'fantasy');
