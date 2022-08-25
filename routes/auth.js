const routes = require("express").Router();
const User = require("../model/User");
const { registerUserSchema, loginUserSchema } = require("../validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

routes.post("/register", async (req, res) => {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }

    // Check if the user already exists in DB
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
        return res.status(400).send({ error: "Email Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
    try {
        const savedUser = await user.save();
        res.send({ user: savedUser._id });
    } catch (err) {
        res.status(500).send(err);
    }
});

routes.post("/login", async (req, res) => {
    const { error } = loginUserSchema.validate(req.body);
    if (error) return res.status(400).send(error.details);

    const user = await User.findOne({ email: req.body.email });
    if (user) {
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).send({ error: "Wrong Creds!!!" });
    } else {
        return res.status(400).send({ error: "Wrong creds!!" });
    }
    const userDetails = {
        name: user.name,
        email: user.email,
    };
    const accessToken = generateAccessToken(userDetails);
    const refreshToken = generateRefreshToken(userDetails);
    res.send({ accessToken: accessToken, refreshToken: refreshToken });
});

// this route is just a hack, never implement this in real world
routes.delete("/logout", (req,res) => {
    // make the refresh and access token invalid and remove it from redis as well
    res.send({"nsg": "Implement logout functionality!"})
})

routes.post("/token", (req, res) => {
    const token = req.body.token;
    if (!token) res.sendStatus(401);

    //  one more check should be here to verify that the token passed is a token available in the DB
    // as normally the refresh token will be stored in the DB or redis
    // if malicipous user has somehow got the old token then token wont be there in redis after logout and 
    // you can reject the request

    // check the refresh token link in the README which states one of the methods like refresh token rotation
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) res.sendStatus(403);
        console.log(user);
        const accessToken = generateAccessToken(user);
        res.send({accessToken: accessToken});
    });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15s",
    });
}

function generateRefreshToken(user) {
    // expiration is not provided for refresh token
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = routes;
