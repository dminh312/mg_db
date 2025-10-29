var CategoryModel = require('../models/CategoryModel');
var ProductModel = require('../models/ProductModel');
var router = require('express').Router();
var authMiddleware = require('../middleware/auth');

// List all categories - accessible to all authenticated users
router.get('/', async (req, res) => {
    var categoryList = await CategoryModel.find({});
    var isAdmin = req.session && req.session.role === 'admin';

    res.render('category/index', { categoryList, isAdmin, username: req.session.username });
    console.log(categoryList)
});

// Admin-only routes
router.get('/delete/:id', authMiddleware.ensureAdmin, async (req, res) => {
    // req.params: get value by URL
    var id = req.params.id;

    await CategoryModel.findByIdAndDelete(id);

    res.redirect('/category');
});

// render form for user to input
router.get('/add', authMiddleware.ensureAdmin, (req, res) => {
    res.render('category/add', { username: req.session.username });
});

// receive form data and insert it to database
router.post('/add', authMiddleware.ensureAdmin, async (req, res) => {
    // get value by form : req.body
    var category = req.body;

    await CategoryModel.create(category);

    res.redirect('/category/add');
});

router.get('/edit/:id', authMiddleware.ensureAdmin, async (req, res) => {
    var id = req.params.id;
    var category = await CategoryModel.findById(id);

    res.render('category/edit', { category, username: req.session.username });
});

router.post('/edit/:id', authMiddleware.ensureAdmin, async (req, res) => {
    var id = req.params.id;
    var data = req.body;

    await CategoryModel.findByIdAndUpdate(id, data);
    console.log(data);

    res.redirect('/category');
});

router.get('/detail/:id', async (req, res) => {
    var id = req.params.id;
    var category = await CategoryModel.findById(id);
    var productList = await ProductModel.find({ category: id }).populate('category');
    var isAdmin = req.session && req.session.role === 'admin';
    res.render('product/index', { productList, isAdmin, username: req.session.username, category: category });
});
module.exports = router;