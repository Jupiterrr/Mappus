//= require("lib/simple-model.js");
//= require("model/location.js");
//= require("lib/utility.js");

var Person = new SimpleModel("person", {
    id: null // {number}
  , name: null // {string}
  , locations: [] // {array#locations}
  , _sidebar_item: null // {object#jquery}
  , facebook_item: null // {object}
});

Person.onLoad = function() {  
    
    var 
        d = this.all
      , i = d.length
      , j, person, points, k, point, id, loci, loc
      , pointCach = {}
      , p = Point.all
      , l = p.length
      , el
    ;
    
    while (l--) {
        el = p[l];
        pointCach[ el.id ] = el;
    }
    
    while (i--) {
        person = d[i];
        j = person.locations.length;
        while (j--) {
            loc = person.locations[j];
            points = loc.points;
            k = points.length;
            while (k--) {
                point = points[k];
                if (typeof(point) == "string") {
                    id = point.split(".")[1];
                    loc.points[k] = pointCach[id];
                }
            }
            if ( loc.selected_point && typeof(loc.selected_point) == "string" ) {
                id = loc.selected_point.split(".")[1];
                loc.selected_point = pointCach[id];
                if (!loc.selected_point) {
                    console.warn("can't find point", loc, id)
                    continue;
                }
                Point.addPerson(loc.selected_point, person);
            }
        }
    }
    
    this.afterLoad.trigger();
}

Person.afterLoad = new JEvent();

Person.select_all_with_locations = function() {
     return this.all.find(function(el){
         return el.locations.length > 0;
     });
}

Person.search = function(string, return_objects) {
    var 
        name = null
      , query = string.toLowerCase()
    ;
        
    return this.find(function(el) {
        name = el.name.toLowerCase();
        return name.indexOf(query) !== -1
    });
}

Person.visual_search = function(string) {
    var  
        d = this.all
      , i = d.length
      , selction = this.search(string)
      , el, locs
    ;
    
    while (i--) {
        person = d[i];
        if (selction.indexOf(person) >= 0) {
            person.sidebar_item[0].classList.remove("hidden");
            locs = person.locations;
            for (var k in person.locations) {
                if (locs[k].selected_point) {
                    Point.showPerson(locs[k].selected_point, person);
                }
            }
        } else {
            person.sidebar_item[0].classList.add("hidden");
            locs = person.locations;
            for (var k in person.locations) {
                if (locs[k].selected_point) {
                    Point.hidePerson(locs[k].selected_point, person);
                }
            }
        }
    }
}

Point.afterLoad.observe( Person.load );
 