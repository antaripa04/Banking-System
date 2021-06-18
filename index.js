const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { stubString } = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/bankDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("h");
});

const customerSchema = {
  username: {
    type: String,
    required: true,
  },
  accountNo: {
    type: Number,
    required: true,
  },
  balance: Number,
};
const transactionSchema = {
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
};
const Customer = mongoose.model("Customer", customerSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const customerArray = [
  { username: "Julie R. Claudio", accountNo: 1023456789, balance: 20000 },
  { username: "Esther A. Neumann", accountNo: 1234567890, balance: 25000 },
  { username: "Steven B. Roberson", accountNo: 2345678901, balance: 19000 },
  { username: "Clyde M. Dexter", accountNo: 3456789012, balance: 24000 },
  { username: "Patsy G. Wang", accountNo: 4567890123, balance: 23000 },
  { username: "Benjamin C. Mason", accountNo: 5678901234, balance: 26000 },
  { username: "Paul L. Frisch", accountNo: 6789012345, balance: 21000 },
  { username: "Carolyn R. Becerra", accountNo: 7890123456, balance: 22000 },
  { username: "Rachel B. Ledford", accountNo: 8901234567, balance: 18000 },
  { username: "Charles M. Farmer", accountNo: 9012345678, balance: 25500 },
];

app.get("/", (req, res) => {
  Customer.find({}, (err, foundCustomers) => {
    if (err) {
      console.log(err);
    }
    if (foundCustomers.length === 0) {
      Customer.insertMany(customerArray, (err) => {
        if (!err) {
          console.log("Succsessfully saved all customer details in DB");
        }
      });
    }
  });
  res.render("home");
  // const day = new date();
  const day = date.getDate();
  console.log(day);
});

app.get("/customers", (req, res) => {
  Customer.find({}, (err, foundCustomers) => {
    res.render("viewcustomer", { customerList: foundCustomers });
  });
});

app.get("/transactions", (req, res) => {
  Transaction.find({}, (err, foundTransactions) => {
    res.render("history", { transactionList: foundTransactions });
  });
});

app.post("/transfer", (req, res) => {
  const senderId = req.body.senderId;
  // console.log(typeof senderId);

  Customer.find({}, (err, foundCustomers) => {
    if (err) {
      console.log(err);
    }
    res.render("transfer", {
      customerList: foundCustomers,
      customerSenderId: senderId,
    });
  });
});

app.post("/status", (req, res) => {
  //  console.log(req.body);
  const {
    customerReceiver: receiverName,
    amonut: amountSent,
    customerSender: senderId,
  } = req.body;
  Customer.findById(senderId, (err, sender) => {
    if (sender.balance < amountSent) {
      res.render("failure");
    } else {
      const day = date.getDate();
      const senderName = sender.username;
      const transaction = new Transaction({
        sender: senderName,
        receiver: receiverName,
        amount: amountSent,
        date: day,
      });
      transaction.save();
      const senderBalance = sender.balance;
      const senderUpdatedBalabce = senderBalance - amountSent;
      console.log(senderBalance);
      Customer.findByIdAndUpdate(
        senderId,
        { balance: senderUpdatedBalabce },
        (err, user) => {
          if (!err) {
            console.log("Updated Sender : ", user);
          }
        }
      );
      Customer.findOneAndUpdate(
        { username: receiverName },
        { $inc: { balance: amountSent } },
        (err, user) => {
          if (!err) {
            console.log("Updated Receiver : ", user);
          }
        }
      );
      res.render("success");
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
