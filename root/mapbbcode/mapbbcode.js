/*
 A JavaScript library for [map] BBCode parsing, displaying and editing.
 https://github.com/MapBBCode/mapbbcode
 (c) 2013, Ilya Zverev
 Licensed WTFPL.
*/
!function(t,e){L=t.L,t.MapBBCodeProcessor={_getRegExp:function(){var t="\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)",e="\\((?:([a-zA-Z0-9,]*)\\|)?(|[\\s\\S]*?[^\\\\])\\)",o=t+"(?:"+t+")*(?:\\s*"+e+")?",i="\\[map(?:=([12]?\\d)(?:,"+t+")?)?\\]",n=i+"("+o+"(?:\\s*;"+o+")*)?\\s*\\[/map\\]",a=new RegExp(n,"i");return{coord:t,params:e,map:n,mapCompiled:a}},isValid:function(t){return this._getRegExp().mapCompiled.test(t)},stringToObjects:function(t){var e=this._getRegExp(),o=t.match(e.mapCompiled),i={objs:[]};if(o&&o[1]&&o[1].length&&+o[1]>0&&(i.zoom=+o[1],o[3]&&o[3].length>0))try{i.pos=L.LatLng?new L.LatLng(o[2],o[3]):[+o[2],+o[3]]}catch(n){}if(o&&o[4])for(var a=o[4].replace(/;;/g,"##%##").split(";"),s=new RegExp("^"+e.coord),r=new RegExp(e.params),l=0;l<a.length;l++){var p,c=a[l].replace(/##%##/g,";"),d=[],h="",u=[];for(p=c.match(s);p;)d.push(L.LatLng?new L.LatLng(p[1],p[2]):[+p[1],+p[2]]),c=c.substr(p[0].length),p=c.match(s);p=c.match(r),p&&(p[1]&&(u=p[1].split(",")),h=p[2].replace(/\\\)/g,")").replace(/^\s+|\s+$/g,"")),i.objs.push({coords:d,text:h,params:u})}return i},objectsToString:function(t){var e="";t.zoom>0&&(e="="+t.zoom,t.pos&&(e+=","+this._latLngToString(t.pos)));for(var o=[],i=[],n=t.objs||[],a=0;a<n.length;a++){for(var s=n[a].coords,r="",l=0;l<s.length;l++)l>0&&(r+=" "),r+=this._latLngToString(s[l]);var p=n[a].text||"",c=n[a].params||[];p.indexOf("|")>=0&&0===c.length&&(p="|"+p),(p.length>0||c.length>0)&&(r=r+"("+(c.length>0?c.join(",")+"|":"")+p.replace(/\)/g,"\\)").replace(/;/g,";;")+")"),s.length&&(1==s.length?o.push(r):i.push(r))}return o.length||i.length||e.length?"[map"+e+"]"+o.concat(i).join("; ")+"[/map]":""},_latLngToString:function(t){var e=Math.pow(10,5);return""+Math.round((t.lat||t[0])*e)/e+","+Math.round((t.lng||t[1])*e)/e}},t.MapBBCode=L.Class.extend({options:{createLayers:null,layers:null,maxInitialZoom:15,defaultPosition:[22,11],defaultZoom:2,leafletOptions:{},polygonOpacity:.1,editorHeight:400,viewWidth:600,viewHeight:300,fullViewHeight:600,fullScreenButton:!0,fullFromStart:!1,windowWidth:800,windowHeight:500,windowFeatures:"resizable,status,dialog",usePreparedWindow:!0,editorCloseButtons:!0,libPath:"lib/",outerLinkTemplate:!1,showHelp:!0,allowedHTML:"[auib]|span|br|em|strong|tt",letterIcons:!0,enablePolygons:!0,preferStandardLayerSwitcher:!0,hideInsideClasses:[]},strings:{},initialize:function(t){L.setOptions(this,t),L.Browser.ie&&t&&t.defaultPosition&&"splice"in t.defaultPosition&&2==t.defaultPosition.length&&(this.options.defaultPosition=[t.defaultPosition[0],t.defaultPosition[1]])},setStrings:function(t){this.strings=L.extend({},this.strings,t)},_eachParamHandler:function(e,o,i){var n=t.MapBBCode.objectParams;if(n)for(var a=0;a<n.length;a++)(!i||n[a].applicableTo(i))&&e.call(o||this,n[a])},_objectToLayer:function(t){var e;return 1==t.coords.length?e=L.marker(t.coords[0]):t.coords.length>2&&t.coords[0].equals(t.coords[t.coords.length-1])?(t.coords.splice(t.coords.length-1,1),e=L.polygon(t.coords,{weight:3,opacity:.7,fill:!0,fillOpacity:this.options.polygonOpacity})):e=L.polyline(t.coords,{weight:5,opacity:.7}),this._eachParamHandler(function(o){for(var i=[],n=0;n<t.params.length;n++)o.reKeys.test(t.params[n])&&i.push(t.params[n]);o.objectToLayer(e,o.text?t.text:i,this)},this),e._objParams=t.params,e},_zoomToLayer:function(t,e,o,i){var n=e.getBounds();if(!n||!n.isValid())return o&&o.zoom?t.setView(o.pos||this.options.defaultPosition,o.zoom):i&&t.setView(this.options.defaultPosition,this.options.defaultZoom),void 0;var a=function(){if(o&&o.pos)t.setView(o.pos,o.zoom||this.options.maxInitialZoom);else{var e=Math.max(this.options.maxInitialZoom,i?0:t.getZoom());t.fitBounds(n,{animate:!1}),o&&o.zoom?t.setZoom(o.zoom,{animate:!1}):t.getZoom()>e&&t.setZoom(e,{animate:!1})}},s=t.getBoundsZoom(n,!1);s?a.call(this):t.on("load",a,this)},createOpenStreetMapLayer:function(){return L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png",{name:"OpenStreetMap",attribution:'Map &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',minZoom:2,maxZoom:18})},_addLayers:function(e){var o=this.options.createLayers?this.options.createLayers.call(this,L):null;o&&o.length||!t.layerList||!this.options.layers||(o=t.layerList.getLeafletLayers(this.options.layers,L)),o&&o.length||(o=[this.createOpenStreetMapLayer()]);for(var i=0;i<o.length;i++)"OSM"===o[i]&&(o[i]=this.createOpenStreetMapLayer());if(e.addLayer(o[0]),o.length>1){var n,a;if(!this.options.preferStandardLayerSwitcher&&L.StaticLayerSwitcher){for(n=L.staticLayerSwitcher(),a=0;a<o.length;a++)n.addLayer(o[a].options.name,o[a]);e.addControl(n)}else{for(n=L.control.layers(),a=0;a<o.length;a++)n.addBaseLayer(o[a],o[a].options.name);e.addControl(n)}}},_hideClassPresent:function(t){if("string"!=typeof t.className)return!1;var e,o,i=t.className.split(" "),n=this.options.hideInsideClasses;if(!n||!n.length)return!1;for(e=0;e<i.length;e++)for(o=0;o<n.length;o++)if(i[e]===n[o])return!0;return t.parentNode&&this._hideClassPresent(t.parentNode)},_px:function(t){return t?t+"px":"100%"},show:function(o,i){var n="string"==typeof o?e.getElementById(o):o;if(n&&(i||(i=n.getAttribute("bbcode")||n.getAttribute("value")||n.innerHTML.replace(/^\s+|\s+$/g,"")),i)){for(;n.firstChild;)n.removeChild(n.firstChild);if(!this._hideClassPresent(n)){var a=n.ownerDocument.createElement("div");a.style.width=this.options.fullFromStart?"100%":this._px(this.options.viewWidth),a.style.height=this.options.fullFromStart?this._px(this.options.fullViewHeight):this._px(this.options.viewHeight),n.appendChild(a);var s=L.map(a,L.extend({},{scrollWheelZoom:!1,zoomControl:!1},this.options.leafletOptions));s.addControl(new L.Control.Zoom({zoomInTitle:this.strings.zoomInTitle,zoomOutTitle:this.strings.zoomOutTitle})),this._addLayers(s);var r=new L.FeatureGroup;r.addTo(s);for(var l=t.MapBBCodeProcessor.stringToObjects(i),p=l.objs,c=0;c<p.length;c++)this._objectToLayer(p[c]).addTo(r);if(this._zoomToLayer(s,r,{zoom:l.zoom,pos:l.pos},!0),this.options.fullScreenButton&&!this.options.fullFromStart){var d,h=new L.FunctionButton(t.MapBBCode.buttonsImage,{position:"topright",bgPos:[0,0],title:this.strings.fullScreenTitle}),u=!1;s.addControl(h),h.on("clicked",function(){var t=s.getContainer().style;u||d||(d=[t.width,t.height]),u=!u,t.width=u?"100%":d[0],t.height=u?this._px(this.options.fullViewHeight):d[1],s.invalidateSize(),h.setBgPos([u?26:0,0]),this._zoomToLayer(s,r)},this)}if(this.options.outerLinkTemplate){var g=L.functionButton(t.MapBBCode.buttonsImage,{position:"topright",bgPos:[52,0],title:this.strings.outerTitle});g.on("clicked",function(){var e=this.options.outerLinkTemplate;e=e.replace("{zoom}",s.getZoom()).replace("{lat}",s.getCenter().lat).replace("{lon}",s.getCenter().lng),t.open(e,"mapbbcode_outer")},this),s.addControl(g)}}}}}),L.FunctionButtons=L.Control.extend({includes:L.Mixin.Events,initialize:function(t,e){if(this._content=t,e.titles||(e.titles=[]),e.titles.length<t.length)for(var o=e.titles.length;o<t.length;o++)e.titles.push("");L.Control.prototype.initialize.call(this,e)},onAdd:function(t){this._map=t,this._links=[];for(var e=L.DomUtil.create("div","leaflet-bar"),o=0;o<this._content.length;o++){var i=L.DomUtil.create("a","",e);this._links.push(i),i.href="#",i.style.padding="0 4px",i.style.width="auto",i.style.minWidth="20px",this.options.titles&&this.options.titles.length>o&&(i.title=this.options.titles[o]),this._updateContent(o);var n=L.DomEvent.stopPropagation;L.DomEvent.on(i,"click",n).on(i,"mousedown",n).on(i,"dblclick",n).on(i,"click",L.DomEvent.preventDefault).on(i,"click",this.clicked,this)}return e},_updateContent:function(t){if(!(t>=this._content.length)){var e=this._links[t],o=this._content[t];if("string"==typeof o){var i=o.length<4?"":o.substring(o.length-4),n="data:image/"===o.substring(0,11);".png"===i||".gif"===i||".jpg"===i||n?(e.style.width=""+(this.options.imageSize||26)+"px",e.style.height=""+(this.options.imageSize||26)+"px",e.style.padding="0",e.style.backgroundImage="url("+o+")",e.style.backgroundRepeat="no-repeat",e.style.backgroundPosition=this.options.bgPos&&this.options.bgPos.length>t&&this.options.bgPos[t]?-this.options.bgPos[t][0]+"px "+-this.options.bgPos[t][1]+"px":"0px 0px"):e.innerHTML=o}else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(o)}}},setContent:function(t,e){t>=this._content.length||(this._content[t]=e,this._updateContent(t))},setTitle:function(t,e){this.options.titles[t]=e,this._links[t].title=e},setBgPos:function(t,e){this.options.bgPos[t]=e,this._links[t].style.backgroundPosition=e?-e[0]+"px "+-e[1]+"px":"0px 0px"},clicked:function(t){for(var e=t.target,o=this._links.length;--o>=0&&e!==this._links[o];);this.fire("clicked",{idx:o})}}),L.functionButtons=function(t,e){return new L.FunctionButtons(t,e)},L.FunctionButton=L.FunctionButtons.extend({initialize:function(t,e){e.title&&(e.titles=[e.title]),e.bgPos&&(e.bgPos=[e.bgPos]),L.FunctionButtons.prototype.initialize.call(this,[t],e)},setContent:function(t){L.FunctionButtons.prototype.setContent.call(this,0,t)},setTitle:function(t){L.FunctionButtons.prototype.setTitle.call(this,0,t)},setBgPos:function(t){L.FunctionButtons.prototype.setBgPos.call(this,0,t)}}),L.functionButton=function(t,e){return new L.FunctionButton(t,e)},t.MapBBCode.buttonsImage="data:image/png;base64,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","objectParams"in t.MapBBCode||(t.MapBBCode.objectParams=[]),t.MapBBCode.objectParams.unshift({text:!0,reKeys:new RegExp("a^"),applicableTo:function(){return!0},objectToLayer:function(t,e,o){e?(t._text=e,L.LetterIcon&&t instanceof L.Marker&&o.options.letterIcons&&e.length>=1&&e.length<=2?(t.setIcon(new L.LetterIcon(e)),t.options.clickable=!1):t.bindPopup(e.replace(new RegExp("<(?!/?("+o.options.allowedHTML+")[ >])","g"),"&lt;"))):t.options.clickable=!1},layerToObject:function(t){return t.inputField?t.inputField.value.replace(/\\n/g,"\n").replace(/\\\n/g,"\\n"):t._text||""},createEditorPanel:function(o,i){if(o instanceof L.Marker){var n=e.createElement("div"),a=e.createTextNode(i.strings.title+": "),s=e.createElement("input");return s.type="text",s.size=20,o._text&&(s.value=o._text.replace(/\\n/g,"\\\\n").replace(/[\r\n]+/g,"\\n")),n.appendChild(a),n.appendChild(s),n.style.marginBottom="8px",o.inputField=s,o.options.draggable=!0,o.defaultIcon=new L.Icon.Default,s.onkeypress=function(e){var i=t.event?(e||t.event).which:e.keyCode;return 27==i||13==i?(o.closePopup(),e.preventDefault(),!1):void 0},o.on("popupopen",function(){s.focus()}),o.on("popupclose",function(){var t=o.inputField.value;L.LetterIcon&&i.options.letterIcons&&t.length>0&&t.length<=2?o.setIcon(new L.LetterIcon(t)):o.setIcon(o.defaultIcon)},this),n}}}),t.MapBBCode.include({_layerToObject:function(t){var e={};return t instanceof L.Marker?e.coords=[t.getLatLng()]:(e.coords=t.getLatLngs(),t instanceof L.Polygon&&e.coords.push(e.coords[0])),e.params=t._objParams||[],this._eachParamHandler(function(o){if(o.text){var i=o.layerToObject(t,"",this);i&&(e.text=i)}else{var n,a=[];for(n=e.params.length-1;n>=0;n--)o.reKeys.test(e.params[n])&&a.unshift(e.params.splice(n,1));var s=o.layerToObject(t,a,this);if(s&&s.length>0)for(n=0;n<s.length;n++)e.params.push(s[n])}},this,t),e},_makeEditable:function(t,o){var i=e.createElement("div");i.style.textAlign="center",i.style.clear="both";var n=e.createElement("input");if(n.type="button",n.value=this.strings.close,n.onclick=function(){t.closePopup()},i.appendChild(n),o){var a=e.createElement("input");a.type="button",a.value=this.strings.remove,a.onclick=function(){t.closePopup(),o.removeLayer(t)},i.appendChild(a)}var s=e.createElement("div");return t.options.clickable=!0,(t instanceof L.Polyline||t instanceof L.Polygon)&&t.editing.enable(),this._eachParamHandler(function(e){var o=e.createEditorPanel?e.createEditorPanel(t,this):null;o&&s.appendChild(o)},this,t),s.appendChild(i),t.bindPopup(s),t},_findMapInTextArea:function(e){var o=e.selectionStart,i=e.value;if(o>=i.length||i.length<10||i.indexOf("[/map]")<0)return"";var n=i.lastIndexOf("[map",o);if(n>=0){var a=i.indexOf("[/map]",n);if(a+5>=o){var s=i.substring(n,a+6);if(t.MapBBCodeProcessor.isValid(s))return s}}return""},_updateMapInTextArea:function(t,e,o){var i=t.selectionStart,n=t.value;t.value=e.length&&n.indexOf(e)>=0?n.replace(e,o):i>=n.length?n+o:n.substring(0,i)+o+n.substring(i)},editor:function(o,i,n,a){var s="string"==typeof o?e.getElementById(o):o;if(s){for(;s.firstChild;)s.removeChild(s.firstChild);var r=s.ownerDocument.createElement("div");r.style.height=this._px(this.options.editorHeight),s.appendChild(r);var l=L.map(r,L.extend({},{zoomControl:!1},this.options.leafletOptions));l.addControl(new L.Control.Zoom({zoomInTitle:this.strings.zoomInTitle,zoomOutTitle:this.strings.zoomOutTitle})),L.Control.Search&&l.addControl(new L.Control.Search),this._addLayers(l);var p=new L.FeatureGroup;p.addTo(l);var c;"string"!=typeof i&&(c=i,i=this._findMapInTextArea(c));for(var d=t.MapBBCodeProcessor.stringToObjects(i),h=d.objs,u=0;u<h.length;u++)this._makeEditable(this._objectToLayer(h[u]).addTo(p),p);this._zoomToLayer(l,p,{zoom:d.zoom,pos:d.pos},!0),L.drawLocal.draw.toolbar.actions.text=this.strings.cancel,L.drawLocal.draw.toolbar.actions.title=this.strings.drawCancelTitle,L.drawLocal.draw.toolbar.buttons.polyline=this.strings.polylineTitle,L.drawLocal.draw.toolbar.buttons.polygon=this.strings.polygonTitle,L.drawLocal.draw.toolbar.buttons.marker=this.strings.markerTitle,L.drawLocal.draw.handlers.marker.tooltip.start=this.strings.markerTooltip,L.drawLocal.draw.handlers.polyline.tooltip.start=this.strings.polylineStartTooltip,L.drawLocal.draw.handlers.polyline.tooltip.cont=this.strings.polylineContinueTooltip,L.drawLocal.draw.handlers.polyline.tooltip.end=this.strings.polylineEndTooltip,L.drawLocal.draw.handlers.polygon.tooltip.start=this.strings.polygonStartTooltip,L.drawLocal.draw.handlers.polygon.tooltip.cont=this.strings.polygonContinueTooltip,L.drawLocal.draw.handlers.polygon.tooltip.end=this.strings.polygonEndTooltip;var g=new L.Control.Draw({position:"topleft",draw:{marker:!0,polyline:{showLength:!1,guidelineDistance:10,shapeOptions:{color:"#000000",weight:5,opacity:.7}},polygon:this.options.enablePolygons?{showArea:!1,guidelineDistance:10,shapeOptions:{color:"#000000",weight:3,opacity:.7,fillOpacity:this.options.polygonOpacity}}:!1,rectangle:!1,circle:!1},edit:{featureGroup:p,edit:!1,remove:!1}});if(this._eachParamHandler(function(t){t.initDrawControl&&t.initDrawControl(g)}),l.addControl(g),l.on("draw:created",function(t){var e=t.layer;this._eachParamHandler(function(t){t.initLayer&&t.initLayer(e)},this,e),this._makeEditable(e,p),p.addLayer(e),"marker"===t.layerType&&e.openPopup()},this),this.options.editorCloseButtons){var m=L.functionButton("<b>"+this.strings.apply+"</b>",{position:"topleft",title:this.strings.applyTitle});m.on("clicked",function(){var e=[];p.eachLayer(function(t){e.push(this._layerToObject(t))},this),s.removeChild(s.firstChild);var o=t.MapBBCodeProcessor.objectsToString({objs:e,zoom:e.length?0:l.getZoom(),pos:e.length?0:l.getCenter()});c&&this._updateMapInTextArea(c,i,o),n&&n.call(a,o)},this),l.addControl(m);var f=L.functionButton(this.strings.cancel,{position:"topright",title:this.strings.cancelTitle});f.on("clicked",function(){s.removeChild(s.firstChild),n&&n.call(a,null)},this),l.addControl(f)}if(this.options.showHelp){var y=L.functionButton('<span style="font-size: 18px; font-weight: bold;">?</span>',{position:"topright",title:this.strings.helpTitle});y.on("clicked",function(){for(var e="",o=this.strings.helpContents,i="resizable,dialog,scrollbars,height="+this.options.windowHeight+",width="+this.options.windowWidth,n=t.open("","mapbbcode_help",i),a=0;a<o.length;a++)e+=a?"#"===o[a].substr(0,1)?"<h2>"+o[a].replace(/^#\s*/,"")+"</h2>":"<p>"+o[a]+"</p>":"<h1>"+o[0]+"</h1>";e+='<div id="close"><input type="button" value="'+this.strings.close+'" onclick="javascript:window.close();"></div>';var s="<style>body { font-family: sans-serif; font-size: 12pt; } p { line-height: 1.5; } h1 { text-align: center; font-size: 18pt; } h2 { font-size: 14pt; } #close { text-align: center; margin-top: 1em; }</style>";n.document.open(),n.document.write(s),n.document.write(e),n.document.close()},this),l.addControl(y)}return{_ui:this,map:l,close:function(){var t=this.getBBCode();this.map=null,this._ui=null,this.getBBCode=function(){return t},s.removeChild(s.firstChild)},getBBCode:function(){var e=[];return p.eachLayer(function(t){e.push(this._layerToObject(t))},this._ui),t.MapBBCodeProcessor.objectsToString({objs:e,zoom:e.length?0:l.getZoom(),pos:e.length?0:l.getCenter()})}}}},editorWindow:function(e,o,i){t.storedMapBB={bbcode:e,callback:o,context:i,caller:this};var n=this.options.windowFeatures,a="height="+this.options.windowHeight+",width="+this.options.windowWidth,s=location.href.match(/^(.+\/)([^\/]+)?$/)[1],r=s+this.options.libPath,l=t.open(this.options.usePreparedWindow?"string"==typeof this.options.usePreparedWindow?this.options.usePreparedWindow:r+"mapbbcode-window.html":"","mapbbcode_editor",n+","+a);if(!this.options.usePreparedWindow){var p='<script src="'+r+'leaflet.js"></script>';p+='<script src="'+r+'leaflet.draw.js"></script>',p+='<script src="'+r+'mapbbcode.js"></script>',p+='<script src="'+r+'mapbbcode-config.js"></script>',p+='<link rel="stylesheet" href="'+r+'leaflet.css" />',p+='<link rel="stylesheet" href="'+r+'leaflet.draw.css" />',p+='<div id="edit"></div>',p+="<script>opener.storedMapBB.caller.editorWindowCallback.call(opener.storedMapBB.caller, window, opener.storedMapBB);</script>",l.document.open(),l.document.write(p),l.document.close()}},editorWindowCallback:function(t,e){t.document.body.style.margin=0;var o=new t.MapBBCode(this.options);o.setStrings(this.strings),o.options.editorHeight="100%",o.editor("edit",e.bbcode,function(o){t.close(),e.callback&&e.callback.call(e.context,o),this.storedMapBB=null},this)}}),"objectParams"in t.MapBBCode||(t.MapBBCode.objectParams=[]),t.MapBBCode.objectParams.push({lineColors:{def:"#0022dd",blue:"#0022dd",red:"#bb0000",green:"#007700",brown:"#964b00",purple:"#800080",black:"#000000"},reKeys:new RegExp("^(blue|red|green|brown|purple|black)$"),applicableTo:function(t){return t instanceof L.Polygon||t instanceof L.Polyline},objectToLayer:function(t,e){var o=this.lineColors,i=e.length>0&&e[0]in o?o[e[0]]:o.def;t.options.color=i,t instanceof L.Polygon&&(t.options.fillColor=i)},layerToObject:function(t,e){return t._colorName?this.lineColors[t._colorName]!==this.lineColors.def?[t._colorName]:[]:e},initLayer:function(){},initDrawControl:function(t){t.options.draw.polyline.shapeOptions.color=this.lineColors.def,t.options.draw.polygon.shapeOptions.color=this.lineColors.def},createEditorPanel:function(t){var o,i=e.createElement("div"),n=[],a=this.lineColors;for(o in a)"string"==typeof a[o]&&"#"===a[o].substring(0,1)&&n.push(o);n=n.sort(),i.style.width=10+20*n.length+"px",i.textAlign="center";for(var s=function(e){var o=e.target.style;if("white"==o.borderColor){t.setStyle({color:o.backgroundColor,fillColor:o.backgroundColor}),t._colorName=e.target._colorName;for(var n=i.childNodes,a=0;a<n.length;a++)n[a].style.borderColor="white";o.borderColor="#aaa"}},r=0;r<n.length;r++)if("def"!==n[r]){var l=e.createElement("div");l._colorName=n[r],l.style.width="16px",l.style.height="16px",l.style.cssFloat="left",l.style.styleFloat="left",l.style.marginRight="3px",l.style.marginBottom="5px",l.style.cursor="pointer";var p=a[n[r]];l.style.backgroundColor=p,l.style.borderWidth="3px",l.style.borderStyle="solid",l.style.borderColor=p==t.options.color?"#aaa":"white",l.onclick=s,i.appendChild(l)}return i}}),L.LetterIcon=L.Icon.extend({options:{className:"leaflet-div-icon",color:"black",radius:11},initialize:function(t,e){this._letter=t,L.setOptions(this,e)},createIcon:function(){var t=this.options.radius,o=2*t+1,i=e.createElement("div");return i.innerHTML=this._letter,i.className="leaflet-marker-icon",i.style.marginLeft=-t-2+"px",i.style.marginTop=-t-2+"px",i.style.width=o+"px",i.style.height=o+"px",i.style.borderRadius=t+2+"px",i.style.borderWidth="2px",i.style.borderColor="white",i.style.fontSize="10px",i.style.fontFamily="sans-serif",i.style.fontWeight="bold",i.style.textAlign="center",i.style.lineHeight=o+"px",i.style.color="white",i.style.backgroundColor=this.options.color,this._setIconStyles(i,"icon"),i},createShadow:function(){return null}}),L.letterIcon=function(t,e){return new L.LetterIcon(t,e)},L.Control.Search=L.Control.extend({options:{position:"topleft",title:"Nominatim Search",email:""},onAdd:function(t){this._map=t;var o=L.DomUtil.create("div","leaflet-bar"),i=e.createElement("div");o.appendChild(i);var n=L.DomUtil.create("a","",i);n.href="#",n.style.width="26px",n.style.height="26px",n.style.backgroundImage="url("+this._icon+")",n.style.backgroundSize="26px 26px",n.style.backgroundRepeat="no-repeat",n.title=this.options.title;var a=L.DomEvent.stopPropagation;L.DomEvent.on(n,"click",a).on(n,"mousedown",a).on(n,"dblclick",a).on(n,"click",L.DomEvent.preventDefault).on(n,"click",this._toggle,this);var s=this._form=e.createElement("form");s.style.display="none",s.style.position="absolute",s.style.left="27px",s.style.top="0px",s.style.zIndex=-10;var r=this._input=e.createElement("input");return r.style.height="25px",r.style.border="1px solid grey",r.style.padding="0 0 0 10px",s.appendChild(r),L.DomEvent.on(s,"submit",function(){return this._doSearch(r.value),!1},this).on(s,"submit",L.DomEvent.preventDefault),o.appendChild(s),o},_toggle:function(){"block"!=this._form.style.display?(this._form.style.display="block",this._input.focus()):this._collapse()},_collapse:function(){this._form.style.display="none",this._input.value=""},_nominatimCallback:function(t){if(t&&t.length>0){var e=t[0].boundingbox;this._map.fitBounds(L.latLngBounds([[e[0],e[2]],[e[1],e[3]]]))}this._collapse()},_callbackId:0,_doSearch:function(o){var i="_l_osmgeocoder_"+this._callbackId++;t[i]=L.Util.bind(this._nominatimCallback,this);var n={q:o,format:"json",limit:1,json_callback:i};this.options.email&&(n.email=this.options.email),this._map.getBounds()&&(n.viewbox=this._map.getBounds().toBBoxString());var a="http://nominatim.openstreetmap.org/search"+L.Util.getParamString(n),s=e.createElement("script");s.type="text/javascript",s.src=a,e.getElementsByTagName("head")[0].appendChild(s)},_icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAL/wAAC/8Bk9f7AQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOnSURBVGiB7ZhPaBxVHMc/vxezuzlsQqQqFf+Af8CLoWgsNHjoYjazbrR4SsGbgkcPInooLb1YRdBDQRCtCp6E3NLDZmendRXpaiC1kXqwh17EixQsmxATk935edhJHELczbydskOZz+m937zf+73v/Gbe+82IqnI3YQa9gLhJBSWdVFDSSQUlnVRQ0kkFJZ174p6wXC5nVXXC9/2RXC53bWFhYS3uGN2QOIrTQqFwKJPJnAGeB54GhoNLCtwAlowxHywuLt7oO1gP+hbkOM4rwGfA/T2GbojIKdd1z+sdLPH7EuQ4zufAGyHTH8BPIrKsqn8Dk8BR4KmdAar63fb29ov1en3TOnAXrN8hx3Fe5z8x/4jI2dHR0Y/m5+fb+4w9KSKfqOohETmezWbPAW/bxu6GVYbK5fJD7Xb7V2AMWPd9/5jnedd7+NzXbrd/BB4HfBE5Xq1Wf7BadRestu1Wq3WejhiAd3uJAahUKrdE5DU6G4VR1S9tYvcisiDpUAy6S7Va7dOD+gYZ+SLoPuk4zsNR4/cisqBisfgEkAdQVTfqjqWqi6H2ZNT4vbDJ0DOh7tWo/qq662OMGbwg4IGdhoj8GdV5fX39Fp33CN/3D1vE70pkQar6S6h9JKp/Pp+fAARARK5F9e+FjaAVgjssIs9axNz1McYsW/h3JbIgz/OawM2ge7JYLD5yUN9CoZAD3gy67WazuRI1fi+sziER+ThojhpjLhzUb3h4+D2CMkhVLzQajQ2b+F3XZlMpiIg4juOp6guB6auhoaG3KpXK6n7j5+bmhprN5jvAOTo3sRVUClesV/5/a7MtTmdnZx9ttVrXCc4k4HcROWOMuVKpVG4ClEqlw8BRVT1Np1ANc1tEpqvV6s+2i9+PvqrtmZmZIyLyNTCx59JtYAN4cI99E8iF+n/5vj/teV5su11fn+C1Wm1lbGzsORF5HwhX2ePsESMi36jqYyLihsz3GmMul0ql8GHdF7F8sUKnAm+1WseMMZNBSTOiqldFZBlYcl33N+jsdJlMZgGYCbnH9vjFJigKgaiLQDFkjkXUQP761Ov1za2trROAFzKPq+qlfh+/gWRoh6mpqZF8Pn8RmA6Z+8rUQP/LNRqNjbW1tRPApZC5r0wN/EfjjigRuRwyjwNnbeYbuCDoiFpdXX0Z+DYwfa+qr9rMlQhBsJupl1T1w2w2W3Zdd91mnoFuCneCxGQoLlJBSScVlHRSQUknFZR0UkFJ564T9C+LGmRQ/iQvLwAAAABJRU5ErkJggg=="}),L.control.search=function(t){return new L.Control.Search(t)},t.MapBBCode.include({strings:{close:"Close",remove:"Delete",apply:"Apply",cancel:"Cancel",title:"Title",zoomInTitle:"Zoom in",zoomOutTitle:"Zoom out",applyTitle:"Apply changes",cancelTitle:"Cancel changes",fullScreenTitle:"Enlarge or shrink map panel",helpTitle:"Open help window",outerTitle:"Show this place on an external map",polylineTitle:"Draw a path",markerTitle:"Add a marker",drawCancelTitle:"Cancel drawing",markerTooltip:"Click map to place marker",polylineStartTooltip:"Click to start drawing a line",polylineContinueTooltip:"Click to continue drawing line",polylineEndTooltip:"Click the last point to finish line",polygonStartTooltip:"Click to start drawing a polygon",polygonContinueTooltip:"Click to continue drawing polygon",polygonEndTooltip:"Click the last point to close this polygon",helpContents:["Map BBCode Editor",'You have opened this help window from inside the map editor. It is activated with "Map" button. When the cursor in the textarea is inside [map] sequence, the editor will edit that bbcode, otherwise it will create new bbcode and insert it at cursor position after clicking "Apply".',"# BBCode","Map BBCode is placed inside <tt>[map]...[/map]</tt> tags. Opening tag may contain zoom with optional position in latitude,longitude format: <tt>[map=10]</tt> or <tt>[map=15,60.1,30.05]</tt>. Decimal separator is always a full stop.",'The tag contains a semicolon-separated list of features: markers and paths. They differ only by a number of space-separated coordinates: markers have one, and paths have more. There can be optional title in brackets after the list: <tt>12.3,-5.1(Popup)</tt> (only for markers in the editor). Title is HTML and can contain any characters, but "(" should be replaced with "\\(", and only a limited set of HTML tags is allowed.','Paths can have different colours, which are stated in <i>parameters</i>: part of a title followed by "|" character. For example, <tt>12.3,-5.1 12.5,-5 12,0 (red|)</tt> will produce a red path.',"# Map Viewer",'Plus and minus buttons on the map change its zoom. Other buttons are optional. A button with four arrows ("fullscreen") expands map view to maximum width and around twice the height. If a map has many layers, there is a layer switcher in the top right corner. There also might be a button with a curved arrow, that opens an external site (usually www.openstreetmap.org) at a position shown on the map.',"You can drag the map to pan around, press zoom buttons while holding Shift key to change zoom quickly, or drag the map with Shift pressed to zoom to an area. Scroll-wheel zoom is disabled in viewer to not interfere with page scrolling, but in works in map editor.","# Editor Buttons",'"Apply" saves map features (or map state if there are none) to a post body, "Cancel" just closes the editor panel. And you have already figured out what the button with a question mark does. Two buttons underneath zoom controls add features on the map.','To draw a path, press the button with a diagonal line and click somewhere on the map. Then click again, and again, until you\'ve got a nice polyline. Do not worry if you got some points wrong: you can fix it later. Click on the final point to finish drawing. Then you may fix points and add intermediate nodes by dragging small square or circular handlers. To delete a path (or a marker), click on it, and in the popup window press "Delete" button.',"Markers are easier to place: click on the marker button, then click on the map. In a popup window for a marker you can type a title: if it is 1 or 2 characters long, the text would appear right on the marker. Otherwise map viewers would have to click on a marker to read the title. A title may contain URLs and line feeds.","# Plugin",'Map BBCode Editor is an open source product, available at <a href="https://github.com/MapBBCode/mapbbcode">github</a>. You will also find there plugins for some of popular forum engines. All issues and suggestions can be placed in the github issue tracker.']}})}(window,document);