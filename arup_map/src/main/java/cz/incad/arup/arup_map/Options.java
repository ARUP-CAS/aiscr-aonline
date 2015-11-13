package cz.incad.arup.arup_map;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class Options {
    
    public static final Logger LOGGER = Logger.getLogger(Options.class.getName());

    public static final String APP_DIR = ".arup";
    public static final String OPTIONS_KEY = "options_key";
    private static Options _sharedInstance = null;
    private final JSONObject conf;
    

    public synchronized static Options getInstance() throws IOException, JSONException {
        if (_sharedInstance == null) {
            _sharedInstance = new Options();
        }
        return _sharedInstance;
    }
    
    public synchronized static void resetInstance(){
        _sharedInstance = null;
        LOGGER.log(Level.INFO, "Options reseted");
    }

    public Options() throws IOException, JSONException {
        String path = System.getProperty("user.home") + File.separator + APP_DIR + File.separator + "conf.json";
        File fdef = FileUtils.toFile(Options.class.getResource("/cz/incad/arup/arup_map/conf.json"));

        String json = FileUtils.readFileToString(fdef, "UTF-8");
        conf = new JSONObject(json);

        File f = new File(path);
        if (f.exists() && f.canRead()) {
            json = FileUtils.readFileToString(f, "UTF-8");
            JSONObject confCustom = new JSONObject(json);
            Iterator keys = confCustom.keys();
            while (keys.hasNext() ) {
                String key = (String) keys.next();
                LOGGER.log(Level.INFO, "key {0} will be overrided", key);
                conf.put(key, confCustom.get(key));
            }
        }

    }
    
    public JSONObject getConf(){
        return conf;
    }

    public String getString(String key, String defVal) {
        return conf.optString(key, defVal);
    }

    public String getString(String key) {
        return conf.optString(key);
    }

    public int getInt(String key, int defVal) {
        return conf.optInt(key, defVal);
    }
    
    public String[] getStrings(String key){
        JSONArray arr = conf.optJSONArray(key);
        String[] ret = new String[arr.length()];
        for(int i = 0; i<arr.length(); i++){
            ret[i] = arr.getString(i);
        }      
        return ret;
    }
    
    public JSONArray getJSONArray(String key){
        return conf.optJSONArray(key);
    }
    
    public JSONObject getJSONObject(String key){
        return conf.optJSONObject(key);
    }
}
