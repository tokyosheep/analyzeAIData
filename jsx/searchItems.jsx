(function(){
    var Searching = function(){
        this.layers = activeDocument.layers;
        this.objects = [];
    }
    Searching.prototype.lookForLayers = function(layers,obj){
        for(var i=0;i<layers.length;i++){
            $.writeln(layers[i].name);
            obj.push({name:layers[i].name});
            if(layers[i].layers&&layers[i].layers.length > 0){
                obj[obj.length-1].layer = [];
                this.lookForLayers(layers[i].layers,obj[obj.length-1].layer);
            }
            if(layers[i].pageItems&&layers[i].pageItems.length > 0){
                obj[obj.length-1].items = [];
                this.lookForItems(layers[i].pageItems,obj[obj.length-1].items);
            }
            if(layers[i].typename == "CompoundPathItem"&&layers[i].pathItems.length > 0){
                obj[obj.length-1].items = [];
                this.lookForItems(layers[i].pathItems,obj[obj.length-1].items);
            }
        }
    }

    Searching.prototype.lookForItems = function(items,array){
        for(var n=0;n<items.length;n++){
            $.writeln(items[n].typename);
            array.push({name:items[n].typename});
            if(items[n].pageItems&&items[n].pageItems.length > 0){
                array[array.length-1].items = [];
                this.lookForItems(items[n].pageItems,array[array.length-1].items);
            }
            if(items[n].fillColor){
                array[array.length-1].color = this.getColor(items[n].fillColor);
            }
            if(items[n].typename == "CompoundPathItem"&&items[n].pathItems.length > 0){
                $.writeln("length"+items[n].pathItems.length);
                array[array.length-1].items = [];
                this.lookForItems(items[n].pathItems,array[array.length-1].items);
            }
        }
    }

    Searching.prototype.getColor = function(color){
        var obj = {};
        for(var key in color){
            obj[key] = color[key];
        }
        return obj;
    }

    var launch = new Searching();
    launch.lookForLayers(launch.layers,launch.objects);
    return JSON.stringify(launch.objects);
})();