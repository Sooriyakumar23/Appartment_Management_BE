const jwt = require("jsonwebtoken");

const SECRET_KEY = "appartment_management_platform_ACxsdfG34VCSGG!233gvVSx";

const options = {
  expiresIn: "1h",
  issuer: "AFFINITY_CODE_WORKS",
};

const generateToken = (userId, username, role) => {
  const payload = {
    userId: userId,
    username: username,
    role: role,
  };
  const token = jwt.sign(payload, SECRET_KEY, options);
  return token;
};

const validateToken = (token, userId) => {
  const decoded = jwt.verify(token, SECRET_KEY);

  if (!decoded.userId) {
    throw new Error("Invalid token: Missing userId");
  }

  if (Date.now() >= decoded.exp * 1000) {
    throw new Error("Invalid token: Token has expired");
  }

  if (decoded.userId !== userId) {
    throw new Error("Invalid token: UserId is not matching");
  }

  return decoded;
};

module.exports = {
  generateToken,
  validateToken,
};
