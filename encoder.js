var 
	Path = require("path"),
	FS = require("fs-extra"),
	Encoding = require("encoding"),
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
		sourceDir = Path.resolve(params.s);
		destDir = Path.resolve(params.d);
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

			if(err)
				console.error(err);
			else {
				var output = Encoding.convert(fileContents, "UTF-8", "CP1252");

				FS.outputFile(writePath, output, "utf8", function(err){
					itemsRemaining--;

					if(err)
						console.error(err);
					else
						console.log("Converted: " + readPath);

					if(itemsRemaining === 0)
						console.log("All done");
				});
			}
		});
	}
}

new Encoder();