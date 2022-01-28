const express = require("express");
var cors = require('cors')
const app = express();
const validateAssertion = require('./iapFunctions');
const createPoolAndEnsureSchema = require('./database');

app.use(cors())

// Passing headers to the front end
app.post('/api/get-email', async (req, res) => {
  const assertion = req.header('X-Goog-IAP-JWT-Assertion');
  try {
    info = await validateAssertion(assertion);
    console.log(info)
    // var email = info.email;
    res.status(200).send(info).end();
  } catch (error) {
    console.log(error);
  }
  res.status(200).send(`Agent@test.com`).end();
})
// Getting user role from cloud sql

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool;

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPoolAndEnsureSchema();
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

app.get('/api/get-role',async (req, res) => {
  pool = pool || (await createPoolAndEnsureSchema());
  const email = req.query.email
  try {
    // Get the 5 most recent votes.
    const gettingRoleQuery = pool.query('SELECT role FROM users WHERE email= ?',[email]);
    
    const [result] = await gettingRoleQuery;

    res.status(200).send(JSON.stringify(result)).end();
  } catch (err) {
    res
      .status(500)
      .send(
        'Unable to load page. Please check the application logs for more details.'
      )
      .end();
  }
});

// End of Getting user role
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
