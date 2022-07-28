const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middlewar
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xk61tih.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect()
    const allServiceCollection = client.db("eventy-data-collection").collection("all-service");
    const allReviewCollection = client.db("eventy-data-collection").collection("all-review");
    const allVenue = client.db("eventy-data-collection").collection("all-Venue");


    
    app.post('/post-review', async (req, res) => {
      const postReview = await allReviewCollection.insertOne(req.body)
      res.send(postReview)
    })
// allItems
    app.get("/allItems", async (req, res) => {
      const query = {};
      const cursor = allServiceCollection.find(query);
      const allItems = await cursor.toArray();
      res.send(allItems);
    });
    // all venue
  
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Eventy server is running");
});

app.listen(port, () => {
  console.log("Listning to port", port);
});
