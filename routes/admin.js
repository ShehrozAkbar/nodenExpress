const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const adminController = require('../controller/admin');

const isAuth = require('../middleware/is-auth');

const { body } = require('express-validator');


const router = express();

// /admin/add-product =>GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products =>GET

router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST

router.post('/add-product',
    [
        body('title', 'title should be string of min 3 length.')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl', 'URL should be valid.')
            .isURL(),
        body('price', 'price should be a valid float.')
            .isFloat(),
        body('description', 'enter min 20 char for desc.')
            .trim()
            .isLength({ min: 20 })
    ],
    isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title', 'title should be string of min 3 length.')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl', 'URL should be valid.')
            .isURL(),
        body('price', 'price should be a valid float.')
            .isFloat(),
        body('description', 'enter min 20 char for desc.')
            .trim()
            .isLength({ min: 20 })
    ],
    isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;