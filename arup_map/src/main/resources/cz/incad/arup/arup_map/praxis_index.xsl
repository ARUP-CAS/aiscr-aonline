<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exts="java://cz.incad.arup.arup_map.XSLFunctions" 
                version="1.0">
    <xsl:output method="xml"/>
    <xsl:param name="filename" select="''" />
    <xsl:template match="/">
        <add>
            <xsl:for-each select="practice">
                <doc>
                    <field name="id"><xsl:value-of select="$filename"/></field>
                    <field name="title"><xsl:value-of select="./title"/></field>>
                    <field name="date"><xsl:value-of select="exts:formatDate(./date)"/></field>
                    <field name="description"><xsl:value-of select="./description"/></field>
                    
                    <xsl:for-each select="./author">
                        <field name="author"><xsl:value-of select="."/></field>
                    </xsl:for-each>
                    <xsl:for-each select="./attachement">
                        <field name="attachment"><xsl:value-of select="."/></field>
                    </xsl:for-each>
                </doc>
            </xsl:for-each>
        </add>
        
    </xsl:template> 
</xsl:stylesheet>
