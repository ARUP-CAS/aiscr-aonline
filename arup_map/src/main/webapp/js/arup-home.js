
/* global _, L */


/**
 * 
 * @type the namespace
 */
var arup = {};


arup.HOME = {
    init: function () {
        this.resultsContainer = $('#home_mapa');
        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
            this.resultsNum = d.homeResultsNum;
            this.search();
        }, this));
        return this;
    },
    search: function () {
        
        var params = $("#searchForm").serialize();
        var url = "data?action=BYQUERY&fq=database:Atlas";
        $.getJSON(url, _.bind(function (d) {
            this.results = d;
            this.numFound = d.response.numFound;
            this.renderSearchResults();
            this.data = this.results.response.docs;
            
        }, this));
    },
    renderSearchResults: function () {
        this.resultsContainer.empty();
        var docs = this.results.response.docs;
        $("#numFound").html(this.numFound + " docs");
        if (this.numFound === 0) {
            return;
        }
        
        for (var i = 0; i < this.resultsNum; i++) {
            var img = $('<img/>', {class:"pull-left"});
            img.attr("src", "img?db="+docs[i].database+"&id=" + docs[i].id);
            img.attr("alt", "");
            img.on("click")
            this.resultsContainer.append(img);
            var p = $('<p/>');
            p.append('<span class="title">'+docs[i].title+'</span>');
            p.append('<br/>');
            p.append(docs[i].Description_1);
            p.append('<br/>');
            p.append(docs[i].Description_2);
            p.append('<span class="clearfix"> </span>');
            
            this.resultsContainer.append(p);
        }
    },
    
    localize: function(key){
        return key;
    }
    

};
