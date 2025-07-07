-- migrations/xxxxxx_create_authentications_table.sql

CREATE TABLE authentications (
  token VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);