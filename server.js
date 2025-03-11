const http = require('http'); 
const fs = require('fs'); 
const path = require('path'); 
const mime = require('mime-types'); 
const formidable = require('formidable');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => { 
    if (req.method.toLowerCase() === 'post' && req.url === '/upload') {
        const form = new formidable.IncomingForm();
        
        // Handle file upload
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error parsing the file:', err);
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end('Error parsing the file');
            }

            const file = files.file; // Assuming the input name is 'file'
            const fileType = mime.lookup(file.name);
            console.log('Uploaded file name:', file.name);
            console.log('Uploaded file MIME type:', fileType);

            // Validate file type (e.g., allow only images)
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(fileType)) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end('Invalid file type. Only JPEG, PNG, and GIF files are allowed.');
            }

            const oldPath = file.path;
            const newPath = path.join(UPLOAD_DIR, file.name);

            // Move the file to the uploads directory
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error('Error saving the file:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    return res.end('Error saving the file');
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('File uploaded successfully!');
            });
        });
    } else {
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url); 

        fs.readFile(filePath, (err, content) => { 
            if (err) { 
                if (err.code === 'ENOENT') { 
                    res.writeHead(404, { 'Content-Type': 'text/html' }); 
                    res.end('<h1>404 File Not Found</h1>', 'utf8'); 
                } else { 
                    res.writeHead(500); 
                    res.end(`Server Error: ${err.code}`); 
                } 
            } else { 
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) }); 
                res.end(content, 'utf8'); 
            }
        });
    }
});

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 