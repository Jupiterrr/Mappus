//= require("lib/infobubble-compiled.js");
//= require("map_style.js");
//= require("lib/mustach.js");
//= require("lib/utility.js");
//= require("lib/markerclusterer.js");
//= require("model/point.js");
//= require("model/person.js");
//= require("app/sidebar.js");

var gmap;

var Mappus = {};


 (function() {

var 
    _this = this
  , log = new LLog()
  , options = {
        cluster: true,
        gridSize: 30,
        maxZoom: 12,
        hide_marker_on_search: true,
        instantSearch: true,
        teplates_path: "templates.html",
        map_options: {
            zoom: 2,
            center: new google.maps.LatLng(30, 60),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            }
        }
    }
  , body = null
  , loading_msg = null 
;

    this.modul = {};
    this.Sidebar = undefined;
    this.cluster = undefined;
    this.map = undefined;
    
    /* Events */
    this.onReady = new JEvent();
    this.onMessage = new JEvent();
    this.onError = new JEvent();
    
    /* Initialize when Dom ready */
    document.addEventListener("DOMContentLoaded", function (){
        //$.when(load_templates(), load_map(), load_modul()
        if (_this.modul.facebook) {
            _this.modul.facebook = _this.modul.facebook(_this);
        } else if (_this.modul.contacts) {
            _this.modul.contacts = modul.contacts(_this);
        }
        start();
    });
    
    /* Show Errors */
    this.onError.observe(function(msg) {
        alert(msg);
    });
    

    function start() {
        log.info("start");
        
        //var view = mustach("basic.layout.template");
        
        /* create Map */
        gmap = new google.maps.Map($("#map_canvas")[0], options.map_options);
        _this.map = gmap;
        
        /* define style of map (see map_style.js) */
        var jayzMapType = new google.maps.StyledMapType(map_style2, {
            map: gmap,
            name: "light"
        });
        gmap.mapTypes.set('light', jayzMapType);
        gmap.setMapTypeId('light');
        
        /* MarkerCluster */
        var mcOptions = {
            gridSize: options.gridSize,
            maxZoom: options.maxZoom
        };
        _this.cluster = new MarkerClusterer(gmap, [], mcOptions);
        _this.cluster.clusterMarkerClick = function(args) {
            args.clusterMarker.openInfoWindowHtml(args.clusteredMarkers.length + ' markers clustered here.');
        };
        
        var view = $$("#app_view");
        _this.Sidebar = new Sidebar(view);
        body = document.body;
        loading_msg = $$("#loading_msg");
              
        Person.afterLoad.observe(function() {
            _this.loading(null, false);
            _this.Sidebar.add_items(Person.all);
            _this.onReady.trigger();
        });
        
    }
    
    this.loading = function(title, status, msg) {
        if (status) {
            body.classList.add("loading");
        } else {
            body.classList.remove("loading");
        }
        console.log("loading:", title, status, msg)
    }


    //_this.onMessage.update(m) } );

}).call(Mappus);