const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;














// 🔹 Middleware
app.use(cors());
app.use(express.json());






 const  serviceAccount = require("./smart-deals-9cbed-firebase-adminsdk-fbsvc-078fcf4803.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});







const checkFirebaseToken= async(req,res,next)=>{
    //  console.log("author information",req.headers.authorization)
    const authorization=req.headers.authorization;
    if(!authorization){
      return res.status(401).send({message:"unauthorized accessed"})
    }
    const token=authorization.split(" ")[1]
    if(!token){
      return res.status(401).send({message:"unauthorized accessed"})
    }
    try{
      const decoded= await admin.auth().verifyIdToken(token)
      console.log("inside the token",decoded)
      req.token_email=decoded.email;
      next()

    }

    catch (e){
      return res.status(401).send({message:"unauthorized access"})


    }
}


// const veryFyFirebaseToken= async(req,res,next)=>{
//   // console.log("firebase token",req.headers.authorization)
//   if(!req.headers.authorization){
//     return res.status(401).send({message:"unauthorized authorized"})
//   }
//   const token=req.headers.authorization.split(" ")[1]
//   if(!token){
//     return res.status(401).send({message:"unauthorized access"})
//   }
//   try{
//      const userInfo= await admin.auth().verifyIdToken(token);
//      req.token_email=userInfo.email
//      console.log(userInfo);
//      next()
//   }

//   catch{
//      return res.status(401).send({message:"unauthorized access"})



//   }



 
// }




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

    app.post("/products",checkFirebaseToken, async (req, res) => {
      console.log("headers in the po",req.headers)
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
    app.get("/bids",checkFirebaseToken,async (req, res) => {
      console.log(req)
      const email = req.query.email;
      const query = {};
      if (email) {
       query.buyer_email = email;
       if(email!==req.token_email){
        return res.status(403).send({message:"forbidden people"})
       }
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
