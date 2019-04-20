const express = require('express')
const router = express.Router()
const mw = require('../middlewares/auth');
const { S3, S3DiskStorage, API, AzureDiskStorage } = require('../lib');
const products = require('../models/products');

const multer  = require('multer');
router.post('/', mw.isAuthAPI, (req, res)=>{
    const uploader = multer({
        storage: AzureDiskStorage({})
      }).fields([
        { name: 'real_food', maxCount: 1 },
        { name: 'junk_food', maxCount: 1 },
      ]);

    uploader(req,res,(err, result)=>{
        if(err){
            res.status(400).json({
                message: "There is something wrong with the request. Please try again.",
                error: err
            });
        }else{
            if(req.files.real_food){
                let body = req.files.real_food[0].body;
                let tags = ['',
                    ...body.tags.map(e=>e.name.toLowerCase()),
                    ...body.description.tags.map(e=>e.toLowerCase()),
                    ...body.brands.map(e=>e.name.toLowerCase()),
                    ...body.objects.map(e=>e.object.toLowerCase())
                ];
                products.getProductsByTag(tags).then(data=>{
                    res.status(200).json(data);
                }).catch(error=>{
                    res.status(400).json({
                        message: "There is problem with your request.",
                        error: error
                    });
                })
            }
            if(req.files.junk_food){
                res.status(200).json(req.files.junk_food[0].body);
            }

            if(Object.keys(req.files).length <= 0){
                res.status(400).json({
                    message: "There is problem with your request. Please try again."
                })
            }
        }
    });
});

module.exports = router;