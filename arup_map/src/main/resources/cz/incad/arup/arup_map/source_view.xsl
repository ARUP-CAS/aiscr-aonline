<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    
    <xsl:template match="/">
        <xsl:for-each select="source">
            <xsl:variable name="sourceID" select="@id" />
            <div class="col-md-12 arup-clean-pd arup-zdroje-item arup-mg-bottom-30 arup-bg-white">
            <div>
                <xsl:attribute name="class">media arup-zdroje-desc arup-zdroje-<xsl:value-of select="$sourceID" /></xsl:attribute>
              <div class="media-left">
                <a href="#">
                  <img alt="" >
                    <xsl:attribute name="src">logo?id=<xsl:value-of select="./@logo" /></xsl:attribute>
                  </img>
                </a>
              </div>
              <div class="media-body">
                <xsl:value-of select="./infrastructure[@name='general']/description" />
              </div>
              <button class="btn arup-clean-radius" >
                  <xsl:attribute name="onclick">toggleItem('item-<xsl:value-of select="$sourceID" />','ico-<xsl:value-of select="$sourceID" />')</xsl:attribute>
                  <i class="glyphicon glyphicon-plus">
                      <xsl:attribute name="id">ico-<xsl:value-of select="$sourceID" /></xsl:attribute>
                  </i>
              </button>
            </div>
            <div class="arup-zdroje-tabs" >
                
                  <xsl:attribute name="id">item-<xsl:value-of select="$sourceID" /></xsl:attribute>
              <!-- Nav tabs -->
              <ul class="nav nav-tabs arup-zdroje-nav-tabs arup-color-gray-pastel-dark" role="tablist">
                  <xsl:for-each select="./infrastructure">
                      <li>
                          <xsl:if test="position()=1">
                              <xsl:attribute name="class">active</xsl:attribute></xsl:if>
                          <a href="#general-1" role="tab" data-toggle="tab">
                              <xsl:attribute name="href">#<xsl:value-of select="./@name"/>-<xsl:value-of select="$sourceID" /></xsl:attribute>
                              <xsl:attribute name="aria-controls">home</xsl:attribute>
                              <xsl:value-of select="./@title"/>
                          </a>
                      </li>
                  </xsl:for-each>
              </ul>
              <!-- Tab panes -->
              <div class="tab-content">
                  <xsl:for-each select="./infrastructure">
                      <xsl:call-template name="tab-panel">
                        <xsl:with-param name="id"><xsl:value-of select="$sourceID" /></xsl:with-param>
                        <xsl:with-param name="name"><xsl:value-of select="./@name"/></xsl:with-param>
                        <xsl:with-param name="active"><xsl:value-of select="position()=1" /></xsl:with-param>
                    </xsl:call-template>
                  </xsl:for-each>
              </div>
            </div>
          </div>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="tab-panel">
        <xsl:param name="name" />
        <xsl:param name="id" />
        <xsl:param name="active" />
        
        <xsl:variable name="context" select="." />
        <div role="tabpanel" >
            
            <xsl:attribute name="id"><xsl:value-of select="./@name"/>-<xsl:value-of select="$id" /></xsl:attribute>
            <xsl:attribute name="class">tab-pane arup-tab-pane <xsl:if test="$active = 'true'">active</xsl:if></xsl:attribute>
            <xsl:for-each select="./para">
                <p>
                <xsl:value-of select="." disable-output-escaping="yes" />
              </p>
            </xsl:for-each>
            
            <xsl:if test="./metadata">
            <table class="table table-hover">
                <tbody>
                    <xsl:for-each select="./metadata">
                      <xsl:variable name="pos" select="position()" />
                      <tr>
                        <th><xsl:value-of select="@name" /></th>
                        <td><xsl:value-of select="." /></td>
                      </tr>
                    </xsl:for-each>
              </tbody></table>
              </xsl:if>
                </div>
    </xsl:template> 
</xsl:stylesheet>
