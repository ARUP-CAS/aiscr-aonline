package cz.incad.arup.arup_map;


import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocumentList;

/**
 *
 * @author alberto
 */
public class SolrIndex {

    private static final String DEFAULT_HOST = "http://localhost:8983/solr";
    private static final String DEFAULT_CORE = "arup";
    
    public static SolrClient getServer() throws IOException {
        Options opts = Options.getInstance();
        HttpSolrClient server = new HttpSolrClient(String.format("%s/%s/", 
                opts.getString("solrHost", DEFAULT_HOST), 
                opts.getString("solrCore", DEFAULT_CORE)));
        server.setMaxRetries(1); // defaults to 0.  > 1 not recommended.
        server.setConnectionTimeout(5000); // 5 seconds to establish TCP
        
        // The following settings are provided here for completeness.
        // They will not normally be required, and should only be used 
        // after consulting javadocs to know whether they are truly required.
        server.setSoTimeout(3000);  // socket read timeout
        server.setDefaultMaxConnectionsPerHost(100);
        server.setMaxTotalConnections(100);
        server.setFollowRedirects(false);  // defaults to false
        
        // allowCompression defaults to false.
        // Server side must support gzip or deflate for this to have any effect.
        server.setAllowCompression(true);
        return server;
    }
    public static SolrDocumentList query(SolrQuery query) throws IOException, SolrServerException {
        SolrClient server = getServer();
        QueryResponse rsp = server.query(query);
        return rsp.getResults();
    }

    public static SolrDocumentList queryOneField(String q, String[] fields, String[] fq) throws IOException, SolrServerException {
        SolrClient server = getServer();
        SolrQuery query = new SolrQuery();
        query.setQuery(q);
        query.setFilterQueries(fq);
        query.setFields(fields);
        query.setRows(100);
        QueryResponse rsp = server.query(query);
        return rsp.getResults();
    }
    
    public static String xml(String q) throws MalformedURLException, IOException {
        SolrQuery query = new SolrQuery(q);
        query.set("indent", true);

        return xml(query);
    }
    
    private static String doQuery(SolrQuery query) throws MalformedURLException, IOException {
        

        // use org.apache.solr.client.solrj.util.ClientUtils 
        // to make a URL compatible query string of your SolrQuery
        String urlQueryString = ClientUtils.toQueryString(query, false);
        Options opts = Options.getInstance();
        String solrURL = String.format("%s/%s/select",
                opts.getString("solrHost", DEFAULT_HOST),
                opts.getString("solrCore", DEFAULT_CORE));
        URL url = new URL(solrURL + urlQueryString);

        // use org.apache.commons.io.IOUtils to do the http handling for you
        String xmlResponse = IOUtils.toString(url, "UTF-8");

        return xmlResponse;
    }
    
    public static String csv(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("wt", "csv");
        return doQuery(query);
    }
    public static String xml(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("indent", true);
        query.set("wt", "xml");
        return doQuery(query);
    }
    
    
    
    public static String json(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("indent", true);
        query.set("wt", "json");
        return doQuery(query);
    }
    
    
    
    public static String json(String urlQueryString) throws MalformedURLException, IOException {
        
        Options opts = Options.getInstance();
        String solrURL = String.format("%s/%s/select",
                opts.getString("solrHost", DEFAULT_HOST),
                opts.getString("solrCore", DEFAULT_CORE));
        URL url = new URL(solrURL + "?" + urlQueryString);

        // use org.apache.commons.io.IOUtils to do the http handling for you
        String xmlResponse = IOUtils.toString(url, "UTF-8");

        return xmlResponse;
    }

}
