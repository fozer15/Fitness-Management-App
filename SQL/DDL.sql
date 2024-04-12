CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL, 
    address TEXT,
    phone VARCHAR(20),
    fullName VARCHAR(255) NOT NULL
);

CREATE TABLE trainers (
    trainer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    fullName VARCHAR(255) NOT NULL,
    bio VARCHAR(255) NOT NULL,
    salary DECIMAL(10, 2) 
);

CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

CREATE TABLE rooms(
  room_number SERIAL PRIMARY KEY,
  capacity INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL
);

CREATE TABLE admins(
  admin_id SERIAL PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  address TEXT,
  role  VARCHAR(255) NOT NULL,
  phone VARCHAR(20)
);

CREATE TABLE groupClasses(
  class_id SERIAL PRIMARY KEY,
  capacity INTEGER NOT NULL,
  noOfMembers INTEGER DEFAULT 0,
  scheduledBy INTEGER REFERENCES admins(admin_id),
  classType VARCHAR(255) NOT NULL,
  assignedTrainer INTEGER REFERENCES trainers(trainer_id),
  assignedRoom INTEGER REFERENCES rooms(room_number)
);

CREATE TABLE schedules(
    schedule_id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(trainer_id),
    groupclass_id INTEGER REFERENCES groupclasses(class_id),
    dayOfWeek day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE classRegistrations(
    registration_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id),
    groupClass_id INTEGER REFERENCES groupClasses(class_id),
    UNIQUE(member_id,groupClass_id)
);

CREATE TABLE trainingSessions(
    session_id SERIAL PRIMARY KEY,
    scheduledBy INTEGER REFERENCES members(member_id),
    assignedTrainer  INTEGER REFERENCES trainers(trainer_id),
    roomBooked  INTEGER REFERENCES rooms(room_number), 
    dayOfWeek day_of_week_enum NOT NULL,
    start_time TIME,
    end_time TIME
);

CREATE TABLE bills(
    bill_id SERIAL PRIMARY KEY,
    billType VARCHAR(255) NOT NULL,
    dueDate DATE NOT NULL,
    amount INTEGER NOT NULL,
    issuedDate DATE NOT NULL,
    paymentStatus BOOLEAN DEFAULT FALSE,
    trainingSessionID INTEGER REFERENCES trainingSessions(session_id),
    issuedBy INTEGER REFERENCES admins(admin_id),
    paidBy  INTEGER REFERENCES members(member_id)
);



CREATE TYPE maintenance_status_enum AS ENUM ('available', 'in maintenance', 'removed');

CREATE TABLE equipments(
  equip_id SERIAL PRIMARY KEY,
  locatedAt INTEGER REFERENCES rooms(room_number),
  equip_type VARCHAR(255) NOT NULL,
  maintenance_status maintenance_status_enum DEFAULT 'available'
);


CREATE TYPE metric_type AS ENUM (
    'Blood Pressure',
    'Heart Rate',
    'Blood Sugar',
    'Weight',
    'BMI'
);

CREATE TABLE HealthMetrics(
    member_id  INTEGER REFERENCES members(member_id),
    metric_type metric_type NOT NULL,
    currentValue INTEGER,
    targetValue INTEGER,
    PRIMARY KEY (member_id, metric_type),
);