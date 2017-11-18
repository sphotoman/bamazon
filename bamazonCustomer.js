var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "1234",
  database: "bamazonDB"
});

connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
  orderProduct();
});


function orderProduct() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "list",
          choices: function() {
            var productArray = [];
            for (var i = 0; i < results.length; i++) {
              productArray.push(results[i].item_id + " " + results[i].product_name + "$" + results[i].price + " | Avail. Qty: " + results[i].stock_quantity);
            }
            return productArray;
          },
          message: "What product would you like to order?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        var str = answer.choice;
        var res = str.split(" ");
    
        // get the information of the chosen item
       var productId = res[0];
       var quantityAvailable = res[res.length-1];
       var quantityOrdered = answer.quantity;

        // determine if there is ample quantity compare ordered quanitity to quantity in stock.
        if (quantityAvailable >= quantityOrdered) {
          // then order
          var remaining = quantityAvailable - quantityOrdered;
          //then decrease the quanity by that amount in the DB 
          connection.query("UPDATE products SET stock_quantity = ? where item_id = ?", [remaining, productId], function (error, result) {
            if (error) throw error;
              console.log("Order was successful!");
              orderProduct();
          })
          
        }
        else {
          // if they ordered too many, apologize and start over
          console.log("Order Denied! Insufficient Inventory To Meet your Order. Try again...");
          orderProduct();
        }
      });
  });
}
