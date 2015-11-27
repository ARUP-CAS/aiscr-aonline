
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
        
        this.constraintTop = $('<div style="position: absolute;" id="timelineConstraintTop"></div>');
        $('body').append(this.constraintTop);
        this.constraintBottom = $('<div style="position: absolute;" id="timelineConstraintBottom"></div>');
        $('body').append(this.constraintBottom);
        
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
        var li = $('<li>' + obdobi[obdobi.length-1].do + '  <strong>-</strong></li>');
        this.timeset.append(li);
        
        this.liHeight = $(this.timeset.find("li")[1]).offset().top - $(this.timeset.find("li")[0]).offset().top;
        
        this.timeline.css("height", this.timeset.height());
        this.timelineBottom.css("top", this.timeset.height() - this.timelineTop.height()*2);
        
        
        this.labelTop.text(this.conf.obdobi[0].od);
        this.labelBottom.text(this.conf.obdobi[this.conf.obdobi.length - 1].do);
        this.selDo[0].selectedIndex = this.conf.obdobi.length - 1;
        
        this.setConstraints();
        
        this.timelineBottom.draggable({ 
            axis: "y" , 
            containment: "#timelineConstraintBottom",
            stop: function(){arup.TIMELINE.dragEndBottom();}
        });
        this.timelineTop.draggable({ 
            axis: "y", 
            containment: "#timelineConstraintTop",
            stop: function(){arup.TIMELINE.dragEndTop();}
        });

        this.selOd.on("change", _.bind(function(){
            this.setOdPos();
            this.setConstraints();
            this.search();
        }, this));
        
        this.selDo.on("change", _.bind(function(){
            this.setDoPos();
            this.setConstraints();
            this.search();
        }, this));
    },
    dragEndTop: function(){
        this.posToObdobi();
        this.setOdPos();
        this.setConstraints();
        this.search();
    },
    dragEndBottom: function(){
        this.posToObdobi();
        this.setDoPos();
        this.setConstraints();
        this.search();
    },
    posToObdobi: function(){
        var pos = this.timelineTop.position().top;
        var idxOd = pos * 3 / this.liHeight;
        this.selOd[0].selectedIndex = idxOd;
        
        
        var pos2 = this.timelineBottom.position().top;
        var idxDo = pos2 * 3 / this.liHeight - 1;
        this.selDo[0].selectedIndex = idxDo;
        
    },
    setConstraints: function(){
        this.constraintTop.width(this.timeline.width());
        this.constraintTop.height(this.timelineBottom.offset().top - this.timeline.offset().top);
        this.constraintTop.offset({
            left:this.timeline.offset().left, 
            top: this.timeline.offset().top
        });
        
        this.constraintBottom.width(this.timeline.width());
        this.constraintBottom.height(this.timeline.offset().top + this.timeline.height() - this.timelineTop.offset().top  - this.timelineTop.height());
        this.constraintBottom.offset({
            left:this.timeline.offset().left, 
            top: this.timelineTop.offset().top + this.timelineTop.height()
        });
    },
    setOdPos: function(){
        var idxOd = this.selOd[0].selectedIndex;
        var idxDo = this.selDo[0].selectedIndex;
        this.labelTop.text(this.conf.obdobi[idxOd].od);

        var pos = this.liHeight * idxOd / 3;
        this.timelineTop.css("top", pos);

        if(idxOd > idxDo){
            this.selDo[0].selectedIndex = idxOd;
            this.labelBottom.text(this.conf.obdobi[idxOd].do);
            this.timelineBottom.css("top", pos);
        }else{
            //var pos2 = this.liHeight * idxDo / 3;
            //this.timelineBottom.css("top", pos2);
        }
    },
    setDoPos: function(){
        var idxOd = this.selOd[0].selectedIndex;
        var idxDo = this.selDo[0].selectedIndex;
        this.labelBottom.text(this.conf.obdobi[idxDo].do);

        var pos = this.liHeight * idxDo / 3;

        if(idxDo < idxOd){
            this.selOd[0].selectedIndex = idxDo;
            this.labelTop.text(this.conf.obdobi[idxDo].od);
            this.timelineTop.css("top", pos);
        }

        this.timelineBottom.css("top", pos - parseInt(this.timelineTop.css("top")));
    },
    search: function(){
        
            $("#od").val(this.conf.obdobi[this.selOd[0].selectedIndex].od);
            $("#do").val(this.conf.obdobi[this.selDo[0].selectedIndex].do);
            arup.current.search();
    },
    fillSelects: function(){
        
    }
    

};