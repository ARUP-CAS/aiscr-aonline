
/* global _, L */

arup.HOME = {
    init: function () {
        this.mapResultsContainer = $('#home_mapa>div.res');
        this.mapResDoc = $('#home_mapa>div.res>div.resDoc').clone();
        this.mapResultsHeader = $('#home_mapa>h2');

        this.sourceResultsContainer = $('#home_zdroj>div.res');
        this.sourceResDoc = $('#home_zdroj>div.res>div.resDoc').clone();
        this.sourceResultsHeader = $('#home_zdroj>h2');

        this.practiceResultsContainer = $('#home_praxe>div.res');
        this.practiceResDoc = $('#home_praxe>div.res>div.resDoc').clone();
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
        var url = "data?action=BYQUERY&ishome=true&" + params;
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
        for (var j = 0; j < Math.min(this.resultsNum, docs.length); j++) {
          var i = Math.round(Math.random() * Math.min(docs.length, 100));
            var resDoc = this.mapResDoc.clone();
            if (docs[i].hasImage) {
                var img = resDoc.find("img");
                img.attr("src", "img?db=" + docs[i].database + "&id=" + docs[i].id);
            }else{
                resDoc.find("div.img").remove();
            }
            resDoc.find("span.title").text(docs[i].title);
            resDoc.find("span.desc_1").text(docs[i].Description_1);
            resDoc.find("span.desc_2").text(docs[i].Description_2);
            this.mapResultsContainer.append(resDoc);
        }
    },
    renderSourceResults: function () {
        this.sourceResultsContainer.empty();
        var docs = this.sourceResults.response.docs;
        if (this.sourceFound === 0) {
            return;
        }
        docs = _.shuffle(docs);
        for (var i = 0; i < Math.min(this.resultsNum, docs.length); i++) {
            var resDoc = this.sourceResDoc.clone();
            resDoc.find("span.title").text(docs[i].title);
            resDoc.find("span.desc").text(docs[i].description);
            this.sourceResultsContainer.append(resDoc);
            
        }
    },
    renderPracticeResults: function () {
        this.practiceResultsContainer.empty();
        var docs = this.practiceResults.response.docs;
        if (this.practiceFound === 0) {
            return;
        }
        docs = _.shuffle(docs);
        for (var i = 0; i < Math.min(this.resultsNum, docs.length); i++) {
            var resDoc = this.sourceResDoc.clone();
            resDoc.find("span.title").text(docs[i].title);
            resDoc.find("span.desc").text(docs[i].description);
            this.practiceResultsContainer.append(resDoc);
        }
    }


};

