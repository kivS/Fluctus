const {electron, app, BrowserWindow, Tray, Menu, dialog, shell} = require('electron');
const http = require('http');
const url = require('url');
const path = require('path');
const log = require('winston');
const {autoUpdater} = require('electron-updater');

let trayIcon;
let videoBoxContainers = Array();
let videoBoxCounter = -1;

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
// Set autoUpdater log to winston
autoUpdater.logger = log;
//autoUpdater.logger.transports.file.level = 'info';


log.info(`Prepare for take off!  Version: ${app.getVersion()}`);


// Make sure that only one instance of the program gets to trive!
const shouldSeppuku = app.makeSingleInstance((commandLine, workingDirectory) => {});
if(shouldSeppuku) app.quit();

function send_info(msg){
	log.info(msg);

	dialog.showMessageBox({
		type: 'info',
		title: 'Info',
		message: msg,
		buttons: ['ok']
	})	
}



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
	SUPPORTED_REQUESTS: ['youtube'],

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
	videoBoxContainers = Array();
});



////*****************************************************
//			   autoUpdater events						   
//									  				   				
//*****************************************************
autoUpdater.on('checking-for-update', () => {
  send_info('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  send_info('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  send_info('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  send_info('Error in auto-updater.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  send_info('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  send_info('Update downloaded; will install in 5 seconds');
});




//*****************************************************
//			   Background dog Start						   
//									  				   				
//*****************************************************
function start(){
	log.info('HEYYYYYY OHHH BOIIIA LET\'S BEGIN!!!!!');

	// Check for updates
	autoUpdater.checkForUpdates();


	// If test mode is on -> Dummy window so end2end tests can run
	if(process.env.NODE_ENV === 'test'){
		let test_window = 	new BrowserWindow({alwaysOnTop: true, show: false});
		test_window.loadURL(`file://${__dirname}/resources/browserWindows/test.html`);

	}

	
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

						log.info('VideoBoxCounter: ', videoBoxCounter);

						// Check if video_type of request_body is supported
						const supported_request = config.SUPPORTED_REQUESTS.find(item => item == request_body.video_type);

						// If request type is not supported.. let's end this conversation
						if(!supported_request) res.end(JSON.stringify({status: 'not_supported'}));


						// Create videoWindow
						videoBoxContainers[++videoBoxCounter] = new BrowserWindow({
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

						// local videoBox reference
						const videoBox = videoBoxContainers[videoBoxCounter];

						// encode request_body into url param
						let query = url.format({ query: request_body })

						// Load window -> Naming convention:(supported_request value + VideoPanel.html)
						videoBox.loadURL(`file://${__dirname}/resources/browserWindows/${supported_request}VideoPanel.html${query}`);

						// Debug
						if(process.env.NODE_ENV === 'dev'){
							videoBox.webContents.openDevTools({
								detach: true
							});
						}
						

						// WINDOW EVENTS
						videoBox.on('closed', () => {
							// Remove current videoBox from global reference
							videoBoxContainers.splice(videoBoxCounter, 1);
						});

						videoBox.once('ready-to-show', () => {
							videoBox.show();
						});

				
						videoBox.webContents.on('new-window', (e, w_url, frameName, disposition, options) =>{
							e.preventDefault();
							log.info('On new-window event: ', {url: w_url, frame_name: frameName, disposition: disposition, options: options});

							// Open all external links externally(Web browser..etc) by Default
							log.info(`Opening ${w_url} externally..`);
							shell.openExternal(w_url);
							
						});


						// Window Error events
						videoBox.webContents.on('crashed', () =>{
							const options = {
								type: 'info',
								title: 'Floating dog crashed',
								message: 'something made this crash..',
								buttons: ['Reload', 'close'],
							}
							dialog.showMessageBox(options, index =>{
								if(index === 0){
									 videoBox.reload();

								}else{
									videoBox.close();
								}
							});
						});

						videoBox.on('unresponsive', () =>{
							const options = {
								type: 'info',
								title: 'Floating dog is still waiting..',
								message: 'This is taking too long..',
								buttons: ['Reload', 'close'],
							}
							dialog.showMessageBox(options, index =>{
								if(index === 0){
									 videoBox.reload();

								}else{
									videoBox.close();
								}
							});
						});


						log.info('Window size: ', videoBox.getSize());
						log.info('Window position: ', videoBox.getPosition());

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
