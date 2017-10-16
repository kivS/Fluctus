const Application = require('spectron').Application;
const path = require('path');
const assert = require('assert');
const fetch = require('node-fetch');


const app_path = path.join(__dirname, '..', 'main.js');

const config = {
  server: 'http://localhost:8753'
}

/**
 * New application wrapper
 * @return {[type]} [description]
 */
 function new_app() {
  return new Application({
    path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    args: [app_path]
  })
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
  this.timeout(60000)

  beforeEach(function () {
    this.app = new_app()
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      // close app
      return this.app.stop()

    }
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

      it('should return status: "not_allowed.." for non defined endpoints', function(){
        return make_request(`${config.server}/all_yo_moneh`, 'POST', null).then(data =>{
            assert.equal(data.status, 'not_allowed..');
        }) 
      })
 
  })


 /* describe('On video panel startup', function (){

      it('should display youtube video panel if the request type is youtube', function(){
          // open youtube video panel
          let payload = {
            video_type: 'youtube',
            video_url: 'https://www.youtube.com/watch?v=RWUPhKPjaBw&t=2560s'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
            })

          }).then(result =>{
              assert.equal('YOUTUBE_PAGE', result);
          })
          
      })

      it('should display vimeo video panel if the request type is vimeo', function(){
          // open vimeo video panel
          let payload = {
            video_type: 'vimeo',
            video_url: 'pokimane'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
            })

          }).then(result =>{
              assert.equal('VIMEO_PAGE', result);
          })
          
      })

      it('should display twitch video panel if the request type is twitch', function(){
          // open twitch video panel
          let payload = {
            video_type: 'twitch',
            video_url: 'pokimane'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
            })

          }).then(result =>{
              assert.equal('TWITCH_PAGE', result);
          })
          
      })

      it('should return status: "not_supported" when the request type is... not supported!', function(){
          // open youtube video panel
          let payload = {
            video_type: 'potato',
            video_url: 'https://www.xpotatox.com/watch?p=ahahhah'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
              let response = JSON.parse(body);
              resolve(response.status)
            })

          }).then(result =>{
             assert.equal('not_supported', result);
          })
          
      })

  })*/
  

}) //