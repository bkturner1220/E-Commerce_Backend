const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const log = console.log;

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productRoutes = await Product.findAll();
    res.status(200).json(productRoutes);
    return;
  } catch (error) {
    res.send(404).json(error);
    
  }
  
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findOne(req.params.id, {
        include: [ Category, { model: Tag, through: ProductTag }]
    });
          if (!productData) {
            res.status(404).json({ message: 'No product found with this id!' });
            return;
          }
          res.status(200).json(productData);
        
        } catch (error) {
          res.status(500).json(error);
        }
      });

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
 try {
  const productData = await Product.create(req.body)
  .then((product) => {
    if (req.body.tagIds.length) {
      const pTagsIds = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id, tag_id,
          product_name: product.name, 
          price: product.price,
          stock: product.stock,
          tag_id: product.tagIds,
            };
              });
                return ProductTag.bulkCreate(pTagsIds);
    }
                  res.status(200).json(productData);
                    })
                      .then((productTagIds) => res.status(200).json(productTagIds))

 } catch (error) {
      res.status(500).json(error);
 }
});



// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: { id: req.params.id }
        });
    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
