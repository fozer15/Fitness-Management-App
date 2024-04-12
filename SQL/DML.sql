INSERT INTO trainers (email, password, address, phone, fullName, bio, salary) 
VALUES 
    ('trainer1@example.com', 'password1', '123 Trainer St, City', '123-456-7890', 'John Doe', 'Fitness enthusiast with 5 years of experience', 50000.00),
    ('trainer2@example.com', 'password2', '456 Trainer Ave, Town', '234-567-8901', 'Jane Smith', 'Certified personal trainer specializing in weight loss', 60000.00),
    ('trainer3@example.com', 'password3', '789 Trainer Blvd, Village', '345-678-9012', 'Mike Johnson', 'Former athlete turned fitness coach', 55000.00),
    ('trainer4@example.com', 'password4', '987 Trainer Rd, Hamlet', '456-789-0123', 'Sarah Brown', 'Passionate about helping clients achieve their fitness goals', 58000.00);

INSERT INTO admins (fullName, address, phone, email, role, password) VALUES
  ('John Doe', '123 Main St, City, Country', '123-456-7890', 'john.doe@example.com', 'Manager', 'password123'),
  ('Jane Smith', '456 Elm St, City, Country', '987-654-3210', 'jane.smith@example.com', 'Trainer', 'password456'),
  ('Alice Johnson', '789 Oak St, City, Country', '456-789-0123', 'alice.johnson@example.com', 'Receptionist', 'password789'),
  ('Michael Brown', '321 Pine St, City, Country', '555-123-4567', 'michael.brown@example.com', 'Maintenance Staff', 'passwordabc'),
  ('Sarah Lee', '789 Maple St, City, Country', '555-987-6543', 'sarah.lee@example.com', 'Nutritionist', 'passworddef'),
  ('David Clark', '456 Cedar St, City, Country', '555-234-5678', 'david.clark@example.com', 'Marketing Manager', 'passwordghi'),
  ('Emily White', '654 Birch St, City, Country', '555-876-5432', 'emily.white@example.com', 'Event Coordinator', 'passwordjkl');

INSERT INTO rooms (capacity, description)
VALUES 
    (20, 'Room 1'),
    (30, 'Room 2'),
    (25, 'Room 3'),
    (15, 'Room 4'),
    (40, 'Room 5');

-- Insert equipments located at rooms
INSERT INTO equipments (locatedAt, equip_type, maintenance_status)
VALUES 
    (1, 'Treadmill', 'available'),
    (2, 'Exercise Bike', 'available'),
    (3, 'Elliptical Machine', 'in maintenance'),
    (4, 'Rowing Machine', 'available'),
    (5, 'Weight Bench', 'removed'),
    (1, 'Dumbbells', 'available'),
    (2, 'Kettlebell', 'available'),
    (3, 'Yoga Mat', 'available'),
    (4, 'Resistance Bands', 'in maintenance'),
    (5, 'Jump Rope', 'available');