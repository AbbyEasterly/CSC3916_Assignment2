/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', (req, res) => {

    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    )
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    );
router.route('/movies')
    .post((req, res) => {
        // Add a new movie to the list
        const movie = req.body;
        if (!movie || !movie.title) {
            return res.status(400).json({
                status: 400,
                message: 'Movie title is required',
                headers: req.headers,
                query: req.query,
                env: process.env.UNIQUE_KEY
            });
        }
        db.save(movie);
        const movies = db.find();
        res.status(200).json({
            status: 200,
            message: 'movie saved',
            movie: movie,
            movies: movies,
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        });
    })
    .get((req, res) => {
        // Return all movies (currently stored in userList)
        const movies = db.find();
        res.status(200).json({
            status: 200,
            message: 'movies retrieved',
            movies: movies,
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        });
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        // HTTP PUT Method
        // Requires JWT authentication.
        // Returns a JSON object with status, message, headers, query, and env.
        const film = req.body;
        if (!film || !film.id) {
            return res.status(400).json({       
                status: 400,
                message: 'Movie id is required',
                headers: req.headers,
                query: req.query,
                env: process.env.UNIQUE_KEY
            });
        }
        const updated = db.update(film.id, film);
        if (!updated) {
            return res.status(404).json({
                status: 404,
                message: 'Movie not found',
                headers: req.headers,
                query: req.query,
                env: process.env.UNIQUE_KEY
            });
        }
        res.status(200).json({
            status: 200,
            message: 'movie updated',
            movie: updated,
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        });
    })
    .delete(authController.isAuthenticated, (req, res) => {
        // HTTP DELETE Method
        // Requires Basic authentication.
        // Returns a JSON object with status, message, headers, query, and env.
        film = req.body;
        if (!film || !film.title) {
            return res.status(400).json({
                status: 400,
                message: 'Movie title is required',
                headers: req.headers,
                query: req.query,  
                env: process.env.UNIQUE_KEY
            });
        }
        else{
        db.delete(film);
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);}
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });
    
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


