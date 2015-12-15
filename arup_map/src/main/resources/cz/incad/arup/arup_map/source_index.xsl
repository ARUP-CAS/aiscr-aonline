<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                version="1.0">
    <xsl:output method="xml"/>
    <xsl:param name="filename" select="''" />
    <xsl:template match="/">
        <add>
            <xsl:for-each select="source">
                <doc>
                    <field name="id"><xsl:value-of select="$filename"/></field>
                    <field name="order"><xsl:value-of select="@order"/></field>
                    <field name="title"><xsl:value-of select="./infrastructure[@name='general']/metadata[@name='název']" /></field>
                    <field name="description"><xsl:value-of select="./infrastructure[@name='general']/description"/></field>
                    
                    <xsl:for-each select="//*[text()]">
                        <field name="text"><xsl:value-of select="normalize-space(.)"/></field>
                    </xsl:for-each>
                </doc>
            </xsl:for-each>
        </add> 
    </xsl:template>
</xsl:stylesheet>
