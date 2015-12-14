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
            if(params["id"]) {
                values.status = videos[parseInt(params["id"])];
            } else {
                var results = [];
                for(var i in videos) {
                    results.push(this["@id"] + "?id=" + i);
                }
                values.status = {"videos": results};
            }
            return {
                "@context": "__interoperability__context/PhoneStatus",
                "PhoneStatus": values.status
            };
        },
        //Modifies a video if its 'id' and 'video' are provided in args
        //Adds a new video to the list if only 'video' is given
        "post": function (values, params) {
            if(params && params['id'] && params['video'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < videos.length) {
                videos[parseInt(params.id)] = params.video;
                console.log("Video " + params.id + " modified.");
                //Not an error
                throw 204;
            } else if(params && params['video']) {
                videos.push(params.video);
                throw 201;
            } else {
                throw 400;
            }
        },
        //Creates a new video and adds it to the list
        "put": function (values, params) {
            if(!params) {
                throw 400;
            }
            var video = {};
            for (var i in params) {
                if (i == 'data') {
                    video.data = params.data;
                    video.start = new Date();
                } else if (i == 'end') {
                    video.end = params.end;
                }
            }
            if(video['data']) {
                videos.push(video);
                console.log("Added new video: " + JSON.stringify(video));
                throw 201;
            }
            //Not an error (not modified)
            throw 304;
        },
        //Nullify the content of a video (instead of removing it)
        "delete": function (values, params) {
            if(params && params['id'] && !isNaN(params.id) && parseInt(params.id) >= 0 && parseInt(params.id) < videos.length) {
                videos[params.id] = null;
                //Not an error
                throw 204;
            }
            throw 400;
        }
    };
})(module);
