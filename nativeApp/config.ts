import * as log from 'winston';

export const config = {
    VIDEO_WINDOW_WIDTH: 500,
    VIDEO_WINDOW_HEIGHT: 440,
    VIDEO_WINDOW_BG_COLOR: '#000',
    SERVER_PORTS: [8791, 8238, 8753],
    SERVER_HOSTNAME: 'localhost',
    SUPPORTED_REQUESTS: ['youtube', 'vimeo', 'twitch', 'soundcloud']
}


export function logger(logs_path){
    // Configure winston logs
    const canHandleExceptions = (process.env.NODE_ENV === 'dev') ? false : true;
    log.configure({
        transports: [
            new (log.transports.Console)({
                level: 'info',
                prettyPrint: true,
            }),
            new (log.transports.File)({
                level: 'info',
                filename: logs_path,
                prettyPrint: true,
                json: false,
                handleExceptions: false
            })
        ]
    });

    // set logger as global for window instances
    global['logger'] = log;

    return log;

}

