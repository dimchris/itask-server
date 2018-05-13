//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let expect = chai.expect;

//import models
var Image = require('../models/Image')

chai.use(chaiHttp)

describe('Images', function () {
    // beforeEach(function(done){
    //     Image.remove({}, function(error){
    //         done()
    //     }
    // )
    // });

    describe('/GET images', function(){
        it('should get all the images', function(done){
            chai.request(server)
                .get('/images')
                .end(function(err, res){
                    console.log(res.body);
                    
                    res.should.have.status(200),
                    res.body.should.have.property('images')
                    res.body.should.have.property('count')
                    expect(res.body.images).to.be.a('array')
                    expect(res.body.images.length).eql(0)
                    expect(res.body.count).to.be.a('number')
                    expect(res.body.count).eql(0)

                    done()
                })
        })
    })

    describe('/POST image', function(){
        it('it should not POST image without data field', function(done){
            let image = {
                name: 'test-image',
                description : 'test-description'
            }

            chai.request(server)
                .post('/images')
                .send(image)
                .end(function(err, res){
                    res.should.have.status(400)
                    done()
                })
        })
    })

});