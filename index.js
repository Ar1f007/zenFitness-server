require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { verifyUser } = require('./middleware/verifyToken');

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
     * @method  POST
     * @access  public
     * @desc    Creates a token on user login
     */
    app.post('/generate-token', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '3d' });
      res.send(token);
    });

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
      const { product } = req.body;

      const response = await productsCollection.insertOne({
        ...product,
        price: Number(product.price),
        quantity: Number(product.quantity),
      });

      res.send(response);
    });

    app.get('/my-products', verifyUser, async (req, res) => {
      const email = req.user.email;

      const cursor = productsCollection.find({ email });
      const products = await cursor.toArray();

      res.send(products);
    });
    /**
     * @method  PUT
     * @access  private
     * @desc    Decrease quantity value of a single product by one
     */
    app.put('/products/:id/update-quantity', async (req, res) => {
      const { id } = req.params;
      const { quantity } = req.body;
      const response = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { quantity } }
      );

      res.send(response);
    });

    app.put('/products/:id/restock', async (req, res) => {
      const { id } = req.params;
      const { restockAmount } = req.body;

      const response = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { quantity: restockAmount } }
      );

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
