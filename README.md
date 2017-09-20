# floating-dog Project
  

---

## Native Desktop App

### Structure
  - main.ts implements http server, global logging, auto-update, notifications, player positioning in screen
  - on http call from web extension, main.ts calls starts a renderer process to display player(player depends on request. eg: youtube player)
  - the video player process has no access to node api and communicates with the main process via a preload script 
  - the preload script implements pre-defined main resources the video player can access to 


### Versioning
  - YYYY-M-1N(N = montly update counter, initial value 00)

### Global Configs:
  * Ports in use:
      * 8791
      * 8238
      * 8753


### Configs
  * **Supported video_type list:**
   -   ```javascript
       SUPPORTED_REQUESTS: ['youtube']

        ```

### Main HTTP API

  * **ping:**
      - Launches Pings native app local server
      - Method: GET
      - Payload: None
      - On success returns:
        ```json
        { "status": "alive"}

        ```


  * **start_video:**
      - Launches video panel with payload
      - Method: POST
      - Payload: video_type, rest of Object
      - On success returns:
        ```json
        { "status": "ok"}

        ```

  * **Errors:**
      - On requests to local server that are not allowed:
      ```json
        { "status": "not_allowed.."}

      ```

      - On open video panels where video_type is not supported:
       ```json
        { "status": "not_supported"}

      ```


### Video/Audio Players API
  - Transport: Json

  #### Youtube
    - video_currentTime --> Number
    - video_type        --> String | eg: youtube
    - video_url         --> Url    | String enconded url object

    video_url
      - list --> playlist id
      - v    --> video id


    

---


## Chrome Extension