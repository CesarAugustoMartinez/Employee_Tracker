const logo = require('asciiart-logo');
const inquirer = require("inquirer");
const setTable = require("console.table");
const connection = require("./db/connection");

console.log( // Creating a logo for the app using the package 'asciiart-logo'
    logo({
        name: 'Employee Tracker',
        font: 'Speed',
        lineChars: 10,
        padding: 2,
        margin: 3,
        borderColor: 'grey',
        logoColor: 'bold-green',
        textColor: 'green',
    })
    .emptyLine()
    .right('version 1.0.0')
    .emptyLine()
    .center('Author: Cesar A Martinez')
    .render()
);


// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    console.log("Connected as id " + connection.threadId + "\n");
    start();
  });


function start() {
    inquirer //To display a menu where the user will select an option
      .prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
          "View all Employees",
          "View all Employees by Department",
          "View all Employees by Manager",
          "Add Employee",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager",
          "View all Roles",
          "Add Role",
          "Remove Role",
          "Update Role",
          "View all Departments",
          "Add Department",
          "Remove Department",
          "View the total utilized budget of a Department",
          "Exit"
        ]
      })
      .then(function(answer) {
        switch (answer.action) { // Calling a function according selected option.
        case "View all Employees":
            console.clear();
            viewEmployees();
            break;
  
        case "View all Roles":
            console.clear();
            viewRoles();
            break;
  
        case "View all Departments":
            console.clear();  
            viewDepartments();
            break;

        case "View all Employees by Manager":
            console.clear();
            viewEmployeesManager();
            break;
        case "Add Department":
            console.clear();
            addDepartment();
            break;
        case "Add Role":
            console.clear();
            addRole();
            break;
        case "Add Employee":
            console.clear();
            addEmployee();
            break;
        case "Update Employee Role":
            console.clear();
            updateEmployeeRole();
            break;
  
        case "Exit":
          connection.end();
          break;
        }
      });
  }

  function viewEmployees(){ // Function to display all employees from the Database
      console.log("Selecting all Employees....\n");
    var query = "SELECT * FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;
         console.table(res);
         start();
    });
  }

  function viewRoles(){ // Function to display all roles from the Database
    console.log("Selecting all Roles....\n");
  var query = "SELECT * FROM role";
  connection.query(query, function(err, res) {
      if (err) throw err;
       console.table(res);
       start();
  });
}

function viewDepartments(){ // Function to display all departments from the Database
    console.log("Selecting all Departments....\n");
  var query = "SELECT * FROM department";
  connection.query(query, function(err, res) {
      if (err) throw err;
       console.table(res);
       start();
  });
}


function viewEmployeesDepartment(){
    console.log("Selecting all Employees by Department....\n");
     // query the database for all departments
    connection.query("SELECT * FROM department", function(err, res) {
    if (err) throw err;
    // once you have the departments, prompt the user for which they'd like 
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var departmentArray = [];
            for (var i = 0; i < res.length; i++) {
              departmentArray.push(res[i].name);
            }
            return departmentArray;
          },
          message: "What department would you like to select?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen department
        var chosenDepartment;
        for (var i = 0; i < res.length; i++) {
          if (res[i].name === answer.choice) {
            chosenDepartment = res[i];
          }
        }
        var query = "SELECT * FROM employee WHERE ?";
        connection.query(query,
            [ 
             {
                deparment_id: chosenDepartment.id
             } 
            ], 
            function(err, res) {
                if (err) throw err;
                console.table(res);
                start();
            });               
      });
  });
}

function viewEmployeesManager(){ // Function to display all employees under a selected manager from the Database
    console.log("Selecting all Managers....\n");
     // query the database for all managers
    connection.query("SELECT e1.id, e1.first_name, e1.last_name FROM employee e1 JOIN employee e2 on e1.id = e2.manager_id", function(err, res) {
    if (err) throw err;
    // once you have the departments, prompt the user for which they'd like
    // console.table(res); 
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var managerArray = [];
            for (var i = 0; i < res.length; i++) {
              managerArray.push(res[i].first_name + " " + res[i].last_name);
            }
            return managerArray;
          },
          message: "What Manager would you like to select?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen manager
        var chosenManagerId;
        for (var i = 0; i < res.length; i++) {
          if (res[i].first_name + " " + res[i].last_name === answer.choice) {
            var chosenManager = (res[i].first_name + " " + res[i].last_name);  
            chosenManagerId = res[i].id;
          }
        }
        var query = `SELECT * FROM employee WHERE manager_id=${chosenManagerId}`;
        connection.query(query,function(err, res) {
                if (err) throw err;
                console.log("Selecting all Employees whose Manager is " + chosenManager + "\n");    
                console.table(res);
                start();
            });               
      });
  });
}

function addDepartment(){ // Function to add a new department
  inquirer
        .prompt({            
            name: "name",
            type: "input",
            message: "Please, enter name of new Department: "
        })
        .then(answers => {
            //Inserting new value to department table
            console.log("Creating new department...\n");
            connection.query("INSERT INTO department SET ?",
            {
                name: answers.name                
            },
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " record inserted!\n");
                // Call updateProduct AFTER the INSERT completes                
                start();
            }
            );
        })
        .catch(error => {
            if(error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
            } else {
            // Something else when wrong
            }
    });
}

function addRole(){ // Function to add a new Role
  connection.query("SELECT * FROM department", function(err, res) {
  if (err) throw err;
  inquirer
        .prompt([{            
            name: "title",
            type: "input",
            message: "Please, enter the new title: "
        }, {            
            name: "salary",
            type: "input",
            message: "Please, enter the salary: "
        },{
          name: "choice",
          type: "rawlist",
          choices: function() {
            let departmentArray = [];
            for (var i = 0; i < res.length; i++) {
                  departmentArray.push(res[i].name);
                }           
            return departmentArray;
            },
          message: "What Department would you like to select?"
          }
        ])
        .then(answers => {
            // Searching department Id from query.
            let departmentID;
            for (i=0; i< res.length;i++){
               if (res[i].name === answers.choice) {
                 departmentID = res[i].id;
               } 
            }
            console.log("Creating new Role...\n");
            //Inserting new value to role table
            connection.query("INSERT INTO role SET ?",
            {
                title: answers.title,
                salary: parseInt(answers.salary),
                department_id: departmentID              
            },
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " record inserted!\n");
                start();
            }
            );
        })
        .catch(error => {
            if(error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
            } else {
            // Something else when wrong
            }
    });
  }); 
}

function addEmployee(){ // Function to add a new employee
  connection.query("SELECT * FROM role", function(err, res) {
  if (err) throw err;
      connection.query("SELECT * FROM employee",function(errEmployee, resEmployee){
      if (errEmployee) throw errEmployee;
      inquirer
            .prompt([{            
                name: "first_name",
                type: "input",
                message: "Please, enter First Name: "
            }, {            
                name: "last_name",
                type: "input",
                message: "Please, enter Last Name: "
            },{
              name: "choiceRole",
              type: "rawlist",
              message: "Select a Role:",
              choices: function() {
                let rolesArray = [];
                for (var i = 0; i < res.length; i++) {
                      rolesArray.push(res[i].title);
                    }           
                return rolesArray;
                }              
              },
              {
                name: "choiceManager",
                type: "rawlist",
                message: "Select a Manager:",
                choices: function() {
                  let managersArray = [];
                  for (var i = 0; i < resEmployee.length; i++) {
                        managersArray.push(resEmployee[i].first_name + " " + resEmployee[i].last_name);
                      }           
                  return managersArray;
                  }                
                }
            ])
            .then(answers => {
                // Searching department Id from query.
                // let roleId;
                // connection.query(`SELECT id FROM role WHERE title = '${answers.choiceRole}'`, function(err,res){
                //   if (err) throw err;
                //   console.table(res);
                //   roleId = res.id;
                // });
                let managerId;
                for (var i = 0; i < resEmployee.length; i++) {
                  if (resEmployee[i].first_name + " " + resEmployee[i].last_name === answers.choiceManager) {
                    managerId = resEmployee[i].id;
                  }                
                }               
                let roleId;
                for (var i = 0; i < res.length; i++) {
                  if (res[i].title === answers.choiceRole) {
                    roleId = res[i].id;
                  }                
                }
                console.log("Creating new Employee...\n");
                //Inserting new value to role table
                connection.query("INSERT INTO employee SET ?",
                {
                    first_name: answers.first_name,
                    last_name: answers.last_name,
                    role_id: roleId,
                    manager_id: managerId              
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " record inserted!\n");
                    start();
                }
                );
            })            
      });      
  }); 
}

function updateEmployeeRole(){ // Function to update the role of a selected employee
  connection.query("SELECT * FROM employee", function(err, resEmployee) {
  if (err) throw err;
      connection.query("SELECT * FROM role",function(errEmployee, resRole){
      if (errEmployee) throw errEmployee;
      inquirer
            .prompt([ 
              {
                name: "choiceEmployee", // Prompt list to select the employe who will update the role
                type: "rawlist",
                message: "Select a Employee to Update The Role:",
                choices: function() {
                  let employeeArray = [];
                  for (var i = 0; i < resEmployee.length; i++) {
                        employeeArray.push(resEmployee[i].first_name + " " + resEmployee[i].last_name);
                      }           
                  return employeeArray;
                  }                
                },
                {
                name: "choiceRole", // Prompt list to select the new role
                type: "rawlist",
                message: "Select a Role:",
                choices: function() {
                  let rolesArray = [];
                  for (var i = 0; i < resRole.length; i++) {
                        rolesArray.push(resRole[i].title);
                      }           
                  return rolesArray;
                  }              
                }              
            ])
            .then(answers => {
                let employeeId;
                for (var i = 0; i < resEmployee.length; i++) { 
                  if (resEmployee[i].first_name + " " + resEmployee[i].last_name === answers.choiceEmployee) {
                    employeeId = resEmployee[i].id;
                  }                
                }               
                let roleId;
                for (var i = 0; i < resRole.length; i++) {
                  if (resRole[i].title === answers.choiceRole) {
                    roleId = resRole[i].id;
                  }                
                }
                connection.query("UPDATE employee SET ? WHERE ?",
                [{
                    role_id: roleId 
                },
                {
                    id: employeeId
                }],
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " record updated!\n");
                    start();
                }
                );
            })            
      });      
  }); 
}
