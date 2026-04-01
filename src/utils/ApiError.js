class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); //as it is a extended class and Error only takes message so first use super keyword then we can use this keywords
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false; // as error occured so always false
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
