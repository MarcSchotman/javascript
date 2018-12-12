/**
 * blowup.js
 * Paul Krishnamurthy 2016
 *
 * https://paulkr.com
 * paul@paulkr.com
 */

$(function ($) {

  $.fn.blowup = function (attributes) {

    var $element = this;

    // If the target element is not an image
    if (!$element.is("img")) {
      console.log("%c Blowup.js Error: " + "%cTarget element is not an image.", 
        "background: #FCEBB6; color: #F07818; font-size: 17px; font-weight: bold;",
        "background: #FCEBB6; color: #F07818; font-size: 17px;");
      return;
    }

    // Constants
    var $IMAGE_URL    = $element.attr("src");
    var $IMAGE_WIDTH  = $element.width();
    var $IMAGE_HEIGHT = $element.height();
    var NATIVE_IMG    = new Image();
    NATIVE_IMG.src    = $element.attr("src");

    // Default attributes
    var defaults = {
      round      : true,
      width      : 200,
      height     : 200,
      background : "#FFF",
      shadow     : "0 8px 17px 0 rgba(0, 0, 0, 0.2)",
      border     : "6px solid #FFF",
      cursor     : true,
      zIndex     : 999999,
      scale      : 1,
      dataCanvas : "",

    }
    var UID = {
      _current: 0,
      getNew: function(){
        this._current++;
        return this._current;
      }
    };
    
    HTMLElement.prototype.pseudoStyle = function(element,prop,value){
      var _this = this;
      var _sheetId = "pseudoStyles";
      var _head = document.head || document.getElementsByTagName('head')[0];
      var _sheet = document.getElementById(_sheetId) || document.createElement('style');
      _sheet.id = _sheetId;
      var className = "pseudoStyle" + UID.getNew();
      
      _this.className +=  " "+className; 
      
      _sheet.innerHTML += " ."+className+":"+element+"{"+prop+":"+value+"}";
      _head.appendChild(_sheet);
      return this;
    };

    // Update defaults with custom attributes
    var $options = $.extend(defaults, attributes);

    // Modify target image
    $element.on('dragstart', function (e) { e.preventDefault(); });
    $element.css("cursor", $options.cursor ? "crosshair" : "none");

    // Create magnification lens element
    var lens = document.getElementById("BlowupLens");
  //  lens.id = "BlowupLens";

  //   // Append the element to the body
  //   $("body").append(lens);

    // Updates styles
    $blowupLens = $("#BlowupLens");
    console.log($blowupLens)

    $blowupLens.css({
      "position"          : "absolute",
      "visibility"        : "hidden",
      "pointer-events"    : "none",
      "zIndex"            : $options.zIndex,
      "width"             : $options.width,
      "height"            : $options.height,
      "border"            : $options.border,
      "background"        : $options.background,
      "border-radius"     : $options.round ? "50%" : "none",
      "box-shadow"        : $options.shadow,
      "background-repeat" : "no-repeat",
    });

    // // Show magnification lens
     $element.mouseenter(function () {
      $blowupLens.css("visibility", "visible");
     
     })

    // Mouse motion on image
    $element.mousemove(function (e) {
      //console.log("in blowup:",$options.pageY,$options.pageX);

      // /console.log($options.pageY,y)
      var lensX = e.pageX - $options.width / 2;
      var lensY = e.pageY - $options.height / 2;

      // Relative coordinates of image
      var relX = e.pageX - $(this).offset().left;
      var relY = e.pageY - $(this).offset().top;
     
      // Zoomed image coordinates 
      
      var zoomX = -Math.floor(relX / $element.width() * (NATIVE_IMG.width * $options.scale) - $options.width / 2);
      var zoomY = -Math.floor(relY / $element.height() * (NATIVE_IMG.height * $options.scale) - $options.height / 2);
      
      var backPos = zoomX + "px " + zoomY + "px";
      var backgroundSize = NATIVE_IMG.width * $options.scale + "px " + NATIVE_IMG.height * $options.scale + "px";
      // Apply styles to lens
      //console.log($options.dataCanvas)
      //url('" +  $IMAGE_URL + "'),
      $blowupLens.css({
        left                  : lensX,
        top                   : lensY,
        "background-image"    : "url('"+$IMAGE_URL+"')",
        "background-size"     : backgroundSize,
        "background-position" : backPos,
        //"background-repeat"   : "no-repeat",
      });

    })
    // Hide magnification lens
    $element.mouseleave(function () {
      $blowupLens.css("visibility", "hidden");
    })

  }
})
