const { Client } = require("es7");
const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    const info = await client.info();
    console.log("Connected to Elasticsearch:", info.body.cluster_name);
  } catch (error) {
    console.error("Error connecting to Elasticsearch:", error);
  }
}

testConnection();

module.exports = client;
