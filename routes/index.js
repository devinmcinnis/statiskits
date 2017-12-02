var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');

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
    request('https://api.cryptokitties.co/auctions?offset=&limit=40&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc', function (err, respSaleExpensive) {
      request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSireCheap) {
        request('https://api.cryptokitties.co/auctions?offset=&limit=20&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc', function (err, respSireExpensive) {

          var saleLeast = JSON.parse(respSaleCheap.body).auctions;
          var saleMost = JSON.parse(respSaleExpensive.body).auctions;
          var sireLeast = JSON.parse(respSireCheap.body).auctions;
          var sireMost = JSON.parse(respSireExpensive.body).auctions;

          // var genesisKitty = saleMost.find(function(catObj) {
          //   return catObj.kitty.id === 1;
          // });

          saleMost = saleMost.filter(function(catObj) {
           // return parseInt(catObj.current_price, 10) <= parseInt(genesisKitty.current_price, 10);
           return parseInt(catObj.current_price, 10) <= 3000000000000000000000; // 10ETH
           
          }).slice(0, 10);

          sireMost = sireMost.filter(function(catObj) {
            return parseInt(catObj.current_price, 10) <= 10000000000000000000; // 10ETH
          }).slice(0, 10);

          res.render('index', {
            ethPrice: ethPrice,
            saleLeast: saleLeast,
            saleMost: saleMost,
            sireLeast: sireLeast,
            sireMost: sireMost,
            title: 'Top 10s'
          });
        });
      });
    });
  });
});


router.get('/sale', function (req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=5000&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSale) {

    var sale = JSON.parse(respSale.body).auctions;

    res.render('all', {
      ethPrice: ethPrice,
      kitties: sale,
      title: 'For Sale'
    });
  });

});


router.get('/sire', function (req, res, next) {

  request('https://api.cryptokitties.co/auctions?offset=&limit=5000&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respSire) {

    var sire = JSON.parse(respSire.body).auctions;

    res.render('all', {
      ethPrice: ethPrice,
      kitties: sire,
      title: 'For Sire'
    });
  });

});

// clock cats
function formatClockCat(kitty) {
  return {
    current_price: kitty.auction.current_price,
    kitty: {
      generation: kitty.generation,
      id: kitty.id,
      image_url: kitty.image_url
    }
  };
}

router.get('/clock', function (req, res, next) {
    request('https://api.cryptokitties.co/kitties?offset=0&limit=1000&owner_wallet_address=0x06012c8cf97bead5deae237070f9587f8e7a266d&sorting=cheap&orderBy=current_price&orderDirection=asc', function (err, respClock) {

      var clock = JSON.parse(respClock.body).kitties.map(formatClockCat);

      res.render('all', {
        ethPrice: ethPrice,
        kitties: clock,
        title: 'Clock Cats'
      });
    });

  });

module.exports = router;
