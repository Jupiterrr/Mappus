//= require("lib/utility.js");

const 
    MODEL = {}
;


var SimpleModel = function(name, object_template) {
    
var 
    _this = this
  , model_prefix = "$" + name
  , object_id_prefix = model_prefix + "."
  , id_counter = 0
  , data_ids = []
  , data = new CustomArray()
;
    this.all = data;
    
    /**
     * First object in model
     */
    this.first = undefined;
    
    /**
     * Constructor
     */
    var init = function() {
        //_this.load();
    };
    
    
    /**
     * Removes dependencies and private values from passed object
     * key beginning with "_" is private
     * 
     * @param {object} b to be procecced
     * @return {object} copy of b without dependencies and private values
     */
    var toJSON = function(b, t) { 
        if (b instanceof Object) {
            if (t !== MODEL && b._db_id) {
                return b._db_id;
            } else {
                if (b instanceof Array) {
                    var out = [], l = b.length;
                    while (l--) {
                        out.push(toJSON( b[l] ));
                    }
                    return out;
                } else {
                    var out = {};
                    for(var k in b) {             
                        if (k.indexOf("_") !== 0) {
                            out[k] = toJSON( b[k] );
                        }
                    }
                    return out;
                }
            }
        } else {
           return b; 
        }
    };
    
    
    /**
     * Saves an ModelObject to localStorage
     * Add an id to the object if it has no
     * 
     * @param {object} obj The object that should be saved
     * @return {object} Same object that is passed
     */
    this.save = function(obj) {
        if (!obj.id) {
            data_ids.push(id_counter);
            obj.id = id_counter;
            obj._db_id = object_id_prefix + id_counter;
            id_counter++;
        }
        
        var key = object_id_prefix + obj.id
          , value = JSON.stringify( toJSON(obj, MODEL) )
        ;
       
        localStorage[key] = value;
        if (!data.length) this.first = obj; 
        data.push(obj);
        
        return obj;
    }
    
    /**
     * Saves all ModelObject stored
     */
    this.save_all = function() {
        var d = this.all, i = d.length;
        while (i--) {
            _this.save(d[i]);
        }
    }
    
    /** 
     * Returns a loaded ModelObject by id
     *
     * @param {number} id 
     * @return {object} The Object with the passed id
                        undefinded if not found
     */
    this.get = function(id) {
        var d = data
          , l = d.length;
        while (l--) {
            if (d[l].id == id) return d[l];
        }
    }
    
    /**
     * Loads the model data with all stored objects from loacalStorage
     *
     * @return {boolean} false if nothing to load
     */
    this.load = function(cb) {
        
        var json = localStorage[model_prefix];
        var finish = function() {
            
            if (_this.onLoad) _this.onLoad();
            if (cb) cb();
        };
        
        if (json) {
            var 
                config = JSON.parse( json )
              , keys = config.keys
              , l = keys.length
              , el, json_el
            ;
            id_counter = config.id_counter;

            var x = "[";
            var m = l;
            while(l--) {
                x += localStorage[ keys[l] ] + ",";
            };
            x = x.substring(0, x.length-1) + "]"; // removes last ","
            var json = JSON.parse( x );
            while(m--) {
                el = json[m];
                data.push( _this.new(el) );
                data_ids.push( el.id );
            };
            
            this.first = data[0];
            finish();
            return true;
        } else {
            finish();
            return false;
        }
    }
    
    
    /**
     * Saves the model data to localStorage
     * Modeldata will be save with the model_prefix "$modelname"
     * value object looks like 
     * {
     *    keys: array
     *  , id_counter: number
     * } 
     *
     */
    this.save_model = function() {
        var d = data_ids
          , l = d.length
          , json = ""
        ;
        
        while(l--) {
            d[l] = object_id_prefix + d[l];
        }
        
        var config = {
            keys: d
          , id_counter: _this.id_counter
        };
        
        json = JSON.stringify( config );
        localStorage[model_prefix] = json;
    }
    
    /**
     * Creates a new model object witch is not stored yet
     * If a object template is defined it is used to preset values
     * @param {object} obj presets the values defined in obj
     * @returns {object} a model object
     */
    this.new = function(obj) {
        var o = {};
        if(object_template) extend(o, object_template);
        for (var k in o) {
            if (o[k] instanceof Array) o[k] = [];
        }
        if (obj) extend(o, obj);
        return o;
    }
    
    
    /**
     * Does the same as new, but saves the object
     *
     */
     
    this.create = function(obj) {
        return this.save( this.new(obj) );
    }

    this.find = function(c) {
        switch(typeof c) {
            case "function": return this.all.select.apply(this.all, arguments);
            case "string": return this.search.apply(this, arguments);
            case "number": return this.get.apply(this, arguments);
            default: console.warn("The find argument is invalid.")
        }
    }

    this.search = function(string) {
        var result = [], el;
        for (var key in this.all) {
            el = this.all[key];
            if ( 
                this.all.hasOwnProperty(key) 
                && fn(el) == true
            ) result.push(el);
        }
        return result;
    }
    
    init(); //calls constructor
}