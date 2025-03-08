const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
	const search = "Sectional";
	const products = await Product.find({price:{$lt:30}}).limit(10);
	res.status(200).json({nbHits: products.length, products: products});
};

const getAllProducts = async (req, res) => {
	// destructuring request query
	const { featured, company, name, price, rating, sort, fields, numericFilters } = req.query;
	const queryObject = {};

	// checking if featured exists
	if (featured) {
		// if featured exists it's value is assigned to the queryObject
		queryObject.featured = featured === "true" ? true : false;
	}

	// checking if company exists
	if (company) {
		// if company exists it's value is assigned to the queryObject
		queryObject.company = { $regex: company, $options: "i" }; // passing in regex object with options i for case insensitivity
	}

	// checking if name exists
	if (name) {
		// if name exists it's value is assigned to the queryObject
		queryObject.name = { $regex: name, $options: "i" }; // passing in regex object with options i for case insensitivity
	}

	// checking if rating exists
	if (rating) {
		// if rating exists it's value is assigned to the queryObject
		queryObject.rating = rating;
	}

	// checking if price exists
	if (price) {
		// if price exists it's value is assigned to the queryObject
		queryObject.price = price;
	}
	
	// checking if numericFilters exists
	if (numericFilters) {
		const numericFiltersList = numericFilters.split(",").join(" ");
		const operatorMap = {
			">" : "$gt",
			"<" : "$lt",
			"=" : "$eq",
			">=" : "$gte",
			"<=" : "$lte"
		}
		const regEx = /\b(=|>|<|<=|>=)\b/g

		let filters = numericFilters.replace(regEx, (match)=> `-${operatorMap[match]}-`)

		const options = ['price','rating'];

		filters = filters.split(',').forEach((item)=> {
			const [field,operator,value] = item.split('-');
			if(options.includes(field)){
				queryObject[field] = { [operator]: Number(value) }
			}
		})

		// if price exists it's value is assigned to the queryObject
		console.log(filters);
	}

	// find all products with queryObject
	let result = Product.find(queryObject);

	// checking if sort exists
	if (sort) {
        const sortList = sort.split(",").join(" ");
		result = result.sort(sortList);
	} else {
        result = result.sort("createdAt");
	}
    
	// checking if fields exists
	if (fields) {
        const fieldsList = fields.split(",").join(" ");
		result = result.select(fieldsList);
	} else {
        result = result.select({});
	}

	// page logic
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page-1) * limit;
     
    result = result.skip(skip).limit(limit)
    
	const products = await result;
	res.status(200).json({nbHits: products.length, products: products});
};

module.exports = {
	getAllProducts,
	getAllProductsStatic,
};
