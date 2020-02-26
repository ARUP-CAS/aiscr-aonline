/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.arup.arup_map;

import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.FileVisitOption;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import org.apache.commons.io.FileUtils;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class DataServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(DataServlet.class.getName());
  public static final String ACTION_NAME = "action";
  public static int ROWS = 100;

  /**
   * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
   * methods.
   *
   * @param req servlet request
   * @param resp servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  protected void processRequest(HttpServletRequest req, HttpServletResponse resp)
          throws ServletException, IOException {
    try {
      String actionNameParam = req.getParameter(ACTION_NAME);
      if (actionNameParam != null) {
        ROWS = Options.getInstance().getInt("solrDefaultRows", ROWS);
        Actions actionToDo = DataServlet.Actions.valueOf(actionNameParam);
        actionToDo.doPerform(req, resp);
      } else {
        PrintWriter out = resp.getWriter();
        out.print("actionNameParam -> " + actionNameParam);
      }
    } catch (IOException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      PrintWriter out = resp.getWriter();
      out.print(e1.toString());
    } catch (SecurityException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
    } catch (Exception e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      PrintWriter out = resp.getWriter();
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    }
  }

  private static JSONArray indexDir(final Path dir, final String xsl, final String core) throws IOException {
    final JSONArray ja = new JSONArray();
    final TransformerFactory tfactory = TransformerFactory.newInstance();
    Files.walkFileTree(dir, EnumSet.of(FileVisitOption.FOLLOW_LINKS), 1,
            new SimpleFileVisitor<Path>() {

      @Override
      public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {

        try {
          if (file.toFile().isFile()) {

            LOGGER.log(Level.INFO, "Indexing file {0}", file);
            StreamSource xsltSource = new StreamSource(DataServlet.class.getResourceAsStream("/cz/incad/arup/arup_map/" + xsl));
            StreamSource xmlSource = new StreamSource(file.toFile());
            Transformer transformer = tfactory.newTransformer(xsltSource);
            StreamResult destStream = new StreamResult(new StringWriter());

            transformer.setParameter("filename", file.toString());
            transformer.transform(xmlSource, destStream);
            StringWriter sw = (StringWriter) destStream.getWriter();

            SolrIndex.postDataToCore(sw.toString(), core);
          }

          return FileVisitResult.CONTINUE;
        } catch (Exception e) {
          LOGGER.log(Level.SEVERE, "Error indexing file {0}", file);

          ja.put("Error indexing file " + file);
          return FileVisitResult.CONTINUE;
        }
      }
    });
    return ja;
  }

  private static void setHeatMap(SolrQuery query, String geom, double cols) {
    String[] coords = geom.split(";");
    String gf = String.format("[%s,%s TO %s,%s]",
            coords[1], coords[0], coords[3], coords[2]);

    double latCenter = (Double.parseDouble(coords[3]) + Double.parseDouble(coords[1])) * .5;
    double lngCenter = (Double.parseDouble(coords[0]) + Double.parseDouble(coords[2])) * .5;
    double dist = (Double.parseDouble(coords[2]) - Double.parseDouble(coords[0])) * cols;

//        String d = req.getParameter("d");
//        if (d != null && !d.equals("")) {
//            try {
//                dist = Math.min(dist, Double.parseDouble(d));
//            } catch (Exception e) {
//
//            }
//        }
    query.set("facet.heatmap", "loc_rpt");
    query.set("facet.heatmap.distErr", Double.toString(dist));
    query.set("facet.heatmap.maxCells", 400000);
    query.set("facet.heatmap.maxLevel", 7);

    query.set("facet.heatmap.geom", String.format("[%s %s TO %s %s]",
            coords[0], coords[1], coords[2], coords[3]));
  }

  enum Actions {
    INDEX_PRACTICES {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
          SolrIndex.postDataToCore("<delete><query>*:*</query></delete>", "practices");
          SolrIndex.postDataToCore("<commit/>", "practices");
          final JSONObject ret = new JSONObject();
          Options opts = Options.getInstance();
          Path dir = Paths.get(opts.getString("dataDir") + opts.getString("practicesDir"));
          JSONArray ja = indexDir(dir, "praxis_index.xsl", "practices");

          LOGGER.log(Level.INFO, "Indexing finished.");
          SolrIndex.postDataToCore("<commit/>", "practices");
          ret.put("errors", ja.length());
          ret.put("errors msgs", ja);
          out.println(ret.toString());
        }
      }
    },
    INDEX_SOURCES {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {

          SolrIndex.postDataToCore("<delete><query>*:*</query></delete>", "sources");
          SolrIndex.postDataToCore("<commit/>", "sources");
          final JSONObject ret = new JSONObject();
          Options opts = Options.getInstance();
          Path dir = Paths.get(opts.getString("dataDir") + opts.getString("sourcesDir"));
          JSONArray ja = indexDir(dir, "source_index.xsl", "sources");

          LOGGER.log(Level.INFO, "Indexing finished.");
          SolrIndex.postDataToCore("<commit/>", "sources");
          ret.put("errors", ja.length());
          ret.put("errors msgs", ja);
          out.println(ret.toString());
        }
      }
    },
    INDEX_MAP {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        JSONObject ret = new JSONObject();
        try (PrintWriter out = resp.getWriter()) {
          Options opts = Options.getInstance();
          String core = opts.getString("mapCore", "arup");
          SolrClient sclient = SolrIndex.getServer(core);

          boolean clean = true;
          if (req.getParameter("clean") != null) {
            clean = Boolean.parseBoolean(req.getParameter("clean"));
          }

          if (clean) {
            SolrIndex.postDataToCore("<delete><query>*:*</query></delete>", core);
            SolrIndex.postDataToCore("<commit/>", core);
          }

          int success = 0;
          int errors = 0;
          JSONArray ja = new JSONArray();
          String[] filenames = req.getParameterValues("filename");
          JSONArray sources;
          if (filenames == null || filenames.length == 0) {
            sources = opts.getJSONArray("indexMapSources");
          } else {
            sources = new JSONArray(filenames);
          }
          String maps = req.getParameter("fmap");

          for (int i = 0; i < sources.length(); i++) {
            List<SolrInputDocument> idocs = new ArrayList<>();
            String filename = sources.getJSONObject(i).getString("file");
            String db = sources.getJSONObject(i).getString("db");

            if (maps == null || maps.equals("")) {
              maps = sources.getJSONObject(i).getString("map");
            }
            JSONObject jmap = new JSONObject(FileUtils.readFileToString(new File(maps), "UTF-8"));
            //Otocim
            Set keyset = jmap.keySet();
            Object[] keys = keyset.toArray();
            for (Object s : keys) {
              String key = (String) s;
              jmap.put(jmap.getString(key), key);
            }

            CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(filename), "UTF-8"), '#', '\"', false);
            LOGGER.log(Level.INFO, "indexing file {0}", filename);
            String[] headerLine = reader.readNext();
            if (headerLine != null) {
              Map<String, Integer> fNames = new HashMap<>();
              for (int j = 0; j < headerLine.length; j++) {
                fNames.put(headerLine[j], j);
                if (!jmap.has(headerLine[j])) {
                  jmap.put(headerLine[j], headerLine[j]);
                }
              }
              String[] nextLine = null;
              while ((nextLine = reader.readNext()) != null) {
                try {
                  SolrInputDocument doc = new SolrInputDocument();
                  for (int j = 0; j < nextLine.length; j++) {
                    doc.addField(jmap.getString(headerLine[j]), nextLine[j]);
                  }

                  String id = nextLine[fNames.get(jmap.getString("id"))];

                  String loc = nextLine[fNames.get(jmap.getString("lat"))] + "," + nextLine[fNames.get(jmap.getString("lng"))];
                  doc.addField("loc", loc);
                  doc.addField("loc_rpt", loc);
                  doc.addField("database", db);

                  boolean hasImage = false;
                  try {
                    String imgFile = Options.getInstance().getString("dataDir") + Options.getInstance().getJSONObject("imagesDir").getString(db) + id + ".jpg";
                    File f = new File(imgFile);
                    hasImage = f.exists();
                  } catch (Exception ex) {
                    hasImage = false;
                  }
                  doc.addField("hasImage", hasImage);

                  idocs.add(doc);
                  if (idocs.size() > 499) {
                    try {
                      sclient.add(idocs);
                      // sclient.commit();
                      success += idocs.size();
                      LOGGER.log(Level.INFO, "Indexed {0} docs", success);
                    } catch (Exception ssex) {
                      ja.put(ssex);
                      LOGGER.log(Level.SEVERE, "Error indexing doc {0}", ssex);
                      out.println(ssex.toString());
                      out.flush();
                    }
                    idocs.clear();
                    
                  }

                } catch (Exception ex) {
                  errors++;
                  ja.put(nextLine);
                  LOGGER.log(Level.SEVERE, "Error indexing doc {0}", nextLine);
                  LOGGER.log(Level.SEVERE, null, ex);
                }

              }
            }
            if (!idocs.isEmpty()) {
              try {
                sclient.add(idocs);
                sclient.commit();
                success += idocs.size();
                LOGGER.log(Level.INFO, "Indexed {0} docs", success);
              } catch (Exception ssex) {
                ja.put(ssex);
                LOGGER.log(Level.SEVERE, "Error indexing doc {0}", ssex);
              }
              idocs.clear();
            }
            ret.put("docs indexed", success);
            ret.put("errors", errors);
            ret.put("errors msgs", ja);
            sclient.commit();
            // sclient.optimize();
          }
          LOGGER.log(Level.INFO, "Indexed Finished. {0} success, {1} errors", new Object[]{success, errors});
          out.println(ret.toString());
        } catch (SolrServerException | IOException ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          resp.getWriter().println(ret.toString());
        }
      }
    },
    HEATMAP {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
          String geom = req.getParameter("geom");
          String[] coords = geom.split(";");
          String gf = String.format("[%s %s TO %s %s]",
                  coords[0], coords[1], coords[2], coords[3]);
          SolrQuery query = new SolrQuery();

          query.setQuery("*:*");
          query.setRows(0);
          query.setFacet(true);
          query.set("facet.heatmap", "loc_rpt");
          query.set("facet.heatmap.distErrPct", "0.02");
          query.set("facet.heatmap.geom", gf);
          JSONObject json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("mapCore", "arup")));

          out.println(json.toString());
        }
      }
    },
    BYPOINT {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {

          String lat = req.getParameter("lat");
          String lng = req.getParameter("lng");
          String dist = req.getParameter("dist");
          String fq = String.format("{!geofilt pt=%s,%s sfield=loc_rpt d=%s}", lat, lng, dist);
          SolrQuery query = new SolrQuery();

          query.setQuery("*:*");
          query.set("fq", fq);
          query.setRows(ROWS);
          //query.setSort("geodist()", SolrQuery.ORDER.asc);
          JSONObject json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("mapCore", "arup")));

          out.println(json.toString());
        }
      }
    },
    BYQUERY {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
          String q = req.getParameter("q");
          String od = req.getParameter("od");
          String to = req.getParameter("do");
          boolean isHome = Boolean.parseBoolean(req.getParameter("ishome"));
          if (q == null || "".equals(q)) {
            q = "*:*";
          }
          SolrQuery query = new SolrQuery();
          query.setQuery(q);
          if (od != null && !"".equals(od)) {
            query.add("fq", "od:[" + od + " TO " + to + "] OR do:[" + od + " TO " + to + "]");
          }

          if (req.getParameterValues("fq") != null) {
            for (String fq : req.getParameterValues("fq")) {
              query.addFilterQuery(fq);
            }
          }

          if (isHome) {
            query.add("bq", "hasImage:true^2.0");
          }

          String geom = req.getParameter("geom");
          if (geom != null && !"".equals(geom)) {

            String[] coords = geom.split(";");
            String gf = String.format("[%s,%s TO %s,%s]",
                    coords[1], coords[0], coords[3], coords[2]);

            double latCenter = (Double.parseDouble(coords[3]) + Double.parseDouble(coords[1])) * .5;
            double lngCenter = (Double.parseDouble(coords[0]) + Double.parseDouble(coords[2])) * .5;
            double dist = (Double.parseDouble(coords[2]) - Double.parseDouble(coords[0])) * .005;

            String d = req.getParameter("d");
            if (d != null && !d.equals("")) {
              try {
                dist = Math.min(dist, Double.parseDouble(d));
              } catch (Exception e) {

              }
            }

            String sort = "query({!bbox v='' filter=false score=distance })";
            query.setSort(sort, SolrQuery.ORDER.asc);
            query.set("d", Double.toString(dist));
            query.set("pt", latCenter + "," + lngCenter);
            query.set("sfield", "loc_rpt");
            setHeatMap(query, geom, .005);
          }
          query.setRows(ROWS);
          query.setFacet(true);
          query.addFacetField(Options.getInstance().getStrings("facets"));
          JSONObject json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("mapCore", "arup")));

          if (json.has("error")) {
            String msg = json.getJSONObject("error").getString("msg");
            LOGGER.log(Level.WARNING, "HEATMAP ERROR: {0}", msg);
            if (msg.contains("Too many cells")) {
              //Set lower precision
              setHeatMap(query, geom, .025);
              json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("mapCore", "arup")));

            }
          }

          out.println(json.toString());
        }
      }
    },
    QUERYSOURCES {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
          String q = req.getParameter("q");
          if (q == null || "".equals(q)) {
            q = "*:*";
          }
          SolrQuery query = new SolrQuery();
          query.setQuery(q);

          if (req.getParameterValues("fq") != null) {
            for (String fq : req.getParameterValues("fq")) {
              query.addFilterQuery(fq);
            }
          }
          query.setRows(ROWS);
          query.addSort("order", SolrQuery.ORDER.asc);
          query.addSort("score", SolrQuery.ORDER.desc);

          JSONObject json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("sourcesCore", "sources")));

          out.println(json.toString());
        }
      }
    },
    QUERYPRACTICES {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        resp.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {

          String q = req.getParameter("q");
          if (q == null || "".equals(q)) {
            q = "*:*";
          }
          SolrQuery query = new SolrQuery();
          query.setQuery(q);

          if (req.getParameterValues("fq") != null) {
            for (String fq : req.getParameterValues("fq")) {
              query.addFilterQuery(fq);
            }
          }
          query.setRows(ROWS);
          query.setSort("title_sort", SolrQuery.ORDER.asc);

          JSONObject json = new JSONObject(SolrIndex.json(query, Options.getInstance().getString("practicesCore", "practices")));

          out.println(json.toString());
        }
      }
    };

    abstract void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception;
  }

  // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
  /**
   * Handles the HTTP <code>GET</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Handles the HTTP <code>POST</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Returns a short description of the servlet.
   *
   * @return a String containing servlet description
   */
  @Override
  public String getServletInfo() {
    return "Short description";
  }// </editor-fold>

}
