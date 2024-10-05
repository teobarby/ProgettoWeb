const DataBase = require("../../db");
const db = new DataBase();


const jwt = require('jsonwebtoken');
const config = require('/Users/matteobarbieri/Documents/Uni/ProgettoWeb/config.json'); // Assicurati che questa importazione sia presente

function generateToken(user) {
    const secretKey = config.jwtSecret; // Usa il segreto JWT
    if (!secretKey) {
        throw new Error("secretOrPrivateKey must have a value");
    }
    return jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
}

module.exports = { generateToken };