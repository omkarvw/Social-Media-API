// const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')


const errorHandlerMiddleware = (err, req, res, next) => {

  // set default
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later'
  }

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors).map((item) =>
      item.message
    ).join(',')
    customError.statusCode = 400
  }

  if (err.code && err.code === 11000) {
    customError = {
      statusCode: StatusCodes.BAD_REQUEST,
      msg: `Duplicate value entered for ${Object.keys(err.keyValue)} field, please enter another value`
    }
  }
  if (err.name === 'CastError') {
    // console.log(err);
    customError = {
      statusCode: StatusCodes.NOT_FOUND,
      msg: `No item found with id ${err.value}.`
    }
  }
  // Object.keys returns an array of all keys of the object
  return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware
