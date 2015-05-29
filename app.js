'use strict'

var config  = require('./config.json');
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var api = new MailChimpAPI(config.apiKey, { version : '2.0'});
var Q = require('Q');


function getListIdByName(listName) {
    return Q.promise(function(resolve, reject) {
        api.call('lists', 'list', function (error, response) {
            if (error) {
                return reject(error);
            }

            var listId;
            response.data.forEach(function (val) {
                if (val.name === listName) {
                    listId = val.id;
                }
            });

            resolve(listId)
        });
    });
}

function unsubscribe(listId, email) {
    return Q.promise(function(resolve, reject) {
        var params = {id: listId, email: {email: email}, delete_member: true, send_goodbye: false, send_notify: false};

        api.call('lists', 'unsubscribe', params, function (error, response) {
            if (error) {
                return reject(error);
            }

            resolve(true)
        });
    });
}

function performUnsubscribe(listName, email) {

    getListIdByName(listName).then(function(listId) {
            if (listId) {
                unsubscribe(listId, email).then(function (result) {
                        console.log("Unsubscribe Successful");
                    },
                    function (err) {
                        console.log("There was an error unsubscribing the user: ", err);
                    })
            }
            else {
                console.log("The specified list name was not found.")
            }
        },
        function(err) {
            console.log("There was an error retrieving the lists: ", err);
        });
}

//Run the routine that will find the listId for the given name, and then unsubscribe the email address.
performUnsubscribe(config.list, config.email);