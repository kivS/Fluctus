const {electron, app, BrowserWindow} = require('electron');
const http = require('http');
const url = require('url');
// screen management funcs module
const screen_helper = require('./helpers/screen-helper');
// Videos window
let videoWindow;



//*****************************************************
//			   CONFIGS					   
//									  				   				
//*****************************************************
const config = {
	VIDEO_WINDOW_WIDTH: 600,
	VIDEO_WINDOW_HEIGHT: 500,
	WINDOW_BG_COLOR: '#000',
	SERVER_PORTS: [60,53,4000,5000,6000],
	SERVER_HOSTNAME: 'hostname'

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

	
	let b_x, b_y = null;  // width && height offset of the new video window
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

			// If I'm being pinged then announce I am alive
			if(req.method == 'GET' && requested_url.pathname == '/ping'){
				// set headers
				res.writeHead(200, {'Content-Type': 'application/json'});

				res.end(JSON.stringify({status: 'alive'}));
			} 

			// Process video panel request
			if(req.method == 'POST' && requested_url.pathname == '/start_video'){
				//handle body of the request
				req.on('data', chunk =>{
					request_body.push(chunk);

				}).on('error', err =>{
					console.error(err.stack);

				}).on('end', function(){
					request_body = JSON.parse(Buffer.concat(request_body).toString());
					console.log('Body: ', request_body);
					res.end(JSON.stringify({status: 'ok'}));	

				});

			}

			/*// Select position of new screens
			b_x = screen_helper.getXoffset(workAreaSize.width, config.VIDEO_WINDOW_WIDTH);
			b_y = screen_helper.getYoffset(workAreaSize.height, config.VIDEO_WINDOW_HEIGHT);

			// Create videoWindow
			videoWindow = new BrowserWindow({
				width:           config.VIDEO_WINDOW_WIDTH,
				height:          config.VIDEO_WINDOW_HEIGHT,
				backgroundColor: config.WINDOW_BG_COLOR,
				alwaysOnTop:     true,
				show:            false,
				x:               b_x,
				y:               b_y,
				frame:           true

			});
			// Load 
			videoWindow.loadURL(`file://${__dirname}/videoWindow.html`);

			// Window events
			videoWindow.on('closed', () => {
				videoWindow = null;
			});

			videoWindow.once('ready-to-show', () => {
				videoWindow.show();
			});

			console.log('Window size: ', videoWindow.getSize());
			console.log('Window position: ', videoWindow.getPosition());*/

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
