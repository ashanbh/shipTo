STO.namespace("STO.Utils");
(function(){
    var system = require('system');
    var fs = require('fs');
    var relativeScriptPath = system.args[0];
    var absoluteScriptPath = fs.absolute(relativeScriptPath);
    this.ABSOLUTE_SCRIPT_DIR = absoluteScriptPath.substring(0, absoluteScriptPath.lastIndexOf('/'));
    this.HOST = "http://localhost:8383/";

    /***************************
     * Parse URL
     ***************************/
    this.parseGET= function(url) {
        // adapted from http://stackoverflow.com/a/8486188
        var query = url.substr(url.indexOf("?") + 1);
        var result = {};
        query.split("&").forEach(function (part) {
            var e = part.indexOf("=")
            var key = part.substr(0, e);
            var value = part.substr(e + 1);
            result[key] = decodeURIComponent(value);
        });
        return result;
    }

    /***************************
     * Override console.error
     ***************************/
    console.error = function () {
        var COLOR_ERROR = '\x1b[31m';
        var COLOR_NONE = '\x1b[0m';
        Array.prototype.unshift.call(arguments, COLOR_ERROR);
        Array.prototype.push.call(arguments, COLOR_NONE);
        system.stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
    };

    /***************************
     * Override console.error
     ***************************/
    this.waitFor = function(testFx, onReady,onTimeOut, timeOutMillis) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 6000, //< Default Max Timout is 6s
            start = new Date().getTime(),
            condition = false,
            interval = setInterval(function () {
                //console.error("WAITFOR:Check",new Date().getTime() ,start, maxtimeOutMillis, (new Date().getTime() - start < maxtimeOutMillis),!condition);
                if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                    // If not time-out yet and condition not yet fulfilled
                    condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
                } else {
                    clearInterval(interval); //< Stop this interval
                    if (!condition) {
                        // If condition still not fulfilled (timeout but condition is 'false')
                        console.error("'waitFor()' timeout");
                        onTimeOut && (typeof onTimeOut === "function") && onTimeOut();
                    } else {
                        // Condition fulfilled (timeout and/or condition is 'true')
                        //console.error("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                        typeof(onReady) === "string" ? eval(onReady) : onReady(condition); //< Do what it's supposed to do once the condition is fulfilled
                    }
                }
            }, 50); //< repeat check every 50ms
    };

    /***************************
     * Override console.error
     ***************************/
    this.readVoltronHTML = function() {
        var content = fs.read(ABSOLUTE_SCRIPT_DIR + "/../voltron.html");
        return content;
    }

    /***************************
     * Override console.error
     ***************************/
    this.writeHTTPResponse = function(response,content){
        console.error("HTTP:Attempting to write content to response:",response);
        try{
            if(response !=null && response != undefined  && !response.closed){
                response.statusCode = 200;
                response.write(content);
                response.closed=true;
                response.close();
            }else{
                console.error("HTTP:Response already closed",JSON.stringify(typeof response));
            }
        }catch(e){
            console.error(e,JSON.stringify(typeof response));
        }
    }
})()
