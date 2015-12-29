
/* global _, L, arup */


arup.TIMELINE = {
    init: function () {
        this.container = $('#timeline');
        this.selOd = $('#selOd');
        this.selDo = $('#selDo');
        this.timeset = this.container.find('ul.timeset');
        this.timeline = this.container.find('ul.timeline');
        this.timelineTop = this.container.find('li.timeline-top');
        this.timelineBottom = this.container.find('li.timeline-bottom');
        
        //this.labelTop = this.container.find('.label-top strong');
        //this.labelBottom = this.container.find('.label-bottom strong');
        
        this.inputOd = $('#tlOd');
        this.inputDo = $('#tlDo');
        
        this.constraintTop = $('<div style="position: absolute;" id="timelineConstraintTop"></div>');
        $('body').prepend(this.constraintTop);
        this.constraintBottom = $('<div style="position: absolute;" id="timelineConstraintBottom"></div>');
        $('body').prepend(this.constraintBottom);
        
        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
            this.render();
        }, this));
        return this;
    },
    formatYear: function(year){
        var label = year + "";
            if(year < 0){
                label = label.substring(1) + " BC";
            }else  if(year===0){
                //label += "";
            }else{
                label += " AD";
            }
            return label;
    },
    render: function(){
        this.selOd.empty();
        this.selDo.empty();
        this.timeset.empty();
        var obdobi = this.conf.obdobi;
        for(var i=0; i<obdobi.length; i++){
            
            this.selDo.append('<option>' + obdobi[i].nazev+ ' ('+ this.formatYear(obdobi[i].do) + ')</option>');
            
            this.selOd.append('<option>' + obdobi[i].nazev+ ' ('+ this.formatYear(obdobi[i].od)+')</option>');
            if(i%3 === 0){
                var li = $('<li value="' + obdobi[i].od + '">'+ this.formatYear(obdobi[i].od) +'  <strong>-</strong></li>');
                this.timeset.append(li);
            }
        }
        var li = $('<li value="' + obdobi[obdobi.length-1].do + '">'+ this.formatYear(obdobi[obdobi.length-1].do) +'  <strong>-</strong></li>');
        this.timeset.append(li);
        
        this.liHeight = $(this.timeset.find("li")[1]).offset().top - $(this.timeset.find("li")[0]).offset().top;
        //this.selDo.css("margin-top", this.liHeight+".px");
        
        this.timeline.css("height", this.timeset.height());
        this.timelineBottom.css("top", this.timeset.height() - this.timelineTop.height()*2);
        
        
        this.inputOd.val(this.conf.obdobi[0].od);
        this.inputDo.val(this.conf.obdobi[this.conf.obdobi.length - 1].do);
        this.selDo[0].selectedIndex = this.conf.obdobi.length - 1;
        
        this.setConstraints();
        
        this.timelineBottom.draggable({ 
            axis: "y" , 
            containment: "#timelineConstraintBottom",
            drag: function(){arup.TIMELINE.draggingBottom();},
            stop: function(){arup.TIMELINE.dragEndBottom();}
        });
        this.timelineTop.draggable({ 
            axis: "y", 
            containment: "#timelineConstraintTop",
            drag: function(e){arup.TIMELINE.draggingTop(e);},
            stop: function(e){arup.TIMELINE.dragEndTop(e);}
        });
        
        
        
        this.inputOd.on("change", _.bind(function(){
            if(this.validateInput()){
                var valOd = parseInt(this.inputOd.val());
                var valDo = parseInt(this.inputDo.val());
                if(valDo < valOd){
                    this.inputDo.val(valOd);
                }
                this.inputToObdobi();
                this.setOdPos();
                this.setDoPos();
                this.setConstraints();
                this.search();
            }
        }, this));

        this.inputDo.on("change", _.bind(function(){
            if(this.validateInput()){
                var valOd = parseInt(this.inputOd.val());
                var valDo = parseInt(this.inputDo.val());
                if(valDo < valOd){
                    this.inputOd.val(valDo);
                }
                this.inputToObdobi();
                this.setOdPos();
                this.setDoPos();
                this.setConstraints();
                this.search();
            }
        }, this));

        this.selOd.on("change", _.bind(function(){
            this.setOdPos();
            this.setOdInput();
            this.setConstraints();
            this.search();
        }, this));
        
        this.selDo.on("change", _.bind(function(){
            this.setDoPos();
            this.setDoInput();
            this.setConstraints();
            this.search();
        }, this));
    },
    draggingTop: function(e){
        
        this.posToObdobi();
        var idxOd = this.selOd[0].selectedIndex;
        this.inputOd.val(this.conf.obdobi[idxOd].od);
        e.stopPropagation();
    },
    draggingBottom: function(e){
        
        this.posToObdobi();
        var idxDo = this.selDo[0].selectedIndex;
        this.inputDo.val(this.conf.obdobi[idxDo].do);
        return false;
    },
    dragEndTop: function(){
        this.posToObdobi();
        this.setOdPos();
        this.setOdInput();
        this.setConstraints();
        this.search();
    },
    dragEndBottom: function(){
        this.posToObdobi();
        this.setDoPos();
        this.setDoInput();
        this.setConstraints();
        this.search();
    },
    validateInput: function(){
        return true;
    },
    inputToObdobi: function(){
        var valOd = parseInt(this.inputOd.val());
        var obdobi = this.conf.obdobi;
        var idxOd = obdobi.length - 1;
        for(var i=0; i<obdobi.length; i++){
            if(valOd < obdobi[i].od){
                idxOd = i - 1;
                break;
            }
        }
        this.selOd[0].selectedIndex = Math.max(0, idxOd);
        
        var valDo = parseInt(this.inputDo.val());
        var idxDo = obdobi.length - 1;
        for(var i=0; i<obdobi.length; i++){
            if(valDo <= obdobi[i].do){
                idxDo = i;
                break;
            }
        }
        this.selDo[0].selectedIndex = Math.min(obdobi.length - 1, idxDo);
    },
    posToObdobi: function(){
        var pos = this.timelineTop.position().top;
        var idxOd = Math.round(pos * 3 / this.liHeight);
        this.selOd[0].selectedIndex = idxOd;
        
        
        var pos2 = this.timelineBottom.position().top;
        var idxDo = Math.min(this.conf.obdobi.length-1, Math.floor(pos2 * 3 / this.liHeight) - 1);
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
        this.constraintBottom.height(this.selDo.offset().top - this.timelineTop.offset().top  - this.timelineTop.height());
        this.constraintBottom.offset({
            left:this.timeline.offset().left, 
            top: this.timelineTop.offset().top + this.timelineTop.height()
        });
    },
    setOdInput:function(){
        var idxOd = this.selOd[0].selectedIndex;
        this.inputOd.val(this.conf.obdobi[idxOd].od);
    },
    setDoInput:function(){
        var idxDo = this.selDo[0].selectedIndex;
        this.inputDo.val(this.conf.obdobi[idxDo].do);
    },
    setOdPos: function(){
        var idxOd = this.selOd[0].selectedIndex;
        var idxDo = this.selDo[0].selectedIndex;

        var pos = this.liHeight * idxOd / 3;
        this.timelineTop.css("top", pos);

        if(idxOd > idxDo){
            this.selDo[0].selectedIndex = idxOd;
            this.timelineBottom.css("top", pos);
        }else{
            //var pos2 = this.liHeight * idxDo / 3;
            //this.timelineBottom.css("top", pos2);
        }
    },
    setDoPos: function(){
        var idxOd = this.selOd[0].selectedIndex;
        var idxDo = this.selDo[0].selectedIndex;
        //this.inputDo.val(this.conf.obdobi[idxDo].do);

        var pos = this.liHeight * idxDo / 3;

        if(idxDo < idxOd){
            this.selOd[0].selectedIndex = idxDo;
            //this.inputOd.val(this.conf.obdobi[idxDo].od);
            this.timelineTop.css("top", pos);
        }

        this.timelineBottom.css("top", pos);
    },
    search: function(){
        
            $("#od").val(this.inputOd.val());
            $("#do").val(this.inputDo.val());
            arup.current.search();
    },
    fillSelects: function(){
        
    }
    

};
