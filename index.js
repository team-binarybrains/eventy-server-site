const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middlewar
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xk61tih.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect()
    const allServiceCollection = client.db("eventy-data-collection").collection("all-service");
    const allReviewCollection = client.db("eventy-data-collection").collection("all-review");
    const allVenueCollection = client.db("eventy-data-collection").collection("all-venue");
    const userCollection = client.db("eventy-data-collection").collection("all-users");

    app.get('/post-review', async (req, res)=> {
      const reviews = await allReviewCollection.find().toArray();
      res.send(reviews);
    });
    app.post('/post-review', async (req, res) => {
      const user = await allReviewCollection.findOne({email: req.body.email});
      if(user?.email){
        res.send({insert:false});
      }
      else{
        const postReview = await allReviewCollection.insertOne(req.body);
        res.send({insert:true});
      }
    })

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.get("allusers", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/delete-user/:id', async (req, res) => {
      const deleteSpecificUser = await userCollection.deleteOne({ _id: ObjectId(req.params.id) })
      res.send(deleteSpecificUser)
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
