require('includes/STO.js');
equire('includes/STO.js');

var server = require('webserver').create();
console.log(STO.getNSName());
server.listen(8080, function(request, response) {
    var casper = require('casper').create();
    casper.options.verbose= true;
    casper.options.logLevel= "warning";
    casper.options.exitOnError=true;
    casper.options.waitTimeout = 1000; //listen to "waitFor.timeout" if you want to handle wait timeouts
    casper.options.viewportSize= {width: 1024, height: 768};
    casper.options.waitTimeout= 3000;
    casper.start('http://www.amazon.com/', function() {
        this.echo(this.getTitle());
        this.capture('/tmp/foo'+new Date()+'.jpeg', undefined, {
            format: 'jpg',
            quality: 75
        });
    });
    casper.run(function(){
        writeHTTPResponse(response,this.getTitle());
    });
});