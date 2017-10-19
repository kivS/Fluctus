
// Debug
if(process.env.NODE_ENV === 'dev') {
    console.log(process.versions);

}else{
    // no console overhead in prod
    console.time = function(){};
    console.timeEnd = function(){};
}

console.time('APP_START_UP');
console.time('APP_IMPORTS')


import { app, BrowserWindow, Tray, Menu, dialog, shell, screen } from 'electron';

// Make sure that only one instance of the program gets to trive!
const shouldSeppuku = app.makeSingleInstance((commandLine, workingDirectory) => { });
if (shouldSeppuku) app.quit();

import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';
import * as autoLaunch from 'auto-launch';

import { config, logger } from './configs';

// get location for logs
let logs_path = path.join(app.getPath('home'), 'fluctus.log');
const log = logger(logs_path)

import * as utils from './utils'

console.timeEnd('APP_IMPORTS');

let trayIcon;
let playerPanelsContainer = Array();
let playerPanelCounter = -1;


// Set autoUpdater log to winston
autoUpdater.logger = log;

// Set auto launch
let auto_launch = new autoLaunch({
    name: app.getName()

}).enable();



log.info(`Prepare for take off!  Version: ${app.getVersion()}`);



//*****************************************************
//             APP Events
//
//*****************************************************
app.on('ready', start);

app.on('window-all-closed', () => {
    playerPanelsContainer = Array();
});



////*****************************************************
//             autoUpdater events
//
//*****************************************************

autoUpdater.on('update-downloaded', (ev, info) => {

    const title = 'Fluctus - New Update';
    const msg = 'Update available. Update now?';
    const btns = ['ok', 'later'];


    utils.sendMsgToUser('info', title, msg, btns, index => {
        // if ok let's update app!
        if (index == '0') autoUpdater.quitAndInstall();
    });

});

autoUpdater.on('error', err => {
    log.error('Error while updating: ', err);
});



//*****************************************************
//             Background dog Start
//
//*****************************************************
function start() {
    console.timeEnd('APP_START_UP');

    log.info('Lift Off of the fluctus!!');

    // Check for updates
    autoUpdater.checkForUpdates();


    // If test mode is on -> Dummy window so end2end tests can run
    if (process.env.NODE_ENV === 'test') {
        let test_window = new BrowserWindow({ alwaysOnTop: true, show: false });
        test_window.loadURL(`file://${__dirname}/resources/player_panels/test.html`);

    }


    let icon = `${__dirname}/resources/images/icon.png`;

    // Set Tray icon
    trayIcon = new Tray(icon);
    trayIcon.setToolTip('Fluctus is waiting..');

    // create menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show logs',
            click: () => {
                shell.openItem(logs_path);
            }
        },
        {
            type: 'separator',
        },
        {
            label: `Version: ${app.getVersion()}`,
            click: () =>{
                shell.openItem(config.RELEASE_PAGE_URL)
            }
        },
        {
            type: 'separator',
        },
        {
            label: 'Exit',
            role: 'quit'
        }
    ]);
    // set menu
    trayIcon.setContextMenu(contextMenu);

    // Show start up ballon for windows
    trayIcon.displayBalloon({
        title: 'Start up',
        content: `Fluctus is starting up!`
    });

    trayIcon.on('click', () => {
        // popup menu
        trayIcon.popUpContextMenu(contextMenu);
    })


    // Get primary screen size info
    const { workAreaSize } = screen.getPrimaryDisplay();


    let requested_url = null;       // request url

    // Create server
    const server = http.createServer((req, res) => {
        log.info('Request Headers: ', req.headers);
        log.info('Request Method: ', req.method);
        log.info('Request Url: ', req.url);

        // Get parsed request url
        requested_url = url.parse(req.url);

        // body for the request
        let request_body = [];

        // set headers
        res.writeHead(200, { 'Content-Type': 'application/json' });

        // Handle request
        switch (true) {
            // for ping requests
            case (req.method == 'GET' && requested_url.pathname == '/ping'):

                res.end(JSON.stringify({ status: 'alive' }));

                break;

            // For video requests
            case (req.method == 'POST' && requested_url.pathname == '/start_player'):
                //handle body of the request
                req.on('data', chunk => {
                    request_body.push(chunk);

                }).on('error', err => {
                    log.error(err.stack);

                }).on('end', function() {

                    console.time('APP_START_PLAYER_PANEL');

                    // get number of video_panels that are open
                    let opened_player_panels = BrowserWindow.getAllWindows().length;
                    log.info('Number of opened player panels: ', opened_player_panels);


                    // concat Buffer data; parse it to string; then parse it to JSON object
                    const request_body_object: object = JSON.parse(Buffer.concat(request_body).toString());
                    log.info('Body: ', request_body_object);

                    log.info('playerPanelCounter: ', playerPanelCounter);

                    // if player_type is not present lets end the convo 
                    if(!request_body_object || !request_body_object['player_type']){
                        res.end(JSON.stringify({ status: 'player_type not present..' }));
                        return;
                    }

                    // Check if video_type of request_body is supported
                    const supported_request = config.SUPPORTED_REQUESTS.find(player_type => player_type == request_body_object['player_type']);


                    // If player type is not supported.. lets end this conversation as well
                    if (!supported_request){
                        res.end(JSON.stringify({ status: 'not_supported!' }));
                        return;
                    }
                  

                    console.time('VIDEO_WINDOW_GET_POSITION');
                    // Get video panel position [x,y]
                    const [player_panel_x_position, player_panel_y_position] = utils.getPlayerPanelPosition(workAreaSize, opened_player_panels);
                    console.timeEnd('VIDEO_WINDOW_GET_POSITION');

                    // Create videoWindow
                    playerPanelsContainer[++playerPanelCounter] = new BrowserWindow({
                        width: config.VIDEO_WINDOW_WIDTH,
                        height: config.VIDEO_WINDOW_HEIGHT,
                        minWidth: config.VIDEO_WINDOW_WIDTH,
                        minHeight: config.VIDEO_WINDOW_HEIGHT,
                        x: player_panel_x_position,
                        y: player_panel_y_position,
                        backgroundColor: config.VIDEO_WINDOW_BG_COLOR,
                        maximizable: false,
                        alwaysOnTop: true,
                        show: false,
                        frame: true,
                        icon: icon,
                        webPreferences: {
                            preload: path.join(__dirname, 'resources', 'player_panels', 'preload.js'),
                            nodeIntegration: (process.env.NODE_ENV === 'dev')? true:false
                        }

                    });

                    // local playerPanel reference
                    const playerPanel = playerPanelsContainer[playerPanelCounter];

                    // encode request_body into url param
                    let query = url.format({ query: request_body_object })

                    // Load window -> Naming convention:(supported_request value + PlayerPanel.html)
                    playerPanel.loadURL(`file://${__dirname}/resources/player_panels/${supported_request}.html${query}`);

                    // Debug
                    if (process.env.NODE_ENV === 'dev') {
                        playerPanel.webContents.openDevTools({
                            detach: true
                        });
                    }


                    // WINDOW EVENTS
                    playerPanel.on('closed', () => {
                        // Remove current playerPanel from global reference
                        playerPanelsContainer.splice(playerPanelCounter, 1);
                    });

                    playerPanel.once('ready-to-show', () => {
                        playerPanel.show();
                        console.timeEnd('APP_START_PLAYER_PANEL');
                    });


                    playerPanel.webContents.on('new-window', (e, w_url, frameName, disposition, options) => {
                        e.preventDefault();
                        log.info('On new-window event: ', { url: w_url, frame_name: frameName, disposition: disposition, options: options });

                        // Open all external links externally(Web browser..etc) by Default
                        log.info(`Opening ${w_url} externally..`);
                        shell.openExternal(w_url);

                    });


                    // Window Error events
                    playerPanel.webContents.on('crashed', () => {
                        const options = {
                            type: 'info',
                            title: 'Fluctus crashed',
                            message: 'something made this crash..',
                            buttons: ['Reload', 'close'],
                        }
                        dialog.showMessageBox(options, index => {
                            if (index === 0) {
                                playerPanel.reload();

                            } else {
                                playerPanel.close();
                            }
                        });
                    });

                    playerPanel.on('unresponsive', () => {
                        const options = {
                            type: 'info',
                            title: 'Fluctus is still waiting..',
                            message: 'This is taking too long..',
                            buttons: ['Reload', 'close'],
                        }
                        dialog.showMessageBox(options, index => {
                            if (index === 0) {
                                playerPanel.reload();

                            } else {
                                playerPanel.close();
                            }
                        });
                    });


                    log.info('Window size: ', playerPanel.getSize());
                    log.info('Window position: ', playerPanel.getPosition());

                    res.end(JSON.stringify({ status: 'ok' }));

                });
                break;

            // For anything else..
            default:
                res.end(JSON.stringify({ status: 'not_allowed..' }));
                break;
        }


    });
    // get last port on ports list
    let port = config.SERVER_PORTS.pop();
    server.listen({ port: port, hostname: config.SERVER_HOSTNAME }, () => { log.info(` Background Dog is listening.. on door ${port}`); });

    // Server Events
    server.on('error', (err: any) => {
        log.error(`\n\nERROR_CODE: ${err.code} | \n\n ${err.stack}`);

        switch (err.code) {
            case 'EADDRINUSE':
            case 'EACCES':
                log.warn(`Port ${port} already in use... trying next one..`);
                // try in another port
                setTimeout(() => {
                    port = config.SERVER_PORTS.pop();
                    server.listen({ port: port, hostname: config.SERVER_HOSTNAME });
                }, 1000)
                break;
        }
    });



}// end of start()

