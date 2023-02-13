const User = require('./schemas/user')
const News = require('./schemas/news')
// const {v4: uuidv4} = require('uuid')

module.exports.getUserByName = async (userName) => {
  return User.findOne({userName})
}

module.exports.getUserById = async (id) => {
  return User.findById({_id: id})
}

module.exports.getUsers = async () => {
  const users = await User.find()
  return users
}

module.exports.updateUserById = async (id, newUser) => {
  const oldUser = await User.findById({_id: id})

  if (newUser.oldPassword !== '' && newUser.newPassword !== '') {
    if (!oldUser.validPassword(newUser.oldPassword)) {
      return null
    }
    oldUser.setPassword(newUser.newPassword)
  }
  await User.findOneAndUpdate(
    {_id: id}, 
    {$set: {
      firstName: newUser.firstName, 
      surName: newUser.surName, 
      middleName: newUser.middleName, 
      image: newUser.image,
      hash: oldUser.hash
    }}
  )
  const user = await User.findOne({_id: id})
  if (oldUser.image !== user.image) {
    user.oldImage = oldUser.image
  }
  return user
}

module.exports.deleteUserById = async (id) => {
  return User.findOneAndRemove({_id: id})
}

module.exports.changeUserPermissions = async (id, permissions) => {
  const user = await User.findOneAndUpdate({_id: id}, {$set: {permission: permissions}})
  return user
}

module.exports.createUser = async (data) => {
  const {username, surName, firstName, middleName, password} = data
  const newUser = new User({
    // id: uuidv4(),
    userName: username,
    surName,
    firstName,
    middleName,
    image: '',
    permission: {
      chat: { C: true, R: true, U: true, D: true },
      news: { C: true, R: true, U: true, D: true },
      settings: { C: true, R: true, U: true, D: true },
    },
  })
  newUser.setPassword(password)
  const user = await newUser.save()

  return user
}

module.exports.createNews = async (user, data) => {
  const {text, title} = data
  const newNews = new News({
    title,
    text,
    user
  })
  await newNews.save()

  const news = await News.find()
  return news
}

module.exports.getNews = async () => {
  const news = await News.find()
  return news
}

module.exports.deleteNewsById = async (id) => {
  await News.findOneAndRemove({_id: id})
  const news = await News.find()
  return news
}

module.exports.updateNewsById = async (id, data) => {
  await News.findOneAndUpdate({_id: id}, {$set: {title: data.title, text: data.text}})
  const news = await News.find()
  return news
}