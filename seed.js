const mongoose = require('mongoose');
const Offer = require('./models/Offer');
const User = require('./models/User')

mongoose.connect('mongodb://localhost/transiRent', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const offers = [
  {
    name: "Peter's lovely room",
    type: "room",
    description: "a lovely room",
    address: {
      street: "Credabilitystr",
      number: 100,
      code: 10117,
      city: "Berlin"
    },
    owner: null,
    timeslots: [
      {
        time: 2021-05-18,
        status: "free",
        bookedBy: null
      }
    ]
  },
  {
    name: "Sally has an appartment!!!",
    type: "appartment",
    description: "lovely appartment in s-berg!!!!!!!",
    address: {
      street: "pallaststr",
      number: 123,
      code: 10781,
      city: "Berlin"
    },
    owner: null,
    timeslots: [
      {
        time: 2021-06-23,
        status: "free",
        bookedBy: null
      }
    ]
  },
  {
    name: "Barry's bike lockup",
    type: "other",
    description: "its cold but it will do",
    address: {
      street: "schlechtstr",
      number: 13,
      code: 10117,
      city: "Berlin"
    },
    owner: null,
    timeslots: [
      {
        time: 2021-08-01,
        status: "free",
        bookedBy: null
      }
    ]
  }
];

const users = [
  {
    username: "Noel Edmonds",
    password: "1234",
  }
];



Offer.insertMany(offers)
  .then(offers => {
    console.log(`Added ${offers.length} sample offers to database`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.log(err);
  })

User.insertMany(users)
.then(users=> {
  console.log(`Added ${users.length} sample users to database`)
})
.catch(err=>{
  console.log(err);
})