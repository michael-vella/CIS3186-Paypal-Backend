# Team 4 - Paypal

### Team members:
- Matthew Amaira
- Mathis Camard
- Michael Vella
- Philip Paul Grima

# Prerequisites

- Install and set up an account for [ngrok](https://ngrok.com/). Paypal uses a sandbox account that needs to be hosted on a web server. Hence, we will first be hosting the paypal sandbox on a localhost server instance and then use ngrok to create a tunnel on the web that will be referenced by application itself. 
- Paypal account. If you do not have one, sign up for a paypal account [here](https://www.paypal.com/mt/home). **It's free!**

# Project Impementation

## Paypal sandbox accounts setup
1. Assuming that you have created a paypal account, go to the [paypal developer platform](https://developer.paypal.com/home/).
2. Log in into your paypal account.
3. Click on **Get API Credentials**.
4. On the left-hand side, under the **Sandbox** heading, select **Accounts**. NOTE: *We will have two accounts: a merchant account that will be used to accept payments from the end user and a sandbox user account that will be used to make payments to the merchant account.*
5. Click on **Create Account** button. Select **Personal (Buyer Account)** as the Account Type and **United Kingdom** as the Country or region and Create.
6. Repeat step 5 but select **Business (Merchant Account)** as Account Type instead.
7. From the left-hand side of the screen, under the **Dashboard** heading, navigate to **My Apps & Credentials**.
8. Navigate to **REST API apps** and click on the **Create App** button.
9. Enter **Test App** as the App Name and select the newly created merchant sandbox account as the App Type. Click on the **Create App** button.
10. We have now created the credentials that will be used for the application itself.

## Setting up the backend

The backend will be used to host the paypal merchant account sandbox.

Using CMD or any other preferred terminal, navigate to the folder where you want to create an empty repository and run the below command to create an empty repository.

```
npm init
```
After the repository has been initialised, run

```
npm install --save express body-parser consolidate ejs paypal-rest-sdk
```

If not already done, open the repository you are working on inside an IDE of your choice. Create a new **app.js** file and copy the following: 

```
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
 
app.get("/", (req, res) => {
    res.send("Works!")
});
 
app.listen(3000, () => {
    console.log("Server is running");
});

```
*Express and consolidate are javascript frameworks used in building cross-platform applications.*

Now, install the nodemon package that will be used to host the backend on our local server (localhost) by running:

```
npm install -g nodemon
```

Then, run the following to host your backend onto localhost (make sure that your terminal is in the correct path where app.js is located)

```
nodemon app.js
```

To verify that the server is up and running go to localhost:3000 where you should see "Works!". 3000 because inside the app.js the app.listen function is passed 3000 as the first parameter. If you change this parameter, change the localhost:XXXX accordingly.

Now, add the following code to you app.js and replace the client_id and client_secret with the details of your newly created merchant account (refer to Paypal sandbox accounts setup above) to configure your paypal merchant account.

```
paypal.configure({
  'mode': 'sandbox',
  'client_id': 'your_client_id',
  'client_secret': 'your_client_secret'
});
```

Now, create a folder inside your repository named views. Inside the folder, we will be creating three .ejs files that will be used to display the paypal payments web views on the web using HTML and Javascript.

1. index.ejs
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Document</title>
    </head>
    <body>
      <h1>Paypal</h1>
        <form name="f1" action="/paypal">
            <button type="submit">Pay</button>
        </form>
    </body>
</html>
```

2. success.ejs
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>success</title>
    </head>
    <body>
        <h1>Transaction successfull!</h1>
    </body>
</html>
```

3. cancel.ejs
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>cancel</title>
    </head>
    <body>
        <h1>Transaction cancelled!</h1>
    </body>
</html>
```

Now, inside the **app.js** file let's create the methods that will handle the paypal payments themselves. Remove the code block
```
app.get("/", (req, res) => {
    res.send("Works!")
});
```

that was created before as this was only used to test that the server was working. Instead copy the following and paste into your **app.js** file instead of the code block that was just deleted.

```
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
            return_url: "http://localhost:XXXX/success",
            cancel_url: "http://localhost:XXXX/cancel"
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
```

Inside the `app.get('/paypal')` method, replace localhost instance accordingly. *Default is 3000*.

Now, go to localhost:XXXX inside the web and test if everything works. NOTE: *When paying, always pay with your sandbox buyer account. We don't know what happens if you use a real paypal account to pay and we didn't want to test it out...*

Now let's create a mobile application and integrate it with the backend we have just created.
## Application setup

[Here](https://www.github.com/michael-vella/CIS3186-Paypal-Application) is the repository for the application itself.
Create a new blank expo project. We have named ours 'Paypal'. For simplicity, you might want to use a different directory than the one that was used by the backend part of the application.
```
npx create-expo-app --template
```

Navigate to the project directory
```
cd Paypal
```

Install `react-native-webview`
```
npm install react-native-webview
```

Download the following [image](https://iconscout.com/icon/paypal-62) and save it inside your assets folder, naming it'paypal'.

Replace **app.js** (of your mobile application) with the following code:
```
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
 
export default class App extends React.Component {
  state = {
    showModal: false,
    status: "Pending",
  };
  handleResponse = (data) => {
    if (data.title === "success") {
      this.setState({ showModal: false, status: "Complete" });
    } else if (data.title === "cancel") {
      this.setState({ showModal: false, status: "Cancelled" });
    } else {
      return;
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <Modal
          visible={this.state.showModal}
          onRequestClose={() => this.setState({ showModal: false })}
        >
          <WebView
            style={{ marginTop: 50 }}
            source={{ uri: "lets_change_this" }}
            onNavigationStateChange={(data) => this.handleResponse(data)}
            injectedJavaScript={`document.f1.submit()`}
          />
        </Modal>
        <Image style={styles.image} source={require("./assets/paypal.png")} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => this.setState({ showModal: true })}>
            <Text style={styles.buttonText}>Pay with Paypal</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.status}>Payment Status: {this.state.status}</Text>
        </View>
      </View>
    );
  }
}
 
const styles = StyleSheet.create({
  buttonContainer: {
    height: 50,
    width: 250,
    marginHorizontal: 10,
    marginVertical: 20,
    marginTop: 40,
    backgroundColor: "#1336DF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    textTransform: "uppercase",
    color: "white",
    fontSize: 17,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  container: {
    paddingTop: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    fontSize: 16,
    fontFamily: "Helvetica",
  },
  image: {
    marginTop: 200,
    height: 150,
    width: 150,
  },
});
```

The mobile application is now finished. However, the paypal backend server is only initialised on our local machine. Let's use **ngrok** to deploy the server from the local machine to the local network and make the server available on our local network.

After installing and setting up an account for ngrok, run
```
ngrok config add-authtoken your_token
```

replacing *your_token* with your ngrok token, accessible from [here](https://dashboard.ngrok.com/get-started/your-authtoken). If this does not work replace `ngrok` with `ngrok.exe`.

Now run 
```
ngrok http XXXX
```
replacing XXXX with your localhost port.

Copy the forwarding link (should be something like this): `https://1...eu.ngrok.io` and paste it into your mobile **app.js** instead of *lets_change_this* inside the Webview -> source -> uri. Also replace the localhost *return_url* and *cancel_url* (inside the backend App.js) with the same link.

Now run and you have successfully integrated paypal with your mobile application.
```
npx expo start
```

**NOTE: For everything to work, both your localhost server and ngrok server must be up and running.**

# References

- [Ngrok Documentation](https://ngrok.com/docs)
- [Paypal Implementation Example](https://medium.com/@adityasingh_32512/integrating-paypal-in-your-react-native-app-4dcf89e11dd)
- [Paypal Github Docs](https://github.com/paypal/PayPal-node-SDK/)
