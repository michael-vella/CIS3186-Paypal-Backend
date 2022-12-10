const express = require("express");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");
const bodyParser = require("body-parser");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AWniCHsnP8MS1rPTtOckLaa3kYpj5gj4Dni7ZL9c5xvwBX_cJ9yxzaG-QNpBQiUX0-1y4qP6kzsjgXd7',
  'client_secret': 'EI1BBxs212AFXkAhRA70tCMg6jQdxBc6AAqUTVseY7TvmAoi5IKMnKulI_A_O9kKhiGZTjdycvjCQCgc'
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/paypal", (req, res) => {
  var create_payment_json = {
      intent: "sale",
      payer: {
          payment_method: "paypal"
      },
      redirect_urls: {
          return_url: "https://6da0-78-133-22-111.eu.ngrok.io/success",
          cancel_url: "https://6da0-78-133-22-111.eu.ngrok.io/cancel"
      },
      transactions: [
          {
              item_list: {
                  items: [
                      {
                          name: "item",
                          sku: "item",
                          price: "1.00",
                          currency: "USD",
                          quantity: 1
                      }
                  ]
              },
              amount: {
                  currency: "USD",
                  total: "1.00"
              },
              description: "This is the payment description."
          }
      ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
      if (error) {
          throw error;
      } else {
          console.log("Create Payment Response");
          console.log(payment);
          res.redirect(payment.links[1].href);
      }
  });
});

app.get("/success", (req, res) => {
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
      payer_id: PayerID,
      transactions: [
          {
              amount: {
                  currency: "USD",
                  total: "1.00"
              }
          }
      ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
      error,
      payment
  ) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
          res.render("success");
      }
  });
});

app.get("/cancel", (req, res) => {
  res.render("cancel");
});

app.listen(3000, () => {
    console.log("Server is running");
});