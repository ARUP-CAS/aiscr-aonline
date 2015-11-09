
/* global _, L */


/**
 * 
 * @type the namespace
 */
var arup = {};


arup.MAP = {
    create: function () {
        this.dist = 5;
        this.mapContainer = $('#map');
        this.resultsContainer = $('#results');
        $.getJSON("js/obdobi.json", _.bind(function(d){
            this.obdobi = d;
            this.getData();
        }, this));
        return this;
    },
    search: function(){
        var url = "data?action=BYQUERY&q=" + $("#q").val();
        $.getJSON(url, _.bind(function(d){
            this.results = d;
            this.numFound = d.response.numFound;
            this.renderSearchResults();
            this.data = this.results.response.docs;
            this.mapData = {
                max: 2,
                data: this.data
            };
            this.heatmapLayer.setData(this.mapData);
        }, this));
    },
    renderSearchResults: function(){
        this.resultsContainer.empty();
        var docs = this.results.response.docs;
        if(this.numFound === 0){
            return;
        }
        for(var i=0; i<docs.length; i++){
            var li = $('<li/>');
            var latlng = {lat: docs[i].lat, lng: docs[i].lng};
            var nazev = docs[i].nazev;
            li.html(nazev);
            if(docs[i].hasOwnProperty("url")){
                var a = $("<a/>");
                a.attr("href", docs[i].url);
                a.attr("target", "docdetail");
                a.text("->")
                li.append(a)
            }
            li.data("docid", i);
            li.data("nazev", nazev);
            li.data("latlng", latlng);
            li.on("click", _.partial(function(ar){
                ar.updatePopup($(this).data("docid"));
            },this));
            this.resultsContainer.append(li);
        }
        this.updatePopup(0);
    },
    onMapClick: function (e) {
//        var value = this.heatmapLayer._heatmap.getValueAt(e.layerPoint);
//        if(value>0){
            var url = "data?action=BYPOINT&lat=" + e.latlng.lat + "&lng=" + e.latlng.lng + "&dist=" + this.dist;
            $.getJSON(url, _.bind(function(d){
                this.results = d;
                this.renderSearchResults();
            }, this));
//        }
    },
    updatePopup: function (docid) {
        var doc = this.results.response.docs[docid];
        var od = doc.od;
        var to = doc.do;
        var i = 0;
        while(od >= this.obdobi[i].od && i<this.obdobi.length){
            i++;
        }
        var j = 0;
        while(to >= this.obdobi[j].do && j<this.obdobi.length){
            j++;
        }
        console.log(i,j);
        var obdobi = "";
        for(var k=i; k<=j; k++){
            obdobi += this.obdobi[k-1].nazev;
        }
                
        var c = doc.nazev +  " at " + doc.lat + ", " + doc.lng + "<br/>" +
                obdobi + " (" + doc.od + " - " + doc.do + ")";
        var latlng = {lat: doc.lat, lng: doc.lng};
        this.popup
                    .setLatLng(latlng)
                    .setContent(c)
                    .openOn(this.map);
    },
    getHeatMapData: function(){
        var b = this.map.getBounds();
        
        var geom = '["' + b._southWest.lng + ' ' + b._southWest.lat +  '" TO "' + 
                b._northEast.lng + ' ' + b._northEast.lat +  '"]';
        //console.log(geom);
        var url = "data?action=HEATMAP&geom=" + geom;
        $.getJSON(url, _.bind(function(d){
            var mapdata = [];
            var facet = d.facet_counts.facet_heatmaps.loc_rpt;
            var gridLevel = facet[1];
            var columns = facet[3];
            var rows = facet[5];
            var minX = facet[7];
            var maxX = facet[9];
            var minY = facet[11];
            var maxY = facet[13];
            var distX = (maxX - minX)/columns;
            var distY = (maxY - minY)/rows;
            console.log(distX, distY);
            var counts_ints2D = facet[15];
            for(var i=0; i<counts_ints2D.length; i++){
                if(counts_ints2D[i] !==null && counts_ints2D[i] !== "null"){
                    var row = counts_ints2D[i];
                    var lat = minY + i*distY;
                    for(var j=0; j<row.length; j++){
                        var count = row[j];
                        if(count>0){
                            var lng = minX + j*distX;
                            mapdata.push({lat: lat, lng:lng, count: count})
                        }
                    }
                }
            }
            
//            this.results = d;
//            this.numFound = d.response.numFound;
//            this.renderSearchResults();
            this.data = mapdata;
            console.log(mapdata);
            this.mapData = {
                data: this.data
            };
            this.heatmapLayer.setData(this.mapData);
        }, this));
    },
    getData: function () {
        $.getJSON("data?action=ALL", _.bind(function (d) {
            this.results = d;
            this.numFound = d.response.numFound;
            this.data = this.results.response.docs;
            this.mapData = {
                data: this.data
            };
            this.render();
        }, this));
    },
    render: function () {
        var baseLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                    maxZoom: 18
                }
        );

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": .05,
            "maxOpacity": .8,
            "minOpacity": .1,
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
            valueField: 'count',
            
//            radius: 4,
//            opacity: 0.8,
//            "maxOpacity": .8,
            gradient: {
                0.45: "rgb(0,0,255)",
                0.55: "rgb(0,255,255)",
                0.65: "rgb(0,255,0)",
                0.95: "yellow",
                1.0: "rgb(255,0,0)"
            }
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
