var 
	Path = require("path"),
	FS = require("fs-extra"),
	Encoding = require("encoding"),
	IconvLite = require("iconv-lite"),
	Minimist = require("minimist");

function Encoder(){

	var 
		itemsRemaining = 0,
		sourceDir = "",
		destDir = "";

	parseArguements();
	readDirRecursively("");

	function parseArguements() {
		var params = Minimist(process.argv.slice(2));
		if(!params.s || !params.d)
			throw "source or destination directory missing";
		sourceDir = params.s;
		destDir = params.d;
	}

	function readDirRecursively(path) {

		FS.readdir(Path.join(sourceDir, path), function(err, contents){
			itemsRemaining += contents.length;
			contents.forEach(function(content){

				var tempPath = "",
				readPath = "",
				writePath = "";

				tempPath = Path.join(path, content);
				readPath = Path.join(sourceDir, tempPath);

				FS.stat(readPath, function(err, stats){
					if(stats.isDirectory()){
						itemsRemaining--;
						readDirRecursively(tempPath);
					}
					else if(stats.isFile() &&
						Path.extname(readPath) === ".html"){
						writePath = Path.join(destDir, tempPath);						
						encoding(readPath, writePath, tempPath);
					}
					else
						itemsRemaining--;
				});
			});
		});
	}

	function encoding(readPath, writePath, tempPath){
		FS.readFile(readPath, null, function (err, fileContents) {

			console.log(readPath);

			if(err)
				console.error(err);
			else {
				try {
					var output = Encoding.convert(fileContents, "UTF-8", "CP1252");

					// var output = IconvLite.decode(fileContents, "win1252");

					// FS.outputFile(writePath, output, "utf8", function(err){
					// 	itemsRemaining--;

					// 	if(err)
					// 		console.error(err);
					// 	else
					// 		console.log("Converted: " + readPath);

					// 	if(itemsRemaining === 0)
					// 		console.log("All done");
					// });
				}
				catch(e){
					console.error(readPath);
					console.error(e.stack);
				}
			}
		});
	}
}

new Encoder();