//= require("lib/simple-model.js");
//= require("lib/utility.js");

var Point = new SimpleModel("point", {
    id: null // {number}
  , name: null // {string}
  , latlng: null // {object#latlng}
  , _persons_visible: [] // {array#persons}
  , _persons_invisible: [] // {array#persons}
  , _marker: null // {object#marker}
});


Point.onLoad = function() {
    console.profile("onLoad_point");
    var d = this.all, i = d.length;
    while (i--) {
        if (d[i]) {
            this.createMarker(d[i]);
        }
    }
    console.profileEnd();
    this.afterLoad.trigger();
}

Point.afterLoad = new JEvent();

// TODO 
Point.createMarker = function(point) {
    if (!point) {
        console.warn("no point");
        return;
    }
    if (typeof google !== "undefined") {
        var marker_options = {
            position: new google.maps.LatLng(point.latlng["lat"], point.latlng["lng"], 0),
            title: point.name
        };
        var marker = new google.maps.Marker(marker_options);
        point._marker = marker;
        
        google.maps.event.addListener(point._marker, 'click', function(e) {  
            var tmpl = document.getElementById("map.infowindow.template").text;
            var html = Mustache.to_html(tmpl, {
                name: point.name
            });
            
             
            var infoBubble2 = new InfoBubble({
              map: Mappus.map,
              content: html,
              shadowStyle: 0,
              disableAnimation: false,
              padding: 5,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderRadius: 5,
              arrowSize: 10,
              borderWidth: 1,
              backgroundClassName: 'phoney',
              borderColor: '#a6a6a6',
              //               disableAutoPan: true,
              //               hideCloseButton: true,
              //               arrowPosition: 30,
            });
            
            infoBubble2.setMaxHeight(200);
            infoBubble2.setMinWidth(200);
            
            
            if (window.bubble_open) window.bubble_open.close();
            infoBubble2.open(Mappus.map, marker);
            window.bubble_open = infoBubble2;
            setTimeout(function() {
                $("." + infoBubble2.g + " img").click(function(){Mappus.Sidebar.onMarkerClose()});
            }, 0);
            
            Mappus.Sidebar.onMarkerClick(point, function() {
                infoBubble2.close();
            });  
              
            var interval = setInterval(setClass, 50);
            function setClass() {
                var el = $(".phoney").parent().parent();
                if (el.length > 0) {
                    clearInterval ( interval );
                    el.addClass("infobubblewindow");
                }
            }
             
        });
    };
}

Point.render = function() {
    
    var points = this.all.select(function(a){ return a._persons_visible.length>0; }),
        i = points.length,
        marker = [];
    while(i--) {
        points[i]._visible = true;
        marker.push(points[i]._marker);
    }
    Mappus.cluster.addMarkers(marker);
}

Point.hide = function(point) {
    if (point._visible == false) return;
    point._visible = false;
    Mappus.cluster.removeMarker(point._marker);
}

Point.show = function(point) {
    if (point._visible == true) return;
    point._visible = true;
    Mappus.cluster.addMarker(point._marker);
}

Point.latlng_temp = {};

Point.base = new SimpleModel();

Point.create = function(arg) {
    var lt = this.latlng_temp,
        json = "{" + arg.latlng.lat + ", " + arg.latlng.lng + "}";
    if ( json in lt ) {
        return lt[json];
    } else {
        var item = Point.base.create.call(this, arg);
        this.latlng_temp[json] = item;
        return item;
    }
}


Point.addPerson = function(point, person) { 
    point._persons_visible.push(person);
    point._visible = true;
}


Point.showPerson = function(point, person) {
    var vis = point._persons_visible.indexOf(person),
        invis = point._persons_invisible.indexOf(person);
    
    if (invis !== -1) {
        point._persons_invisible.splice(invis, 1);
        point._persons_visible.push(person);
    } 
    
    if (point._visible == false) {
        Point.show(point);
    }
}

Point.hidePerson = function(point, person) { 
    var vis = point._persons_visible.indexOf(person);
    
    if (vis !== -1) {
        point._persons_visible.splice(vis, 1);
        point._persons_invisible.push(person);
    }
    
    if (point._visible == true && point._persons_visible.length == 0) {
        Point.hide(point);
    }
}

Point.load();