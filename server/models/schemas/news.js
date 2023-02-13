const mongoose = require('mongoose')

const Schema = mongoose.Schema

const newsSchema = new Schema(
  {
    // id: {
    //   type: String,
    //   required: [true, 'id required'],
    //   unique: true
    // },
    // created_at: {
    //   type: Date
    // },
    text: {
      type: String
    },
    title: {
      type: String
    },
    user: {
      firstName: String,
      _id: String,
      image: String,
      middleName: String,
      surName: String,
      userName: String
    }
  },
  {
    versionKey: false,
    timestamps: {createdAt: 'created_at'},
  },
)

const News = mongoose.model('news', newsSchema)

module.exports = News