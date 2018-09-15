const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Task = require("../models/Task");

exports.task_add = (req, res, next) => {
    let _id = new mongoose.Types.ObjectId();
    let task = new Task({
        _id,
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        cards: req.body.cards,
        contributor: req.userData.userId,
        age: req.body.age,
        level: req.body.level,
        tags: req.body.tags,
        published: req.body.published
    })
    task.save().then((result) => {
        return res.status(200).json(
            {
                message: 'Task added',
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + task._id
                }

            }
        )
    }
    ).catch((error) => res.status(403).json({ error }))
}

exports.task_get = (req, res, next) => {
    Task.findById(req.params.taskId)
        .select('_id name description age level image contributor cards tags published createdAt updatedAt')
        .populate({
            path: 'cards',
            select: '_id name description image',
            populate: {
                path: 'image',
                select: 'name description data'
            }
        })
        .populate({
            path: 'image',
            select: '_id data'
        })
        .populate('contributor', '_id fullname')
        .exec()
        .then((task) => {
            // let cardsRef = task.cards.map( card => {
            //     return {
            //         id : card._id,
            //         request:{
            //             type: 'GET',
            //             url: req.protocol + '://' + req.get('host') + '/cards' + '/' + card._id
            //         }
            //     }
            // })
            return res.status(200).json(
                task
            );
        })
}
exports.task_get_all = (req, res, next) => {
    let query = {}
    if (req.query.name) query.name = {
            '$regex' : req.query.name
        }
    if (req.query.age) {
        let age = req.query.age.split(',')        
        query.age = {
            $gte : parseInt(age[0]),
            $lte: parseInt(age[1])
        }
        
    }
    // console.log(query.age);
    if (req.query.level) {
        let level = req.query.level.split(',')
        query.level = {
            $gte : level[0],
            $lte: level[1]
        }
    }    
    if (req.query.tags) query.tags = { $in: req.query.tags.split(',') }
    Task.find(query)
        .skip(parseInt(req.query.skip) || 0)
        .limit(parseInt(req.query.limit) || 0)
        .select('_id name description age level image contributor tags published createdAt updatedAt')
        .populate('contributor')
        .populate({
            path: 'image',
            select: '_id name description data'
        })
        .exec()
        .then((tasks) => {
            return res.status(200).json(
                {
                    count: tasks.length,
                    tasks: tasks.map((task) => {
                        return {
                            _id: task._id,
                            name: task.name,
                            description: task.description,
                            age: task.age,
                            level: task.level,
                            image: task.image,
                            contributor: {
                                id: task.contributor.id,
                                name: task.contributor.fullname
                            },
                            tags: task.tags,
                            published: task.published,
                            createdAt: task.createdAt,
                            updatedAt: task.updatedAt,
                            url: {
                                type: 'GET',
                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + task._id
                            }
                        }
                    })
                }
            );
        })
        .catch(error => {
            return res.status(500).json({
                error
            })
        })
}

exports.task_update = (req, res, next) => {

    Task.findByIdAndUpdate(req.params.taskId, { $set: req.body })
        .exec()
        .then((task) => {
            return res.status(200).json(
                {
                    message: "Task Updated",
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + req.params.taskId
                    }
                }
            );
        })
}

exports.task_remove = (req, res, next) => {
    Task.findById(req.params.taskId)
        .exec()
        .then((task) => {
            if (task.contributor == req.userData.userId) {
                Task.findByIdAndRemove(req.params.taskId)
                    .exec()
                    .then(() => {
                        return res.status(200).json({
                            message: 'Task successfully removed.'
                        })
                    })
                    .catch(error => {
                        return res.status(500).json({
                            error
                        })
                    })
            }
        })
        .catch(error => res.status(500).json({ error }))
}
