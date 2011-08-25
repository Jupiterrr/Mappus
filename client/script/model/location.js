function Location(address, id) {
    this.address = address;
    this.id = id;
    
    this.points = [], //of Points,
    this.selected_point = null; 
    this.isGeocoded = false;
    this.type = null;
    this.sidebar_subitem = null;
    this.isVisible = false;
}