USE employee_tracker_db;

INSERT INTO department (name)
VALUES ("Development"),("Marketing"),("Design"),("Production"),("Mananging"),("Sales");

INSERT INTO role (title,salary,department_id)
VALUES ("Designer",65000,3),
("Software Developer",90000,1),
("Engineer",75000,4),
("Director of Marketing",70000,2),
("Operation Manager",100000,5),
("Sales Associate",50000,6);

INSERT INTO employee (first_name,last_name,role_id)
VALUES ("Augusto","Martinez",2),
("Hernan","Martinez",3),
("Gabriela","Santacruz",1),
("Tania","Murphy",4);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ("Aaron","Martinez",6,1);


SELECT department.name, sum(role.salary) 
FROM employee 
JOIN role on employee.role_id = role.id 
JOIN department on role.department_id = department.id 
WHERE department_id = 1 
GROUP by department.id; 


