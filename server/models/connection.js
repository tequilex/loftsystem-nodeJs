const mongoose = require('mongoose')


const uri = () => {
  const mode = process.env.NODE_ENV
  if (mode === 'DEV') {
    const uri = process.env.URIDB_LOCAL
    return uri
  }
  if (mode === 'PROD') {
    const uri = process.env.URIDB_PROD
    return uri
  }
} 

mongoose.Promise = global.Promise
mongoose.set('strictQuery', true)
mongoose.connect(uri())

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open');
})

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose connection disconnected app termination');
    process.exit(1)
  })
})