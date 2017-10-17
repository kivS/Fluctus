// disable console family(log, error, debug) if we're in prod
if(_get_env() != 'dev'){
    Object.keys(console).forEach(function(key){
                // allow only logs with error level
               if(key == 'error') return;
               console[key] = function(){};
    })
}

