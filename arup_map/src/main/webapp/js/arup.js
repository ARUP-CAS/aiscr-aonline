
/**
 * 
 * @type the namespace
 */
var arup = {
    init: function(){
        this.setMenuActive();
        $.getJSON("conf", _.bind(function (d) {
            this.conf = d;
        }, this));
    },
    setMenuActive: function(){
        $("#navbar li").removeClass("active");
        var loc = window.location.href;
        var e = $("#navbar li.arup-nav-default");
        if(loc.indexOf("map.vm")>0){
            e = $("#navbar li.arup-nav-mapa");
        }else if(loc.indexOf("source.vm")>0){
            e = $("#navbar li.arup-nav-zdroj");
        }else if(loc.indexOf("praxis.vm")>0){
            e = $("#navbar li.arup-nav-praxe");
        }else if(loc.indexOf("about.vm")>0){
            e = $("#navbar li.arup-nav-about");
        }
        e.addClass("active");
        
    },
    navigate: function(page){
        window.location.href = page + ".vm?" + $("#searchForm").serialize();
    },
    localize: function(key){
        return key;
    }

};
