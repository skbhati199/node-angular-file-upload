    var express = require('express');
    var router = express.Router();
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var fs = require('fs');
    var path = require('path');

    var mime = require('mime');



    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });

    /** Serving from the same express Server
    No cors required */
    app.use(express.static('../client'));
    app.use(express.static(path.join(__dirname,'public')));
    app.use(bodyParser.json());  

    fs.readdir('uploads/', (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
})

function fromDir(startPath,filter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
        };
    };
};



    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            // console.log(file.path);
            console.log(file.originalname.split('.')[0]);
            fs.appendFileSync('public/data.txt', file.originalname.split('.')[0] + '\r\n');
            cb(null, file.originalname);
        }
    });

    app.get('/download', function(req, res){
       
         var file = __dirname + '/public/data.txt';

  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);
  console.log(file);
 res.download(file);

 
});

    var upload = multer({ //multer settings
                    dest : 'uploads/',
                    limits : {
                        fieldNameSize : 100,
                        fileSize : 60000000
                    },
                    storage: storage
                }).single('file');

    /** API path that will upload the files */

    app.post('/upload', function(req, res) {
        upload(req,res,function(err){
			// console.log(req.file);
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null});
        });
    });

    app.listen('3001', function(){
        console.log('running on 3001...');
    });