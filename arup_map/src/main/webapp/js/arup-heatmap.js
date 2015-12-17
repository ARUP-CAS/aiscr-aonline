
/* global _, L, arup */




arup.MAP = {
    create: function () {
        this.dist = 5;
        this.mapContainer = $('#map');
        this.resultsContainer = $('#results>ul');

        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
            this.markerZoomLevel = d.markerZoomLevel;
            this.facetMaxChars = d.facetMaxChars;
            this.markersList = [];
            this.prepareMap();
            this.search();
        }, this));
        return this;
    },
    removeMarkers: function () {
        for (var i = 0; i < this.markersList.length; i++) {
            this.markers.removeLayer(this.markersList[i]);
        }
    },
    search: function () {

        var params = $("#searchForm").serialize();
        var url = "data?action=BYQUERY&" + params +
                "&geom=" + this.getMapsBoundsFilter() +
                "&center=" + this.map.getCenter();
        $.getJSON(url, _.bind(function (d) {
            this.removeMarkers();
            this.markersList = [];
            this.results = d;
            this.numFound = d.response.numFound;
            this.renderSearchResults();
            this.data = this.results.response.docs;
            if (this.heatView) {
                var mapdata = this.processHeatMapFacet();
                this.mapData = {
                    max: 2,
                    data: mapdata
                };
                this.heatmapLayer.setData(this.mapData);
            }
            this.overlayMaps = {
                "heat": this.heatmapLayer,
                "markers": this.markers
            };

        }, this));
    },
    setUsedFilters: function () {
        var hasFilters = false;
        hasFilters = $("#searchForm>input.filter").length > 0 || $('#q').val() !== '';
        $("#facets li.facet").removeClass("arup-facet-active");
        $("#facets li.facet a i").remove();

        for (var i = 0; i < $("#facets li.facet").length; i++) {

            var field = $($("#facets li.facet")[i]).data("field");
            //var li = $("#facets li." + field);
            var li = $("#facets").find("li[data-field='" + field + "']");
            var a = li.find("a");

            if ($("#searchForm>input.filter." + field).length > 0) {
                var input = $("#searchForm>input.filter." + field);
                var id = input.attr("id");
                var field = input.val().split(":")[0];
                var val = input.val().split(":")[1];
                //remove quotes if exists
                if (val.indexOf('"') === 0) {
                    val = val.substring(1);
                }
                if (val[val.length - 1] === '"') {
                    val = val.substring(0, val.length - 1);
                }
                a.text(arup.MAP.localize(val));
                li.click(function () {
                    var field = $(this).data('field');
                    $("#searchForm>input.filter." + field).remove();
                    arup.MAP.search();
                });

                li.addClass("arup-facet-active");
                //a.append(' <i class="glyphicon glyphicon-ok"></i>');

            } else {

                a.text($(li).data("label"));
            }
        }
    },
    renderSearchResults: function () {
        this.resultsContainer.empty();
        var docs = this.results.response.docs;
        $("#numFound").html(this.numFound + " docs");
        if (this.numFound === 0) {
            return;
        }

        this.setView();
        for (var i = 0; i < docs.length; i++) {
            var li = $('<li/>');
            //if (docs[i].hasOwnProperty("url")) {
            var a = $("<a/>");
            //a.attr("href", docs[i].url);
            a.attr("href", "#");
            //a.attr("target", "docdetail");
            a.text(docs[i].title);
            li.append(a);
            //}
            li.data("docid", i);
            this.resultsContainer.append(li);
            if (!this.heatView) {
                this.addMarker(docs[i], i);

                li.on("click", _.partial(function (ar) {
                    var docid = $(this).data("docid");
                    ar.markersList[docid].openPopup();
                    return false;
                }, this));
            }
        }
        this.renderFacets();
    },
    addMarker: function (doc, idx) {
        var marker = L.marker([doc.lat, doc.lng], {docid: idx});
        this.markersList[idx] = marker;
        marker.on("popupopen", _.partial(function (ar) {
            ar.map.setView(ar.getVisibleCenter(this.getLatLng()));
            this.setPopupContent(ar.popupContent(this.options.docid));
        }, this));
        //marker.addTo(this.markers);

        var c = this.popupContent(idx);
        marker.bindPopup(c).addTo(this.markers);

    },
    onResize: function () {
        var size = this.map.getSize();
        this.heatmapLayer._width = size.x;
        this.heatmapLayer._height = size.y;
        this.heatmapLayer._el.style.width = size.x + 'px';
        this.heatmapLayer._el.style.height = size.y + 'px';
        this.heatmapLayer._heatmap._width = size.x;
        this.heatmapLayer._heatmap._height = size.y;
        this.heatmapLayer._heatmap._renderer.setDimensions(size.x, size.y);
        this.heatmapLayer._update();
    },
    getVisibleCenter: function (latlng) {
        if ($("#facets_pane").is(":visible")) {
            var facetsOffset = $("#facets_pane").offset();
            var fLeft = ($("#facets_pane").offset().left - this.mapContainer.offset().left) * .5;
            var h = $("#facets_pane").height() * .5;
            var vLatLng = this.map.containerPointToLatLng(L.point(fLeft, h));
            var cLatLng = this.map.getCenter();
            return L.latLng(latlng.lat - vLatLng.lat + cLatLng.lat, latlng.lng - vLatLng.lng + cLatLng.lng);
        } else {
            return latlng;
        }
    },
    localize: function (key) {
        return key;
    },
    addFilter: function (field, value) {
        if ($("#searchForm>input." + field).length === 0) {
            var index = $("#searchForm>input[name='fq']").length + 1;
            var input = $('<input name="fq" type="hidden" class="filter ' + field + '" />');
            $(input).attr("id", "fq_" + index);
            $(input).data("field", field);
            input.val(field + ":" + '"' + value + '"');
            $("#searchForm").append(input);
        } else {
            $("#searchForm>input." + field).val(field + ":" + '"' + value + '"');
        }


        $("#offset").val(0);
        this.search();
    },
    renderFacets: function () {
        var facets = this.conf.facets;
        this.setUsedFilters();
        $.each(facets, _.bind(function (idx, facet) {
            if (!this.results.facet_counts.facet_fields.hasOwnProperty(facet)) {
                return;
            }
            var facetvals = this.results.facet_counts.facet_fields[facet];
            if (facetvals.length < 3)
                return;

            var ul = $("#" + facet + ">ul");
            ul.empty();
            for (var i = 0; i < facetvals.length; i = i + 2) {
                if (facetvals[i] !== "null" && parseInt(facetvals[i + 1]) > 0) {
                    var li = $("<li/>", {class: "link"});
                    li.data("facet", facet);
                    li.data("value", facetvals[i]);

                    var label = $("<span/>");
                    var ico = $("<i class='glyphicon glyphicon-chevron-right arup-facet-ico'></i>"); // pedro
                    var txt = facetvals[i];
                    if (txt.length > this.facetMaxChars) {
                        label.attr("title", txt);
                        txt = txt.substring(0, this.facetMaxChars - 1) + "...";
                    }
                    label.text(txt + " (" + facetvals[i + 1] + ")");
                    label.click(function () {
                        arup.MAP.addFilter($(this).parent().data("facet"), '' + $(this).parent().data("value") + ''); // pedro - removed "
                    });
                    li.append(ico); // pedro
                    li.append(label);
                    ul.append(li);
                }
            }
        }, this));
    },
    onMapClick: function (e) {
//        var url = "data?action=BYPOINT&lat=" + e.latlng.lat + "&lng=" + e.latlng.lng + "&dist=" + this.dist;
//        $.getJSON(url, _.bind(function (d) {
//            this.results = d;
//            this.numFound = d.response.numFound;
//            this.renderSearchResults();
//        }, this));
    },
    popupContent: function (docid) {
        var doc = this.results.response.docs[docid];
        var div = $("<div/>");
        var b = $("<b/>");
        if (doc.hasOwnProperty("url")) {
            var a = $("<a/>");
            a.attr("href", doc.url);
            a.attr("target", "docdetail");
            a.text(doc.title);
            b.append(a);
        } else {
            b.text(doc.title);
        }
        div.append(b);

        var c = "<br/>" +
                '<img class="img-popup" src="img?id=' + doc.id + '&db=' + doc.database + '" />' + '<br/>' +
                doc.Type_site + '<br/>' +
                doc.Type_area + '<br/>' +
                doc.Description_1 + '<br/>' +
                doc.Description_2 + '<br/>';
        div.append(c);

        return div[0];
    },
    getMapsBoundsFilter: function () {
        var b = this.map.getBounds();
        return b._southWest.lng + ';' + b._southWest.lat + ';' +
                b._northEast.lng + ';' + b._northEast.lat;
    },
    getVisibleCount: function () {

        var facet = this.results.facet_counts.facet_heatmaps.loc_rpt;
        var counts_ints2D = facet[15];
        var count = 0;
        if (counts_ints2D !== null) {

            for (var i = 0; i < counts_ints2D.length; i++) {

                if (counts_ints2D[i] !== null && counts_ints2D[i] !== "null") {
                    var row = counts_ints2D[i];
                    for (var j = 0; j < row.length; j++) {
                        count += row[j];
                    }
                }
            }
        }
        return count;
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
        var counts_ints2D = facet[15];
        //console.log(gridLevel, rows, columns);
        if (counts_ints2D !== null) {

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

                        }
                    }
                }
            }
        }
        return mapdata;
    },
    prepareMap: function () {
        var baseLayer = L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                    maxZoom: this.conf.maxZoom
                }
        );

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": this.conf.heatmapRadius,
            "maxOpacity": this.conf.heatmapMaxOpacity,
            "minOpacity": this.conf.heatmapMinOpacity,
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
            gradient: this.conf.heatmapGradient
        };


        this.heatmapLayer = new HeatmapOverlay(cfg);

        this.map = new L.Map('map', {
            center: new L.LatLng(49.803, 15.496),
            zoom: 8,
            fullscreenControl: true,
            //layers: [baseLayer, this.heatmapLayer]
            layers: [baseLayer]
        });


        this.markers = new L.featureGroup();

        this.map.addLayer(this.heatmapLayer);

        this.popup = L.popup();

        this.map.on('click', _.bind(this.onMapClick, this));
        this.map.on('zoomend', _.bind(this.onZoomEnd, this));
        this.map.on('dragend', _.bind(this.onZoomEnd, this));
        this.map.on('resize', _.bind(this.onResize, this));
        this.map.on('fullscreenchange', _.bind(this.onFullScreen, this));
        
        $("#qFull").on("change", _.bind(this.searchFull, this));
        
        //$('#facets_pane').insertAfter('.leaflet-control-container');
    },
    searchFull: function(){
        $("#q").val($("#qFull").val());
        this.search();
    },
    onFullScreen: function () {
        $("#facets_btn").css('z-index', this.mapContainer.css('z-index'));
        $("#facets_pane").css('z-index', this.mapContainer.css('z-index'));
        if (this.map.isFullscreen()) {
            $("#facets_btn").css('position', 'fixed');
            $("#facets_pane").css('position', 'fixed');
            $("#qFull").val($("#q").val());
            $("#fullBox").show();
        } else {
            $("#facets_btn").css('position', 'absolute');
            $("#facets_pane").css('position', 'absolute');
            $("#fullBox").hide();
        }

        this.search();
    },
    setView: function () {
        var count = this.getVisibleCount();
        this.heatView = this.map.getZoom() < this.markerZoomLevel &&
                this.numFound > this.conf.displayRows &&
                count > this.conf.displayRows;
        if (this.heatView) {
            $(".arup-nav-tabs li.results").hide();
            if (this.map.hasLayer(this.markers)) {
                this.map.removeLayer(this.markers);
            }
            if (!this.map.hasLayer(this.heatmapLayer)) {
                this.map.addLayer(this.heatmapLayer);
            }
        } else {
            $(".arup-nav-tabs li.results").show();
            if (!this.map.hasLayer(this.markers)) {
                this.map.addLayer(this.markers);
            }
            if (this.map.hasLayer(this.heatmapLayer)) {
                this.map.removeLayer(this.heatmapLayer);
            }
        }
    },
    onZoomEnd: function () {
        this.search();
    }


};
