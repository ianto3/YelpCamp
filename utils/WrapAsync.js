// Wrapper for async functions to catch errors

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};