const mysql = require('promise-mysql');
// [START cloud_sql_mysql_mysql_create_socket]
const createConnection = async () => {
  return await mysql.createPool({
    user: 'convatec_ob', 
    password: '_>*a74HE]}{A{m3S',
    database: 'convatec_ob', 
    socketPath: `/cloudsql/vci-live:us-central1:vci-livesql`,
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0,
  });
};
// [END cloud_sql_mysql_mysql_create_socket]

const ensureSchema = async pool => {
  // Wait for tables to be created (if they don't already exist).
  await pool.query(
    `CREATE TABLE IF NOT EXISTS votes
      ( vote_id SERIAL NOT NULL, time_cast timestamp NOT NULL,
      candidate CHAR(6) NOT NULL, PRIMARY KEY (vote_id) );`
  );
  console.log("Ensured that table 'votes' exists");
};

module.exports = createPoolAndEnsureSchema = async () =>
  await createConnection()
    .then(async pool => {
      await ensureSchema(pool);
      return pool;
    })
    .catch(err => {
      logger.error(err);
      throw err;
});

