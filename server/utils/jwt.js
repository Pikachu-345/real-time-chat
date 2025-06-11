const jwt = require('jsonwebtoken');
const keys = require('../config/keys'); 

const generateToken = (id) => {
    const token = jwt.sign({ id }, keys.jwtSecret, {
        expiresIn: "7d",
    });
    return token; 
};

module.exports = generateToken;