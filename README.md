# Cash Advance Service Backend

Backend for credit card cash advance service application. Please see front end repo: https://github.com/dartmouth-cs98/19w-quantweb for detailed README.

## Architecture

We use [Express.js](http://expressjs.com/) as a backend framework.

We use [passport.js](http://www.passportjs.org/) for authentication.

We use [mongoose](https://mongoosejs.com/) for interfacing with [mLab](https://mlab.com/welcome/)

We use the [cluster](https://nodejs.org/api/cluster.html) module of Node.js to distribute our server over multicore hosts.

We use [GitHub webhooks](https://developer.github.com/webhooks/) to automatically update the server when a PR is closed on master

We host on [AWS](https://aws.amazon.com), using a free-tier, single-core EC2 AMI instance.

Our api can be found at:
> http://ec2-54-212-62-214.us-west-2.compute.amazonaws.com/api/

## Setup

Clone the repository and navigate to its root folder. The backend is written in node. 

## Deployment
Navigate to the root folder of the repo and type:
````Bash
# Ensure your dependencies are up to date
yarn install

# To run development mode
npm start

# To build for production
npm run build

# To run for production
npm run prod
````

To access EC2, get the ```.pem``` file from a team member (or slack), then:
```Bash
# Login to the machine
ssh -i "quantweb.pem" ec2-user@ec2-54-212-62-214.us-west-2.compute.amazonaws.com

# Enter server dir
cd 19w-quantweb-backend

# To update the server manually
./restartServer
```

## Authors

Tyler Burnam, Azahr Hussain, Deven Orie, Joe Connolly

## Acknowledgments
I used the following tutorial to write starter code: https://www.youtube.com/watch?v=gnsO8-xJ8rs
