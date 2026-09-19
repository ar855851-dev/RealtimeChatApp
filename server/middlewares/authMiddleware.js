const jwt = require('jsonwebtoken');        

module.exports = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                message: 'Authorization header missing or malformed',
                success: false
            });
        }

        if (!process.env.SECRET_KEY) {
            return res.status(500).send({
                message: 'JWT secret is not configured',
                success: false
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedtoken = jwt.verify(token, process.env.SECRET_KEY); //yeh token ko verify karta hai aur usme se user ki information nikalta hai

        req.body = req.body || {}; // agr req ke body empty hai to usko empty object bana deta hai taki aage ke routes me use kiya ja sake
        req.body.userId = decodedtoken.userId; // yeh decoded  token me se userId   nikalta hai aur usko request ke body me daal deta hai taki aage ke routes me use kiya ja sake

        next();   // next() aage routes mai jane ke liye
    } catch (error) {
        res.status(401).send({
            message: error.message,
            success: false
        });
    }
};