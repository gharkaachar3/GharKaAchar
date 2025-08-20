const jwt = require('jsonwebtoken');
const User = require('../Model/User');
const redisClient = require("../config/redis")

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  secure: process.env.NODE_ENV === 'production',
};

const userMiddleware = async (req, res, next) => {
  try {
    const { token, refresh } = req.cookies;

    if (!token && !refresh) throw new Error('token does not exist');

    const ACCESS_SECRET = process.env.JWT_ACCESS_KEY;
    const REFRESH_SECRET = process.env.JWT_REFRESH_KEY;

    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      // Helpful log to find misconfig quickly
      console.error('JWT secrets missing:', {
        hasAccess: !!ACCESS_SECRET,
        hasRefresh: !!REFRESH_SECRET
      });
      throw new Error('server config error: jwt secret missing');
    }

    let payload;

    // Try verify access token first
    try {
      payload = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      // If no refresh, ask login again
      if (!refresh) throw new Error('session ended, login again');

      // Verify refresh token
      let refpayload;
      try {
        refpayload = jwt.verify(refresh, REFRESH_SECRET);
      } catch {
        throw new Error('refresh token invalid or expired');
      }

      // Re-issue a new access token using the SAME access secret
      const newToken = jwt.sign(
        {
          _id: refpayload._id,
          email: refpayload.email, // keep field names consistent
          name: refpayload.name,
          role: refpayload.role
        },
        ACCESS_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('token', newToken, {
        ...COOKIE_BASE,
        maxAge: 60 * 60 * 1000
      });

      payload = refpayload;
    }

    const user = await User.findById(payload._id);
    if (!user) throw new Error('user not found or invalid ID');

        //  const isBlocked = await redisClient.exists(`token:${token}`);
        // const isRefBlocked = await redisClient.exists(`refresh:${refresh}`);
        // if (isBlocked || isRefBlocked) throw new Error('login again');

    req.user = user;
    next();
  } catch (error) {
    console.log('userMiddleware: ' + error);
    // Send JSON to avoid HTML showing up in frontend
    res.status(401).json({ message: error.message, user: null });
  }
};

module.exports = userMiddleware;
