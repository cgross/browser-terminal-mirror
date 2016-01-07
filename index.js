'use strict';
var hooker = require('hooker');
var convert = new (require('ansi-to-html'))();
var ws = require('ws');
var https = require('https');

module.exports = function (options) {

    options = options || {};
    options.port = options.port || 37901;
    options.errorPattern = options.errorPattern || [/Warning:/g,/errored\safter/g];
    if (!Array.isArray(options.errorPattern)) {
        options.errorPattern = [options.errorPattern];
    }

    //start server
    var WebSocketServer = ws.Server;

    var wss;
    if (!options.ssl){
        wss = new WebSocketServer({port: options.port});
    } else {
        var processRequest = function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Not implemented');
        };
        var app = https.createServer({
        key: options.key,
        cert: options.cert,
        passphrase: options.passphrase
        },processRequest).listen(options.port);

        wss = new WebSocketServer({server:app});
    }

    wss.broadcast = function(data) {
        for(var i in this.clients) {
        this.clients[i].send(JSON.stringify(data));
        }
    };

    hooker.hook(process.stdout,'write', function() {

        var data = {};

        if (arguments[0] === '\x1b[2K') {
        data = {removeLine:true};
        } else if (arguments[0] === '\x1b[1G'){
        //do nothing
        return;
        } else {
        var html = convert.toHtml(arguments[0]);
        // var html = ansi_up.ansi_to_html(arguments[0]);
        if (html[0] !== '<') {
            html = '<span>' + html + '</span>';
        }
        //such hack
        html = html.replace(/color:#A50/gm,'color:#F0E68C');

        data = {
            line: html,
            orig: arguments[0],
            //such hack, much wow
            isError: isError(arguments[0],options)
        };
        }

        wss.broadcast(data);
    });

};

var isError = function(message,options) {
    for (var i = 0; i < options.errorPattern.length; i++) {
        if (options.errorPattern[i].test(message)) {
            console.error('MESSAGE='+message);
            return true;
        }
    }
    return false;
};