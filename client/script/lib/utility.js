//= require("lib/mustach.js");

if (!console) {
    var console = {};
    console.log = function() {};
};
function cl(a, b) {
    console.log(b, a);
}


// String.prototype.ttest = function(regex, params) {
//     return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
// }
//Array.prototype.each = function(fn){this.forEach(fn);};
var each = function(obj, fn) {
    if (fn.length == 1) {
        for (x in obj) {
            fn(obj[x]);
        };
    } else if (fn.length == 2) {
        for (x in obj) {
            fn(x, obj[x]);
        };
    };
};
$extend = function(orginal, extended) {
    for (var key in (extended || {})) {
        orginal[key] = extended[key];
    };
    return orginal;
};
function Getter(fn) {
    var result;
    var fns = [];

    set = function(arg) {
        //kjbb
        result = arg;
        fns.forEach(function(x) {
            x(result)
            //x(result);
        });
        return;
    };

    fn();

    function get(get_fn) {
        if (result) {
            get_fn(result);
        } else {
            fns.push(get_fn);
        };
    };

    return {
        get: get
    };
};
function Hash(obj) {
    var hash = obj || {};

    function get(name) {
        return hash['name'];
    };

    function set(key, value) {
        hash[key] = value;
        return hash;
    };

    function all() {
        return hash;
    };

    return {
        set: set,
        get: get,
        all: all
    };
};

var DataRecord = function(options) {
    this.data = {};
    this.id_counter = 0;

    for (var option in options) {
        this[option] = options[options];
    };

    this.raise = function(event, obj) {
        if (typeof(this[event]) == "function") {
            var ret = this[event](obj);
            if (ret) {
                return ret;
            } else {
                return obj;
            };
        } else {
            return obj;
        };
    };
};
DataRecord.prototype.add = function(obj) {
    obj.id = this.id_counter++;
    obj = this.raise('before_add', obj);
    obj.id = this.id_counter++;
    this.data[obj.id] = obj;

    obj = this.raise('after_add', obj);

    return obj;
};
DataRecord.prototype.find = function(param) {
    var _this = this;

    function find_by_string(query) {
        var records = [];

        $j.each(_this.data,
        function(k, item) {
            records.push(item);
        });

        query = query.toLowerCase().split(" ");

        var record_auswahl = $j.grep(records,
        function(record) {

            // setzte adressstring zusammen: Hans Müller 65781 Neuhausen
            var adresse = "";
            $j.each(record,
            function(key, value) {
                if (typeof(value) == 'string') {
                    adresse += value + " ";
                };
            });
            adresse = adresse.toLowerCase();

            for (var key in query) {
                if (!adresse.test(query[key])) {
                    return false;
                };
            };
            return true;
        });

        return record_auswahl;
    };
    function find_by_function(fn) {
        var result = [];
        for (var key in _this.data) {
            if (fn(this.data[key])) {
                result.push(_this.data[key]);
            };
        };
        return result;
    };

    if (typeof(param) == 'string') {
        return find_by_string(param);
    };
    if (typeof(param) == 'function') {
        return find_by_function(param);
    };
};
DataRecord.prototype.find_by = function(key_string, value_string) {
    return find(function(item) {
        return item[key_string] == value_string;
    });
};
DataRecord.prototype.all = function() {
    return this.data
};
DataRecord.prototype.set = function(id, key, val) {
    this.data[id][key] = val;
};
DataRecord.prototype.remove = function(key) {
    return delete this.data[key];
};
DataRecord.prototype.search = function(param) {
    param = this.raise('before_search', param);
    obj = this.find(param);
    obj = this.raise('after_search', obj);
    return obj;
};





function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

function extend(a, b) {
    for(var k in b) {
        a[k] = b[k];
    }
    return a;
}

function lc() {
    localStorage.clear();
}

function cl() {
    console.log.apply(console, arguments);
}




/*  Chain:

 *  var fn = function(){
 *    //do some stuff 
 *    this.is.done();
 *  }
 *  var chain = new Chain([fn, ...]);
 *  chain.start();

*/
function Chain(functions) {
    $this = this;
    this.functions = functions || [];

    this.is = {};
    this.is.done = function() {
        var x = $this.functions.shift();
        if (x) {
            x.call($this);
        };
    };
    this.start = function() {
        this.is.done();
    };
};


/*  Log:

 *  var log = new Log();
 *
 *  log(0, "nuntia") <=> log.trace("nuntia") 
 *  => trace: nuntia 
 *  
 *  0: trace
 *  1: debug
 *  2: info
 *  3: warning
 *  4: error
 *  5: fatal

*/
function LLog(origin_name) {
    var level_name = {
        0: "trace",
        1: "debug",
        2: "info",
        3: "warning",
        4: "error",
        5: "fatal"
    },
		origin = origin_name ? origin_name + ": " + "" : "";
		
    this.log = function() {
        var args = [];
        var a;
        for(var i = 0; i < arguments.length; i++) {
            a = arguments[i];
            if (is("Array", a) && a.length > 5) {
                a = {array: a}; 
            }
            args.push(a);
        };
        console.log.apply(console, args);
    };
    
    var log = this.log;
    
    function logWithStatus(status) {
        var name = level_name[status] + ": "
        return function() {
            log.apply(log, [name].concat(Array.prototype.slice.call(arguments)));
        }
        
        
    }
    
    this.log.trace = logWithStatus(0);
    this.log.debug = logWithStatus(1);
    this.log.info = logWithStatus(2);
    this.log.warning = logWithStatus(3);
    this.log.error = logWithStatus(4);
    this.log.fatal = logWithStatus(5);

    return this.log;
};



mustach = function(id, data) {
    console.log("mustach id:", id);
    var tmpl = document.getElementById(id).text;
    return html = Mustache.to_html(tmpl, data || {});
};
    
var $ = function(){
    var results;
    if (arguments.length == 2) {
        results = arguments[0].querySelectorAll(arguments[1]);
    } else {
        results = document.querySelectorAll(arguments[0]);
    }
    return Array.prototype.slice.call(results)
};
var $$ = function(){
    if (arguments.length == 2) {
        return arguments[0].querySelector(arguments[1]);
    } else {
        return document.querySelector(arguments[0]);
    }
};

CustomArray = function(array) {
     if (array) {
         for (var i = 0; i < array.length; i++) {
             this.push(array[i]);
         }
     }
 }
 CustomArray.prototype = new Array();
 
 CustomArray.prototype.select = function(select_fn, return_objects) {
     var result = [];
     for(var i = 0; i < this.length; i++) {
         if (select_fn(this[i])) {
             result.push(!return_objects ? this[i] : i);
         }
     }
     
     return result;
 }
 
 CustomArray.prototype.deselect = function(select_fn, return_objects) {
    return this.select(function(el) { return !select_fn(el); }, return_objects);
 }
 
 CustomArray.prototype.select_and_delete = function(select_fn) {
     var selection = this.select(select_fn);
     for(var i = 0; i < selection.length; i++) {
         this.delete(selection[i]);
     }
 }
 CustomArray.prototype.indexOf = function(obj) {
   for (var i = 0; i < this.length; i++) {
     if (this[i] == obj)
       return i;
   }
   return -1;
 }
 CustomArray.prototype.delete = function(obj) {
     if(obj instanceof Number) {
         this.splice(obj, 1);
     } else {
         this.splice(this.indexOf(obj), 1);
     }
 }
 
 CustomArray.prototype.has = function(obj) {
   return this.indexOf(obj) >= 0;
 }
 
 CustomArray.prototype.without = function(array) {
    var a = new CustomArray(array);
    
    return this.select(function(el) {
        return !a.has(el);
    });
  }
  
  CustomArray.prototype.clear = function() {
      while(this.length){
          this.shift();
      }
  }
  
function JEvent() {
    this.observer = [];
    this.triggerer = {
        is: false,
        arguments: null
    };
}
JEvent.prototype.observe = function(fn, context) {
    if (this.triggerer.is) {
        fn.apply(context, this.triggerer.arguments)
    } else {
        this.observer.push({
            fn: fn,
            context: context || this
        }); 
    }
}
JEvent.prototype.update = function() {
    console.assert(!this.triggerer.is, "Can't call update after trigger!");
    var e;
    for (var key in this.observer) {
        e = this.observer[key];
        e.fn.apply(e.context, arguments);
    }
}
JEvent.prototype.trigger = function() {
    this.update.apply(this, arguments);
    this.triggerer.is = true;
    this.triggerer.arguments = arguments;
}


function removeElement(el) {
    el.parentNode.removeChild(el);
}
