<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    
    <xsl:template match="/">
         <div class="container arup-content-container">
          <div class="col-md-12 arup-praxe">
            <ul class="list-unstyled">
                <xsl:for-each select="practice">
                    <xsl:call-template name="li">
                        <xsl:with-param name="id"><xsl:value-of select="./@name"/></xsl:with-param>
                        <xsl:with-param name="name"><xsl:value-of select="./@name"/></xsl:with-param>
                        <xsl:with-param name="active"><xsl:value-of select="position()=1" /></xsl:with-param>
                    </xsl:call-template>
                </xsl:for-each>
            </ul>
          </div>
        </div>
        
        
    </xsl:template>

    <xsl:template name="li">
        <xsl:param name="name" />
        <xsl:param name="id" />
        <xsl:param name="active" />
        
        <li>
            <div class="arup-praxe-item-container">
              <h2 class="arup-color-gray-pastel-dark"><a href="">Archeobotanická databáze ČR</a></h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                laboris nisi ut aliquip ex ea commodo consequat ...
              </p>
              <p>
                <!-- 
                u priloh, pokud dostanu format, tak na zaklade nej mohu dosadit ikonu pro konkretni format - pdf, word, text atd. zatim dosazuji obecnou ikonu 
                jako napr. zde -> http://sluzby.incad.cz/staticDemo/skoda/search.html - filter Fomrat
                -->
                <a href="" title="" class="arup-color-gray-pastel-dark"><i class="glyphicon glyphicon-save-file"></i> Dokument ke stazeni</a>&#160;&#160;<span class="arup-color-gray">|</span>&#160;
                <a href="" title="" class="arup-color-gray-pastel-dark"><i class="glyphicon glyphicon-save-file"></i> Word dokument</a>
              </p>
            </div>
          </li>
              
    </xsl:template> 
</xsl:stylesheet>
