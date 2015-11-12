
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
        $.getJSON("js/obdobi.json", _.bind(function (d) {
            this.obdobi = d;
            this.prepareMap();
            //this.getData();
            this.search();
        }, this));
        return this;
    },
    search: function () {
        var url = "data?action=BYQUERY&q=" + $("#q").val() +
                "&od=" + $("#od").val() + "&do=" + $("#do").val() +
                "&geom=" + this.getMapsBoundsFilter() +
                "&center=" + this.map.getCenter();
        $.getJSON(url, _.bind(function (d) {
            this.results = d;
            this.numFound = d.response.numFound;
            this.renderSearchResults();
            this.data = this.results.response.docs;
            var mapdata = this.processHeatMapFacet();
            this.mapData = {
                max: 2,
                data: mapdata
            };
            this.heatmapLayer.setData(this.mapData);
            this.overlayMaps = {
                "heat": this.heatmapLayer,
                "markers": this.markers
            };
            //L.control.layers(this.overlayMaps).addTo(this.map);

        }, this));
    },
    renderSearchResults: function () {
        this.resultsContainer.empty();
        var docs = this.results.response.docs;
        $("#numFound").html(this.numFound + " docs");
        if (this.numFound === 0) {
            return;
        }
        
        for (var i = 0; i < docs.length; i++) {
            var li = $('<li/>');
            var latlng = {lat: docs[i].lat, lng: docs[i].lng};
            li.append('<div>'+docs[i].nazev+'</div>');
            li.append('<div>'+docs[i].typ1+'</div>');
            if (docs[i].hasOwnProperty("url")) {
                var a = $("<a/>");
                a.attr("href", docs[i].url);
                a.attr("target", "docdetail");
                a.text("->");
                li.append(a);
            }
            li.data("docid", i);
            li.on("click", _.partial(function (ar) {
                ar.updatePopup($(this).data("docid"));
            }, this));
            this.resultsContainer.append(li);
            
            L.marker([docs[i].lat, docs[i].lng]).bindPopup(li.html()).addTo(this.markers);

        }
        
        this.updatePopup(0);
    },
    onMapClick: function (e) {
//        var url = "data?action=BYPOINT&lat=" + e.latlng.lat + "&lng=" + e.latlng.lng + "&dist=" + this.dist;
//        $.getJSON(url, _.bind(function (d) {
//            this.results = d;
//            this.numFound = d.response.numFound;
//            this.renderSearchResults();
//        }, this));
    },
    updatePopup: function (docid) {
        var doc = this.results.response.docs[docid];
        var obdobi = "";

        var c = doc.nazev + " at " + doc.lat + ", " + doc.lng + "<br/>" +
                obdobi + " (" + doc.od + " - " + doc.do + ")";
        var latlng = {lat: doc.lat, lng: doc.lng};
        this.popup
                .setLatLng(latlng)
                .setContent(c)
                .openOn(this.map);
    },
    getMapsBoundsFilter: function () {
        var b = this.map.getBounds();
        return b._southWest.lng + ';' + b._southWest.lat + ';' +
                b._northEast.lng + ';' + b._northEast.lat;
    },
    processHeatMapFacet: function () {
        var mapdata = [];
        var facet = this.results.facet_counts.facet_heatmaps.loc_rpt;
        var gridLevel = facet[1];
        var columns = facet[3];
        var rows = facet[5];
        var minX = facet[7];
        var maxX = facet[9];
        var minY = facet[11];
        var maxY = facet[13];
        var distX = (maxX - minX) / columns;
        var distY = (maxY - minY) / rows;
        console.log(rows, columns, distX, distY);
        var counts_ints2D = facet[15];
        var maxVal = 0;
        var maxValCoords = {};
        for (var i = 0; i < counts_ints2D.length; i++) {
            if (counts_ints2D[i] !== null && counts_ints2D[i] !== "null") {
                var row = counts_ints2D[i];
                var lat = maxY - i * distY;
                for (var j = 0; j < row.length; j++) {
                    var count = row[j];
                    if (count > 0) {
                        var lng = minX + j * distX;
                        var bounds = new L.latLngBounds([
                            [lat, lng],
                            [lat - distY, lng + distX]
                        ]);
                        mapdata.push({lat: bounds.getCenter().lat, lng: bounds.getCenter().lng, count: count});
                        if (count > maxVal) {
                            maxValCoords.lat = bounds.getCenter().lat;
                            maxValCoords.lng = bounds.getCenter().lng;
                            maxValCoords.count = count;
                            maxValCoords.i = i;
                            maxValCoords.j = j;
                            maxVal = count;
                        }
                    }
                }
            }
        }
        //console.log(maxValCoords);

//            this.results = d;
//            this.numFound = d.response.numFound;
//            this.renderSearchResults();
        return mapdata;
    },
    getHeatMapData: function () {

        //console.log(geom);
        var url = "data?action=HEATMAP&geom=" + this.getMapsBoundsFilter();
        $.getJSON(url, _.bind(function (d) {
            this.results = d;
            this.numFound = d.response.numFound;
            this.data = this.processHeatMapFacet();
            //console.log(mapdata);
            this.mapData = {
                max: 10,
                data: this.data
            };
            this.heatmapLayer.setData(this.mapData);

        }, this));
    },
    setMarkers: function () {

    },
    getData: function () {
        var url = "data?action=ALL&geom=" + this.getMapsBoundsFilter();
        $.getJSON(url, _.bind(function (d) {
            this.results = d;
            this.numFound = d.response.numFound;
            this.data = this.results.response.docs;
            this.mapData = {
                data: this.data
            };
            this.heatmapLayer.setData(this.mapData);
        }, this));
    },
    prepareMap: function () {
        var baseLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                    maxZoom: 18
                }
        );

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": .05,
            "maxOpacity": .5,
            "minOpacity": .05,
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
                0.25: "rgb(0,0,255)",
                0.45: "rgb(0,255,255)",
                0.65: "rgb(0,255,0)",
                0.95: "yellow",
                1.0: "rgb(255,0,0)"
            }
        };


        this.heatmapLayer = new HeatmapOverlay(cfg);

        this.map = new L.Map('map', {
            center: new L.LatLng(49.803, 15.496),
            zoom: 8,
            //layers: [baseLayer, this.heatmapLayer]
            layers: [baseLayer]
        });


        this.markers = new L.featureGroup();
        this.map.addLayer(this.heatmapLayer);
        //this.map.addLayer(this.markers);

        this.overlayMaps = {
            "heat": this.heatmapLayer,
            "markers": this.markers
        };
        L.control.layers(this.overlayMaps).addTo(this.map);
            
        this.popup = L.popup();

        this.map.on('click', _.bind(this.onMapClick, this));
        //this.map.on('zoomend', _.bind(this.onZoomEnd, this));
        this.map.on('moveend', _.bind(this.onZoomEnd, this));

    },
    onZoomEnd: function () {
        this.search();
    }


};
