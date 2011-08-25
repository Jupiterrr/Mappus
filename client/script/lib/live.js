/*
  Live.js - One script closer to Designing in the Browser
  Written for Quplo.com by Martin Kool (@mrtnkl).
  http://livejs.com
  http://livejs.com/license (MIT)
*/
(function () {

  var headers = { "Etag": 1, "Last-Modified": 1, "Content-Length": 1, "Content-Type": 1 },
      Resources = {},
      CurrentLinkElements = {},
      OldLinkElements = {},
      interval = 1000,
      loaded = false,
      active = false;

  var Live = {

    // performs a cycle per interval
    heartbeat: function () {
      // check if #live is found in the hash, and activate or deactivate accordingly
      active = document.location.hash.indexOf("nolive") == -1;
      if (active) {
        // make sure all resources are loaded on first activation
        if (!loaded) Live.loadResources();
        Live.checkForChanges();
      }
      setTimeout(Live.heartbeat, interval);
    },

    // loads all local css and js resources upon first activation
    loadResources: function () {

      // helper method to assert if a given url is local
      function isLocal(url) {
        var loc = document.location,
            reg = new RegExp("^\\.|^\/|^" + loc.protocol + "//" + loc.host);
        return url.match(reg) || !url.match(/:\/\//);
      }

      // gather all resources
      var scripts = document.getElementsByTagName("script"),
          links = document.getElementsByTagName("link"),
          resources = [document.location.href];

      // track local css urls
      for (var i = 0; i < links.length; i++) {
        var link = links[i], type = href = link.getAttribute("type"), href = link.getAttribute("href");
        if (type && href && type.toLowerCase() == "text/css" && isLocal(href)) {
          resources.push(href);
          CurrentLinkElements[href] = link;
        }
      }

      // track local js urls
      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i], src = script.getAttribute("src");
        if (src && isLocal(src)) {
          resources.push(src);
        }
      }

      // initialize the resources info
      for (var i = 0; i < resources.length; i++) {
        var url = resources[i];
        Live.getHead(url, function (url, info) {
          Resources[url] = info;
        });
      }

      // add rule for morphing between old and new css files
      var head = document.getElementsByTagName("head")[0],
          style = document.createElement("style"),
          rule = "transition: all .3s ease-out;"
          css = [".livejs-loading * { ",rule, " -webkit-", rule, "-moz-", rule, "-o-", rule, "}"].join('');  
      style.setAttribute("type", "text/css");
      head.appendChild(style);
      style.styleSheet? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
      
      // yep
      loaded = true;
    },

    // check all tracking resources for changes
    checkForChanges: function () {
      for (var url in Resources) {
        Live.getHead(url, function (url, newInfo) {
          var oldInfo = Resources[url],
              hasChanged = false;
          Resources[url] = newInfo;
          for (var header in oldInfo) {
            // do verification based on the header type
            var oldValue = oldInfo[header],
                newValue = newInfo[header],
                contentType = newInfo["Content-Type"];
            switch (header) {
              case "Etag":
                if (!newValue) break;
                // fall through to default
              default:
                hasChanged = oldValue != newValue;
                break;
            }
            // if changed, act
            if (hasChanged) {
              Live.refreshResource(url, contentType);
              break;
            }
          }
        });
      }
    },

    // act upon a changed url of certain content type
    refreshResource: function (url, type) {
      switch (type) {
        // css files can be reloaded dynamically by replacing the link element       
        case "text/css":
          var link = CurrentLinkElements[url],
              html = document.body.parentNode,
              head = link.parentNode,
              next = link.nextSibling,
              newLink = document.createElement("link");

          html.className = html.className.replace(/\s*livejs\-loading/gi, '') + ' livejs-loading';
          newLink.setAttribute("type", "text/css");
          newLink.setAttribute("rel", "stylesheet");
          newLink.setAttribute("href", url + "?now=" + new Date() * 1);
          next ? head.insertBefore(newLink, next) : head.appendChild(newLink);
          CurrentLinkElements[url] = newLink;
          OldLinkElements[url] = link;

          // schedule removal of the old link
          Live.removeOldLinkElements();
          break;

        // check if an html resource is our current url, then reload       
        case "text/html":
          if (url != document.location.href)
            return;

          // local javascript changes cause a reload as well
        case "text/javascript":
        case "application/javascript":
        case "application/x-javascript":
          document.location.reload();
      }
    },

    // removes the old stylesheet rules only once the new one has finished loading
    removeOldLinkElements: function () {
      var pending = 0;
      for (var url in OldLinkElements) {
        // if this sheet has any cssRules, delete the old link
        try {
          var link = CurrentLinkElements[url],
              oldLink = OldLinkElements[url],
              html = document.body.parentNode,
              sheet = link.sheet || link.styleSheet,
              rules = sheet.rules || sheet.cssRules;
          if (rules.length >= 0) {
            oldLink.parentNode.removeChild(oldLink);
            delete OldLinkElements[url];
            setTimeout(function() {
              html.className = html.className.replace(/\s*livejs\-loading/gi, '');
            }, 100);
          }
        } catch (e) {
          pending++;
        }
        if (pending) setTimeout(Live.removeOldLinkElements, 50);
      }
    },

    // performs a HEAD request and passes the header info to the given callback
    getHead: function (url, callback) {
      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XmlHttp");
      xhr.open("HEAD", url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status != 304) {
          xhr.getAllResponseHeaders();
          var info = {};
          for (var h in headers) {
            var value = xhr.getResponseHeader(h);
            // adjust the simple Etag variant to match on its significant part
            if (h == "Etag" && value) value = value.replace(/^W\//, '');
            if (h == "Content-Type" && value) value = value.replace(/^(.*?);.*?$/i, "$1");
            info[h] = value;
          }
          callback(url, info);
        }
      }
      xhr.send();
    }
  };

  // start listening
  window.addEventListener ? window.addEventListener("load", Live.heartbeat, false) :
                           window.attachEvent("onload", Live.heartbeat, false);
})();
