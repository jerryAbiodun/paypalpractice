const express = require("express");
const paypal = require("paypal-rest-sdk");

let PORT = 5000

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AeG96NCIQZFkGghr_g4XwJGz5yueeiIACYBbV3mx67IBhwkzqbQf6U9-LgSXga1kICBqOf3YB1sl3I3V",
  client_secret:
    "EATuXf3zRuR39W7WIKmEgFTh4Vfc6ATIL3n9NTcFQtnj5iOnEtgJfLhuUtx7ZxYCeE-YGaoVXUw-xDka",
});

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://localhost:${PORT}/success`,
        cancel_url: `http://localhost:${PORT}/cancel`
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Red Sox Hat",
                sku: "001",
                price: "25.00",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "25.00",
          },
          description: "Hat for the best team ever",
        },
      ],
    };
  
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        
        console.debug("payment",payment)
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  });

  app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    console.debug("req.query",req.query)
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "25.00",
          },
        },
      ],
    };
  
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          res.send("Success");
        }
      }
    );
  });
  
  app.get('/cancel', (req, res) => res.send('Cancelled'));

  

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));