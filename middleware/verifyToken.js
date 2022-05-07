const jwt = require('jsonwebtoken');

exports.verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).send({ message: 'Login to continue' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = { email: decoded.email };

    next();
  } catch (error) {
    return res.status(403).send({ message: 'Authentication invalid' });
  }
};
