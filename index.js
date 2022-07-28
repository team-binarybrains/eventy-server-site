const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { application } = require("express");

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
    const allVenueCollection = client.db("eventy-data-collection").collection("all-venue");
    const allReviewCollection = client.db("eventy-data-collection").collection("all-review");
    const selectVenuCollection = client.db("eventy-data-collection").collection("select-venu");
    const allBookingCollection = client.db("eventy-data-collection").collection("all-booking");

    app.get("/allservices", async (req, res) => {
      const services = await allServiceCollection.find().toArray();
      res.send(services);
    })

    app.get("/allvenues", async (req, res) => {
      const venues = await allVenueCollection.find().toArray();
      res.send(venues);
    })

    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allServiceCollection.findOne(query);
      res.send(result);
    })

    app.get("/selectVenu/:email", async (req, res) => {
      const query = { email: req.params.email }
      const venu = await selectVenuCollection.find(query).toArray();
      res.send(venu);
    })

    app.post("/venuInsert", async (req, res) => {
      const selectVenu = req.body;
      const venuCount = await selectVenuCollection.find().toArray();
      if (venuCount.length) {
        res.send({ acknowledged: false });
      } else {
        const venuPost = await selectVenuCollection.insertOne(selectVenu);
        res.send(venuPost);
      }
    })

    app.post("/booking", async (req, res) => {
      const bookingInfo = req.body;
      const result = await allBookingCollection.insertOne(bookingInfo);
      res.send(result);
    })

    app.delete("/selectVenuDelete/:id", async (req, res) => {
      const deleteId = req.params.id;
      const result = await selectVenuCollection.deleteOne({ _id: ObjectId(deleteId) })
      res.send(result);
    })

    app.post('/post-review', async (req, res) => {
      const postReview = await allReviewCollection.insertOne(req.body)
      res.send(postReview)
    })

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
