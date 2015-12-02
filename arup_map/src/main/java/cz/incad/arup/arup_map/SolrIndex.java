package cz.incad.arup.arup_map;


import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
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

    public static final Logger LOGGER = Logger.getLogger(SolrIndex.class.getName());
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
    
    private static String doQuery(SolrQuery query) throws MalformedURLException, IOException, ProtocolException {
        return doQuery(query, Options.getInstance().getString("solrCore", DEFAULT_CORE));
    }
    private static String doQuery(SolrQuery query, String core) throws MalformedURLException, IOException, ProtocolException {

        
        String urlQueryString = ClientUtils.toQueryString(query, false);
        Options opts = Options.getInstance();
        String solrURL = String.format("%s/%s/select",
                opts.getString("solrHost", DEFAULT_HOST),
                core);
        URL url = new URL(solrURL + urlQueryString);
        
        
            // use org.apache.commons.io.IOUtils to do the http handling for you
//            String xmlResponse = IOUtils.toString(url, "UTF-8");
//            return xmlResponse;
        
            HttpURLConnection urlc = null;
        String POST_ENCODING = "UTF-8";
        
            urlc = (HttpURLConnection) url.openConnection();
            urlc.setConnectTimeout(10000);
            
            urlc.setRequestMethod("GET");
            urlc.setDoOutput(false);
            urlc.setDoInput(true);
            
            String ret = null;
            String errorStream = "";
            InputStream in = null;
            try {
                in = urlc.getInputStream();
                int status = urlc.getResponseCode();
                if (status != HttpURLConnection.HTTP_OK) {
                    LOGGER.log(Level.WARNING, " HTTP response code={0}", status);
                }
                ret = IOUtils.toString(in, "UTF-8");
                
                
            } catch (IOException e) {
                
                    LOGGER.log(Level.WARNING, "IOException while reading response");
                    LOGGER.log(Level.WARNING, null, e);
            } finally {
                IOUtils.closeQuietly(in);
            }

            InputStream es = urlc.getErrorStream();
            if (es != null) {
                try {
                    errorStream = IOUtils.toString(es);
                    LOGGER.log(Level.WARNING, "Mame ERROR {0}", errorStream);
                } catch (IOException e) {
                    LOGGER.log(Level.WARNING, "IOException while reading response");
                    throw new IOException(e);
                } finally {
                        es.close();
                }
            }
            if (errorStream.length() > 0) {
                LOGGER.log(Level.WARNING, "errorStream: {0}", errorStream.toString());
            }

            return ret;
        
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
    
    public static String json(SolrQuery query, String core) throws MalformedURLException, IOException {
        
        query.set("indent", true);
        query.set("wt", "json");
        return doQuery(query, core);
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
    
    public static String postData(String dataStr)
            throws Exception {
        Options opts = Options.getInstance();
        return postData(String.format("%s/%s/update",
                opts.getString("solrHost", DEFAULT_HOST),
                opts.getString("solrCore", DEFAULT_CORE)), dataStr);
    }
    
    public static String postDataToCore(String dataStr, String core)
            throws Exception {
        Options opts = Options.getInstance();
        return postData(String.format("%s/%s/update",
                opts.getString("solrHost", DEFAULT_HOST),
                core), dataStr);
    }

    public static String postData(String url, String dataStr)
            throws Exception {

        URL solrUrl = new URL(url);
        Reader data = new StringReader(dataStr);
        StringBuilder output = new StringBuilder();
        HttpURLConnection urlc = null;
        String POST_ENCODING = "UTF-8";

        urlc = (HttpURLConnection) solrUrl.openConnection();
        try {
            urlc.setRequestMethod("POST");
        } catch (ProtocolException e) {
            throw new Exception("Shouldn't happen: HttpURLConnection doesn't support POST??", e);
        }
        urlc.setDoOutput(true);
        urlc.setDoInput(true);
        urlc.setUseCaches(false);
        urlc.setAllowUserInteraction(false);
        urlc.setRequestProperty("Content-type", "text/xml; charset=" + POST_ENCODING);

        OutputStream out = urlc.getOutputStream();

        try {
            Writer writer = new OutputStreamWriter(out, POST_ENCODING);
            pipe(data, writer);
            writer.close();
        } catch (IOException e) {
            throw new Exception("IOException while posting data", e);
        } finally {
            if (out != null) {
                out.close();
            }
        }

        InputStream in = urlc.getInputStream();
        int status = urlc.getResponseCode();
        StringBuilder errorStream = new StringBuilder();
        try {
            if (status != HttpURLConnection.HTTP_OK) {
                errorStream.append("postData URL=").append(solrUrl.toString()).append(" HTTP response code=").append(status).append(" ");
                throw new Exception("URL=" + solrUrl.toString() + " HTTP response code=" + status);
            }
            Reader reader = new InputStreamReader(in);
            pipeString(reader, output);
            reader.close();
        } catch (IOException e) {
            throw new Exception("IOException while reading response", e);
        } finally {
            if (in != null) {
                in.close();
            }
        }

        InputStream es = urlc.getErrorStream();
        if (es != null) {
            try {
                Reader reader = new InputStreamReader(es);
                pipeString(reader, errorStream);
                reader.close();
            } catch (IOException e) {
                throw new Exception("IOException while reading response", e);
            } finally {
                if (es != null) {
                    es.close();
                }
            }
        }
        if (errorStream.length() > 0) {
            throw new Exception("postData error: " + errorStream.toString());
        }

        return output.toString();

    }

    /**
     * Pipes everything from the reader to the writer via a buffer
     */
    private static void pipe(Reader reader, Writer writer) throws IOException {
        char[] buf = new char[1024];
        int read = 0;
        while ((read = reader.read(buf)) >= 0) {
            writer.write(buf, 0, read);
        }
        writer.flush();
    }

    /**
     * Pipes everything from the reader to the writer via a buffer except lines
     * starting with '<?'
     */
    private static void pipeString(Reader reader, StringBuilder writer) throws IOException {
        char[] buf = new char[1024];
        int read = 0;
        while ((read = reader.read(buf)) >= 0) {
            if (!(buf[0] == '<' && buf[1] == '?')) {
                writer.append(buf, 0, read);
            }
        }
    }

}
