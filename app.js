var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/info.html'));
});

app.get('/convert', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/upload.html'));    
});

app.post('/convert', function(req, res) {
    var stream = req.pipe(fs.createWriteStream(path.join(__dirname, 'temp.pdf')));
    stream.on('finish', function(){
        var cmd = 'pdftotext temp.pdf temp.txt'; 
    	exec(cmd, function(error, stdout, stderr) {
    	    // command output is in stdout
	        console.log(`stdout: ${stdout}`);
	        console.log(`stderr: ${stderr}`);
	        if (error !== null) {
	            console.log(`exec error: ${error}`);
                res.status(500).send(`${error}`);
	        }
            else {
                res.sendFile(path.join(__dirname, "temp.txt"));
            }
	    });
    });
});

app.listen(3000, function () {
    console.log('Convert service listening on port 3000!');
});
