
var Facebook = {
    port: null,
    connect: function(port, msg) {
        console.log("facebook.connect")
        Facebook.port = port;
        Facebook.sender = msg.sender;
        
        Facebook.geocoder = new Geocoder();
       
        // falls eingellogt ...
        if (false) {
            // var at = JSON.parse(localStorage.accessToken);
            //             console.log(at)
            //             
            //             var test_url = "https://graph.facebook.com/me?access_token=" + at.access_token;
            //             $.ajax({
            //               url: test_url,
            //               dataType: 'json',
            //               success: function(r) {
            //                   console.log("facebook.connect.connected", r)
            //                   if ( Facebook.onConnect ) Facebook.onConnect( at );
            //               },
            //               error: function(e) {
            //                   console.log("facebook.connect.failed -> login", e)
            //                   Facebook.login();
            //               }
            //             });
            //             
        } else {
            Facebook.login();
        }
    },
    sender: null,
    login: function() {
        console.log("facebook.login")
        
        Facebook.port.postMessage( {
            status: "loading",
            msg: "verbinde mit Facebook",
            sender: Facebook.sender
        });
        
        var url = "https://www.facebook.com/dialog/oauth?"  
                + "client_id=116990711651134&"
                + "display=popup&"
                + "redirect_uri=http://www.facebook.com/connect/login_success.html&"
                + "scope=friends_hometown,friends_location&"
                + "response_type=token";
        window.open(url, "Facebook", "width=630,height=350");
        
        chrome.tabs.onUpdated.addListener( Facebook.onTabsUpdate );
    },
    successURL: 'facebook.com/connect/login_success.html',
    onTabsUpdate: function(id, state, tab) {
        if (tab.url.indexOf(Facebook.successURL) != -1) {
            console.log("facebook.login.response")
            var params = tab.url.split('#')[1].split("&");
            var access_token = {
                access_token: params[0].split("=")[1],
                expires_in: params[1].split("=")[1],
                time: new Date()
            } 
            
            localStorage.accessToken = JSON.stringify( access_token );
            console.info("access_token", access_token);
            chrome.tabs.onUpdated.removeListener( Facebook.onTabsUpdate );
            chrome.tabs.remove(id);
            Facebook.access_token = access_token;
            Facebook.getFriendsData();
        }
    },
    access_token: null,

    getFriendsData: function() {
        Facebook.port.postMessage( {
            status: "loading",
            msg: "lade Daten von Freunden",
            sender: Facebook.sender
        });
        
         var url 
            = "https://graph.facebook.com/me/friends?"
            + "fields=name,hometown,location,picture,link"
            + "&format=JSON" 
            + '&access_token=' + Facebook.access_token.access_token
        ;

        $.getJSON(url, function(data, x) {
            console.log("query result");//, data)
            Facebook.getFriendsDataResponse( data.data ) 
        });
        
        var url 
            = "https://graph.facebook.com/me"
            + "&format=JSON" 
            + '&access_token=' + Facebook.access_token.access_token
        ;

        $.getJSON(url, function(data, x) {
            localStorage["facebook"] = JSON.stringify(data);
        });
    },
    getFriendsDataResponse: function(r) {
        console.log("getFriendsDataResponse")
        
        var location, loc, person, el,
            i = r.length, j, person_locations, pl;
        
        while (i--) {
            el = r[i];
            if (!(
                (el.location && el.location.id != "") || 
                (el.hometown && el.hometown.id != "")  
            )) continue;
            
            person = Person.create({
               name: el.name, 
               facebook_item: el
            });
            
            person_locations = [];
            person_locations.push(el.location || null);
            person_locations.push(el.hometown || null);
            
            j = person_locations.length;
            while (j--) {
                pl = person_locations[j];
                if (pl && pl.id != "") {
                    pl.name = pl.name.replace("Germany", "Deutschland");
                    person.locations.push( new Location(pl.name, pl.id) );
                }
            }
        }
        
        Facebook.geocode(fertig);
        
        function fertig() {
            Facebook.port.postMessage( {
                status: "ok",
                sender: Facebook.sender
            });
        }

        
        //cb("test test"); // @main_view
    },
    geocode: function(cb) {
        console.log("pers geocoder");
        
        var uncoded = [];

        var d = Person.all,
            i = d.length,
            l, j;
        while (i--) {
            l = d[i].locations;
            j = l.length;
            while (j--) {
                if (l[j].isGeocoded === false) uncoded.push( l[j] );
            }
        }

        Facebook.geocoder.ask(uncoded, cb);
    },
    geocoder: null

}