var express = require('express');
var router = express.Router();
var request = require('request');

var ethPrice = 520;

function getEthPrice() {
  request('https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=CAD', function(err, resp) {
    ethPrice = parseInt(JSON.parse(resp.body)[0].price_cad, 10);
  });
}

getEthPrice();
setInterval(getEthPrice, 1000 * 60 * 15); // Every 15 minutes

/* GET home page. */
router.get('/', function(req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=1000&type=sale&status=open', function(err, respSale) {
    request('https://api.cryptokitties.co/auctions?offset=&limit=1000&type=sire&status=open', function(err, respSire) {
      var bodySale = JSON.parse(respSale.body);
      var bodySire = JSON.parse(respSire.body);

      var sale = bodySale.auctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      var saleEndPrice = bodySale.auctions.sort(function(a, b) {
        return a.end_price - b.end_price;
      }).slice(0, 10);

      var sire = bodySire.auctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      res.render('index', {
        ethPrice: ethPrice,
        firstSale: sale[0],
        firstSire: sire[0],
        lastUpdate: new Date(),
        sale: sale,
        saleEndPrice: saleEndPrice,
        sire: sire,
        title: 'Top 10s'
      });
    });
  });

});

/* GET home page. */
router.get('/sale', function(req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=1000&type=sale&status=open', function(err, respSale) {
      var bodySale = JSON.parse(respSale.body);

      var sale = bodySale.auctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      });

      res.render('all', {
        ethPrice: ethPrice,
        lastUpdate: new Date(),
        kitties: sale,
        title: 'For Sale'
      });
  });

});

/* GET home page. */
router.get('/sire', function(req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=1000&type=sire&status=open', function(err, respSire) {
      var bodySire = JSON.parse(respSire.body);

      var sire = bodySire.auctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      });

      res.render('all', {
        ethPrice: ethPrice,
        lastUpdate: new Date(),
        kitties: sire,
        title: 'For Sire'
      });
  });

});

module.exports = router;
