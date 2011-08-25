chrome.extension.onRequest.addListener( onRequest );
function onRequest(request, sender, sendResponse) {
    console.log(request);
    if (request.facebbok_connect) {
        Facebook.connect( sendResponse );
    }
}


chrome.extension.onConnect.addListener(function(port) {
  console.assert(port.name == "mappus");
  port.onMessage.addListener(function(msg) {
    console.log("received:", msg);
    
    if (msg.action == "facebook.connect") {
      Facebook.connect(port, msg);
    };
  });
});