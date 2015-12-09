/**
 * Capability that handles a list of photos and takes photos.
 * GET returns a given photo or the entire list
 * PUT creates a new photo
 * POST creates or modifies a photo
 * DELETE removes a photo from the list
 */
(function(module) {
    //List of photos taken
    var photos = [];

    module.exports = {
        //Returns a particular photo if its id is provided, an array of references to all photos otherwise
        "get": function (values, params) {
            if(params['id']) {
                values.status = photos[params.id];
            } else {
                var results = [];
                for(var i in photos) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"photos": results};
            }
            return values.status;
        },
        //Modifies a photo if its 'id' and 'photo' are provided in args
        //Adds a new photo to the list if only 'photo' is given
        "post": function (values, params) {
            if(params && params['id'] && params['photo'] && params.id >= 0 && params.id < photos.length) {
                photos[params.id] = params.photo;
                console.log("Photo " + params.id + " modified.");
                //Not an error
                throw new Error(204);
            } else if(params & params['photo']) {
                photos.add(params.photo);
                return photos.length -1;
            } else {
                throw new Error(400);
            }
        },
        //Creates a new photo and adds it to the list
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
            }
            var photo = {};
            if (params['data']) {
                photo.data = params.data;
                photo.date = new Date();
                photos.add(photo);
                console.log("Added new photo: " + JSON.stringify(photo));
                //TODO: Should return "created" instead of a value
                return photos.length - 1;
            } else {
                //Unrecognized parameter
                return new Error(400);
            }
        },
        "delete": function (values, params) {
            if(params && params['id'] && typeof(params) === 'number' && params.id >= 0 && params.id < photos.length) {
                photos.remove(params.id);
                //Not an error
                return new Error(204);
            }
            return new Error(400);
        }
    };
})(module);