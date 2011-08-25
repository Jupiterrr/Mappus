const 
    inheriting = {}
;


var BasicModel = function(name){
   if (arguments[0] == inheriting) return;

   this.name = name;
   this.data = [];
   this.id_counter = 0;
   
   //this.update_db_keys();
}

BasicModel.prototype.set = function (key, item) {
    if (
        key == undefined 
        && (
            key in this.data 
            || key == this.id_counter - 1
        )
    ) {
        console.warn("key %o not defined", key)
        return;
    };
    console.warn("set");
    this.data[key] = item;
        
    item.id = "$" + this.name + "." + key;
    var json = JSON.stringify( item ),
        db_key = item.id;
    //localStorage.setItem(db_key, json);
}

BasicModel.prototype.get = function (key) {
    var d = this.data, i = d.length;
    while (i--) {
       if (d[i].id.split(".")[1] == key) return d[i]; 
    }
}

BasicModel.prototype.first = function () {
    return this.get(0);
}

BasicModel.prototype.last = function () {
    return this.get( this.data.length-- );
}

BasicModel.prototype.push = function (item) {
    item.id = "$" + this.name + "." + this.id_counter;
    this.data.push(item);
    this.id_counter++;
    this.update_db_keys();
}

BasicModel.prototype.update_db_keys = function () {
    var keys = [],
        that = this;
    
    jQuery.each(this.data, function(k, v) {
        keys.push(v.id);
    });
    
    var json_keys = JSON.stringify( keys );
    localStorage.setItem(this.name + ".keys", json_keys);
    
    var json_config = JSON.stringify({
        id_counter: this.id_counter
    });
    localStorage.setItem(this.name + ".config", json_config);
}

BasicModel.prototype.db_get_keys = function () {
    var json = localStorage.getItem(this.name + ".keys");
    return JSON.parse( json );
}
BasicModel.prototype.db_get_config = function () {
    var json = localStorage.getItem(this.name + ".config");
    return JSON.parse( json );
}

BasicModel.prototype.load = function(cb) {
    console.log("load " + this.name);
    this.data = [];
    var that = this,
        keys = this.db_get_keys();
    
    
    if (!keys) { end(); return;};
    
    var i = keys.length, key, json, obj, index;
    
    var ls = localStorage;
    
    
    while (i--) {
        key = keys[i];
        json = JSON.parse( localStorage[key] );
        var obj = new this.Object( json );  
        if (this.after_create) this.after_create( obj );
        obj.id = json.id;
        index = json.id.split(".")[1];
        that.data.push(obj);
    }
    var config = that.db_get_config();
    jQuery.extend(that, config);
    end();
    
    
    // loop();
    //    function loop() {
    //       if (i--) {
    //           key = keys[i];
    //              json = JSON.parse( localStorage.getItem(key) );
    //              obj = that.create( json );
    //              obj.id = json.id;
    //              index = json.id.split(".")[1];
    //              that.data.push(obj);
    //           setTimeout(loop, 0);
    //       } else {
    //           after_loop();
    //       }
    //    }
    //    function after_loop() {
    //        var config = that.db_get_config();
    //        jQuery.extend(that, config);
    // 
    //        /*
    //        var handle_storage = function (e) {
    //            console.log("storage event")//, e);
    //            if (e.key.indexOf("$" + this.name) == 0) {
    //                load_with_key(e.key);
    //            }
    //        };
    //        window.addEventListener("storage", handle_storage, false);
    //        */
    //        end();
    //    }
    //    
       function end() {
           if (that.after_load) that.after_load();
           if (cb instanceof Function) cb();
       }
    
}


BasicModel.prototype.dbSave = function() {
    this.update_db_keys();
    var e = this.data, i = e.length;
    while (i--) {
        e[i].dbSave();
    }
}


var Model = function(name, object_pattern) {
    if (arguments[0] == inheriting) return;
    BasicModel.call(this, name);
    
    this.Object = this.createObject(object_pattern);
    //this.load();
}
Model.prototype = new BasicModel(inheriting);
Model.prototype.base = BasicModel.prototype;

Model.prototype.setObject = function (key, item) {
    if (key == "" || !item instanceof this.Object) return;
    this.set(key, item);
}


Model.prototype.pushObject = function (item) {
    this.push(item);
}

Model.prototype.create = function(arg) {
    var item = new this.Object(arg);  
    this.pushObject( item );
    if (this.after_create) this.after_create(item);
    return item;
}

Model.prototype.all = function() {
    return this.data;
}

Model.prototype.select = function(fn) {
    var result = [], el;
    
    for (var key in this.data) {
        el = this.data[key];
        if ( 
            this.data.hasOwnProperty(key) 
            && fn(el) == true
        ) result.push(el);
    }
    return result;
}

Model.prototype.find = function(c) {
    switch(typeof c) {
        case "function": return this.select.apply(this, arguments);
        case "string": return this.search.apply(this, arguments);
        case "number": return this.get.apply(this, arguments);
        default: console.warn("The find argument is invalid.")
    }
}

Model.prototype.search = function(string) {
    var result = [], el;
    for (var key in this.data) {
        el = this.data[key];
        if ( 
            this.data.hasOwnProperty(key) 
            && fn(el) == true
        ) result.push(el);
    }
    return result;
}

Model.prototype.createObject = function(pattern) {
    
    var Object = function() {
        ModelObject.apply(this, arguments);
    }
    Object.prototype = new ModelObject(inheriting);
    Object.prototype._pattern = pattern;
    Object.prototype._parent = this;
    
    return Object;
}



function ModelObject(arg) {
    if (arguments[0] == inheriting) return;
    
    this.define_default();  
    this.extend(arg);
}

ModelObject.prototype.define_default = function() {
    var that = this;
    jQuery.each(this._pattern, function(k, v){
        switch(v.toLowerCase()) {
            case 'string', 'object', 'number', 'boolean', 'function':
                //that[k] = null;
                break;
            case 'array':
                that[k] = [];
                break;
            default:
                //that[k] = null;
        }
    });
}

ModelObject.prototype._pattern = {};

ModelObject.prototype.save = function() {
    this._parent.pushObject(this);
}

ModelObject.prototype.dbSave = function() {
    console.log("saved", this.name);
    localStorage[this.id] = this.toJSON(true);
}

ModelObject.prototype.toJSON = function(b) { 
    var parent = this._parent;
    function remove_dependenciec(obj) {
        if ( is("Object", obj) ) {
            if (obj._parent && obj._parent != parent) return obj.id;
                     
            var out = {};
            jQuery.each(obj, function(k, v) {
                if (k[0] != "_" && !(v instanceof Function)) {
                    out[k] = remove_dependenciec(v);
                }
            });
            return out;
        } else if ( is("Array", obj) ) {
            var out = [];
            jQuery.each(obj, function(k, v) {
                out.push(remove_dependenciec(v));
            });
            return out;
        } else {
            return obj;
        }
    }
    if (b === true) {
        return JSON.stringify( 
            remove_dependenciec( this )
        );
    } else {
        return remove_dependenciec( this );
    }
    
}

ModelObject.prototype.extend = function(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}









