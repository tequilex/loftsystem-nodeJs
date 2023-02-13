const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    // id: {
    //   type: String,
    //   required: [true, 'id required'],
    //   unique: true
    // },
    firstName: {
      type: String
    },
    middleName: {
      type: String
    },
    image: {
      type: String
    },
    surName: {
      type: String
    },
    userName: {
      type: String,
      required: [true, 'username required'],
      unique: true
    },
    permission: {
      chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
    },
    hash: {
      type: String,
      required: [true, 'Password required']
    }
  },
  {
    versionKey: false,
    timestamps: {createdAt: 'created_at', updatedAt: 'update_at'},
  },
)

userSchema.methods.setPassword = function (password) {
  this.hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

userSchema.methods.validPassword  = function (password) {
  return bcrypt.compareSync(password, this.hash)
}

const User = mongoose.model('user', userSchema)

module.exports = User