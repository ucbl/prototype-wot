/**
 * Rather complex capability that handles a list of phone photos.
 * GET returns a given photo of the entire list
 * PUT creates a new photo
 * POST creates or modifies a photo
 * DELETE removes a photo from the list
 */
(function(module) {
    //List of passed photos
    var photos = [];

    module.exports = {
        //Returns a particular photo if its id is provided, an array of references to all photos otherwise
        "get": function (values, params) {
            if(params["id"]) {
                values.status = photos[parseInt(params["id"])];
            } else {
                var results = [];
                for(var i in photos) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"photos": results};
            }
            return {
                "@context": "__interoperability__context/PhoneStatus",
                "PhoneStatus": values.status
            };
        },
        //Modifies a photo if its 'id' and 'photo' are provided in args
        //Adds a new photo to the list if only 'photo' is given
        "post": function (values, params) {
            if(params && params['id'] && params['photo'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < photos.length) {
                photos[parseInt(params.id)] = params.photo;
                console.log("Photo " + params.id + " modified.");
                //Not an error
                throw 204;
            } else if(params && params['photo']) {
                photos.push(params.photo);
                throw 201;
            } else {
                throw 400;
            }
        },
        //Creates a new photo and adds it to the list
        "put": function (values, params) {
            if(!params) {
                throw 400;
            }
            var photo = {};
            if (params['data']) {
                photo.data = params.data;
                photo.start = new Date();
                photos.push(photo);
                console.log("Added new photo: " + JSON.stringify(photo));
                throw 201;
            }
            //Not an error (not modified)
            throw 304;
        },
        //Nullify the content of a photo (instead of removing it)
        "delete": function (values, params) {
            if(params && params['id'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < photos.length) {
                photos[params.id] = null;
                //Not an error
                throw 204;
            }
            throw 400;
        }
    };
})(module);