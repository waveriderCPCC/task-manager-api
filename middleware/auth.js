let jwt = require("jsonwebtoken");
let User = require("../models/user");

let authenticate = async (req, res, next) => {
  try {
    let token = req.header("Authorization").replace("Bearer ", "");
    let decode = jwt.verify(token, "h2iPPZPlsc21g3ReabGcrL");

    let user = await User.findOne({ _id: decode._id, "tokens.token": token });

    if (!user) {
      throw new Error();
    } else {
      req.token = token;
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(401).send({ error: "Please sign in" });
  }
};

module.exports = authenticate;
