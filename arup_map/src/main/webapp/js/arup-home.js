
/* global _, L */




arup.HOME = {
    init: function () {
        this.mapResultsContainer = $('#home_mapa>div.res');
        this.mapResultsHeader = $('#home_mapa>h2');

        this.sourceResultsContainer = $('#home_zdroj>div.res');
        this.sourceResultsHeader = $('#home_zdroj>h2');

        this.practiceResultsContainer = $('#home_praxe>div.res');
        this.practiceResultsHeader = $('#home_praxe>h2');

        this.welcomeContainer = $('#home_text');
        this.foundContainer = $('#home_found');
        this.mapFound = 0;
        this.sourceFound = 0;
        this.practiceFound = 0;
        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
            this.resultsNum = d.homeResultsNum;
            this.search();
        }, this));
        return this;
    },
    numFound: function () {
        return this.mapFound +
                this.sourceFound +
                this.practiceFound;
    },
    search: function () {
        
        this.mapFound = 0;
        this.sourceFound = 0;
        this.practiceFound = 0;
        
        var params = $("#searchForm").serialize();
        var url = "data?action=BYQUERY&fq=hasImage:true&" + params;
        $.getJSON(url, _.bind(function (d) {
            this.mapResults = d;
            this.mapFound = d.response.numFound;

            this.foundContainer.find("strong").text(this.numFound());
            this.mapResultsHeader.find("span>strong").text(this.mapFound);

            this.renderMapResults();

        }, this));


        url = "data?action=QUERYSOURCES&" + params;
        $.getJSON(url, _.bind(function (d) {
            this.sourceResults = d;
            this.sourceFound = d.response.numFound;

            this.foundContainer.find("strong").text(this.numFound());
            this.sourceResultsHeader.find("span>strong").text(this.sourceFound);

            this.renderSourceResults();

        }, this));

        url = "data?action=QUERYPRACTICES&" + params;
        $.getJSON(url, _.bind(function (d) {
            this.practiceResults = d;
            this.practiceFound = d.response.numFound;

            this.foundContainer.find("strong").text(this.numFound());
            this.practiceResultsHeader.find("span>strong").text(this.practiceFound);

            this.renderPracticeResults();

        }, this));


        if ($("#q").val() !== "") {
            this.welcomeContainer.hide();
            this.foundContainer.show();
            this.foundContainer.find("span.q").text($("#q").val());
            this.mapResultsHeader.find("span").show();
            this.sourceResultsHeader.find("span").show();
            this.practiceResultsHeader.find("span").show();
        } else {
            this.welcomeContainer.show();
            this.foundContainer.hide();
            this.mapResultsHeader.find("span").hide();
            this.sourceResultsHeader.find("span").hide();
            this.practiceResultsHeader.find("span").hide();
        }
    },
    renderMapResults: function () {
        this.mapResultsContainer.empty();
        var docs = this.mapResults.response.docs;
        $("#numFound").html(this.numFound + " docs");
        if (this.numFound === 0) {
            return;
        }

        for (var i = 0; i < Math.min(this.resultsNum, docs.length); i++) {
            var img = $('<img/>', {class: "pull-left"});
            img.attr("src", "img?db=" + docs[i].database + "&id=" + docs[i].id);
            img.attr("alt", "");
            img.on("click")
            this.mapResultsContainer.append(img);
            var p = $('<p/>');
            p.append('<span class="title">' + docs[i].title + '</span>');
            p.append('<br/>');
            p.append(docs[i].Description_1);
            p.append('<br/>');
            p.append(docs[i].Description_2);
            p.append('<span class="clearfix"> </span>');

            this.mapResultsContainer.append(p);
        }
    },
    renderSourceResults: function () {
        this.sourceResultsContainer.empty();
        var docs = this.sourceResults.response.docs;
        if (this.sourceFound === 0) {
            return;
        }

        for (var i = 0; i < Math.min(this.resultsNum, docs.length); i++) {
            var p = $('<p/>');
            p.append('<span class="title">' + docs[i].title + '</span>');
            p.append('<br/>');
            p.append(docs[i].description);
            p.append('<span class="clearfix"> </span>');

            this.sourceResultsContainer.append(p);
        }
    },
    renderPracticeResults: function () {
        this.practiceResultsContainer.empty();
        var docs = this.practiceResults.response.docs;
        if (this.practiceFound === 0) {
            return;
        }

        for (var i = 0; i < Math.min(this.resultsNum, docs.length); i++) {
            var p = $('<p/>');
            p.append('<span class="title">' + docs[i].title + '</span>');
            p.append('<br/>');
            p.append(docs[i].description);
            p.append('<span class="clearfix"> </span>');

            this.practiceResultsContainer.append(p);
        }
    }


};

