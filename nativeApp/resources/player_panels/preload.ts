import {remote} from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import {make_request, simple_json_hasher} from '../../utils.js';

// Settings file path
const settings_file_path = path.join(remote.app.getPath('home'), 'fluctus_settings.json');

/**
 * loads resources into renderer processes once they're ready
 */
 process.once('loaded', function() {

   // init settings file
   initSettings();

   global['_log'] = remote.getGlobal('logger');
   global['_parse_url'] = url.parse;
   global['_process_crash'] = process.crash;
   global['_getCurrentWindow'] = remote.getCurrentWindow();
   global['_disableDragAndDrop'] = disableDragAndDrop;
   global['_get_env'] = getEnv;
   global['_settings'] = getSettings;
   global['_save_item'] = saveItem;
   global['_edit_item'] = editItem;
   global['_delete_item'] = deleteItem;
   global['_open_player_panel'] = openPlayerPanel;
   global['_simple_json_hasher'] = simple_json_hasher;


   // disables drag and drop on toolbar
   document.addEventListener('dragover', (event) => {
     event.preventDefault();
     return false;
   }, false);

   document.addEventListener('drop', (event) => {
     event.preventDefault();
     return false;
   }, false);

 });


/**
 * disables drag and drop on iframe
 */
 function disableDragAndDrop() {
   console.log('disable drag & drop - Active');
   let _iframe = document.getElementsByTagName('iframe')[0].contentDocument;

   _iframe.addEventListener('dragover', (event) => {
     event.preventDefault();
     return false;
   }, false);

   _iframe.addEventListener('drop', (event) => {
     event.preventDefault();
     return false;
   }, false);
 }


function getEnv(){
  if(process.env.NODE_ENV){
    let env;
    switch (process.env.NODE_ENV) {
      case "dev":
      env = 'dev';
      break;

      case "test":
      env = 'test';
      break;

      default:
      env='prod';
      break;
    }

    return env;

  }else{
    return 'prod';
  }
}

function getSettings(){
  return new Promise((resolve, reject) =>{
      fs.readFile(settings_file_path, 'utf-8', (err, data) =>{
        if(err) reject(err);

        let json_data;

        try{
          json_data = JSON.parse(data)

        }catch(e){
           reject("error_parsing_settings")
        }

        if(json_data) resolve(json_data)

      })

  }).catch(error =>{
    global['_log'].error(error);
  })
 

}


/**
 * Save item to settings savedList
 * @param {[type]} data [description]
 */
function saveItem(data){

  // hash data to create 32 bits identifier
  const itemToSaveID = simple_json_hasher(data).toString();

  const itemToSave = {

      updated_at: new Date().getTime(),
      created_at: new Date().getTime(),
      payload: data,
      name: 'Visible name, shortcut. Click here to rename'
  }

  console.log('Item to be saved:', itemToSave);

  // get current settings
  getSettings().then(settings =>{
    // add item to saveList
    settings['savedList'][itemToSaveID] = itemToSave;
    console.log('Settings:', settings);

    // rewrite settings with changes made
    saveSettings(settings);

    // display notification to user
    const notify = new Notification('Saved!', { icon: '../images/icon.png' });

    // make sure notification goes away in a timely manner!
    notify.onshow = () =>{
      const closeNotifTimeOut = setTimeout( () =>{
        notify.close();
        clearTimeout(closeNotifTimeOut);
      }, 1000)
    }


  })
}


/**
 * Given saved item id, delete it from settings savedList
 * @param {[type]} id [description]
 */
function deleteItem(id){
  // get current settings
  getSettings().then(settings =>{
    // add item to saveList
    if(settings['savedList'][id]){
      console.log('Deleting item with id:', id);
      delete(settings['savedList'][id]);

      // rewrite settings with changes made
      saveSettings(settings);

    }
  })
}


function editItem(id, item){
  console.log('Editing item:', id, item);

  // get settings
  getSettings().then(settings =>{
    if(settings['savedList'][id]){
      
       settings['savedList'][id] = item;
       // update time of update
       settings['savedList'][id]['updated_at'] =  new Date().getTime();

       console.log('Edit saved! ID -', id);

      // rewrite settings with changes made
      saveSettings(settings);

    }
  })
}


function initSettings(){
  // data to save in settings file

  const data = {
    'savedList':{
      'x1':{
        updated_at: new Date().getTime(),
        created_at: new Date().getTime(),
        name: 'Visible name, shortcut. Click here to rename',
        payload:{
           player_type: 'youtube',
           video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      }
    }

  }

  // check if settings file exists, if not create one..
  return new Promise((resolve, reject) =>{
    fs.stat(settings_file_path, (err, status) =>{
      if(err) reject(err);

      if(status){
        global['_log'].info('Settings file is present!');
        resolve(true)
      }

    })
  })
  .catch(error =>{
    // 
    global['_log'].info('No settings file. Creating one..');
    saveSettings(data)
  })

}


/**
 * Given a saved item lets play on the player panel
 * TODO: we need to keep the port in use in memory
 */
function openPlayerPanel(payload){

  return make_request('http://localhost:8753/start_player', 'POST', payload)
    .catch(error =>{
      global['_log'].error(error);
    })

}

/**
 * Rewrite settings file
 * @param {[type]} data [description]
 */
function saveSettings(data){
  fs.writeFile(settings_file_path, JSON.stringify(data), (error) =>{
    if(error) global['_log'].error(error)
  })
}