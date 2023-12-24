const { validationResult } = require("express-validator");
const query = require("../db/index.js");
const es = require("../elasticsearch.js");

exports.product_search = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  try {
    const response = await es.search({
      index: "product_index",
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  product_name: req.query.q,
                },
              },
              {
                match: {
                  description: req.query.q,
                },
              },
            ],
          },
        },
      },
    });

    const results = [];

    // Extract and log the hits (documents) from the response
    const hits = response.body.hits.hits;
    for (let i = 0; i < hits.length; i++) {
      const text = "select * from product where product_id=$1";
      const q = await query(text, [hits[i]._source.product_id]);
      results.push(q.rows[0]);
    }
    return res.status(200).send({ matches: results });
  } catch (error) {
    console.error("Error searching data:", error);
    return res.status(400).send({ error });
  }
};
