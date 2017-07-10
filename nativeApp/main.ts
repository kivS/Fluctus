import { app, BrowserWindow, Tray, Menu, dialog, shell, screen } from 'electron';

// Make sure that only one instance of the program gets to trive!
const shouldSeppuku = app.makeSingleInstance((commandLine, workingDirectory) => { });
if (shouldSeppuku) app.quit();

import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as log from 'winston';
import { autoUpdater } from 'electron-updater';
import * as autoLaunch from 'auto-launch';

let trayIcon;
let videoBoxContainers = Array();
let videoBoxCounter = -1;

// get location for logs
let logs_path = path.join(app.getPath('home'), 'fluctus.log');

// Configure winston logs
const canHandleExceptions = (process.env.NODE_ENV === 'dev') ? false : true;
log.configure({
    transports: [
        new (log.transports.Console)({
            level: 'info',
            prettyPrint: true,
        }),
        new (log.transports.File)({
            level: 'error',
            filename: logs_path,
            prettyPrint: true,
            json: false,
            handleExceptions: canHandleExceptions
        })
    ]
});
// set logger as global for window instances
global['logger'] = log;
// Set autoUpdater log to winston
autoUpdater.logger = log;

// Set auto launch
let auto_launch = new autoLaunch({
    name: app.getName()

}).enable();



log.info(`Prepare for take off!  Version: ${app.getVersion()}`);




//*****************************************************
//             CONFIGS
//
//*****************************************************
const config = {
    VIDEO_WINDOW_WIDTH: 480,
    VIDEO_WINDOW_HEIGHT: 400,
    VIDEO_WINDOW_BG_COLOR: '#000',
    SERVER_PORTS: [8791, 8238, 8753],
    SERVER_HOSTNAME: 'localhost',
    SUPPORTED_REQUESTS: ['youtube', 'vimeo', 'twitch', 'soundcloud']

}


//*****************************************************
//             APP Events
//
//*****************************************************
app.on('ready', start);

app.on('window-all-closed', () => {
    videoBoxContainers = Array();
});



////*****************************************************
//             autoUpdater events
//
//*****************************************************

autoUpdater.on('update-downloaded', (ev, info) => {

    const title = 'Fluctus - New Update';
    const msg = 'Update available. Update now?';
    const btns = ['ok', 'later'];


    sendMsgToUser('info', title, msg, btns, index => {
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
    log.info('Lift Off of the fluctus!!');

    // Check for updates
    autoUpdater.checkForUpdates();


    // If test mode is on -> Dummy window so end2end tests can run
    if (process.env.NODE_ENV === 'test') {
        let test_window = new BrowserWindow({ alwaysOnTop: true, show: false });
        test_window.loadURL(`file://${__dirname}/resources/video_panels/test.html`);

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
            label: `Version: ${app.getVersion()}`,
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
            case (req.method == 'POST' && requested_url.pathname == '/start_video'):
                //handle body of the request
                req.on('data', chunk => {
                    request_body.push(chunk);

                }).on('error', err => {
                    log.error(err.stack);

                }).on('end', function() {

                    // get opens windows
                    let opened_video_panels = BrowserWindow.getAllWindows().length;
                    log.info('Number of opened video panels: ', opened_video_panels);


                    // concat Buffer data; parse it to string; then parse it to JSON object
                    const request_body_object: object = JSON.parse(Buffer.concat(request_body).toString());
                    log.info('Body: ', request_body_object);

                    log.info('VideoBoxCounter: ', videoBoxCounter);

                    // Check if video_type of request_body is supported
                    const supported_request = config.SUPPORTED_REQUESTS.find(item => item == request_body_object['video_type']);

                    // If request type is not supported.. let's end this conversation
                    if (!supported_request) res.end(JSON.stringify({ status: 'not_supported' }));


                    // Get video panel position [x,y]
                    const video_panel_position = getVideoPanelPosition(workAreaSize, opened_video_panels);


                    // Create videoWindow
                    videoBoxContainers[++videoBoxCounter] = new BrowserWindow({
                        width: config.VIDEO_WINDOW_WIDTH,
                        height: config.VIDEO_WINDOW_HEIGHT,
                        minWidth: config.VIDEO_WINDOW_WIDTH,
                        minHeight: config.VIDEO_WINDOW_HEIGHT,
                        x: video_panel_position[0],
                        y: video_panel_position[1],
                        backgroundColor: config.VIDEO_WINDOW_BG_COLOR,
                        maximizable: false,
                        alwaysOnTop: true,
                        show: false,
                        frame: false,
                        icon: icon,
                        webPreferences: {
                            preload: path.join(__dirname, 'resources', 'video_panels', 'preload.js'),
                            nodeIntegration: false
                        }

                    });

                    // local videoBox reference
                    const videoBox = videoBoxContainers[videoBoxCounter];

                    // encode request_body into url param
                    let query = url.format({ query: request_body_object })

                    // Load window -> Naming convention:(supported_request value + VideoPanel.html)
                    videoBox.loadURL(`file://${__dirname}/resources/video_panels/${supported_request}.html${query}`);

                    // Debug
                    if (process.env.NODE_ENV === 'dev') {
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


                    videoBox.webContents.on('new-window', (e, w_url, frameName, disposition, options) => {
                        e.preventDefault();
                        log.info('On new-window event: ', { url: w_url, frame_name: frameName, disposition: disposition, options: options });

                        // Open all external links externally(Web browser..etc) by Default
                        log.info(`Opening ${w_url} externally..`);
                        shell.openExternal(w_url);

                    });


                    // Window Error events
                    videoBox.webContents.on('crashed', () => {
                        const options = {
                            type: 'info',
                            title: 'Fluctus crashed',
                            message: 'something made this crash..',
                            buttons: ['Reload', 'close'],
                        }
                        dialog.showMessageBox(options, index => {
                            if (index === 0) {
                                videoBox.reload();

                            } else {
                                videoBox.close();
                            }
                        });
                    });

                    videoBox.on('unresponsive', () => {
                        const options = {
                            type: 'info',
                            title: 'Fluctus is still waiting..',
                            message: 'This is taking too long..',
                            buttons: ['Reload', 'close'],
                        }
                        dialog.showMessageBox(options, index => {
                            if (index === 0) {
                                videoBox.reload();

                            } else {
                                videoBox.close();
                            }
                        });
                    });


                    log.info('Window size: ', videoBox.getSize());
                    log.info('Window position: ', videoBox.getPosition());

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



////*****************************************************
//             HELPER FUNCTIONS
//
//*****************************************************

/**
 * Send message dialog to user
 * @param  {[string]} type -> info, error ,etc..
 * @param  {[string]} title -> title
 * @param  {[string]} msg -> message
 * @param  {[string]} btns -> array of butttons : ["ok" , "zz"]
 * @return {[type]}     [description]
 */
function sendMsgToUser(type, title, msg, btns, cb) {
    dialog.showMessageBox({
        "type": type,
        "title": title,
        "message": msg,
        "buttons": btns

    }, index => {

        cb(index);
    })
}


/**
 * Get position for video panel
 * @param  {[object]} work_area_size          --> screen size available
 * @param  {[int]} number_of_opened_panels
 * @return {[array]}       left and top offset for video panel
 */
function getVideoPanelPosition(work_area_size, number_of_opened_panels): number[] {

    console.log("work area: ", work_area_size);
    console.log("opened video panels: ", number_of_opened_panels);

    // Increment number of opened panels to compensate delay (starts at 0)
    number_of_opened_panels++;

    // Padding for window on screen
    const padding_y = 10;
    const padding_x = 10;

    // get panels per row
    let panels_per_row = Math.floor(work_area_size.width / (config.VIDEO_WINDOW_WIDTH + padding_x));
    log.info('boxes per row: ', panels_per_row);

    // Start at bottom right of screen
    let initial_x = (work_area_size.width - config.VIDEO_WINDOW_WIDTH - padding_x);
    let initial_y = (work_area_size.height - config.VIDEO_WINDOW_HEIGHT - padding_y);


    let x = null;
    let y = null;

    switch (true) {
        // For first row
        case number_of_opened_panels <= panels_per_row:
            x = initial_x - (config.VIDEO_WINDOW_WIDTH + padding_x) * (number_of_opened_panels - 1);
            y = initial_y;
            break;

        // for second row
        case number_of_opened_panels > panels_per_row && number_of_opened_panels <= panels_per_row * 2:
            x = initial_x - (config.VIDEO_WINDOW_WIDTH + padding_x) * (number_of_opened_panels - panels_per_row - 1);
            y = initial_y - (config.VIDEO_WINDOW_HEIGHT + padding_y + 20);
            break;

        // Anything taking more than 2 rows let's place them at bottom right of screen
        default:
            x = initial_x;
            y = initial_y;
            break;
    }


    return [parseInt(x), parseInt(y)];

}
