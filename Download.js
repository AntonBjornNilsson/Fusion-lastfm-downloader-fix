var script_path = Skin_Path + "scripts\\";
var limit = 1;
var download_size = 2; //0 small 1 medium 2 original
var download_size_replace = {
	"0" : 252,
	"1" : 500,
	"2" : "_"
};

String.prototype.is_folder = function () {
	if (!fso)
		return;
	return fso.FolderExists(this);
}

String.prototype.create = function () {
	if (!fso)
		return;
	if (!this.is_folder())
		fso.CreateFolder(this);
}

String.prototype.validate = function () {
	return this.replace(/[\/\\|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, "");
}

function run_cmd(c, w) {
	try {
		WshShell.Run(c, 0, w);
	} catch (e) {}
}

function download(artist) {
	if (!ActiveX)
		return;

	//this.domain = "http://www.last.fm";
	this.domain = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=";
	this.artist = artist.validate();

	if (this.artist == "" || this.artist == "?")
		return;

	this.artists_folder = Skin_Path + "\\Images\\Artists\\";
	this.artists_folder.create();
	this.artist_folder = artists_folder + this.artist;
	this.artist_folder.create();

	this.folder = this.artist_folder + "\\"; //this.folder;

	if (!this.folder.is_folder())
		return;

	this.url = this.domain + encodeURIComponent(this.artist) + "&api_key=1a4cdf495e91a7eac3a53dc20ba4b0a4&format=json";
	//fb.trace(this.url);
	xmlhttp.open("GET", this.url, true);
	//xmlhttp.setRequestHeader("Content-Type", "text/xml");
	xmlhttp.send();
	//fb.trace("sent");
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				fb.trace("PARSING");
				var text = xmlhttp.responsetext;
				doc.open();
				var div = doc.createElement("div");
				div.innerHTML = text;
				
				//fb.trace(text);
				var jsonResponse = JSON.parse(text);
				//THIS -> jsonResponse.artist.image[3]["#text"]
				//fb.trace(jsonResponse.artist.image[3]["#text"]);

				var urls = [];
				urls.push(jsonResponse.artist.image[3]["#text"]);
				
				for (i = 0; i < Math.min(urls.length, limit, 5); i++) {
					run_cmd("cscript //nologo \"" + script_path + "download.vbs\" \"" + urls[i] + "\" \"" + this.folder + this.artist.validate() + "_" + urls[i].substring(urls[i].lastIndexOf("/") + 1) + "\"", false);
				}
				//fb.trace(this.artist.validate() + " (Artist Artwork) - Downloading...");
				doc.close();
			} else {
				fb.trace("HTTP error: " + xmlhttp.status);
			}
		}
	}
}

function downloadAlbum(artist, album) {
	//fb.trace(artist + " " + album);
	if (!ActiveX)
		return;
	
	this.domain = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=1a4cdf495e91a7eac3a53dc20ba4b0a4&artist=" + encodeURIComponent(this.artist)+ "&album="+encodeURIComponent(this.album)+"&format=json";

	this.artist = artist.validate();
	this.album = album.validate();

	if (this.artist == "" || this.artist == "?" || this.album == "" || this.album == "?")
		return;

	this.artists_folder = Skin_Path + "\\Images\\Artists\\";
	this.artists_folder.create();
	this.artist_folder = artists_folder + this.artist;
	this.artist_folder.create();
	this.album_folder = this.artist_folder + "\\" + this.album;
	this.album_folder.create();

	this.folder = this.album_folder + "\\";
	
	if (!this.folder.is_folder())
		return;

	//this.url = this.domain + "/music/" + encodeURIComponent(this.artist) + "/" + encodeURIComponent(this.album) + "/+images";
	this.url=this.domain;
	//fb.trace(this.url);
	xmlhttp.open("GET", this.url, true);
	xmlhttp.send();
	//fb.trace("b4");
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				fb.trace("after");
				var text = xmlhttp.responsetext;
				doc.open();
				var div = doc.createElement("div");
				div.innerHTML = text;
				//fb.trace(text);
				var jsonResponse = JSON.parse(text);
				//THIS -> jsonResponse.artist.image[3]["#text"]
				//fb.trace(jsonResponse.album.image[3]["#text"]);

				var urls = [];
				urls.push(jsonResponse.album.image[3]["#text"]);
				
				for (i = 0; i < Math.min(urls.length, limit, 5); i++) {
					run_cmd("cscript //nologo \"" + script_path + "download.vbs\" \"" + urls[i] + "\" \"" + this.folder + this.album.validate() + "_" + urls[i].substring(urls[i].lastIndexOf("/") + 1) + "\"", false);
				}
				//fb.trace(this.album.validate() + " (Album Artwork) - Downloading...");
				doc.close();
			} else {
				fb.trace("This");
				fb.trace("HTTP error: " + xmlhttp.status);
			}
		}
	}
}
