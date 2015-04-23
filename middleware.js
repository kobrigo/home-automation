var logger = require('./logger');
//this file contains middle-ware that I use in my server
module.exports = (function () {
    return {
        requestLogger: function(req, res, next) {
            logger.log(req.url);
            next(); // Passing the request to the next handler in the stack.
        }
    };
})();
