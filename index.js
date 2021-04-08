const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()


const port = process.env.PORT || 5055


console.log(process.env.DB_USER);

app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x0ej8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log('connection error', err);
  const eventCollection = client.db("cosmetic").collection("products");

  app.get('/events', (req,res) => {
    eventCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get("/event/:id", (req, res) => {
    const id = ObjectID(req.params.id)
    eventCollection.find(id)
    .toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post('/addEvent', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event: ', newEvent);
    eventCollection.insertOne(newEvent)
    .then(result => {
      console.log('inserted count', result.insertedCount);
      res.send(result.insertedCount > 0)
    })
  })

  app.delete('/deleteEvent/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete this', id);
    eventCollection.deleteOne({_id: id})
    .then(result => console.log(result.deletedCount > 0))
  })

  //   client.close();
});

client.connect((err) => {
  const orderCollection = client.db("cosmetic").collection("orders");
  
  app.post("/addOrder", (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
    console.log(newOrder);
  })
  app.get("/orders", (req, res) => {
    orderCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})