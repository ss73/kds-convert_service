var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var multer = require('multer')
var crypto = require ("crypto");
var tempdir = '/tmp/convertservice/';
var upload = multer({ dest: tempdir });

app.use(function (req, res, next) {
    var content_type = req.headers['content-type'];
    if (content_type != null && content_type.startsWith('multipart/form-data')) {
        req.url = "/form" + req.url;
        console.log("New 'virtual' URL: " + req.url);
    }
    next();
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/info.html'));
});

app.get('/convert', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/convert.html'));
});

app.get('/cleanup', function (req, res) {
    res.send("Cleaning up directory: " + tempdir);
    fs.readdir(tempdir, function (err, files) {
        for (i in files) {
            console.log("Deleting: " + files[i]);
            fs.unlink(tempdir + files[i], function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    });
});

app.post('/form/convert', upload.single('pdffile'), function (req, res) {
    //console.log("Files: " + JSON.stringify(req.file));
    var infile = req.file.path;
    var outfile = infile + ".txt";
    var cmd = 'pdftotext ' + infile + ' ' + outfile;
    console.log("Command: " + cmd);
    exec(cmd, function (error, stdout, stderr) {
        // command output is in stdout
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (error !== null) {
            console.log(`exec error: ${error}`);
            res.status(500).send(`${error}`);
        }
        else {
            res.sendFile(outfile);
        }
    });
});

app.post('/convert', function (req, res) {
    var filename = tempdir + crypto.randomBytes(16).toString('hex');
    var stream = req.pipe(fs.createWriteStream(filename));
    stream.on('finish', function () {
        var cmd = 'pdftotext ' + filename + ' ' + filename + '.txt';
        exec(cmd, function (error, stdout, stderr) {
            // command output is in stdout
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
                res.status(500).send(`${error}`);
            }
            else {
                res.sendFile(filename + '.txt');
            }
        });
    });
});

app.listen(3000, function () {
    console.log('Convert service listening on port 3000!');
});
