# Fluctus Project
  

---

## Native Desktop App

### Structure
  - main.ts implements http server, global logging, auto-update, notifications, player panel positioning in screen
  - on http call from web extension, main.ts starts a renderer process to display player panel(player depends on request. eg: youtube player)
  - the player panel process has no access to node api and communicates with the main process via a preload script 
  - the preload script implements pre-defined main resources the player panel can access to 


### Versioning
  - YYYY-M-1N(N = montly update counter, initial value 00)

### Global Configs:
  * Reserved Ports:
      * 8791
      * 8238
      * 8753 (default)


### Configs
**Supported player_type list:**
  ```javascript
  SUPPORTED_REQUESTS: ['youtube', 'vimeo', 'twitch', 'soundcloud']

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


  * **start_player:**
      - Launches requested player panel 
      - Method: POST
      - Payload: player_type, rest of Object
      - On success returns:
        ```json
        { "status": "ok"}

        ```

  * **Errors:**
      - On requests to local server that are not allowed:
      ```json
        { "status": "not_allowed.."}

      ```

      - On open player panel where player_type is not supported:
       ```json
        { "status": "not_supported!"}

      ```

       - On open player panel where player_type is not present:
       ```json
        { "status": "player_type not present.."}

      ```


### Video/Audio Players API
  - Transport: Json
  - player_type is required for each request

  Youtube:
    - video_currentTime  --> Video start time in seconds
    - video_url:         --> Url  | String enconded url object
        - list           --> playlist id
        - v              --> video id

  
  Vimeo:
    - video_url --> URL or video ID
    - time      --> video start time in seconds
    

  Soundcloud:
    - video_url


  Twitch:
    - video_id | channel_id      --> Video(prefix must be 'v', eg: v123443545) or channel ID


---


## Chrome Extension