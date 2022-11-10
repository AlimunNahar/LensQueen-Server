const express = require("express");
const cors = require("cors");
// const jwt = require("JsonWebToken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rz0ozm8.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("lensQueen").collection("services");

    const reviewCollection = client.db("lensQueen").collection("reviews");

    // load all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // Only 3 service
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const homeService = await cursor.limit(3).toArray();
      console.log(homeService);
      res.send(homeService);
    });

    // load individual services
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      // console.log(service);
      res.send(service);
    });

    // post reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // get reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
      // console.log(reviews);
    });

    // update
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: status,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
  } finally {
  }
}

run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("Lens Queen server is running");
});

app.listen(port, () => {
  console.log(`Lens Queen server running on port: ${port}`);
});
