/**
 * Created by shawnmccarthy on 1/22/17.
 */
'use strict;';
//Include crypto to generate the movie id
var crypto = require('crypto');
module.exports = function () {
    return {
        userList: [],
        movieList: [],
        /*
         * Save the user inside the "db".
         */
        saveUser: function (user) {
            user.id = crypto.randomBytes(20).toString('hex');
            this.userList.push(user);
            return 1;
        },
        saveMovie: function (movie) {
            movie.id = crypto.randomBytes(20).toString('hex');
            this.movieList.push(movie);
            return 1;
        },
       
        findMovie: function (id) {
            if (id) {
                return this.movieList.find(function (element) {
                    return element.id === id;
                });
            } else {
                return this.movieList;
            }
        },
        findUser: function (name) {
            if (name) {
                return this.userList.find(function (element) {
                    return element.username === name;
                });
            } else {
                return this.userList;
            }
        },
        /*
         * Delete a movie with the given id.
         */
        removeMovie: function (id) {
            var found = 0;
            this.movieList = this.movieList.filter(function (element) {
                if (element.id === id) {
                    found = 1;
                }
                else {
                    return element.id !== id;
                }
            });
            return found;
        },
        /*
         * Update a movie with the given id
         */
        updateMovie: function (id, movie) {
            var movieIndex = this.movieList.findIndex(function (element) {
                return element.id === id;
            });
            if (movieIndex !== -1) {
                Object.assign(this.movieList[movieIndex], movie);
                return this.movieList[movieIndex];
            } else {
                return null;
            }
        }
    };
};