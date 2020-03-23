const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const formidable = require('formidable');

const server = http.createServer(function (request,response) {
    // let requestURL = new URL(request.url);
    // console.log(requestURL.pathname);
    var filePath;
    switch (request.url) {
        case '/sendmail' : {
            SENDMAIL(request,response);
            break;
        }
        case '/' : {
            filePath = path.join(__dirname,'index.html');
            console.log(filePath);
            fs.readFile(filePath,function (error,filecontent) {
                if (error){
                    DISPLAYERROR(request,response);
                }
                response.writeHead(200,{'Content-Type':'text/html'});
                response.end(filecontent,'utf8');
            });
            break;
        }
        default : {
            filePath = path.join(__dirname,request.url);
            console.log(filePath);

            let contentType = CONTENTTYPE(filePath);
            fs.readFile(filePath,function (error,filecontent) {
                if (error) {
                    DISPLAYERROR(request,response);
                }
                response.writeHead(200,{'Content-Type': contentType});
                response.end(filecontent,'utf8');
            });
        }
    }

});

const PORT = process.env.PORT || 4444;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function CONTENTTYPE(filePath) {
    let contentType = 'text/html';

    switch (path.extname(filePath)) {
        case '.css' : {
            contentType = 'text/css';
            break;
        }
        case '.js' : {
            contentType = 'text/javascript';
            break;
        }
        case '.ico' : {
            contentType = 'image/ico';
            break;
        }
        case '.png' : {
            contentType = 'image/png';
            break;
        }
        case '.jpg' : {
            contentType = 'image/jpg';
            break;
        }
    }
    return contentType;
}

function SENDMAIL(request,response) {
    let data = new formidable.IncomingForm();

    data.parse(request, function (error, fields, files) {
        if (error) {
            DISPLAYERROR(request,response);
        } else {
            console.log(files);
            console.log(fields);

            const transporter = nodemailer.createTransport({
                service : fields.service,
                auth : {
                    user : fields.mail,
                    pass : fields.password
                }
            });


            const mail = {
                from : fields.mail,
                to : fields.recepient,
                subject : fields.subject,
                attachments : [{
                    filename : files.documents.name,
                    content : fs.readFileSync(files.documents.path),
                    contentType : files.documents.type
                }]
            };

            if (fields.contentType === 'text') {
                mail['text'] = fields.content;
            }
            else {
                mail['html'] = fields.content;
            }

            transporter.sendMail(mail,(error,result)=> {
                if (error) {
                    console.log(error.message);
                    DISPLAYERROR(request,response)
                }
                console.log(result);

                filePath = path.join(__dirname,'index.html');
                console.log(filePath);
                fs.readFile(filePath,function (error,filecontent) {
                    if (error){
                        DISPLAYERROR(request,response);
                    }
                    response.writeHead(200,{'Content-Type':'text/html'});
                    response.end(filecontent,'utf8');
                });

            });
        }
    });
}

function DISPLAYERROR(request,response){
    let errorfile = path.join(__dirname,'Error.html');
    fs.readFile(errorfile,(e,content)=> {
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(content,'utf8');
    });
}