
/* global _, L */

arup.PRACTICE = {
    init: function () {
        this.resultsContainer = $("#results");
        this.search();
        return this;
    },
    search: function () {
        
        var params = $("#searchForm").serialize();
        var url = "data?action=QUERYPRACTICES&" + params;
        $.getJSON(url, _.bind(function (d) {
            this.resultsContainer.empty();
            
            var docs = d.response.docs;
            for (var i = 0; i < docs.length; i++) {
                var ps = {dir: "sources", id: docs[i].id , xsl: "praxis_view.xsl"};
                var div = $("<div/>");
                div.load("tr.vm", ps);
                this.resultsContainer.append(div);
            }
        }, this));

    }

};

