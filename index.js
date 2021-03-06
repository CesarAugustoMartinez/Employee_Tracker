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
          "View all Employees by Manager",
          "Add Employee",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager",
          "View all Roles",
          "Add Role",
          "Remove Role",
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
        case "Update Employee Manager":
            console.clear();
            updateEmployeeManager();
            break;
        case "Remove Employee":
            console.clear();
            removeEmployee();
            break;    
        case "Remove Role":
            console.clear();
            removeRole();
            break; 
        case "Remove Department":
            console.clear();
            removeDepartment();
            break;   
        case "View the total utilized budget of a Department":
            console.clear();
            ViewTotalBudgetDepartment();
            break;

        case "Exit":
          connection.end();
          break;
        }
      });
  }

  function viewEmployees(){ // Function to display all employees from the Database
      console.log("Selecting all Employees....\n");
    var query = `SELECT e1.first_name, e1.last_name, role.title, role.salary, concat(e2.first_name, e2.last_name) as Manager, department.name as Department 
    FROM employee e1 
    JOIN role on e1.role_id = role.id 
    left JOIN employee e2 on  e1.manager_id = e2.id
    JOIN department on role.department_id = department.id order by e1.id`;
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

function viewEmployeesManager(){ // Function to display all employees under a selected manager from the Database
    console.log("Selecting all Managers....\n");
     // query the database for all managers
    connection.query("SELECT e1.id, e1.first_name, e1.last_name FROM employee e1 JOIN employee e2 on e1.id = e2.manager_id group by e1.id", function(err, res) {
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
      connection.query("SELECT * FROM role",function(err, resRole){
      if (err) throw err;
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

function updateEmployeeManager(){ // Function to update the role of a selected employee
  connection.query("SELECT * FROM employee", function(err, resEmployee) {
  if (err) throw err;
      connection.query("SELECT * FROM employee",function(err, resManager){
      if (err) throw err;
      inquirer
            .prompt([ 
              {
                name: "choiceEmployee", // Prompt list to select the employe who will update the role
                type: "rawlist",
                message: "Select a Employee to Update its Manager:",
                choices: function() {
                  let employeeArray = [];
                  for (var i = 0; i < resEmployee.length; i++) {
                        employeeArray.push(resEmployee[i].first_name + " " + resEmployee[i].last_name);
                      }           
                  return employeeArray;
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
                console.log(employeeId);            
                inquirer
                  .prompt([ 
                    {
                      name: "choiceManager", // Prompt list to select new Manager
                      type: "rawlist",
                      message: "Select a Manager:",
                      choices: function() {
                        let managerArray = [];
                        for (var i = 0; i < resManager.length; i++) {
                            if (resManager[i].id !== employeeId) {
                              managerArray.push(resManager[i].first_name + " " + resManager[i].last_name);
                            }                             
                            }           
                        return managerArray;
                        }              
                      }              
                  ])
                  .then(answersRole => {
                    let managerId;
                    for (var i = 0; i < resManager.length; i++) {
                      if ((resManager[i].first_name + " " + resManager[i].last_name) === answersRole.choiceManager) {
                        managerId = resManager[i].id;
                      }                
                    }
                    connection.query("UPDATE employee SET ? WHERE ?",
                    [{
                        manager_id: managerId 
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
             
            })            
      });      
  }); 
}



function ViewTotalBudgetDepartment(){ // Function to View the total utilized budget of a Department
  connection.query("SELECT * FROM department", function(err, resDepartment) {
  if (err) throw err;
      inquirer
            .prompt([ 
              {
                name: "choiceDepartment", // Prompt list to select the deparment to view its budget
                type: "rawlist",
                message: "Select a Department",
                choices: function() {
                  let departmentArray = [];
                  for (var i = 0; i < resDepartment.length; i++) {
                        departmentArray.push(resDepartment[i].name);
                      }           
                  return departmentArray;
                  }                
                }
            ])
            .then(answers => {
                let departmentId;
                for (var i = 0; i < resDepartment.length; i++) { 
                  if (resDepartment[i].name === answers.choiceDepartment) {
                    departmentId = resDepartment[i].id;
                  }                
                }
                connection.query("SELECT department.name, sum(role.salary) as Utilized_Budget FROM employee JOIN role on employee.role_id = role.id JOIN department on role.department_id = department.id WHERE department_id = ? GROUP by department.id;",
                [departmentId],function(err, res) {
                    if (err) throw err;
                    console.log("Displaying Budget for " + answers.choiceDepartment + " department." + "\n");    
                    console.table(res);
                    start();
                }
                );
              })            
            })            
}


function removeEmployee(){ // Function to Delete an Employee
  connection.query("SELECT * FROM employee", function(err, resEmployee) {
  if (err) throw err;
  console.table(resEmployee);
  inquirer
        .prompt([ 
          {
            name: "employeeId", // Input to enter employee's id to be deleted
            type: "input",
            message: "Enter Employee's Id that would like remove or Press Enter to return: "
          }])
        .then(answers => {            
            connection.query("DELETE FROM employee WHERE id = ?;",
            [answers.employeeId],function(err, res) {                    
                if (err) { 
                  console.log("Can not delete a parent record, This employee is manager. \n");
                  start();
                } else {
                if (res.affectedRows != 0) {
                       console.log("Employee deleted...." + "\n");    
                    }
                start();
              }
            }
            );
          })
    });                             
}


function removeRole(){ // Function to Delete a Role
  connection.query("SELECT * FROM role", function(err, resRole) {
  if (err) throw err;
  console.table(resRole);
  inquirer
        .prompt([ 
          {
            name: "roleId", // Input to enter role's id to be deleted
            type: "input",
            message: "Enter Role's Id that you would like remove or Press Enter to return: "
          }])
        .then(answers => {            
            connection.query("DELETE FROM role WHERE id = ?;",
            [answers.roleId],function(err, res) {                    
                if (err) { // Condition to control if the role is used by an employee
                  console.log("Can not delete a parent record, This role is being used by at least for an employee. \n");
                  start();
                } else {
                if (res.affectedRows != 0) {
                       console.log("Role deleted...." + "\n");    
                    }
                start();
              }
            }
            );
          })
    });                             
}


function removeDepartment(){ // Function to Delete a Role
  connection.query("SELECT * FROM department", function(err, resDepartment) {
  if (err) throw err;
  console.table(resDepartment);
  inquirer
        .prompt([ 
          {
            name: "departmentId", // Input to enter role's id to be deleted
            type: "input",
            message: "Enter Department's Id that you would like remove or Press Enter to return: "
          }])
        .then(answers => {            
            connection.query("DELETE FROM department WHERE id = ?;",
            [answers.departmentId],function(err, res) {                    
                if (err) { // Condition to control if the role is used by an employee
                  console.log("Can not delete a parent record, This department is being used by at least for a Role. \n");
                  start();
                } else {
                if (res.affectedRows != 0) {
                       console.log("Department deleted...." + "\n");    
                    }
                start();
              }
            }
            );
          })
    });                             
}
