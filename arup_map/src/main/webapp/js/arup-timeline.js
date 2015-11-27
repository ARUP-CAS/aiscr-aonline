
/* global _, L */


arup.TIMELINE = {
    init: function () {
        this.container = $('#timeline');
        this.selOd = $('#selOd');
        this.selDo = $('#selDo');
        this.timeset = this.container.find('ul.timeset');
        this.timeline = this.container.find('ul.timeline');
        this.timelineTop = this.container.find('li.timeline-top');
        this.timelineBottom = this.container.find('li.timeline-bottom');
        
        this.labelTop = this.container.find('.label-top strong');
        this.labelBottom = this.container.find('.label-bottom strong');
        
        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
            this.render();
        }, this));
        return this;
    },
    render: function(){
        this.selOd.empty();
        this.selDo.empty();
        this.timeset.empty();
        var obdobi = this.conf.obdobi;
        for(var i=0; i<obdobi.length; i++){
            this.selDo.append('<option>' + obdobi[i].nazev+ ' ('+obdobi[i].do+')</option>');
            this.selOd.append('<option>' + obdobi[i].nazev+ ' ('+obdobi[i].od+')</option>');
            if(i%3 === 0){
                var li = $('<li>' + obdobi[i].od + '  <strong>-</strong></li>');
                this.timeset.append(li);
            }
        }
        this.timeline.css("height", this.timeset.height());
        this.timelineBottom.css("margin-top", this.timeset.height() - this.timelineTop.height()*2);
        this.selOd.on("change", _.bind(function(){
            var idxOd = this.selOd[0].selectedIndex;
            var idxDo = this.selDo[0].selectedIndex;
            this.labelTop.text(this.conf.obdobi[idxOd].od);
            
            
            var h = $(this.timeset.find("li")[1]).offset().top - $(this.timeset.find("li")[0]).offset().top;
            var pos = h * Math.floor(idxOd / 3);
            this.timelineTop.css("margin-top", pos);
            
            if(idxOd > idxDo){
                this.selDo[0].selectedIndex = idxOd;
                this.labelBottom.text(this.conf.obdobi[idxOd].do);
                this.timelineBottom.css("margin-top", pos - parseInt(this.timelineTop.css("margin-top")));
            }else{
                var pos2 = h * Math.floor(idxDo / 3);
                this.timelineBottom.css("margin-top", pos2 - pos);
            }
            this.search();
            
        }, this));
        
        this.selDo.on("change", _.bind(function(){
            var idxOd = this.selOd[0].selectedIndex;
            var idxDo = this.selDo[0].selectedIndex;
            this.labelBottom.text(this.conf.obdobi[idxDo].do);
            
            var h = $(this.timeset.find("li")[1]).offset().top - $(this.timeset.find("li")[0]).offset().top;
            var pos = h * Math.floor(idxDo / 3);
            
            if(idxDo < idxOd){
                this.selOd[0].selectedIndex = idxDo;
                this.labelTop.text(this.conf.obdobi[idxDo].od);
                this.timelineTop.css("margin-top", pos);
            }
            
            this.timelineBottom.css("margin-top", pos - parseInt(this.timelineTop.css("margin-top")));
            this.search();
        
        }, this));
    },
    search: function(){
        
            $("#od").val(this.conf.obdobi[this.selOd[0].selectedIndex].od);
            $("#do").val(this.conf.obdobi[this.selDo[0].selectedIndex].do);
            arup.current.search();
    },
    fillSelects: function(){
        
    }
    

};
