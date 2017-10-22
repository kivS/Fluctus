// check if current media on the player has already been saved
let SHOW_SAVE_BUTTON = false;

_settings().then(settings =>{

    // get hash of current payload
    const payload_id =  _simple_json_hasher(_parse_url(location.search, true).query);
    console.log('current payload ID:', payload_id);

    // check if payload is already saved
    if(!settings.savedList[payload_id.toString()]){
        console.log('Item not in saved list... showing save button!');
        SHOW_SAVE_BUTTON = true;
        document.getElementById('saveBtn').style.visibility = "visible";
    }
}) 




 document.getElementById('refreshBtn').addEventListener('click', e =>{
   _getCurrentWindow.reload();
 });

 document.getElementById('saveBtn').addEventListener('click', e =>{
   // Parse payload in URL and parse it into object
    const payload = _parse_url(location.search, true).query;
    console.log('Payload: ', payload);

    // save current media 
    _save_item(payload);
    
    // hide save button 
    SHOW_SAVE_BUTTON = false;
    document.getElementById('saveBtn').style.visibility = "hidden";

 });

 // handle toolbar visibility
 _getCurrentWindow.on('blur', () =>{
     console.log('panel lost focus.. hiding toolbar');
     document.getElementsByClassName('toolbar')[0].style.visibility = "hidden";
     document.getElementById('saveBtn').style.visibility = "hidden";
 });

  _getCurrentWindow.on('focus', () =>{
     document.getElementsByClassName('toolbar')[0].style.visibility = "visible";
     if(SHOW_SAVE_BUTTON) document.getElementById('saveBtn').style.visibility = "visible";
 });
 


