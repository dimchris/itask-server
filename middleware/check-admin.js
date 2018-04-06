const jwt = require('jsonwebtoken');

// First check-auth for userData
module.exports = (req, res, next) => {
        if(req.userData.role !== "admin"){
            return res.status(401).json({
                message: 'Auth failed'
            })
        }
        next();
};