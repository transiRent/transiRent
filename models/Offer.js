const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const offerSchema = new Schema({
  name: {
    type: String,
  },
  type: { 
    type: String,
    enum: ['appartment', 'room', 'other']
  },
  description: String,
  address: {
    street: String,
    number: Number,
    code: Number,
    city: {
      type: String,
      default: 'Berlin'
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  timeslots: [
    {
      time: Date,
      status: {
        type: String,
        enum: ['free', 'booked'],
        default: 'free'
      },
      bookedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
      }
    }
  ]
});

const Offer = model("Offer", offerSchema);

module.exports = Offer;
