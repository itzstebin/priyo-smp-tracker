// api/index.js - Serverless function entrypoint for Vercel deployment
const app = require('../server/index');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Vercel Serverless Invocation Error:', err);
    res.status(500).json({
      error: 'Vercel Serverless Invocation Error',
      message: err.message,
      stack: err.stack
    });
  }
};
