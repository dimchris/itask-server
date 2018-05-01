const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Card = require("../models/Card");

exports.card_add = (req, res, next) => {
    let _id =  new mongoose.Types.ObjectId(),
    card = new Card({
        _id,
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        contributor: req.userData.userId,
        tags: req.body.tags
    })
    card.save().then((result) => {
        return res.status(200).json(
            {
                message: 'Card added',
                id: _id,
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + card._id
                }

            }
        )
    }
    ).catch((error)=>res.status(403).json({error}))
}

exports.card_get = (req, res, next) => {
    Card.findById(req.params.cardId)
        .populate('image')
        .populate('contributor', '_id fullname')
        .exec()
        .then((card) => {
            return res.status(200).json(
                {
                    name: card.name,
                    description: card.description,
                    image: card.image.data,
                    contributor: card.contributor
                }
            );
        })
}
exports.card_get_all = (req, res, next) => {
    Card.find()
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
                                id: card .contributor.id,
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

exports.card_update = (req, res, next) => {

    Card.findByIdAndUpdate(req.params.cardId, {$set: req.body})
        .exec()
        .then((card) => {
            return res.status(200).json(
                {
                    message: "Card Updated",
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + req.params.cardId
                    }
                }
            );
        })
}

exports.card_remove = (req, res, next ) => {
    Card.findById(req.params.cardId)
        .exec()
        .then((card)=>{
            if(card.contributor == req.userData.userId){
                Card.findByIdAndRemove(req.params.cardId)
                    .exec()
                    .then(() => {
                        return res.status(200).json({
                            message: 'Card successfully removed.'
                        })
                    })
                    .catch(error => {
                        return res.status(500).json({
                            error
                        })
                    })
            }
        })
        .catch(error => res.status(500).json({error}))
}
