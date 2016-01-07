(function browser_terminal_mirror(ssl){

    if (typeof ssl === 'undefined'){
      var scripts= document.getElementsByTagName('script');
      var path= scripts[scripts.length-1].src;
      var indexOfSsl = path.indexOf('ssl=');
      ssl = (indexOfSsl === -1 ? false : path.substr(indexOfSsl + 4,4) === 'true');
    }

    var state = document.readyState;
    if(state !== 'interactive' && state !== 'complete') {
      setTimeout(browser_terminal_mirror.bind(this,ssl), 100);
      return;
    }

    if (typeof WebSocket === undefined){
      console.log('browser-terminal-mirror - websockets not available');
      return;
    }

    var protocol = ssl ? 'wss' : 'ws';

    var connection = new WebSocket(protocol + '://' + location.hostname + ':37901');
    connection.onmessage = function(e){
      var data = JSON.parse(e.data);
      var pre = document.querySelector('#browser-terminal-mirror>pre');
      if (data.line) {
        $('#browser-terminal-mirror>pre').append(data.line);
        pre.scrollTop = pre.scrollHeight;
      }
      if (data.removeLine) {
        pre.removeChild(pre.children[pre.children.length-1]);
      }
      if (data.isError) {
        document.querySelector('#browser-terminal-mirror').style.display = 'block';
      }

      while (pre.children.length > 300) {
        pre.removeChild(pre.children[0]);
      }
      //need to delete the lines over time else the browser will get bogged down
    };

    var elem = document.createElement('div');
    elem.id = 'browser-terminal-mirror';
    elem.style.display = 'none';
    elem.style.position = 'fixed';
    elem.style.top = elem.style.left = elem.style.bottom = elem.style.right = '10px';
    elem.style.paddingTop = '0px';
    elem.style.zIndex = 9999999;

    var pre = document.createElement('pre');
    pre.style.backgroundColor = 'black';
    pre.style.color = '#CCC';
    pre.style.position = 'absolute';
    pre.style.top = pre.style.left = pre.style.bottom = pre.style.right = '0px';
    pre.style.overflowY = 'scroll';
    pre.style.marginBottom = '0px';
    elem.appendChild(pre);

    var toolbar = document.createElement('div');
    toolbar.style.position = 'absolute';
    toolbar.style.top = '5px';
    toolbar.style.right = '25px';
    toolbar.style.zIndex = 999999;
    elem.appendChild(toolbar);

    var link = document.createElement('a');
    link.style.color = 'grey';
    link.href = 'http://github.com/cgross/browser-terminal-mirror';
    link.innerHTML = 'browser-terminal-mirror';
    toolbar.appendChild(link);

    var sep = document.createElement('span');
    sep.innerHTML = ' | ';
    toolbar.appendChild(sep);

    link = document.createElement('a');
    link.style.color = 'grey';
    link.href = '#';
    link.innerHTML = 'clear';
    link.addEventListener('click',function(e){
      e.preventDefault();
      pre.innerHTML = '';
    });
    toolbar.appendChild(link);

    sep = document.createElement('span');
    sep.innerHTML = ' | ';
    toolbar.appendChild(sep);

    link = document.createElement('a');
    link.style.color = 'grey';
    link.href = '#';
    link.innerHTML = 'close';
    link.addEventListener('click',function(e){
      e.preventDefault();
      elem.style.display = 'none';
    });
    toolbar.appendChild(link);

    document.body.appendChild(elem);

})();
