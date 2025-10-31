const express = require("express");
const cors=require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT||3000;

//middleware
app.use(cors())
app.use(express.json())



app.get("/", (req, res) => {
  res.send("hello smart server !");
});


const uri ="mongodb+srv://SmartDBUser:uToEV0JvlvzQ90Ws@cluster0.g6tkuix.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

 const database = client.db("productsDB");
 const productCollection = database.collection("products");
   //setup the data into database by server 
   app.post("/products",async(req,res)=>{
    const newProduct=req.body;
    const result=await productCollection.insertOne(newProduct)
    res.send(result)

   })
   //delete product form database
   app.delete("/products/:id",async (req,res)=>{
    const id=req.params.id;
     const query={_id:new ObjectId(id)}
      const result=await productCollection.deleteOne(query)
      res.send(result)
   })

// find all data form database 
app.get("/products",async(req,res)=>{
    const cursor=productCollection.find()
    const result=await  cursor.toArray()
    res.send(result)
})

//find specific data form database
app.get("/products/:id",async (req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await productCollection.findOne(query)
    res.send(result)
})

   //update product name and price 
   app.patch("/products/:id",async (req,res)=>{
    const id=req.params.id;
    const updateProduct=req.body;
    const query={_id:new ObjectId(id)}
    const update={
        $set:{
            name:updateProduct.name,
            price:updateProduct.price,
        }
    }
     const result =await productCollection.updateOne(query,update)
     res.send(result)
   })









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);








app.listen(port, () => {
  console.log(`smart server is running  on port ${port}`);
});
//SmartDBUser
//uToEV0JvlvzQ90Ws