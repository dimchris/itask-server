const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Image = require("../models/Image")

exports.image_add = (req, res, next) => {
    image = new Image({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        data: req.body.data,
        contributor: req.userData.userId
    })
    image.save().then((result) => {
        return res.status(200).json(
            {
                message: 'Image added',
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + image._id
                }

            }
        )
    }
    )
}

exports.image_get = (req, res, next) => {
    Image.findById(req.params.imageId)
        .populate('contributor')
        .exec()
        .then((image) => {
            return res.status(200).json(
                {
                    descriptiom: image.description,
                    data: image.data,
                    contributor: image.contributor.fullname
                }
            );
        })
}
exports.image_get_all = (req, res, next) => {
    Image.find(req.params.imageId)
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
                            url: {
                                type: 'get',
                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + image._id
                            }
                        }
                    })
                }
            );
        })
}
