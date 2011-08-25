//= require("app/script.js");

Mappus.modul.facebook = function(parent) {

var log = new LLog("facebook plugin")
  , current_user = null
  , modal = null
  , templates = {
        loading: "fb.loading.template"
      , start: "fb.start.template"
      , result: "fb.results.template"
      , modal: "fb.modal.template"
    }
  , facebook = {}
;
    
    parent.onReady.observe(start);
    
    function start() {
        if (Person.all.length == 0) {
            var o = show(templates.start).content;
            $$(o, "#facebook_connect_button").addEventListener("click", connect, false);
        } else {
            Point.render();
            loadProfilePictures();
        }
    }
    
    function connect() {
        parent.loading("facebook_data_query", true);
        var offen = false;
        
        window.addEventListener("message", receiveMessage, false);
        function receiveMessage(event){
            offen = true;
            
            if (event.origin !== "http://carstengriesheimer.de") return;
            
            //console.log("token: ", event.data);
            parent.loading("facebook_data_query", false);
            var token = event.data;
            removeElement(modal.dom);
            query(token);
        }
        
        var url = "https://www.facebook.com/dialog/oauth?"  
                + "client_id=116990711651134&"
                + "display=popup&"
                + "redirect_uri=http://carstengriesheimer.de/mappus_w/connect.html&"
                + "scope=friends_hometown,friends_location&"
                + "response_type=token";
        var win = window.open(url, "Facebook", "width=630,height=350");
        
        senden();
        function senden() {
            win.postMessage("Hallo",  "*"); // TODO richtige adresse
            if (!offen) setTimeout(senden, 100); //senden bis Antwort eintrifft
        }
    }

    function query(token) {
        parent.loading("facebook_data_query", true, null);
        
        var url = "https://graph.facebook.com/me/friends?"
                + "fields=name,hometown,location,picture,link"
                + '&access_token=' + token;
        
        FlyJSONP.get({
          url: url,
          success: queryResult,
          error: function(errorMsg) {
            console.log(errorMsg);
          }
        });
    };
    
    function queryResult(data) {
        console.log(data);
        parent.loading("facebook_data_query", false);
    }
    
    // function afterQuery() {
    //     Point.load(function() {
    //         Point.render();
    //         Person.load(function(){
    //             parent.Sidebar.add_items(Person.all, function() {
    //                 Point.render();
    //             });
    //         });
    //     });
    // }
    
    function show(template, data) {
        if (modal === null) {
            modal = {};
            $$("#map_canvas").innerHTML += mustach(templates.modal, { version: 1.0 });
            modal.dom = $$("#modal");
            modal.fb = {
                content: $$(modal.dom, "section"),
                footer: $$(modal.dom, "footer"),
                heading: $$(modal.dom, "h3")
            }
        }
        modal.fb.content.innerHTML = mustach(template, data);

        return modal.fb;
    };
    
    function loadProfilePictures() {
        var d = Person.all, l = d.length, html, img, el;
        while(l--) {
            el = d[l];
            img = document.createElement("img");
            img.setAttribute('src', el.facebook_item.picture);
            document.querySelector('[data-id="'+el.id+'"] .person_pic').appendChild(img);
        }
    }
};
