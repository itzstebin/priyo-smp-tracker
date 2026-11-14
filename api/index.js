// api/index.js - Serverless function entrypoint for Vercel deployment
let app = null;
let initError = null;

try {
  app = require('../server/index');
} catch (err) {
  console.error('Fatal initialization error:', err);
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Backend Initialization Error',
      message: initError.message,
      stack: initError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Runtime execution error:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Runtime execution error',
      message: err.message,
      stack: err.stack
    });
  }
};
