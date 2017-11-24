var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');

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

      var saleAuctions = JSON.parse(respSale.body).auctions.map(function(cat) {
        var timeNow = moment();
        var catEndTime = moment(new Date(parseInt(cat.end_time, 10)))
        cat.time_until_end = catEndTime.fromNow();

        var endingWithin5Minutes = catEndTime.diff(timeNow, 'minutes') <= 5;

        if (endingWithin5Minutes) {
          cat.ending_soon = true;
        }

        return cat;
      });

      var sireAuctions = JSON.parse(respSire.body).auctions.map(function(cat) {
        var timeNow = moment();
        var catEndTime = moment(new Date(parseInt(cat.end_time, 10)))
        cat.time_until_end = catEndTime.fromNow();

        var endingWithin5Minutes = catEndTime.diff(timeNow, 'minutes');

        if (endingWithin5Minutes <= 5) {
          cat.ending_soon = true;
        }

        return cat;
      });

      var saleLeast = saleAuctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      var saleMost = saleAuctions.sort(function(b, a) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      var saleEndPrice = saleAuctions.sort(function(a, b) {
        return a.end_price - b.end_price;
      }).slice(0, 10);

      var sireLeast = sireAuctions.sort(function(a, b) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      var sireMost = sireAuctions.sort(function(b, a) {
        return a.current_price - b.current_price;
      }).slice(0, 10);

      var endTime = sireAuctions.sort(function(a, b) {
        return a.end_time - b.end_time;
      }).slice(0, 10);

      res.render('index', {
        ethPrice: ethPrice,
        endTime: endTime,
        lastUpdate: new Date(),
        saleLeast: saleLeast,
        saleMost: saleMost,
        saleEndPrice: saleEndPrice,
        sireLeast: sireLeast,
        sireMost: sireMost,
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
