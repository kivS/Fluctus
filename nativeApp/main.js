const {electron, app, BrowserWindow, Tray, Menu, dialog} = require('electron');
const http = require('http');
const url = require('url');
const path = require('path');
const log = require('winston');

let videoWindow, trayIcon;

// get location for logs
let logs_path = path.join(app.getPath('home'), 'floating_dog.log');

// Configure winston logs
log.configure({
	transports: [
		new (log.transports.Console)({
			level: 'info',
			prettyPrint: true
		}),
		new (log.transports.File)({
			level: 'info',
			filename: logs_path,
			prettyPrint: true, 
			json: false
		})
	]
});
// set logger as global for window instances
global.logger = log;


//*****************************************************
//			   CONFIGS					   
//									  				   				
//*****************************************************
const config = {
	VIDEO_WINDOW_WIDTH: 480,
	VIDEO_WINDOW_HEIGHT: 400,
	VIDEO_WINDOW_BG_COLOR: '#000',
	SERVER_PORTS: [8791,8238,8753],
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
	log.info('HEYYYYYY OHHH BOIIIA LET\'S BEGIN!!!!!');

	
	let icon = `${__dirname}/resources/images/icon.png`;

	// Set Tray icon
	trayIcon = new Tray(icon);
	trayIcon.setToolTip('Floating dog at your service..');

	const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Exit',
				click: () => {
					app.quit();
				}
			}
	]);
	trayIcon.setContextMenu(contextMenu);


	// Get primary screen size info
	const {workAreaSize}= require('electron').screen.getPrimaryDisplay();

	log.info('Get all displays: ', require('electron').screen.getAllDisplays());

	let requested_url = null;       // request url 

	// Create server
	const server = http.createServer((req, res) =>{
			log.info('Request Headers: ', req.headers);
			log.info('Request Method: ',  req.method);
			log.info('Request Url: ',     req.url);

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
						log.error(err.stack);

					}).on('end', function(){
						// concat Buffer data; parse it to string; then parse it to JSON object
						request_body = JSON.parse(Buffer.concat(request_body).toString());
						log.info('Body: ', request_body);

						// Create videoWindow
						videoWindow = new BrowserWindow({
							width:           config.VIDEO_WINDOW_WIDTH,
							height:          config.VIDEO_WINDOW_HEIGHT,
							minWidth:        config.VIDEO_WINDOW_WIDTH,
							minHeight:       config.VIDEO_WINDOW_HEIGHT,
							x:               config.VIDEO_WINDOW_getXoffset(workAreaSize.width),
							y:               config.VIDEO_WINDOW_getYoffset(workAreaSize.height),
							backgroundColor: config.VIDEO_WINDOW_BG_COLOR,
							alwaysOnTop:     true,
							show:            false,
							frame:           true,
							icon: 			 icon

						});

						// encode request_body into url param
						let query = url.format({ query: request_body })

						// Load window
						videoWindow.loadURL(`file://${__dirname}/resources/browserWindows/youtubeVideoPanel.html${query}`);

						// Debug
						videoWindow.webContents.openDevTools();

						// WINDOW EVENTS
						videoWindow.on('closed', () => {
							videoWindow = null;
						});

						videoWindow.once('ready-to-show', () => {
							videoWindow.show();
						});

						// Window Error events
						videoWindow.webContents.on('crashed', () =>{
							const options = {
								type: 'info',
								title: 'Floating dog crashed',
								message: 'something made this crash..',
								buttons: ['Reload', 'close'],
							}
							dialog.showMessageBox(options, index =>{
								if(index === 0){
									 videoWindow.reload();

								}else{
									videoWindow.close();
								}
							});
						});

						videoWindow.on('unresponsive', () =>{
							const options = {
								type: 'info',
								title: 'Floating dog is still waiting..',
								message: 'This is taking too long..',
								buttons: ['Reload', 'close'],
							}
							dialog.showMessageBox(options, index =>{
								if(index === 0){
									 videoWindow.reload();

								}else{
									videoWindow.close();
								}
							});
						});


						log.info('Window size: ', videoWindow.getSize());
						log.info('Window position: ', videoWindow.getPosition());

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
	server.listen({port: port, hostname: config.SERVER_HOSTNAME}, () => { log.info(` Background Dog is listening.. on door ${port}`); });

	// Server Events
	server.on('error', (err) => {
		log.error(`\n\nERROR_CODE: ${err.code} | \n\n ${err.stack}`);

		switch(err.code){
			case 'EADDRINUSE':
			case 'EACCES':
				log.warn(`Port ${port} already in use... trying next one..`);
				// try in another port
				setTimeout(() =>{
					port = config.SERVER_PORTS.pop();
					server.listen({port: port, hostname: config.SERVER_HOSTNAME});
				},1000)
			break;
		}
	});



}// end of start()
