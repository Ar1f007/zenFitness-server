require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dn87v.mongodb.net/zenFitness?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const productsCollection = client.db('zenFitness').collection('products');

    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get('/products/details/:id', async (req, res) => {
      const { id } = req.params;
      const productDetails = await productsCollection.findOne({ _id: ObjectId(id) });
      res.send(productDetails);
    });
  } finally {
  }
};

run().catch(console.dir());

app.get('/', (req, res) => {
  res.send('Running server...');
});

app.listen(port, () => console.log('Listening to port', port));
