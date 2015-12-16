<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    
    <xsl:template match="/">
         <div class="col-md-12 arup-praxe">
            <ul class="list-unstyled">
                <xsl:for-each select="practice">
                    <li>
                        <div class="arup-praxe-item-container">
                          <h2 class="arup-color-gray-pastel-dark"><a href=""><xsl:value-of select="./title" /></a></h2>
                          <p>
                          <xsl:for-each select="author">
                            <a href="" title="" class="arup-color-gray-pastel-dark">
                                <i class="glyphicon glyphicon-user"></i>&#160;<xsl:value-of select="." />
                            </a>&#160;&#160;
                            <span class="arup-color-gray">|</span>&#160;
                        </xsl:for-each>
                          </p>
                          <p>
                              <xsl:value-of select="./description" disable-output-escaping="yes" />
                          </p>
                          <p>
                              <xsl:for-each select="attachement">
                                  <a target="download" title="" class="arup-color-gray-pastel-dark">
                                      <xsl:variable name="href"><xsl:value-of select="." /></xsl:variable>
                                      <i class="glyphicon glyphicon-save-file"></i> Dokument ke stazeni
                                  </a>&#160;&#160;
                                  <span class="arup-color-gray">|</span>&#160;
                              </xsl:for-each>
                          </p>
                        </div>
                      </li>
                    
                    
                </xsl:for-each>
            </ul>
          </div>
        
    </xsl:template>

</xsl:stylesheet>
