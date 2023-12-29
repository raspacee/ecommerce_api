class CustomError extends Error {
  constructor(statusCode, error, errorArray = null) {
    super(error);
    this.statusCode = statusCode;
    this.errorArray = errorArray;
  }
}

module.exports = { CustomError };
