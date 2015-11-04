
/* global _, L */

/** 
 * Simple event handler used in application 
 * @constructor 
 */
function ApplicationEvents() {
}

ApplicationEvents.prototype = {
    handlerEnabled: true,
    enableHandler: function () {
        this.handlerEnabled = true;
    },
    disableHandler: function () {
        this.handlerEnabled = false;
    },
    /** contains event handlers*/
    handlers: [],
    /** 
     * Trigger event 
     * @method
     */
    trigger: function (type, data) {
        console.log("trigger event:" + type);
        if (!this.handlerEnabled) {
            console.log("handler disabled. Discarding event " + type);
            return;
        }

        $.each(this.handlers, function (idx, obj) {
            obj.apply(null, [type, data]);
        });
    },
    /** add new handler 
     *@method
     */
    addHandler: function (handler) {
        this.handlers.push(handler);
    },
    /** remove handler 
     * @method
     */
    removeHandler: function (handler) {
        /*
         var index = this.handlers.indexOf(handler);
         var nhandlers = [];
         if (index >=0)  {
         for (var i=0;i<index;i++) {
         nhandlers.push(this.handlers[i]);
         }
         for (var i=index+1;i<this.handlers.length;i++) {
         nhandlers.push(this.handlers[i]);
         }
         }
         this.handlers = nhandlers;
         */
    }
};


function ARUP() {
    this.eventsHandler = new ApplicationEvents();
    this.init();
}
ARUP.prototype = {
    init: function () {
        this.dist = 5;
        this.mapContainer = $('#map');
        this.resultsContainer = $('#results');

    },
    onMapClick: function (e) {
        var value = this.heatmapLayer._heatmap.getValueAt(e.layerPoint);
        if(value>0){
            var url = "data?action=BYPOINT&lat=" + e.latlng.lat + "&lng=" + e.latlng.lng + "&dist=" + this.dist;
            $.getJSON(url, _.bind(function(d){
                this.resultsContainer.empty();
                for(var i=0; i<d.length; i++){
                    var div = $('<div/>');
                    var latlng = {lat: d[i].lat, lng: d[i].lng};
                    var nazev = d[i].nazev;
                    div.html(nazev);
                    div.data("nazev", nazev);
                    div.data("latlng", latlng);
                    div.on("click", _.partial(function(ar){
                        var latlng = $(this).data("latlng");
                        ar.popup
                            .setLatLng(latlng)
                            .setContent($(this).data("nazev") + " at " + latlng.lat + ", " + latlng.lng)
                            .openOn(this.map);
                    },this));
                    this.resultsContainer.append(div);
                }
                var nazev = d[0].nazev;
                this.popup
                    .setLatLng(e.latlng)
                    .setContent(nazev + " at " + e.latlng.toString())
                    .openOn(this.map);
            }, this));
        }
    },
    updateTooltip: function (x, y, value) {

        var transform = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
        var elem = this.tooltip[0];
        elem.style.MozTransform = transform;
        elem.style.msTransform = transform;
        elem.style.OTransform = transform;
        elem.style.WebkitTransform = transform;
        elem.style.transform = transform;
        elem.innerHTML = value;
    },
    getData: function () {
        $.getJSON("data?action=ALL", _.bind(function (d) {
            this.data = d;
            this.render();
        }, this));
    },
    render: function () {
        this.mapData = {
            max: 8,
            data: this.data
        };
        var baseLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                    maxZoom: 18
                }
        );

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": .1,
            "maxOpacity": .8,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries 
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": false,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        };


        this.heatmapLayer = new HeatmapOverlay(cfg);

        this.map = new L.Map('map', {
            center: new L.LatLng(49.803, 15.496),
            zoom: 8,
            layers: [baseLayer, this.heatmapLayer]
        });

        this.heatmapLayer.setData(this.mapData);

        // make accessible for debugging
        layer = this.heatmapLayer;


        this.popup = L.popup();

        this.map.on('click', _.bind(this.onMapClick, this));

    }


};
