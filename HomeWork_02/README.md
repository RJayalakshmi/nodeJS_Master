# Node.Js Master Class HomeWork Assignment #2 - "API for a pizza-delivery company"

# The Assignment:

Please create a simple "Hello World" API. Meaning:

Details (Scenario):

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager:

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

2. Users can log in and log out by creating or destroying a token.

3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).

4. A logged-in user should be able to fill a shopping cart with menu items

5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

Important Note: If you use external libraries (NPM) to integrate with Stripe or Mailgun, you will not pass this assignment. You must write your API calls from scratch. Look up the "Curl" documentation for both APIs so you can figure out how to craft your API calls.

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 

And please: Don't forget to document how a client should interact with the API you create!

# config
  Update Strip and Mailgun sandbox account details in the file "lib/config.js"

  NOTE: As Mailgun sandbox account sends email only to your own authorized emails, update your Mailgun account details to test order receipt email feature and use email address authorized in your Mailgun account while register user.

# Project Flow
  Step 1: User Registration

  Step 2: User Login - Upon succesful login, user receives menu list and an Authorization Token

  Step 3: Add item into shopping cart

  Step 4: Update shopping cart if needed

  Step 5: Place Order - Upon successful order, order recipt mailed to user's registered email.

  Step 6: View Orders

  In addition, user can update their profile, get refreshed authorized token and view shopping cart.
 
  NOTE: Refer API document "API - Home Assignment #2.pdf" for details on end points

# Postman Collection
  Use below collection link to install end points into postman

  https://www.getpostman.com/collections/93fe4d00513ea8774786   

