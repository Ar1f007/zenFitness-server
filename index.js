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

    /**
     * @method  GET
     * @access  public
     * @desc    Get all products
     */
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    /**
     * @method  GET
     * @access  private
     * @desc    Get a single product's details
     */
    app.get('/products/details/:id', async (req, res) => {
      const { id } = req.params;
      const productDetails = await productsCollection.findOne({ _id: ObjectId(id) });
      res.send(productDetails);
    });

    /**
     * @method  POST
     * @access  private
     * @desc    Add a new product
     */
    app.post('/products', async (req, res) => {
      const { values } = req.body;
      const response = await productsCollection.insertOne({
        ...values,
        price: Number(values.price),
        quantity: Number(values.quantity),
      });

      res.send(response);
    });

    /**
     * @method  DELETE
     * @access  private
     * @desc    Delete a single product
     */
    app.delete('/products/:id', async (req, res) => {
      const { id } = req.params;
      const result = await productsCollection.deleteOne({ _id: ObjectId(id) });

      res.send(result);
    });
  } finally {
  }
};

run().catch(console.dir());

app.get('/', (req, res) => {
  res.send('Running server...');
});

app.listen(port, () => console.log('Listening to port', port));
