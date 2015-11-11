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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
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
    public static final int ROWS = 20;

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

    enum Actions {

        INDEX {
                    @Override
                    void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
                        resp.setContentType("application/json;charset=UTF-8");
                        try (PrintWriter out = resp.getWriter()) {
                            int success = 0;
                            int errors = 0;
                            SolrClient sclient = SolrIndex.getServer();
                            JSONObject ret = new JSONObject();
                            JSONArray ja = new JSONArray();
                            String filename = req.getParameter("filename");
                            String maps = req.getParameter("fmap");
                            JSONObject jmap = new JSONObject(FileUtils.readFileToString(new File(maps), "UTF-8"));
                            //Otocim
                            Set keyset = jmap.keySet();
                            Object[] keys = keyset.toArray();
                            for (Object s : keys) {
                                String key = (String) s;
                                jmap.put(jmap.getString(key), key);
                            }
                            
                            CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(filename), "UTF-8"), '#', '\"', false);
                            
                            String[] headerLine = reader.readNext();
                            if (headerLine != null) {
                                Map<String, Integer> fNames = new HashMap<>();
                                for (int j = 0; j < headerLine.length; j++) {
                                    fNames.put(headerLine[j], j);
                                }
                                String[] nextLine = null;
                                while ((nextLine = reader.readNext()) != null) {
                                    try {
                                        SolrInputDocument doc = new SolrInputDocument();
                                        for (int j = 0; j < nextLine.length; j++) {
                                            doc.addField(jmap.getString(headerLine[j]), nextLine[j]);
                                        }

                                        String loc = nextLine[fNames.get(jmap.getString("lng"))] + "," + nextLine[fNames.get(jmap.getString("lat"))];
                                        doc.addField("loc", loc);
                                        doc.addField("loc_rpt", loc);
                                        sclient.add(doc);
                                        success++;
                                        if (success % 500 == 0) {
                                            sclient.commit();
                                            LOGGER.log(Level.INFO, "Indexed {0} docs", success);
                                        }
                                    } catch (Exception ex) {
                                        errors++;
                                        ja.put(nextLine);
                                        LOGGER.log(Level.SEVERE, "Error indexing doc {0}", nextLine);
                                        LOGGER.log(Level.SEVERE, null,ex);
                                    }
                                    
                                }
                            }
                            sclient.commit();
                            ret.put("docs indexed", success);
                            ret.put("errors", errors);
                            ret.put("errors msgs", ja);

                            out.println(ret.toString());
                        }
                    }
                },
        ALL {
                    @Override
                    void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
                        resp.setContentType("application/json;charset=UTF-8");
                        try (PrintWriter out = resp.getWriter()) {

                            SolrQuery query = new SolrQuery();
                            query.setQuery("*:*");
                            String geom = req.getParameter("geom");
                            if (geom != null && "".equals(geom)) {
                                String[] coords = geom.split(";");
                                String gf = String.format("[%s,%s TO %s,%s]", 
                                        coords[0], coords[1], coords[2], coords[3]);
                                query.set("fq", "loc_rpt:" + gf);
                            }
                            query.setRows(ROWS);
                            //query.setFields("lat,lng");
                            JSONObject json = new JSONObject(SolrIndex.json(query));

                            out.println(json.toString());
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
                            JSONObject json = new JSONObject(SolrIndex.json(query));

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
                            JSONObject json = new JSONObject(SolrIndex.json(query));

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
                            if (q == null || "".equals(q)) {
                                q = "*:*";
                            }
                            SolrQuery query = new SolrQuery();

                            query.setQuery(q);
                            
                            if (od != null && !"".equals(od)) {
                                query.set("fq", "od:["+od+" TO *]");
                            }
                            if (to != null && !"".equals(to)) {
                                query.set("fq", "do:[* TO "+to+"]");
                            }
                            String geom = req.getParameter("geom");
                            if (geom != null && !"".equals(geom)) {
                                String[] coords = geom.split(";");
                                String gf = String.format("[%s,%s TO %s,%s]", 
                                        coords[0], coords[1], coords[2], coords[3]);
                                query.set("fq", "loc_rpt:" + gf);
                                query.setFacet(true);
                                query.set("facet.heatmap", "loc_rpt");
                                query.set("facet.heatmap.distErrPct", "0.02");
                                query.set("facet.heatmap.geom", String.format("[%s %s TO %s %s]", 
                                    coords[0], coords[1], coords[2], coords[3]));
                            }
                            query.setRows(ROWS);
                            JSONObject json = new JSONObject(SolrIndex.json(query));

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
