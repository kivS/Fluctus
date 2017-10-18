const Application = require('spectron').Application;
const electron = require('electron');
const path = require('path');
const assert = require('assert');
const fetch = require('node-fetch');


const app_path = path.join(__dirname, '..', 'main.js');

const config = {
  server: 'http://localhost:8753'
}




function make_request(url, method, payload){

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


/****************************************************************************************************************/




/**
 *    TESTS
 */

 describe('Application lift off!', function () {
  this.timeout(15000)

  beforeEach(function () {
    this.app = new Application({
        path: electron,
        args: [app_path]
    })
 
    return this.app.start()

  })

  afterEach(function () {
    if(this.app && this.app.isRunning()) {
      // close app
      return this.app.stop()

    }

    return undefined;

  })


  describe('On launch', function() {
    it('should get Dummy test page', function() {
      return this.app.browserWindow.getTitle().then(title =>{
       assert.equal(title, "TEST_PAGE");
     });
    })
  })


  describe('On local server request received', function(){

      it('should return status: "alive" when pinged!', function() {
        return make_request(`${config.server}/ping`, 'GET', null).then(data =>{
            assert.equal(data.status, 'alive');
        })
      })

      it('should return status: "not_allowed.." for non defined POST endpoints', function(){
        return make_request(`${config.server}/all_yo_moneh`, 'POST', null).then(data =>{
            assert.equal(data.status, 'not_allowed..');
        }) 
      })

      it('should return status: "not_allowed.." for non defined GET endpoints', function(){
        return make_request(`${config.server}/all_yo_moneh`, 'GET', null).then(data =>{
            assert.equal(data.status, 'not_allowed..');
        }) 
      })

      it('should return status: "not_allowed.." for non defined PUT endpoints', function(){
        return make_request(`${config.server}/all_yo_moneh`, 'PUT', null).then(data =>{
            assert.equal(data.status, 'not_allowed..');
        }) 
      })

      it('should return status: "not_supported!" when player_type is not in the allowed list', function(){
        return make_request(`${config.server}/start_player`, 'POST', {player_type: 'bananaHammer'}).then(data => {
          assert.equal(data.status, 'not_supported!')
        })  
      })

      it('should return status: "player_type not present.."  when player_type is not present in the start_player request', function(){
        return make_request(`${config.server}/start_player`, 'POST', {banana:'good'}).then(data => {
          assert.equal(data.status, 'player_type not present..')
        })
      })

      it('should return stastus: "ok" when start_player request POST has player_type ', function(){
        return make_request(`${config.server}/start_player`, 'POST', {player_type: 'youtube'}).then(data => {
          assert.equal(data.status, 'ok')
        })
      })
 
  })


  describe('On player panel startup', function (done){

      it('should display youtube player panel if the request type is youtube', function(){
          // open youtube video panel
          let payload = {
            player_type: 'youtube',
            video_url: 'https://www.youtube.com/watch?v=RWUPhKPjaBw&t=2560s'
          }
          
          return new Promise(resolve =>{
            return make_request(`${config.server}/start_player`, 'POST', payload)
            .then((data) =>{
              
              this.app.client.windowByIndex(1).then(() =>{
                  this.app.client.getHTML('#page_id', false).then(page_id =>{
                      resolve(page_id)
                  })
              })
            })
          })
          .then(result =>{
              assert.equal('YOUTUBE_PAGE', result);
          })
          
      })

      it('should display vimeo player panel if the request type is vimeo', function(){
          // open vimeo video panel
          let payload = {
            player_type: 'vimeo',
            video_url: 'pokimane'
          }

          return new Promise(resolve =>{
            return make_request(`${config.server}/start_player`, 'POST', payload)
              .then((data) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
              })
          })
          .then(result =>{
              assert.equal('VIMEO_PAGE', result);
          })
      })

      

      it('should display twitch video panel if the request type is twitch', function(){
          // open twitch video panel
          let payload = {
            player_type: 'twitch',
            video_url: 'pokimane'
          }

          return new Promise(resolve =>{
             make_request(`${config.server}/start_player`, 'POST', payload)
              .then((data) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
              })
          })
          .then(result =>{
              assert.equal('TWITCH_PAGE', result);
          })        
      })

      it('should display twitch video panel if the request type is twitch', function(){
          // open twitch video panel
          let payload = {
              "player_type": "soundcloud",
              "video_url": "https://soundcloud.com/twiml"
          }

          return new Promise(resolve =>{
             make_request(`${config.server}/start_player`, 'POST', payload)
              .then((data) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
              })
          })
          .then(result =>{
              assert.equal('SOUNDCLOUD_PAGE', result);
          })
          
      })
  })
  

}) //