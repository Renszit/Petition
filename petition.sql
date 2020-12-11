DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS petition;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      pass VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE petition (
     id SERIAL PRIMARY KEY,
     signature VARCHAR NOT NULL CHECK (signature != ''),
     user_id INTEGER NOT NULL REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(255),
  url VARCHAR(255),
  user_id INT NOT NULL UNIQUE REFERENCES users(id)
);



