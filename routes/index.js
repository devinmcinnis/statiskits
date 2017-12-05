var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');

function getEthPrice() {
  request('https://api.coinmarketcap.com/v1/ticker/ethereum/', function (err, resp) {
    ethPrice = parseFloat(JSON.parse(resp.body)[0].price_usd, 10);
  });
}

var ethPrice = 0;
getEthPrice();
setInterval(getEthPrice, 1000 * 60 * 15); // Every 15 minutes

const oneEth = 1000000000000000000;
const API_LIMIT = 100;

/* GET home page. */
router.get('/', function (req, res, next) {

  //https://api.cryptokitties.co/auctions?offset=0&limit=12&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc
  request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (errSaleCheap, respSaleCheap) {
    request(`https://api.cryptokitties.co/auctions?offset=&limit=${API_LIMIT}&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc`, function (errSaleExp, respSaleExpensive) {
      request('https://api.cryptokitties.co/auctions?offset=&limit=10&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc', function (errSireCheap, respSireCheap) {
        request('https://api.cryptokitties.co/auctions?offset=&limit=50&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=desc', function (errSireExp, respSireExpensive) {

          var saleLeast = [];

          if (respSaleCheap.statusCode === 200) {
            saleLeast = JSON.parse(respSaleCheap.body).auctions;
          }

          var saleMost = [];

          if (respSaleExpensive.statusCode === 200) {
            saleMost = JSON.parse(respSaleExpensive.body).auctions;
          }

          var sireLeast = [];

          if (respSireCheap.statusCode === 200) {
            saleMost = JSON.parse(respSireCheap.body).auctions;
          }

          var sireMost = [];

          if (respSireExpensive.statusCode === 200) {
            saleMost = JSON.parse(respSireExpensive.body).auctions;
          }

          saleMost = saleMost.filter(function(catObj) {
           return parseInt(catObj.current_price, 10) <= oneEth * 495;
          }).slice(0, 10);

          sireMost = sireMost.filter(function(catObj) {
            return parseInt(catObj.current_price, 10) <= oneEth * 15;
          }).slice(0, 10);

          res.render('index', {
            ethPrice: ethPrice,
            headerTitle: 'Top 10s',
            saleLeast: saleLeast,
            saleMost: saleMost,
            sireLeast: sireLeast,
            sireMost: sireMost,
            title: 'CryptoKitties Tools - Top 10s'
          });
        });
      });
    });
  });
});


router.get('/sale/:page?', function (req, res, next) {
  var paramPage = req.params.page;
  var isGoodPageNum = paramPage > 0;
  var page = isGoodPageNum ? parseInt(paramPage, 10) : 0;
  var offset = page * API_LIMIT;
  var search = req.query.search || '';

  request(`https://api.cryptokitties.co/auctions?offset=${offset}&search=${search}&limit=${API_LIMIT}&type=sale&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc`, function (errSale, respSale) {

    var parsedResp = {};

    if (respSale.statusCode === 200) {
      parsedResp = JSON.parse(respSale.body);
    }

    var totalOverLimit = parsedResp.total > offset;
    var sale = parsedResp.auctions;

    res.render('all', {
      ethPrice: ethPrice,
      headerTitle: 'For Sale',
      kitties: sale,
      nextPage: totalOverLimit ? page + 1 : null,
      pageType: 'sale',
      prevPage: isGoodPageNum ? page - 1 : null,
      title: 'CryptoKitties Tools - For Sale'
    });
  });

});


router.get('/sire/:page?', function (req, res, next) {
  var paramPage = req.params.page;
  var isGoodPageNum = paramPage > 0;
  var page = isGoodPageNum ? parseInt(paramPage, 10) : 0;
  var offset = page * API_LIMIT;
  var search = req.query.search || '';

  request(`https://api.cryptokitties.co/auctions?offset=${offset}&search=${search}&limit=${API_LIMIT}&type=sire&status=open&sorting=cheap&orderBy=current_price&orderDirection=asc`, function (errSire, respSire) {

    var parsedResp = {};

    if (respSire.statusCode === 200) {
      parsedResp = JSON.parse(respSire.body);
    }

    var totalOverLimit = parsedResp.total > offset;
    var sire = parsedResp.auctions;

    res.render('all', {
      ethPrice: ethPrice,
      headerTitle: 'For Sire',
      kitties: sire,
      nextPage: totalOverLimit ? page + 1 : null,
      pageType: 'sire',
      prevPage: isGoodPageNum ? page - 1 : null,
      title: 'CryptoKitties Tools - For Sire'
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
      image_url: kitty.image_url,
      status: {
        cooldown_index: kitty.status.cooldown_index
      }
    }
  };
}

router.get('/clock/:pageId?', function (req, res, next) {
  var paramPage = req.params.page;
  var isGoodPageNum = paramPage > 0;
  var page = isGoodPageNum ? parseInt(paramPage, 10) : 0;
  var offset = page * API_LIMIT;
  var search = req.query.search || '';

  request(`https://api.cryptokitties.co/kitties?offset=${offset}&limit=${API_LIMIT}&owner_wallet_address=0x06012c8cf97bead5deae237070f9587f8e7a266d&sorting=cheap&orderBy=current_price&orderDirection=asc`, function (errClock, respClock) {

    var parsedResp = {};

    if (respClock.statusCode === 200) {
      parsedResp = JSON.parse(respClock.body);
    }

    var totalOverLimit = parsedResp.total > offset;
    var clock = parsedResp.kitties && parsedResp.kitties.map(formatClockCat);

    res.render('all', {
      ethPrice: ethPrice,
      headerTitle: 'Clock Cats',
      kitties: clock,
      nextPage: totalOverLimit ? page + 1 : null,
      pageType: 'clock',
      prevPage: isGoodPageNum ? page - 1 : null,
      title: 'CryptoKitties Tools - Clock Cats'
    });
  });
});

module.exports = router;
