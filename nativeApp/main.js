const {electron, app, BrowserWindow} = require('electron');
const http = require('http');
const url = require('url');
// Videos window
let videoWindow;



//*****************************************************
//			   CONFIGS					   
//									  				   				
//*****************************************************
const config = {
	VIDEO_WINDOW_WIDTH: 600,
	VIDEO_WINDOW_HEIGHT: 500,
	VIDEO_WINDOW_BG_COLOR: '#000',
	SERVER_PORTS: [60,53,4000,5000,6000],
	SERVER_HOSTNAME: 'hostname',

	VIDEO_WINDOW_getXoffset: function(work_area_width){
		// will position the window to the right side
		return work_area_width - this.VIDEO_WINDOW_WIDTH - 5;
	},

	VIDEO_WINDOW_getYoffset: function(work_area_height){
		// will position the window to the right side
		return work_area_height - this.VIDEO_WINDOW_HEIGHT;
	}

}


//*****************************************************
//			   APP Events						   
//									  				   				
//*****************************************************
app.on('ready', start);

app.on('window-all-closed', () => {
	return;
});



//*****************************************************
//			   Background dog Start						   
//									  				   				
//*****************************************************
function start(){
	console.log(`HEYYYYYY OHHH BOIIIA LET'S BEGIN!!!!!`);

	// Get primary screen size info
	const {workAreaSize}= require('electron').screen.getPrimaryDisplay();

	console.log('Get all displays: ', require('electron').screen.getAllDisplays());

	let requested_url = null;       // request url 

	// Create server
	const server = http.createServer((req, res) =>{
			console.log('Request Headers: ', req.headers);
			console.log('Request Method: ', req.method);
			console.log('Request Url: ', req.url);

			// Get parsed request url
			requested_url = url.parse(req.url);

			// body for the request
			let request_body = [];

			// set headers
			res.writeHead(200, {'Content-Type': 'application/json'});

			// Handle request
			switch(true){
				// for ping requests
				case (req.method == 'GET' && requested_url.pathname == '/ping'):

					res.end(JSON.stringify({status: 'alive'}));

				break;

				// For video requests
				case (req.method == 'POST' && requested_url.pathname == '/start_video'):
					//handle body of the request
					req.on('data', chunk =>{
						request_body.push(chunk);

					}).on('error', err =>{
						console.error(err.stack);

					}).on('end', function(){
						// concat Buffer data; parse it to string; then parse it to JSON object
						request_body = JSON.parse(Buffer.concat(request_body).toString());
						console.log('Body: ', request_body);

						// Create videoWindow
						videoWindow = new BrowserWindow({
							width:           config.VIDEO_WINDOW_WIDTH,
							height:          config.VIDEO_WINDOW_HEIGHT,
							backgroundColor: config.VIDEO_WINDOW_BG_COLOR,
							alwaysOnTop:     true,
							show:            false,
							x:               config.VIDEO_WINDOW_getXoffset(workAreaSize.width),
							y:               config.VIDEO_WINDOW_getYoffset(workAreaSize.height),
							frame:           true

						});

						// encode request_body into url param
						let query = url.format({ query: request_body })

						// Load window
						videoWindow.loadURL(`file://${__dirname}/resources/browserWindows/videoPanel.html${query}`);

						// Window events
						videoWindow.on('closed', () => {
							videoWindow = null;
						});

						videoWindow.once('ready-to-show', () => {
							videoWindow.show();
						});

						console.log('Window size: ', videoWindow.getSize());
						console.log('Window position: ', videoWindow.getPosition());

						res.end(JSON.stringify({status: 'ok'}));	

					});
				break;

				// For anything else..
				default:
					res.end(JSON.stringify({status: 'not_allowed..'}));	
				break;
			}


	});
	// get last port on ports list
	let port = config.SERVER_PORTS.pop();
	server.listen({port: port, hostname: config.SERVER_HOSTNAME}, () => { console.log(` Background Dog is listening.. on door ${port}`); });

	// Server Events
	server.on('error', (err) => {
		console.error(`\n\nERROR_CODE: ${err.code} | \n\n ${err.stack}`);

		switch(err.code){
			case 'EADDRINUSE':
				console.log(`Port ${port} already in use... trying next one..`);
				// try in another port
				setTimeout(() =>{
					port = config.SERVER_PORTS.pop();
					server.listen({port: port, hostname: config.SERVER_HOSTNAME});
				},1000)
			break;
		}
	});



}// end of start()
