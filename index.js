const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { application } = require("express");

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

function varifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Un authorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    // console.log("this is decoded", decoded);
    next();
  });
}

async function run() {
  try {
    await client.connect()
    const allServiceCollection = client.db("eventy-data-collection").collection("all-service");
    const allVenueCollection = client.db("eventy-data-collection").collection("all-venue");
    const allReviewCollection = client.db("eventy-data-collection").collection("all-review");
    const selectVenuCollection = client.db("eventy-data-collection").collection("select-venu");
    const allBookingCollection = client.db("eventy-data-collection").collection("all-booking");
    const userCollection = client.db("eventy-data-collection").collection("all-users");
    const allVenue = client.db("eventy-data-collection").collection("all-Venue");

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

    //  admin verification
    const verifyAdmin = async (req, res, next) => {
      const userEmail = req.decoded?.email;
      // console.log(userEmail);
      const user = await userCollection.findOne({
        email: userEmail,
      });
      if (user?.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
    };

    app.get('/post-review', async (req, res)=> {
      const reviews = await allReviewCollection.find().toArray();
      res.send(reviews);
    });

    app.post("/post-review", async (req, res) => {
      const user = await allReviewCollection.findOne({ email: req.body.email });
      if (user?.email) {
        res.send({ insert: false });
      } else {
        const postReview = await allReviewCollection.insertOne(req.body);
        res.send({ insert: true });
      }
    });

    // get an admin
    app.get("/admin/:email", varifyJwt ,async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "40d",
      });
      res.send({ result, token });
    });

    app.get("/allusers", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/delete-user/:id", async (req, res) => {
      const deleteSpecificUser = await userCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(deleteSpecificUser);
    });
// allItems
    app.get("/allItems", async (req, res) => {
      const query = {};
      const cursor = allServiceCollection.find(query);
      const allItems = await cursor.toArray();
      res.send(allItems);
    });
    // all venue

    // my booking
    app.get("/myBooking", async (req, res) => {
      const query = {};
      const cursor = allBookingCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.delete("/myBooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allBookingCollection.deleteOne(query);
      res.send(result);
    });
  
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
