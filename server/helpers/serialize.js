module.exports.serializeUser = (user) => {
  return {
    firstName: user.firstName,
    id: user._id,
    image: user.image,
    middleName: user.middleName,
    permission: user.permission,
    surName: user.surName,
    username: user.userName,
  }
}

module.exports.serializeNews = (news) => {
  return {
    text: news.text,
    title: news.title,
    id: news._id,
    user: {
      firstName: news.user.firstName,
      id: news.user._id,
      username: news.user.userName,
      middleName: news.user.middleName,
      image: news.user.image,
      surname: news.user.surName
    }
  }
}