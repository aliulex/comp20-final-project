import http from 'http'; 
import fs from 'fs';
import qs from 'querystring';
import Genius from 'genius-lyrics';
import Mongo from 'mongodb';

const Client = new Genius.Client("o19mtznUl0mu0kk0DZxZgATNB-2Cw0ihj5ybfCdOpd-pz25oY7A4J5BgGQEoqDGb");
const MongoClient = Mongo.MongoClient;
const url = "mongodb+srv://aliulex:aliulex0@cluster0.qxqu8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"; 

var info;
var query;
var lyrics;

var port = process.env.PORT || 3000;

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

    else if (req.url == "/lyrics") 
	{
        var file = 'lyrics.html';  
  		fs.readFile(file, function(err, txt) 
        {
      	    res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
  	    });

        info = "";
        query = "";

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
			const firstSong = searches[0];
			lyrics = await firstSong.lyrics();
			
			res.write("<h1>Song Lyrics App</h1>");
			res.write("<h2>Lyrics</h2>");
			res.write(lyrics);

			res.end();
        });
    }
    
    else if (req.url == "/favorites") 
    {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write("favorite page<br>");
        
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
            if(err) { return console.log(err); return;}
            
            var dbo = db.db("favorites");
            var collection = dbo.collection('songs');
            var myobj = {song: query};
            
            collection.insertOne(myobj, function(err, result) {
                if(err) { console.log("query err: " + err); return; }
                console.log("new document inserted");
            });
            
            collection.find({}).toArray(function(err, items) {
                res.write("<h2>Your Favorite Songs:</h2>");
                if(items.length == 0) 
                {
                    res.write("No favorites");
                }
                else 
                {
                    for (let i=0; i<items.length; i++)
                    {
                        res.write(items[i].song + "<br><br>");
                    }
                    res.end();
                } 
            });
        
        });
    }
}).listen(port); 