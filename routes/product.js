var ProductModel = require('../models/ProductModel');
var CategoryModel = require('../models/CategoryModel');
var router = require('express').Router();
var authMiddleware = require('../middleware/auth');
var multer = require('multer');
var path = require('path');

// Configure multer for image uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/') // Store images in public/images folder
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// List all products - accessible to all authenticated users
router.get('/', async (req, res) => {
    var productList = await ProductModel.find({}).populate('category');
    var isAdmin = req.session && req.session.role === 'admin';

    res.render('product/index', { productList, isAdmin, username: req.session.username });
    console.log(productList);
});

// Admin-only routes
// Delete product
router.get('/delete/:id', authMiddleware.ensureAdmin, async (req, res) => {
    var id = req.params.id;

    await ProductModel.findByIdAndDelete(id);

    res.redirect('/product');
});

// Render form to add new product
router.get('/add', authMiddleware.ensureAdmin, async (req, res) => {
    var categoryList = await CategoryModel.find({});
    
    res.render('product/add', { categoryList, username: req.session.username });
});

// Handle add product form submission
router.post('/add', authMiddleware.ensureAdmin, upload.single('image'), async (req, res) => {
    var product = req.body;
    
    // If file was uploaded, save the path
    if (req.file) {
        product.image = '/images/' + req.file.filename;
    }

    await ProductModel.create(product);

    res.redirect('/product');
});

// Render form to edit product
router.get('/edit/:id', authMiddleware.ensureAdmin, async (req, res) => {
    var id = req.params.id;
    var product = await ProductModel.findById(id);
    var categoryList = await CategoryModel.find({});

    res.render('product/edit', { product, categoryList, username: req.session.username });
});

// Handle edit product form submission
router.post('/edit/:id', authMiddleware.ensureAdmin, upload.single('image'), async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    
    // If new file was uploaded, update the image path
    if (req.file) {
        data.image = '/images/' + req.file.filename;
    }

    await ProductModel.findByIdAndUpdate(id, data);
    console.log(data);

    res.redirect('/product');
});

module.exports = router;
