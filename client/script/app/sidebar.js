//= require("model/person.js");
//= require("model/point.js");
//= require("lib/utility.js");

var Sidebar = function(parent_dom) {
    this.dom = null;
    this.open_items = new CustomArray();
    this.live_search = true;
    this.search_string = "";
    
    this.create(parent_dom);
}

Sidebar.prototype.create = function(parent_dom) {
    this.dom = $$("#aside");
    
    var that = this;
    this.input_dom = $$("#searchbar input");
    
    this.input_dom.addEventListener('KeyDown', function(e) {
        if (e.keyCode == 13) {
            that.onSearch(null, e.keyCode);
        } else {
            setTimeout(function() {
                that.onSearch(null, e.keyCode);
            }, 0);
        }        
    });
}


Sidebar.prototype.onSearch = function(value, key) {
    var _this = Mappus.Sidebar;
    value = value || _this.input_dom.val();
    
    if (_this.search_string == value) return;
    
    _this.close_all_items();
    _this.search_string = value;
    
    if (this.infobubble) this.infobubble(); //closes infobubble
    
    if (value.indexOf("@") == 0) {
        var name = value.substr(1);     
        _this.locationSearch(name, key);
    } else {
        Person.visual_search(value);
    }
    
    
}

Sidebar.prototype.locationSearch = function(name, key) {
    var matched_points = [];
    var _this = Mappus.Sidebar;
    
    var selection = [];      
    for (var k in Point.all) {
        var pp = Point.all[k];
        
        if (pp.name.indexOf(name) != -1 && (!(pp.name.indexOf(" ") != -1) || pp.name.indexOf(name) == 0)) {
            matched_points.push(pp);
            Point.show(pp);
            selection = selection.concat(pp._persons_visible).concat(pp._persons_invisible);
        } else {
            Point.hide(pp);
        }
    }
    
    //Autocomplete
    if (matched_points.length == 1 && key != 8) {
        var point = matched_points[0];
        var index_a = point.name.indexOf(name);
        var index_e = point.name.indexOf(",", index_a+1);
        index_e = index_e == -1 ? point.name.length-1 : index_e;
        var fname = point.name.substr(index_a, index_e - index_a);
        var range = name.length + 1;
        _this.input_dom.val("@"+fname);
        _this.input_dom[0].setSelectionRange(range, ("@"+fname).length);
    }
    
    
    var d = Person.data, i = d.length, el, locs;
    while (i--) {
        el = d[i];
        if (selection.indexOf(el) >= 0) {
            el.sidebar_item.removeClass("hidden");
        } else {
            el.sidebar_item.addClass("hidden");
        }
    }
}


Sidebar.prototype.onMarkerClick = function(point, infobubble_close_fn) {
    this.last_search = this.input_dom.val();
    this.input_dom.val("@"+point.name);
    this.onSearch();
    this.infobubble = infobubble_close_fn;
}    

Sidebar.prototype.onMarkerClose = function(point) {
    this.input_dom.val(Mappus.Sidebar.last_search);
    this.infobubble = null;
    this.onSearch(Mappus.Sidebar.last_search);
}

Sidebar.prototype.open_item = function(item) {
	//console.log(item.dataset.id);

	var same = this.open_items.has(item);
	if (this.open_items.length != 0) this.close_all_items();
	if(!same) {
	    $(item).addClass("active");
    	this.open_items.push(item);  
	}
}

Sidebar.prototype.close_all_items = function() {
    var i = this.open_items.length;
    while (i--) {
        this.open_items[i].classList.remove("active");
        this.open_items[i].classList.add("inactive");
    }
    this.open_items = new CustomArray();
}
               
                 
Sidebar.prototype.show_item = function(person) {
    //person.sidebar.show();
}

Sidebar.prototype.hide_item = function(person) {
    //person.sidebar.hide();
}

Sidebar.prototype.hide_all_items = function() {
    for(var i = 0; i < Persons.length; i++) {
        //Persons[i].sidebar.hide();
    }
}

Sidebar.prototype.add_items = function(array, cb) {
    console.log("sidebar add: ", {array: array});
    return;
    
    array.sort(function (a, b){
         var A = a.name.toLowerCase();
         var B = b.name.toLowerCase();
         if (A < B){
            return -1;
         }else if (A > B){
           return  1;
         }else{
           return 0;
         }
    });
    
    var locations_style = {
        current: {
            title: "current location", 
            image: "image/Nod32.png"
        },
        home: {
            title: "hometown location",
            image: "image/Home.png"
        }
    },
    templates = {
        person: "sidebar.person.template",
        location: "sidebar.location.template",
        location_pic: "sidebar.location_pics.template"
    };
    
    var fragment = document.createDocumentFragment();
    console.log(array, "r");
    
    for (var i = 0, obj; i < array.length; i++){        
        obj = array[i];
        
        
        var data = {
            name: obj.name
          , picture: obj.facebook_item.picture
          , link: obj.facebook_item.link
        };
        var tmpl = document.getElementById(templates.person).text;
        var html = Mustache.to_html(tmpl, data);        
        var person_el = $(html).appendTo(holder);
        person_el.attr('data-id', obj.id);
        
        var locations = person_el.find("ul");
        
        $.each(obj.locations, function(k, el){
            var x = locations.mustach(templates.location, {location_name: el.address});
            x.click(function(){
                var latlng = el.selected_point._marker.getPosition();
                Mappus.map.setZoom(10);
                Mappus.map.panTo(latlng);
            })
        });
        
        obj.sidebar_item = person_el;

        var that = this;
        person_el.click(function(e) {
            if (e.srcElement.tagName != "A") that.open_item(this, obj);
        });
        
    }
    holder.children().appendTo($("#datenliste"));
    

    if (cb) cb();
    

    // current_li.click(function() {
    //     center(obj.current_location);
    //     animate(obj.current_location);
    // });
    // 
    // 
    // this.dom.append(li);
    // li.append(aside);
    // if (home) aside.append(home_img);
    // if (current) aside.append(current_img);
    // li.append(img);
    // li.append(name);
    // li.append(adressen);
    // if (home) adressen.append(home_li);
    // if (current) adressen.append(current_li);

}


this.sidebar = null;
// have to be init
function Modal(html, init_open) {
    var el;
    this.close = function() {
        return el.hide();
    };
    this.nevv = function() {
        el = $('<div id="modal"></div>').append($(html)).appendTo($("body")).hide();
        if (init_open) {
            this.open()
        };
    };
    this.open = function() {
        var h = $(el).outerHeight(),
        w = $(el).outerWidth(),
        w_sidebar = $('#aside').outerWidth(),
        css = {
            'margin-left': -(w / 2),
            //-(w_sidebar/2),
            'margin-top': -(h / 2 + 50)
        };
        $this.log.trace(w_sidebar);
        return el.css(css).show();
    };
    this.nevv();
};
