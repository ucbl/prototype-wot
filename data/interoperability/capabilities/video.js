/**
 * Rather complex capability that handles a list of phone videos.
 * GET returns a given video of the entire list
 * PUT creates a new video
 * POST creates or modifies a video
 * DELETE removes a video from the list
 */
(function(module) {
    //List of passed videos
    var videos = [];

    module.exports = {
        //Returns a particular video if its id is provided, an array of references to all videos otherwise
        "get": function (values, params) {
            if(params['id']) {
                values.status = videos[params.id];
            } else {
                var results = [];
                for(var i in videos) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"videos": results};
            }
            return values.status;
        },
        //Modifies a video if its 'id' and 'video' are provided in args
        //Adds a new video to the list if only 'video' is given
        "post": function (values, params) {
            if(params & params['id'] && params['video'] && params.id >= 0 && params.id < videos.length) {
                videos[params.id] = params.video;
                console.log("Video " + params.id + " modified.");
                //Not an error
                throw new Error(204);
            } else if(params & params['video']) {
                videos.add(params.video);
                return videos.length -1;
            } else {
                throw new Error(400);
            }
        },
        //Creates a new video and adds it to the list
        "put": function (values, params) {
            if(!params) {
                return new Error(400);
            }
            var video = {};
            for (var i in params) {
                if (i == 'data') {
                    video.data = params.data;
                    video.start = new Date();
                } else if (i == 'end') {
                    video.end = params.end;
                } else {
                    //Unrecognized parameter
                    return new Error(400);
                }
            }
            if(video['data']) {
                videos.add(video);
                console.log("Added new video: " + JSON.stringify(video));
                //TODO: Should return "created" instead of a value
                return videos.length -1;
            }
            //Not an error (not modified)
            return new Error(304);

        },
        "delete": function (values, params) {
            if(params && params['id'] && typeof(params) === 'number' && params.id >= 0 && params.id < videos.length) {
                videos.remove(params.id);
                //Not an error
                return new Error(204);
            }
            return new Error(400);
        }
    };
})(module);