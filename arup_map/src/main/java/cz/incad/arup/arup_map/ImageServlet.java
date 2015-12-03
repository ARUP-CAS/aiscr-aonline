/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.arup.arup_map;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author alberto
 */
@WebServlet(name = "ImageServlet", urlPatterns = {"/img"})
public class ImageServlet extends HttpServlet {

    public static final Logger LOGGER = Logger.getLogger(ImageServlet.class.getName());

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try (OutputStream out = response.getOutputStream()) {
            String id = request.getParameter("id");
            String db = request.getParameter("db");
            if (id != null && !id.equals("")) {
                try{
                    String fname = Options.getInstance().getString("dataDir") +  
                            Options.getInstance().getJSONObject("imagesDir").getString(db) + id + ".jpg";
                    File f = new File(fname);
                    if (f.exists()) {
                        response.setContentType("image/jpeg");
                        BufferedImage bi = ImageIO.read(f);
                        ImageIO.write(bi, "jpg", out);
                    } else {
                        emptyImg(response, out);
                    }
                }catch(Exception ex){
                    emptyImg(response, out);
                }
            } else {
                emptyImg(response, out);
            }
        }
    }

    private void emptyImg(HttpServletResponse response, OutputStream out) throws IOException {
        String empty = getServletContext().getRealPath(File.separator) + "img/empty.gif";
        response.setContentType("image/gif");
        BufferedImage bi = ImageIO.read(new File(empty));
        ImageIO.write(bi, "gif", out);
        
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
