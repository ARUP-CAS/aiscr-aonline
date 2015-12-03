# README #

Institute of Archaeology Prague

### Content ###

* arup_map is the webapp to show heatmap based on OSM
* solr has configuration files and test data. Solr version is 5.3 (http://apache.miloslavbrada.cz/lucene/solr/5.3.1)

 Copy arup folder to unzipped solr-5.3.1/server/solr. 
 From solr-5.3.1 execute bin/solr start -f. Solr will be running on port 8983: http://localhost:8983/solr  

Configuration
create folder ~/.arup
conf.json in this directory merges with the default one in war.

{
    #url of running solr
    "solrHost": "http://localhost:8983/solr",

    #core names
    "mapCore": "arup",
    "sourcesCore": "sources",
    "practicesCore": "practices",
    

    #default number of rows for solr queries
    "solrDefaultRows" : 100,

    #number of results to display
    "displayRows" : 100,

    #number of results in home page
    "homeResultsNum":4

    #zoom level for toggle view from heatmap to markers
    "markerZoomLevel" : 13,

    #maximum zoom level allowed
    "maxZoom": 15,

    #list of facets
    "facets": ["database", "Type_area", "Type_site"],

    #number of characters to display. If value is longer, will be cutted and ellipsis added
    "facetMaxChars" : 80,

    #Data directories. sources, practices and imagesDir are relative to dataDir
    "dataDir":"/home/alberto/Projects/ARUP/data/",
    "imagesDir":{"Atlas":"images_atlas/"},
    "sourcesDir":"sources/",
    "practicesDir":"practices/",


    #List of source directories for indexing map records. 
    #db: database, file: file to index, map: json file with field names map between csv a solr 
    "indexMapSources": [{"db":"Atlas", "file":"/home/archeo/data/atlas.csv", "map":"/home/archeo/data/maps.json"}],
}