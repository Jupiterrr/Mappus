
function Geocoder() {
   this.socket = new io.Socket("mappus.duostack.net", {port: 9980});
   this.addresses = [];
   this.end = true;
   this.socketOpen();
   this.counter = 0;
}

Geocoder.prototype.socketOpen = function() {
    console.log("open");
    
    this.socket.connect();
    var that = this;
    this.socket.on('connect', function() { that.onConnect(); });
    this.socket.on('message', function(m){ that.onMessage(m); });
    this.socket.on('disconnect', this.onDisconnect); 
}

Geocoder.prototype.onConnect = function() {
    console.log("connected");
    this.connected = true;
    if (this.onConnectfn != null) { this.onConnectfn(); }
}

Geocoder.prototype.onMessage = function(msg) {
    console.log("received messageg")//, msg);
    try {
        var r = JSON.parse(msg);
    } catch(e){
        console.warn(e);
        return;
    }
    if (r && r.geocode) this.parsee(r.geocode);
}

Geocoder.prototype.onDisconnect = function() {
    if (this.end == true) {
        console.log("close");
    } else {
        console.warn("connectionen closed unexpected");
    }
}

Geocoder.prototype.connected = false;
Geocoder.prototype.onConnectfn = null;
Geocoder.prototype.onFinish = null;

Geocoder.prototype.sendRequest = function( locations ) {
    console.log("send geocode request");
    this.end = false;
    var query = [];
    var locationsByID = {};
    var a = locations, i = a.length, el;
    while (i--) {
        el = a[i];
        
        if (!(el.id in locationsByID)) locationsByID[el.id] = [];
        
        locationsByID[el.id].push(el);
        
        query.push({
            id: el.id,
            address: el.address
        });
    }
    this.locationsByID = locationsByID;
    query = { geocode: query };
    console.log("query?:", query)
    this.socket.send(query);
}

Geocoder.prototype.ask = function(locations, cb) {
    var that = this;
    if (this.connected == false) {
        that.onConnectfn = function() {
            that.ask(locations, cb);
        };
        return;
    } else {
        this.onFinish = cb;
        this.sendRequest( locations );
    }
}

Geocoder.prototype.end = function() {
    console.log("end");
    this.end = true;
}

Geocoder.prototype.parsee = function(msg) {
    console.log("nachricht")//, msg);
    
    var i = msg.length, el1, lbi = this.locationsByID, j, id_goup, location, point, points, points_r;
    while (i--) {
        el1 = msg[i];
        if (!el1.id in lbi) continue;
        
        // create points
        points_r = el1.locations;
        j = points_r.length;
        points = [];
        while (j--) {
            el2 = points_r[j];
            point = Point.create({
                name: el2.address.replace("Germany", "Deutschland"),
                latlng: el2.cord
            });
            points.push(point);
        }
        
        // set points to locations in location groups    
        id_goup = lbi[el1.id];
        
        j = id_goup.length;
        while (j--) {
            location = id_goup[j];
             if (points.length > 0) {
                location.points = points;
                location.selected_point = points[0];
                location.isGeocoded = true;
                location.status = el1.status;
            } else {
                location.status = el1.status;
            }
        }
    }
    Person.save_all();
    Person.save_model();
    Point.save_all();
    Point.save_model();
    if (this.onFinish) this.onFinish();
}
