export const formatResponse = (data, message = "Success", statusCode = 200) => {
    return {
      status: statusCode,
      message,
      data,
      timestamp: new Date(),
    };
  };
  
  export const formatError = (message, statusCode = 400) => {
    return {
      status: statusCode,
      message,
      timestamp: new Date(),
    };
  };
  