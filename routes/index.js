var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');

function attachTimeUntilEnd(cat) {
  var timeNow = moment();
  var catEndTime = moment(new Date(parseInt(cat.end_time, 10)))
  cat.time_until_end = catEndTime.fromNow();

  var endingWithin5Minutes = catEndTime.diff(timeNow, 'minutes') <= 30;

  if (endingWithin5Minutes) {
    cat.ending_soon = true;
  }

  return cat;
}

function getEthPrice() {
  request('https://api.coinmarketcap.com/v1/ticker/ethereum/', function (err, resp) {
    ethPrice = parseInt(JSON.parse(resp.body)[0].price_usd, 10);
  });
}

var ethPrice = 0;
getEthPrice();
setInterval(getEthPrice, 1000 * 60 * 15); // Every 15 minutes

/* GET home page. */
router.get('/', function (req, res, next) {

  //https://api.cryptokitties.co/auctions?offset=0&limit=12&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc
  request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSaleCheap) {
    request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc', function (err, respSaleExpensive) {
      request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSireCheap) {
        request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc', function (err, respSireExpensive) {

          var saleLeast = JSON.parse(respSaleCheap.body).auctions.map(attachTimeUntilEnd);
          var saleMost = JSON.parse(respSaleExpensive.body).auctions.map(attachTimeUntilEnd);
          var sireLeast = JSON.parse(respSireCheap.body).auctions.map(attachTimeUntilEnd);
          var sireMost = JSON.parse(respSireExpensive.body).auctions.map(attachTimeUntilEnd);

          // var saleEndSoon = saleLeast.sort(function(a, b) {
          //   return a.end_time - b.end_time;
          // }).slice(0, 10);

          // var sireEndSoon = sireAuctions.sort(function(a, b) {
          //   return a.end_time - b.end_time;
          // }).slice(0, 10);

          res.render('index', {
            ethPrice: ethPrice,
            lastUpdate: new Date(),
           // saleEndSoon: saleEndSoon,
            saleLeast: saleLeast,
            saleMost: saleMost,
          //  sireEndSoon: sireEndSoon,
            sireLeast: sireLeast,
            sireMost: sireMost,
            title: 'Top 10s'
          });
        });
      });
    });
  });
});

/* GET home page. */
router.get('/sale', function (req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=5000&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSale) {

    var sale = JSON.parse(respSale.body).auctions.map(attachTimeUntilEnd);

    res.render('all', {
      ethPrice: ethPrice,
      lastUpdate: new Date(),
      kitties: sale,
      title: 'For Sale'
    });
  });

});

/* GET home page. */
router.get('/sire', function (req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=5000&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSire) {

    var sire = JSON.parse(respSire.body).auctions.map(attachTimeUntilEnd);

    res.render('all', {
      ethPrice: ethPrice,
      lastUpdate: new Date(),
      kitties: sire,
      title: 'For Sire'
    });
  });

});

module.exports = router;
