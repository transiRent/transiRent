const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    // unique: true -> Ideally, should be unique, but its up to you
  },
  password: String,
  firstName: String,
  lastName: String,
  description: String,
  imgName: String,
  imgPath: {
    type: String,
    default: '/images/anonymous.png'
  },
  publicId: String,
  ratings: [{
    ratedBy:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rating: Number,
    comments: String
  }],
  averageRating: Number
});

const User = model("User", userSchema);

module.exports = User;
