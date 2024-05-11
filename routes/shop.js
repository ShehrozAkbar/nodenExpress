const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const isAuth = require('../middleware/is-auth');


const shopController = require('../controller/shop')

const router = express();

// this response will triger automatically because all the link that have / , thats why we put it at last

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productID', shopController.getproduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart/delete-product', isAuth, shopController.postDeleteCartProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;