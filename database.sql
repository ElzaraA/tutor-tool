CREATE TABLE pupils (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    average_score DECIMAL(2,1) NOT NULL,
    homework_completed INTEGER NOT NULL
);