import http from 'http'; 
import fs from 'fs';
import qs from 'querystring';
import Genius from 'genius-lyrics';
const Client = new Genius.Client("o19mtznUl0mu0kk0DZxZgATNB-2Cw0ihj5ybfCdOpd-pz25oY7A4J5BgGQEoqDGb");

http.createServer(function (req, res)  
{
    if (req.url == "/") 
	{
        var file = 'index.html';  
  		fs.readFile(file, function(err, txt) 
        {
      	    res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            res.end();
  	    });
	}

    else if (req.url == "/process") 
	{
		res.writeHead(200, {'Content-Type':'text/html'});

        var info = "";
        var query = "";

	    req.on('data', data => {
        	info += data.toString();
        });

	    req.on('end', async () => {
		    info = qs.parse(info);
	        if (info['song']) 
	        {
	            query = info['song'];
	        }
			
			const searches = await Client.songs.search(query);

			// Pick first one
			const firstSong = searches[0];

			// Ok lets get the lyrics
			const lyrics = await firstSong.lyrics();
			
			res.write("<h1>Song Lyrics App</h1>");
			res.write("<h2>Lyrics</h2>");
			res.write(lyrics);

			res.end();
        });
    }
}).listen(8080); 
