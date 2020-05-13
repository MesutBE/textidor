'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// - setup -
const FILES_DIR = __dirname + '/text-files';
// create the express app
const app = express();

// - use middleware -
// allow Cross Origin Resource Sharing
app.use(cors());
// parse the body
app.use(bodyParser.json());

// https://github.com/expressjs/morgan#write-logs-to-a-file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
// and log to the console
app.use(morgan('dev'));

// statically serve the frontend
app.use(express.static('public')); // in this way we can serve our index.html and the other files as front-end

// to complete the project we need to see 
// demo.min.js app's logs by inspecting 
// the page and look at network requests

// - declare routes -

// read all file names
app.get('/files', (req, res, next) => {
  fs.readdir(FILES_DIR, 'utf-8', (err, list) => {
    if (!list) {
      res.status(404).end();
      return;
    }
    if (err) {
      // https://expressjs.com/en/guide/error-handling.html
      next(err);
      return;
    }

    res.json(list);
  });
});

// read a file
app.get('/files/:name', (req, res, next) => {
  const fileName = req.params.name;
  fs.readFile(`${FILES_DIR}/${fileName}`, 'utf-8', (err, fileText) => {
    if (!list) {
      res.status(404).end();
      return;
    }
    if (err) {
      next(err);
      return;
    }

    const responseData = {
      name: fileName,
      text: fileText,
    };
    res.json(responseData);
  });
});

// write a file
app.post('/files/:value', (req, res, next) => {
  const fileName = req.params.value;
  const fileText = req.body.text; // see action.js saveFile method fileText is sent in body..
  // console.log(fileName);
  // console.log(fileText);


  fs.writeFile(`${FILES_DIR}/${fileName}`, fileText, err => {
    if (err) {
      next(err);
      return;
    }
    // https://stackoverflow.com/questions/33214717/why-post-redirects-to-get-and-put-redirects-to-put
    res.redirect(303, '/files');
  });
});

// delete a file
app.delete('/files/:writesomething', (req, res, next) => {
  const fileName = req.params.writesomething;
  
  fs.unlink(`${FILES_DIR}/${fileName}`, err => {
    if (err && err.code === 'ENOENT') {
      // if file doesn't exist
      next(err);
      return;
    }
    if (err) {
      next(err);
      return;
    }

    res.redirect(303, '/files');
  });
});

// - handle errors in the routes and middleware -

// https://expressjs.com/en/guide/error-handling.html
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).end();
});

// - open server -
// try to exactly match the message logged by demo.min.js
app.listen(
  config.PORT,
  () => {
    console.log(`simple editor: running on port ${config.PORT} (${config.MODE} mode)`);
  }
);
