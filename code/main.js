const {electron, app, BrowserWindow} = require('electron');
const http = require('http');
let videoWindow;



//*****************************************************
//			   CONFIGS					   
//									  				   				
//*****************************************************
const config = {
	VIDEO_WINDOW_WIDTH: 600,
	VIDEO_WINDOW_HEIGHT: 500,
	WINDOW_BG_COLOR: '#000',
	SERVER_PORTS: [60,53]

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

	// Create server
	const server = http.createServer((req, res) =>{
			console.log(req.headers);
			res.end('Heyooo from server');

			// Create videoWindow
			videoWindow = new BrowserWindow({
				width:           config.VIDEO_WINDOW_WIDTH,
				height:          config.VIDEO_WINDOW_HEIGHT,
				backgroundColor: config.WINDOW_BG_COLOR,
				alwaysOnTop:     true,
				show:            false

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


	});
	let port = config.SERVER_PORTS.pop();
	server.listen({port: port, hostname: 'localhost'}, () => { console.log(` Background Dog is listening.. on door ${port}`); });

	// Server Events
	server.once('error', (err) => {
		console.error(`\n\nERROR_CODE: ${err.code} | \n\n ${err.stack}`);

		switch(err.code){
			case 'EADDRINUSE':
				console.log(`Port ${port} already in use... trying next one..`);
				// try in another port
				setTimeout(() =>{
					port = config.SERVER_PORTS.pop();
					server.listen({port: port, hostname: 'localhost'});
				},1000)
			break;
		}
	});



}
