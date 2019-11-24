const path = require('path');
const express = require('express');
const app = express();
const async = require('async');
const request = require('request');

app.use(express.static(__dirname + '/public'));

app.set('views', './views');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

/**
 * Retrieve Policy information based on accountId.
 * Implements a polling mechanism until policy information is ready.
 * Per documentation note:
 * https://trellisconnect.com/docs#-account--accountid--policies
 */
app.get('/account/:accountId/policies', (req, res) => {
  const {accountId} = req.params;
  let policiesInWaiting = true;
  async.whilst(function test(cb) {
    cb(null, policiesInWaiting);
  }, function iteratee(callback) {
    request({
      url: `https://api.trellisconnect.com/trellis/connect/1.1.0/account/${accountId}/policies`,
      headers: {
        'Accept': 'application/json',
        'X-API-Client-Id': process.env.CLIENT_KEY,
        'X-API-Secret-Key': process.env.SECRET_KEY,
      },
    }, function(err, response, body) {
      switch (response.statusCode) {
        case 400:
          callback(null, policiesInWaiting);
          break;
        case 401:
        case 404:
          callback(err);
          break;
        default:
          policiesInWaiting = !policiesInWaiting;
          callback(null, body);
      }
    });
  }, function(err, result) {
    if (err) {
      return res.json({err});
    }
    const policies = JSON.parse(result);
    res.json(policies);
  });
});

app.listen(3000, () => {
  console.log('listening on port 3000...');
});
