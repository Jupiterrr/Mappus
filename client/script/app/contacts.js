// google.load("maps", "3", {"other_params" : "sensor=false"});
// google.load("jquery", "1.5.2");
google.load("gdata", "1.x");
//google.setOnLoadCallback(initFunc);
    


var contactsService;

function setupContactsService() {
  contactsService = new google.gdata.contacts.ContactsService('exampleCo-exampleApp-1.0');
}

function logMeIn() {
  var scope = 'https://www.google.com/m8/feeds';
  var token = google.accounts.user.login(scope);
}

function initFunc() {
  setupContactsService();
  logMeIn();
  //getMyContacts();
}

function getMyContacts() {
  var contactsFeedUri = 'https://www.google.com/m8/feeds/contacts/default/full';
  var query = new google.gdata.contacts.ContactQuery(contactsFeedUri);

  // Set the maximum of the result set to be 5
  query.setMaxResults(800);

  contactsService.getContactFeed(query, handleContactsFeed, handleError);
}
var xxx = [];
var handleContactsFeed = function(result) {
  var entries = result.feed.entry;
  console.log(entries.length);
  for (var i = 0; i < entries.length; i++) {
    var contactEntry = entries[i];
    
    var emailAddresses = contactEntry.getPostalAddresses();
    //if (emailAddresses.length != 0) xxx.push(emailAddresses);
    
    for (var j = 0; j < emailAddresses.length; j++) {
        xxx.push(emailAddresses[j].getValue());
    }    
  }
  console.log(xxx);
}

function handleError(e) {
  alert("There was an error!");
  alert(e.cause ? e.cause.statusText : e.message);
}


// /*
//  TODO maerker html: weil mehrere Freunde auf der selben Position sein können, kann der Inhalt der Popupblase nicht
//                           für jeden Marker seperat festgelegt werden.
//                           Eventuell müssen auch die Marker angepasst werden und bei doppelter Belegung immer ein Clustermarker mit
//                           entsprechender Anzahl angezeigt werden.
//     TODO logs überarbeiten
// */
// 
// $mapper.modul.contacts = function() {
//     var parent = $mapper,
//     log = new LLog("contacts plugin"),
//     current_user = null,
//     modal = null,
//     test_data = typeof(fb_freunde) == 'undefined' ? null : fb_freunde,
//     templates = {
//         loading: "fb.loading.template",
//         start: "fb.start.template",
//         result: "fb.results.template",
//         modal: "fb.modal.template"
//     };
// 
//     function initialize(cb) {
//         log.info("loading contacts dependencies");
//         load_dependencies(function() {
//             log.info("contacts dependencies loaded");
//             cb();
//         });
//     };
// 
//     function load_dependencies(cb) {
//         
//         // google.load("gdata", "1.x");
//         //        google.setOnLoadCallback(function(){
//         //            alert(1);
//         //        });
//     };
// 
//     function start() {
//         // for testing 
//         /*
//             TODO rmove test data in produktion
//         */
//         
//             //show(templates.start).content.find("#facebook_connect_button").click(connect);
//         this.log.info("rrrrrrrrrr");
//     }
// 
//     // function connect() {
//     //         //show(templates.loading);
//     //         FB.login(connected, {
//     //             perms: 'friends_hometown,friends_location'
//     //         });
//     //     };
//     // 
//     //     function connected(response) {
//     //         log.trace('FB.login callback', response);
//     //         if (response.session) {
//     //             log.info('Facebook: User is logged in');
//     //             query();
//     //         } else {
//     //             log.info('Facebook: User isn\'t logged in');
//     //             alert('Error');
//     //             show(templates.start);
//     //         };
//     //     };
//     // 
//     //     function query() {
//     //         var query = FB.Data.query("select uid, name, current_location, hometown_location, pic_square from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
//     //         query.wait(query_cb);
//     //     };
//     // 
//     //     function query_cb(fb_query_result) {
//     //         log.trace("query result", fb_query_result);
//     // 
//     //         // transform result to friend_objects
//     //         var friend, location, loc, el;
//     //         for(var i = 0; i < fb_query_result.length; i++) {
//     //             el = fb_query_result[i];
//     //             person = new Person();
//     //             person.name = el.name;
//     //             
//     //             /*
//     //                 TODO remove locations after geocoding in Friend until every geocode is unique in a friends object 
//     //             */
//     //             if (el.current_location) {
//     //                 loc = el.current_location;
//     //                 location = loc.city + ", " + loc.state + ", " + loc.country;
//     //                 person.add_loction(location, "fb_current_location");
//     //                 
//     //             };
//     //             
//     //             if (el.hometown_location) {
//     //                 loc = el.hometown_location;
//     //                 location = loc.city + ", " + loc.state + ", " + loc.country;
//     //                 person.add_loction(location, "fb_hometown_location");
//     //             };
//     //             
//     //             person.fb = el;
//     //             person.save();
//     //         }
//     //         
//     //         
//     //         //Persons.cleanup();
//     //         
//     //         // var data = {
//     //         //             all_friends: Persons.length,
//     //         //             with_address: Persons.with_locations().length,
//     //         //             all_addresses: Locations.length
//     //         //         };
//     //         //         
//     //         //         var b = show(templates.result, data);
//     //         //             $('<a href="javascript:;" class="big">Anzeigen</a>').appendTo(b.footer).click(function() {
//     //         //             var home = b.content.find("#home").is(':checked'),
//     //         //                 current = b.content.find("#current").is(':checked');
//     //         //             geocode(home, current);
//     //         //         });
//     //         geocode(true, true);
//     //     };
//     // 
//     // 
//     //     function geocode(home_b, current_b) {
//     //         log.info("(geocode)", {
//     //             home: home_b,
//     //             current: current_b
//     //         });
//     //         show(templates.loading);
//     //         
//     //         // TODO
//     //         // removes location from friend if user deseleceted it
//     //         // or add address to an array (=> geocoding)
//     //         
//     //         Locations.geocode();
//     //         add_friends_to_map();
//     //         
//     //         /*
//     //             TODO selection of home and current???
//     //         */
//     //         
//     //         
//     //         // Friends.
//     //         //        var shoul_be_deleted = function(el) {
//     //         //            return (!current && el.type == "current_location") || (!home && el.type == "hometown_location");
//     //         //        }    
//     //         //            
//     //         //        Persons.locations.select_and_delete(shoul_be_deleted);
//     //         
//     //         
//     //         // parent.geocode_serverside(adressen, function(pos) {
//     //         //             geocode_cb(pos, freunde, adressen);
//     //         //         });
//     //         
//     //     };
//     // 
//     // 
//     //     function add_friends_to_map() {
//     //         log.trace("fb_add: ", "friends", "...");
//     //         
//     //         // $.each(fb_freunde, function(k, el) {
//     //         //             xx = new Person();
//     //         //             $.extend(xx, el);
//     //         //             Persons.push(xx);
//     //         //             
//     //         //             xx.locations = [];
//     //         //             $.each(el.locations, function(k, zel) {
//     //         //                 zz = new Location();
//     //         //                 $.extend(zz, zel);
//     //         //                 Locations.push(zz);
//     //         //                 xx.locations.push(zz);
//     //         //                 
//     //         //                 $.each(zz.cord, function(k, cord) {
//     //         //                     cord.latlng = cord.latlng.split(",");
//     //         //                 });
//     //         //                 
//     //         //             });
//     //         //         });
//     //             
//     //         var friends = Persons;
//     //         log.trace("fb_add: ", "friends", "...", friends.length, parent.sidebar());
//     //         var sidebar_objs = [];
//     //         for (var i = 0; i < friends.length; i++) {
//     //             sidebar_objs.push(friends[i]);
//     //         }
//     //         
//     //         parent.sidebar().add_items(sidebar_objs);
//     //         
//     //         modal.dom.hide();
//     //         //parent.sidebar().slideOut();
//     //         //Persons.render_marker();
//     //     }
//     //    
//     //     function show(template, data) {
//     //         if (modal === null) {
//     //             modal = {};
//     //             modal.dom = $("#map_canvas").mustach(templates.modal, {version:ENV.version
//     //                 });
//     //             
//     //             modal.fb = {
//     //                 content: modal.dom.find("section"),
//     //                 footer: modal.dom.find("footer"),
//     //                 heading: modal.dom.find("h3")
//     //             }
//     //         }
//     // 
//     //        data = data || {};
//     //         modal.fb.content.empty();
//     //         
//     //         modal.fb.content.mustach(template, data);
//     // 
//     //         return modal.fb;
//     //     };
//     
//     return {
//         initialize: initialize,
//         start: start
//     };
// };
