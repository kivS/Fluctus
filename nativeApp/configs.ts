import * as log from 'winston';


//--------------------------------------------------------------------------------------------------

export const config = {
    VIDEO_WINDOW_WIDTH: 500,
    VIDEO_WINDOW_HEIGHT: 440,
    VIDEO_WINDOW_BG_COLOR: '#000',
    SERVER_PORTS: [8791, 8238, 8753],
    SERVER_HOSTNAME: 'localhost',
    SUPPORTED_REQUESTS: ['youtube', 'vimeo', 'twitch', 'soundcloud'],
    RELEASE_PAGE_URL: 'https://github.com/kivS/floating-dog/releases',
    SAVED_BY_USER_WINDOW_WIDTH: 500,
    SAVED_BY_USER_WINDOW_HEIGHT: 300,
}


//--------------------------------------------------------------------------------------------------

function timestampFormat(){
    let date = new Date().toString().split(' ');
    const [w, m, d, y, t] = date; 


    return `${w} ${d} ${m} ${y} ${t}` ;
}


export function logger(logs_path){
    // Configure winston logs
    const canHandleExceptions = (process.env.NODE_ENV === 'dev') ? false : true;
    log.configure({
        transports: [
            new (log.transports.Console)({
                level: 'info',
                prettyPrint: true,
                timestamp: timestampFormat,
                colorize: true
            }),
            new (log.transports.File)({
                level: 'error',
                filename: logs_path,
                prettyPrint: true,
                eol: '\n\n',
                timestamp: timestampFormat,
                json: false,
                handleExceptions: false
            })
        ]
    });

    // set logger as global for window instances
    global['logger'] = log;

    return log;

}

//--------------------------------------------------------------------------------------------------
