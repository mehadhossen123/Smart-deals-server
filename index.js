const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Root route
app.get("/", (req, res) => {
  res.send("Hello Smart Server!");
});

// 🔹 MongoDB Connection URI
const uri =
  "mongodb+srv://SmartDBUser:uToEV0JvlvzQ90Ws@cluster0.g6tkuix.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ✅ Connect to MongoDB
    await client.connect();

    const database = client.db("productsDB");
    const productCollection = database.collection("products");
    const bidsCollection = database.collection("Bids");
    const userCollection = database.collection("user");

    // 🔹 POST: Add user
    app.post("/user", async (req, res) => {
      const newUser = req.body;
       const existingUser=await userCollection.findOne({email:req.body.email})
       if(existingUser){
        res.send("user is already exist in the database ")
       }
       else{
         const result = await userCollection.insertOne(newUser);
         res.send(result);

       }

     
    });

//get latest product
    app.get("/latest-product",async (req,res)=>{
        const cursor = productCollection.find().sort({
          created_at:-1
        }).limit(6)
        const result=await cursor.toArray()
        res.send(result)
    })


    // 🔹 POST: Add product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // 🔹 DELETE: Delete a product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // 🔹 GET: All products (with optional email filter)
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // 🔹 GET: Single product by ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // 🔹 PATCH: Update product name and price
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateProduct.name,
          price: updateProduct.price,
        },
      };
      const result = await productCollection.updateOne(query, update);
      res.send(result);
    });

    // 🔹 GET: All bids (with optional buyer email filter)
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

   //get specific bids for a product 
   app.get("/bids/products/:productId",async (req,res)=>{
     const  productId=req.params.productId;
      const cursor = bidsCollection.find({ product :productId}).sort({bid_price:-1});
      const result =await cursor.toArray()
      res.send(result)

   })

 
   app.get("/bids",async(req,res)=>{
    const cursor=bidsCollection.find({buyer_email:req.query.email})
    const result=await cursor.toArray()
    res.send(result)
   })
  
  //delete specific bids api is here 
  app.delete("/bids/:id",async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result =await bidsCollection.deleteOne (query)
    res.send(result)

  })




    // 🔹 POST: Add a bid
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    // ✅ MongoDB connection test
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // Connection stays open for the app to run
  }
}

// Run the function
run().catch(console.dir);

// 🔹 Start the server
app.listen(port, () => {
  console.log(`🚀 Smart Server is running on port ${port}`);
});
