const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Image = require("../models/Image")

exports.image_add = (req, res, next) => {
    let _id = new mongoose.Types.ObjectId()
    image = new Image({
        _id,
        name: req.body.name,
        description: req.body.description,
        data: req.body.data,
        contributor: req.userData.userId,
        tags: req.body.tags
    })
    image.save().then((result) => {
        return res.status(200).json(
            {
                message: 'Image added',
                id: _id,
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + image._id
                }

            }
        )
    }
    ).catch((error)=>res.status(403).json({error}))
}

exports.image_get = (req, res, next) => {
    Image.findById(req.params.imageId)
        .exec()
        .then((image) => {
            return res.status(200).json(
                {
                    name: image.name,
                    description: image.description,
                    data: image.data,
                    contributor: image.contributor
                }
            );
        })
}
exports.image_get_all = (req, res, next) => {
    Image.find()
        .skip(parseInt(req.query.skip) || 0)
        .limit(parseInt(req.query.limit) || 0)
        .populate('contributor')
        .exec()
        .then((images) => {
            return res.status(200).json(
                {
                    count: images.length,
                    images: images.map((image) => {
                        return {
                            id: image._id,
                            description: image.description,
                            contributor: {
                                id: image .contributor.id,
                                name: image.contributor.id
                            },
                            url: {
                                type: 'GET',
                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + image._id
                            }
                        }
                    })
                }
            );
        })
}

exports.image_update = (req, res, next) => {
    // you must admin to change the image
    if (userData.role !== 'admin') {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
    Image.findByIdAndUpdate(req.params.imageId, {$set: req.body})
        .exec()
        .then((image) => {
            return res.status(200).json(
                {
                    message: "Image Updated",
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + req.params.imageId
                    }
                }
            );
        })
}
