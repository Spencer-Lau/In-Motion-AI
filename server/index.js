const express = require('express'); // import Express
const path = require('path');
const cors = require('cors');
const app = express(); // app, new instance of Express()

// console.log(app); // to see the methods that come with Express app

app.use(cors());

app.get('/', (req, res) => { // GET request to root endpoint, can access req to server or res to client
  res.send('req recieved')
})
app.listen(8080, () => {
  console.log('server listening on port 8080')
});