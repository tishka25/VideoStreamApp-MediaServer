const express = require('express')
const fs = require('fs')
const path = require('path');
const list = require('./video_list');
const app = express()



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'/front-end/index.html'))
})


app.get("/list", (req, res) => {
    res.send(list);
});


app.get("/thumbnail/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if(id < list.length){
        const filePath = path.join(__dirname, list[id].thumbnail)
        console.log("Sending file: ", filePath)
        res.sendFile(filePath);
    }else{
        console.log("Not found")
        res.sendStatus(404);
    }
})

app.get('/video/:id', function (req, res) {
    const id = parseInt(req.params.id);
    console.log("Getting stream for: ", id);
    const path = list[id].file;
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1

        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
})

app.listen(3333, function () {
    console.log('App is running on port 3333')
})