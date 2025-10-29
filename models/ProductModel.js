var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    category: {
        type: mongoose.SchemaTypes.ObjectId,  // "category" là tên của field tham chiếu
        ref: 'categories'                      // "categories" là tên của collection tham chiếu
    }
});

var ProductModel = mongoose.model("products", ProductSchema);

module.exports = ProductModel;
