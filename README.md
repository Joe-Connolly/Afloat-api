# Afloat Backend

Backend for an app for providing payday cash advances to American workers. Visit [here](https://github.com/dartmouth-cs98/19w-quantweb-backend) for the frontend.

## Architecture

We use [Express.js](http://expressjs.com/) as a backend framework.

We use [passport.js](http://www.passportjs.org/) for authentication.

We use [mongoose](https://mongoosejs.com/) for interfacing with [mLab](https://mlab.com/welcome/)

We use the [PLAID](https://plaid.com/) API for linking a users bank account.

We use the [Dwolla](https://www.dwolla.com/) API for transfering money to and from a users bank account.

We use the [SendGrid](https://sendgrid.com/) API for sending emails to users

We use [GitHub webhooks](https://developer.github.com/webhooks/) to automatically update the server when a PR is closed on master

We host on [AWS](https://aws.amazon.com), using a free-tier, single-core EC2 AMI instance.

Our api can be found at:
> http://ec2-54-212-62-214.us-west-2.compute.amazonaws.com/api/ or https://quantwebdev.me

We use the [cluster](https://nodejs.org/api/cluster.html) module of Node.js to distribute our server over multicore hosts.
## Setup

1) Clone the repo
2) Navigate to the repo's root folder. 
3) Run the following commands:
````
# run mongodb if necessary
brew services start mongodb
# install depencies
yarn
# run the app
yarn start

````
## Deployment
Navigate to the root folder of the repo and type:
````Bash
# Ensure your dependencies are up to date
yarn install
# To run development mode
yarn start
# To build for production
yarn run build
# To run for production
yarn run prod
````

## Branches
* `master` is our stable branch
* `joe/dev` is Joe's dev branch, currently holding beta features (email verification, email updating, lazy loading transactions) that have not been merged with master
## Authors

Tyler Burnam, Azhar Hussain, Deven Orie, Joe Connolly
