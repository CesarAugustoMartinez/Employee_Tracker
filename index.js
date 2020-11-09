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
    inquirer
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
        switch (answer.action) {
        case "View all Employees":
          viewEmployees();
          break;
  
        case "View all Roles":
          viewRoles();
          break;
  
        case "View all Departments":
          viewDepartments();
          break;

        case "View all Employees by Manager":
          viewEmployeesManager();
          break;
  
        case "Exit":
          connection.end();
          break;
        }
      });
  }

  function viewEmployees(){
      console.log("Selecting all Employees....\n");
    var query = "SELECT * FROM employee";
    connection.query(query, function(err, res) {
        if (err) throw err;
         console.table(res);
         start();
    });
  }

  function viewRoles(){
    console.log("Selecting all Roles....\n");
  var query = "SELECT * FROM role";
  connection.query(query, function(err, res) {
      if (err) throw err;
       console.table(res);
       start();
  });
}

function viewDepartments(){
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

function viewEmployeesManager(){
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
        var chosenManager;
        for (var i = 0; i < res.length; i++) {
          if ((res[i].first_name + " " + res[i].last_name) === answer.choice) {
            chosenManager = res[i].id;
          }
        }
        var query = `SELECT * FROM employee WHERE manager_id=${chosenManager}`;
        connection.query(query,function(err, res) {
                if (err) throw err;
                console.log("Selecting all Employees....\n");    
                console.table(res);
                start();
            });               
      });
  });
}
