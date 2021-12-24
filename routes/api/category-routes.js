const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryRoutes = await Category.findAll();
    res.status(200).json(categoryRoutes);
    return;
  } catch (error) {
    res.send(500).json(error);
    
  }
  
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findOne(req.params.id, {
        include: [{ model: Product }]
    });
          if (!categoryData) {
            res.status(404).json({ message: 'No Category found with this id!' });
            return;
          }
          res.status(200).json(categoryData);
        
        } catch (error) {
          res.status(500).json(error);
        }
      });

router.post('/', async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create({
      category_name: 
        req.body.category_name});
        res.status(200).json(categoryData);
  } catch (error) {
      res.status(500).json(error);

  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  
  
  try {
    const categoryData = await Category.update({
      where: {
        id: req.params.id,
      },
        category_name: req.body.category_name
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No Category found with this id!' });
      return;
    }
    res.status(200).json(categoryData);
  
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No Category found with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);

  }
});

module.exports = router;
