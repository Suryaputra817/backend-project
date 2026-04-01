const asyncHandler = (requestHandeler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandeler(req, res, next)).catch((err) => next(err));
  };
};
// the function requesthandler can be any thing as per our need but it only passes the req and res and next as parameter for further use it is like a rapper for try-catch ot resolve-reject
export { asyncHandler };

/*
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
*/
