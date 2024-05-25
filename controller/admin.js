const { ObjectID } = require('bson');
const Product = require('../modles/product');
const { validationResult } = require('express-validator')
const Mongoose=require('mongoose');

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false,
        hasError: false,
        errorMessage: null,
        isAuthenticated: req.session.isLoggedIn,
        validationErrors: []
    });

}


exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const error = validationResult(req);
    // console.log(error.array());
    if (!error.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            edit: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
                imageUrl: imageUrl
            },
            errorMessage: error.array()[0].msg,
            validationErrors: error.array()
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save()
        .then(result => {
            console.log('Product Successfully created!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;
    if (!editMode) {
        res.redirect('/');
    }
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                hasError: true,
                edit: editMode,
                product: product,
                errorMessage: null,
                isAuthenticated: req.session.isLoggedIn,
                validationErrors: []

            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}


exports.postEditProduct = (req, res, next) => {

    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    const error = validationResult(req);
    // console.log(error.array());
    if (!error.isEmpty()) {
        return res.httpStatusCode(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            edit: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                imageUrl: updatedImageUrl,
                _id: prodId
            },
            errorMessage: error.array()[0].msg,
            validationErrors: error.array()
        });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            return product.save()
                .then(() => {
                    console.log('Product Updated!');
                    res.redirect('/admin/products');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });


}

exports.getProducts = (req, res, next) => {
    // req.user.getProducts()
    Product.find({ userId: req.user._id })
        // .select('title price') //this will filter the product and only show us the passed parameters [NOTE: here in the filter _id will always show unless you pass it like -_id to exclude it]
        // .populate('userId') //this will populate the userId with full user data [Note: here we cann also pass the 2nd argument of filter just like above]
        .then(products => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log(result);
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
