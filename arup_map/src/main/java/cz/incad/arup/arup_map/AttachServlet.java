/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.arup.arup_map;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
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
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author alberto
 */
@WebServlet(name = "AttachServlet", urlPatterns = {"/attach"})
public class AttachServlet extends HttpServlet {

    public static final Logger LOGGER = Logger.getLogger(AttachServlet.class.getName());

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
            String name = request.getParameter("name");
            String dir = request.getParameter("dir");
            String fileType = request.getParameter("type");;
            if (name != null && !name.equals("")) {
                try{
                    String fname = Options.getInstance().getString("dataDir") +  
                            dir + "attachments" + File.separator + name;
                    File f = new File(fname);
                    if (f.exists()) {
                        
                        // You must tell the browser the file type you are going to send
                        // for example application/pdf, text/plain, text/html, image/jpg
                        if (fileType != null && !fileType.equals("")) {
                            response.setContentType(fileType);
                        }

                        // Make sure to show the download dialog
                        response.setHeader("Content-disposition", "attachment; filename=" + name);


                        // This should send the file to browser
                        FileInputStream in = FileUtils.openInputStream(f);
                        IOUtils.copy(in, out);
                        in.close();
                        out.flush();
                    } else {
                        System.out.println(fname + " NOT FONUD");
                    }
                }catch(Exception ex){
                    System.out.println(ex);
                }
            } 
            
        }
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
