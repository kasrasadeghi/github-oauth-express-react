const express = require('express');
const path = require('path');

const request = require('axios');

const app = express();
const port = process.env.PORT || 5000;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const paramsify = (params) => Object.keys(params).map(k => [k, params[k]].map(encodeURIComponent).join('=')).join('&');

// API calls
app.post('/api/hello', (req, res) => {
  res.send({ message: 'Hello From Express' });
});

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello From Express' });
});

app.post('/api/postauth', (req, res) => {
  request.post('https://github.com/login/oauth/access_token', req.query + '&' + CLIENT_SECRET, {headers: {Accept: "application/json"}})
  .then(r => {
    let {access_token, scope, token_type} = r.data;
    res.send({access_token, scope, token_type});
  }).catch(e => console.log(e));
});

// Serve any static files
// app.use(express.static(path.join(__dirname, 'client/build')));

// // Handle React routing, return all requests to React app
// app.get('/index.html', function(req, res) {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// app.get('/authed', function(req, res) {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });



const GITHUB_BASE = "https://api.github.com/"

//                                    undocumented magic
const get_path = (req) => { return req.params[0] }
const make_github_url = (path, params) => GITHUB_BASE + path + '?' + paramsify(params);

app.post('/github/*', function(req, res) {
  const path = get_path(req);
  const url = make_github_url(path, req.query);

  console.log('requesting to', url);
  request.post(url)
  .then(r => {
    console.log('sending', r.data);
    res.send(r.data);
  })
  .catch(e => {
    console.log(e.message);
    console.log(e.config);
    res.send(e.message);
  });
})

app.get('/github/*', function(req, res) {
  const path = get_path(req);
  const url = make_github_url(path, req.query);

  console.log('requesting to', url);
  request.get(url)
  .then(r => {
    console.log('sending', r.data);
    res.send(r.data);
  })
  .catch(e => {
    console.log(e.message);
    console.log(e.config);
    res.send(e.message);
  });
})

app.listen(port, () => console.log(`Listening on port ${port}`));
