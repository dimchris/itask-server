const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Image = require("../models/Image")
const Card = require("../models/Card")
const Task = require("../models/Task")

exports.user_get_all = (req, res, next) => {
    User.find()
        .skip(parseInt(req.query.skip) || 0)
        .limit(parseInt(req.query.limit) || 0)
        .exec()
        .then(users => {
            return res.status(200).json(
                {
                    count: users.length,
                    users: users.map(user => {
                        return {
                            id: user._id,
                            email: user.email,
                            fullname: user.fullname,
                            role: user.role,
                            status: user.status,
                            request: {
                                tupe: "GET",
                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + user._id
                            }

                        }
                    }),
                }
            );
        })
}

exports.user_get = (req, res, next) => {
    // TODO: Can anyone see details about this user ?
    if (req.userData.userId != req.params.userId && userData.role !== 'admin') {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
    User.findOne({ _id: req.params.userId })
        .select('email fullname role status')
        .exec()
        .then(
            user => {
                return res.status(200).json(
                    user
                )
            }
        )
}

exports.user_update = (req, res, next) => {
    if (req.userData.userId != req.params.userId && userData.role !== 'admin') {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
    let params = {};
    if (req.userData.role === 'admin') {
        if (req.body.email) {
            params.email = req.body.email
        }
        if (req.body.role) {
            params.role = req.body.role
        }
        if (req.body.status) {
            params.status = req.body.status
        }
        if (req.body.fullname) {
            params.fullname = req.body.fullname
        }
    } else {
        if (req.body.email) {
            params.email = req.body.email
        }
    }

    console.log(params);


    User.update({ _id: req.params.userId }, { "$set": params })
        .exec()
        .then((result) => {
            return res.status(200).json(
                {
                    message: "User updated",
                    request: {
                        type: "GET",
                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + req.params.userId
                    }
                }
            )
        })
        .catch((error) => {
            return res.status(404).json(
                {
                    error
                }
            )
        }
        )
};

exports.user_delete = (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.user_signup = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exists"
                });
            } else {
                if (!req.body.password && req.body.password.length <= 8) {
                    return res.status(400).json({
                        error: "Password at least 8 characters"
                    })
                }
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            fullname: req.body.fullname
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
};

exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Pending approval."
                });
            }
            if (user.status < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            userId: user[0]._id,
                            role: user[0].role
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth successful",
                        userId: user[0]._id,
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

/* 
* User Images
*/
exports.user_get_images = (req, res, next) => {
    User.findById(req.params.userId)
        .populate('images')
        .exec()
        .then(
            (user) => {
                return res.status(200).json(
                    {
                        count: user.images.length,
                        images: user.images.map(
                            image => {
                                return {
                                    name: image.name,
                                    description: image.description,
                                    request: {
                                        type: 'GET',
                                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + image._id
                                    }
                                }
                            }
                        )
                    }
                )
            }
        )
        .catch(error => {
            return res.status(403).json(
                {
                    error
                }
            );
        })
}

exports.user_add_image = (req, res, next) => {
    User.findById(req.userData.userId)
        .then((user) => {
            if (user.images.indexOf(req.body.imageId) < 0) {
                console.log(user.images);
                user.images.push(req.body.imageId)
                user.save().then((result) => {
                    return res.status(200).json(
                        {
                            message: 'Image added',
                            request: {
                                type: 'GET',
                                url: req.protocol + '://' + req.get('host') + 'images' + '/' + req.body.imageId
                            }
                        }
                    )
                }
                )
                    .catch(error => {
                        res.status(403).json({ error })
                    })
            } else {
                res.status(200).json({
                    message: 'Image added',
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + 'images' + '/' + req.body.imageId
                    }
                })
            }
        })
}

exports.user_get_images = (req, res, next) => {
    Image.find()
        .where({ contributor: req.params.userId })
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
                                id: image.contributor.id,
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

exports.user_get_cards = (req, res, next) => {
    Card.find()
        .where({contributor: req.params.userId})
        .skip(parseInt(req.query.skip) || 0)
        .limit(parseInt(req.query.limit) || 0)
        .populate('contributor')
        .exec()
        .then((cards) => {
            return res.status(200).json(
                {
                    count: cards.length,
                    cards: cards.map((card) => {
                        return {
                            id: card._id,
                            description: card.description,
                            contributor: {
                                id: card.contributor.id,
                                name: card.contributor.id
                            },
                            url: {
                                type: 'GET',
                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + card._id
                            }
                        }
                    })
                }
            );
        })
}
exports.user_get_tasks = (req, res, next) => {
    Task.find()
    .where({contributor: req.params.userId})
    .skip(parseInt(req.query.skip) || 0)
    .limit(parseInt(req.query.limit) || 0)
    .select('id name description age level image contributor')
    .populate('contributor')
    .populate({
        path: 'image',
        select: '_id data'
    })
    .exec()
    .then((tasks) => {
        return res.status(200).json(
            {
                count: tasks.length,
                tasks: tasks.map((task) => {
                    return {
                        id: task._id,
                        name: task.name,
                        description: task.description,
                        age: task.age,
                        level: task.level,
                        image: task.image,
                        contributor: {
                            id: task.contributor.id,
                            name: task.contributor.fullname
                        },
                        url: {
                            type: 'GET',
                            url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + task._id
                        }
                    }
                })
            }
        );
    })
}


