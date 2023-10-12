# Archeologie online #

[![DOI](https://zenodo.org/badge/112324331.svg)](https://zenodo.org/badge/latestdoi/112324331) [![SWH](https://archive.softwareheritage.org/badge/origin/https://github.com/ARUP-CAS/aiscr-aonline/)](https://archive.softwareheritage.org/browse/origin/?origin_url=https://github.com/ARUP-CAS/aiscr-aonline)

Institute of Archaeology of the CAS, Prague

### Content ###

* arup_map is the webapp to show heatmap based on OSM
* solr has configuration files and test data. Solr version is 5.3 (http://apache.miloslavbrada.cz/lucene/solr/5.3.1)

 Copy arup folder to unzipped solr-5.3.1/server/solr. 
 From solr-5.3.1 execute bin/solr start -f. Solr will be running on port 8983: http://localhost:8983/solr  

Configuration
create folder ~/.arup
conf.json in this directory merges with the default one in war.


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

    #The radius each datapoint will have (if not specified on the datapoint itself) 
    "heatmapRadius": 0.05,

    #The maximal opacity the highest value in the heatmap will have. (will be overridden if opacity set)
    "heatmapMaxOpacity": 0.5,

    #The minimum opacity the lowest value in the heatmap will have (will be overridden if opacity set)
    "heatmapMinOpacity": 0.1,

    An object that represents the gradient (syntax: number string [0,1] : color string)
    "heatmapGradient":{
                "0.25": "rgb(0,0,255)",
                "0.45": "rgb(0,255,255)",
                "0.65": "rgb(0,255,0)",
                "0.95": "rgb(255,255,0)",
                "1.0": "rgb(255,128,0)"
            },

Index run from servlet.
Indexing map records
http://localhost:8084/arup_map/data?action=INDEX_MAP

Indexing sources
http://localhost:8084/arup_map/data?action=INDEX_SOURCES

Indexing practices
http://localhost:8084/arup_map/data?action=INDEX_PRACTICES
