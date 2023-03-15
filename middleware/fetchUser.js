const jwt = require('jsonwebtoken');
const JWT_SECRET = 'prathamesh';

const fetchUser = (req, res, next) => {
  ///Get the\ user  from kwt token and addd id to req object
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ error: 'valide token is required' });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log('data', data);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'valide token is required' });
  }
};

module.exports = fetchUser;
