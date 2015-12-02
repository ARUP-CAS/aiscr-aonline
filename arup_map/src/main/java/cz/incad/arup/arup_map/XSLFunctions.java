package cz.incad.arup.arup_map;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author alberto
 */
public class XSLFunctions {
    public static String formatDate(String old){
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
            SimpleDateFormat sdfOut = new SimpleDateFormat("YYYY-MM-dd'T'hh:mm:ss'Z'");
            return sdfOut.format(sdf.parse(old));
        } catch (ParseException ex) {
            Logger.getLogger(XSLFunctions.class.getName()).log(Level.SEVERE, "error parsing date {0}", old);
            return "";
        }
    }
}
