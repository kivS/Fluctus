
////*****************************************************
//             HELPER FUNCTIONS
//
//*****************************************************
import { config } from './configs'
import { dialog } from 'electron';
import fetch from 'node-fetch';

const log = global['logger']



/**
 * Send message dialog to user
 * @param  {[string]} type -> info, error ,etc..
 * @param  {[string]} title -> title
 * @param  {[string]} msg -> message
 * @param  {[string]} btns -> array of butttons : ["ok" , "zz"]
 * @return {[type]}     [description]
 */
export function sendMsgToUser(type, title, msg, btns, cb) {
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
export function getPlayerPanelPosition(work_area_size, number_of_opened_panels): number[] {

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





/**
 * make http requests
 * @param {[type]} url     [description]
 * @param {[type]} method  [description]
 * @param {[type]} payload [description]
 */
export function make_request(url, method, payload){

  return new Promise((resolve, reject) => {

    const body = JSON.stringify(payload) || '';

    fetch(url,{
        method: method,
        headers: {"Content-Type": "application/json"},
        body: body
    })
    .then(response =>{
        return response.json()
    })
    .then(data => {
        resolve(data);

    })
    .catch(err =>{
        reject(err);
    })

  })
}


/**
 * simple One-way hash function for IDS
 * @param {[type]} json_data [description]
 */
export function simple_json_hasher(json_data){
    const guinea_pig = JSON.stringify(json_data);
    let hash = 0;

    if(guinea_pig.length == 0) return hash;

    for(let i = 0; i < guinea_pig.length; i++){
        // get char code
        let aChar = guinea_pig.charCodeAt(i);

        //binary manipulations to return a 32 bits id
        hash = ( (hash << 5) - hash ) + aChar;
        hash = hash & hash;
    }
    return hash;
}