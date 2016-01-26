<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    
    <xsl:template match="/">
         <div class="col-md-12 arup-praxe">
            <ul class="list-unstyled">
                <xsl:for-each select="practice">
                    <li>
                        <div class="arup-praxe-item-container">
                          <h2 class="arup-color-gray-pastel-dark"><span><xsl:value-of select="./title" /></span></h2>
                          <p>
                          <xsl:for-each select="author">
                            <span class="arup-color-gray-pastel-dark">
                                <i class="glyphicon glyphicon-user"></i>&#160;<xsl:value-of select="." />
                            </span>&#160;&#160;
                            <xsl:if test="position() != last()">
                                <span class="arup-color-gray">|</span>&#160;
                            </xsl:if>
                        </xsl:for-each>
                          </p>
                          <p>
                              <xsl:copy-of select="./description"  />
                          </p>
                          <p>
                              <xsl:for-each select="attachement">
                                  <a target="download" title="" class="arup-color-gray-pastel-dark">
                                      <xsl:attribute name="href">attach?name=<xsl:value-of select="." />&amp;type=<xsl:value-of select="@type" />&amp;dir=practices/</xsl:attribute>
                                      <i class="glyphicon glyphicon-save-file"></i><xsl:value-of select="." />
                                  </a>&#160;&#160;
                                    <xsl:if test="position() != last()">
                                        <span class="arup-color-gray">|</span>&#160;
                                    </xsl:if>
                              </xsl:for-each>
                          </p>
                        </div>
                      </li>
                    
                    
                </xsl:for-each>
            </ul>
          </div>
        
    </xsl:template>

</xsl:stylesheet>
