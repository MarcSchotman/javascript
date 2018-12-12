// the demo has a cat that has been labeled in the instance segmentation stage.
// in the MS COCO paper, we stopped annotating individual instance and switched to crowd annotation when there are 10+ instance have been annotated.
// for simplicity, this demo only shows one annotated cat.
// polys: [instance1, instance2]
// instance: [polygon1, polygon2]
// polygon: [x1,y1,x2,y2,...,xn,yn] x, y are fractions of image width and height

var baseLayer = new Kinetic.Layer();
var glassLayer = new Kinetic.Layer();
var baseDrawLayer = new Kinetic.Layer();
var explicitLayer = new Kinetic.Layer();
var glassDrawLayer = new Kinetic.Layer();
var testLayer = new Kinetic.Layer();

var glassmask;
var baseDraw;
var glassDraw;

var explicitDrawImg = new Image();
var isdrew = false;
//var isdrew = true;

var R = 30;
var zoom = 2;
var maxZoom = 10;
var opacityDraw = 0.7;

var lensInnerColor = 'white'
var lensOuterColor = 'white'

var lineThickness = 10;
var thicknessLens = 5;
var painting = false;
var startX;
var startY;
var drawColor;// = window.getComputedStyle(btn1).backgroundColor; ;
var maxWidth = 1200;



function resize(img, maxwidth) {
    var w = img.width, h = img.height;
    var r = maxwidth / w;
    if (r < 1) {
        img.width = w * r;
        img.height = h * r;
    }
    return r;
}

imageObj = new Image();
imageObj.onload = function () {

    scale = resize(imageObj, maxWidth);

    var stage = new Kinetic.Stage({
        container: 'container',
        width: imageObj.width,
        height: imageObj.height
    });
    stage.states = new Object();
    stage.statesisdrawbrush = true;


    // var sizer=scalePreserveAspectRatio(imageObj.width,imageObj.height, maxWidth,maxHeight);
    // /* initialize explicit layer */
    var canvas = $('#canvas-img');
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;

    // // hidden context for drawing
    // var ctx_img = canvas[0].getContext("2d");
    // ctx_img.drawImage(imageObj,0,0,imageObj.width, imageObj.height, 0,0, canvas.width,canvas.height)

    explicitDrawImg = imageObj.cloneNode();
    /* ======= base image layer ==============*/

    var imageBase = new Kinetic.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: imageObj.width,
        height: imageObj.height
    });

    // add the shape to the layer
    baseLayer.add(imageBase);

    // add the layer to the stage
    stage.add(baseLayer);

    /* ======= magnifying glass layer ==============*/


    var glass = new Kinetic.Circle({
        fillPatternImage: imageObj,
        fillPatternScaleX: zoom,
        fillPatternScaleY: zoom,
        fillPatternOffsetX: 0,
        fillPatternOffsetY: 0,
        width: imageObj.width,
        height: imageObj.height,
        x: 256,
        y: 256,
        radius: R * 4,
        stroke: lensOuterColor,
        strokeWidth: thicknessLens,
        opacity: 1,
    });
    console.log(glass)

    glassmask = new Kinetic.Circle({

        x: 256,
        y: 256,
        radius: R,
        stroke: lensInnerColor,//String(drawColor),
        fill: drawColor,
        opacity: 0.5,
    });

    glassLayer.add(glass);
    glassLayer.add(glassmask);
    stage.add(glassLayer);
    glassLayer.moveToTop();



    function glassMove(x, y) {

        glass.x(x);
        glass.y(y);
        glassDraw.x(x);
        glassDraw.y(y);
        glassDraw.fillPatternImage(explicitDrawImg);
        glassZoom();
    }
    console.log(scale)

    function glassZoom() {
        var x = glass.x();
        var y = glass.y();

        if (zoom <= 1) {
            glass.radius(R * 4);
            glass.fillPatternOffsetX(x / scale);
            glass.fillPatternOffsetY(y / scale);
            glass.fillPatternScaleX(1.0 * scale);
            glass.fillPatternScaleY(1.0 * scale);

            glassmask.radius(R / zoom);
            glassmask.x(x);
            glassmask.y(y);

            glassDraw.fillPatternOffsetX(x);
            glassDraw.fillPatternOffsetY(y);
            glassDraw.fillPatternScaleX(1.0);
            glassDraw.fillPatternScaleY(1.0);
        } else {
            glass.radius(R * 4);
            glass.fillPatternOffsetX(x / scale);
            glass.fillPatternOffsetY(y / scale);
            glass.fillPatternScaleX(zoom * scale);
            glass.fillPatternScaleY(zoom * scale);

            glassmask.radius(R);
            glassmask.x(x);
            glassmask.y(y);

            glassDraw.fillPatternOffsetX(x);
            glassDraw.fillPatternOffsetY(y);
            glassDraw.fillPatternScaleX(zoom);
            glassDraw.fillPatternScaleY(zoom);
        }

        glassDrawLayer.draw();
        glassLayer.draw();
        /* hide drawing shape */
        glassLayer.moveToTop()
        glassDrawLayer.moveToTop();
        if (!isdrew) { glassLayer.moveToTop(); }

    }

    /* ============ drawing layer ==============*/
    stage.add(baseDrawLayer);
    stage.on('mousedown', onmousedown);
    function onmousedown(ev) {
        startX = ev.evt.x - $('#container').position().left + window.pageXOffset;;
        startY = ev.evt.y - $('#container').position().top + window.pageYOffset;
        if (typeof startX === 'undefined') {
            startX = ev.evt.clientX - $('#container').position().left + window.pageXOffset;
            startY = ev.evt.clientY - $('#container').position().top + window.pageYOffset;
        }
        painting = true;
        if (zoom < 1) {
            var lineThickness = R / zoom;
        } else {
            var lineThickness = R / zoom;
        }
        brush_draw(startX, startY, lineThickness);
    }
    stage.on('mouseup', function (ev) {
        painting = false;
    });

    stage.on('mousemove', onmousemove)
    function onmousemove(ev) {
        if (zoom < 1) {
            var lineThickness = R / zoom;
        } else {
            var lineThickness = R / zoom;
        }

        var mouseX = ev.evt.x - $('#container').position().left + window.pageXOffset;;
        var mouseY = ev.evt.y - $('#container').position().top + window.pageYOffset;
        if (typeof mouseX === 'undefined') {
            mouseX = ev.evt.clientX - $('#container').position().left + window.pageXOffset;;
            mouseY = ev.evt.clientY; - $('#container').position().top + window.pageYOffset;
        }
        glassMove(mouseX, mouseY);

        if (!painting) {
            return;
        }
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        var rectCount = Math.sqrt(dx * dx + dy * dy) / (lineThickness);

        if (rectCount <= 1) {
            brush_draw(mouseX, mouseY, lineThickness);
        } else {
            for (var i = 0; i < rectCount; i++) {
                // calc an XY between starting & ending drag points
                var nextX = startX + dx * i / rectCount;
                var nextY = startY + dy * i / rectCount;
                brush_draw(nextX, nextY, lineThickness);
            }
        }
        startX = mouseX;
        startY = mouseY;
    }


    /* draw image */
    // draw image onload
    explicitDrawImg.onload = function () {
        stage.states.isdrawbrush = true;
    }
    var baseDraw = new Kinetic.Image({
        x: 0,
        y: 0,
        width: imageObj.width,
        height: imageObj.height,
    });
    baseDrawLayer.add(baseDraw);


    var tmpDrawLayer = new Kinetic.Layer();

    function brush_draw(x, y, lineThickness) {
        // create a new canvas that renders circle
        var _R = Math.round(lineThickness);
        var tmpDraw = new Kinetic.Circle({
            x: x,
            y: y,
            fill: drawColor,
            radius: _R,
            opacity: opacityDraw,
        });

        stage.add(tmpDrawLayer);
        tmpDrawLayer.moveToBottom();
        tmpDrawLayer.add(tmpDraw);
        tmpDrawLayer.draw();

        var ctx = tmpDrawLayer.getContext();
        var drawData = ctx.getImageData(x - _R, y - _R, 2 * _R + 1, 2 * _R + 1);
        tmpDraw.remove()

        var ctx = baseDrawLayer.getContext();

        var imgData = ctx.getImageData(x - _R, y - _R, 2 * _R + 1, 2 * _R + 1);
        //console.log(drawColor)

        var RGB = drawColor.slice(4, -1);
        var R = parseInt(RGB.split(",")[0]);
        var G = parseInt(RGB.split(",")[1]);
        var B = parseInt(RGB.split(",")[2]);

        if (draw_state == DRAW) {

            for (i = 0; i < imgData.data.length; i += 4) {

                if (drawData.data[i + 3] != 0) {
                    imgData.data[i] = R;
                    imgData.data[i + 1] = G;
                    imgData.data[i + 2] = B;
                    imgData.data[i + 3] = parseInt(opacityDraw * 255);
                }

            }
        } else if (draw_state == ERASE) {
            for (i = 0; i < imgData.data.length; i += 4) {
                if (drawData.data[i + 3] != 0) {
                    imgData.data[i] = R;
                    imgData.data[i + 1] = G;
                    imgData.data[i + 2] = B;
                    imgData.data[i + 3] = 0;
                }
                
            }
        }
        ctx.putImageData(imgData, x - _R, y - _R);


        stage.states.isdrawbrush = false;
        explicitDrawImg.src = baseDrawLayer.getCanvas().toDataURL();
        baseDraw.fillPatternImage(explicitDrawImg);
        isdrew = true;
    } // draw brush end

    /* draw image in glass */
    glassDraw = new Kinetic.Circle({
        fillPatternImage: imageObj,
        fillPatternScaleX: zoom,
        fillPatternScaleY: zoom,
        fillPatternOffsetX: 256,
        fillPatternOffsetY: 256,
        x: 256,
        y: 256,
        radius: R * 4,
        opacity: 1,
    });
    console.log(glassDraw)
    glassDraw.setStroke(null);
    glassDrawLayer.add(glassDraw);
    stage.add(glassDrawLayer);
    glassDrawLayer.draw();


    // keyboard event
    $(document).keypress(function (ev) {
        if (ev.which == 90 || ev.which == 122){
            if (zoom <8){ zoom += 0.25;}
              glassZoom();
          }
          if (ev.which == 88 || ev.which == 120){
            if (zoom > 0.25){zoom -= 0.25;}
            else{zoom = 0.25}
            glassZoom();
          }
          if (ev.which == 68 || ev.which == 100){
            if (draw_state != DRAW){
                draw_state_toggle(drawColor);
            }
              glassZoom();
          }
          if (ev.which == 69 || ev.which == 101){
            if (draw_state != ERASE){
                draw_state_toggle(drawColor);
            }
              glassZoom();
          }
        
    });
    var handleWheel = function (event) {
        // cross-browser wheel delta
        // Chrome / IE: both are set to the same thing - WheelEvent for Chrome, MouseWheelEvent for IE
        // Firefox: first one is undefined, second one is MouseScrollEvent
        var e = window.event || event;
        // Chrome / IE: first one is +/-120 (positive on mouse up), second one is zero
        // Firefox: first one is undefined, second one is -/+3 (negative on mouse up)
        var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));

        // Do something with `delta`
        if (delta > 0) {
            if (zoom < maxZoom) { zoom += 0.25; }
            glassZoom();
        }
        else if (delta < 0) {
            if (zoom > 0.25) { zoom -= 0.25; }
            else { zoom = 0.25 }
            glassZoom();
        }

        e.preventDefault();
    };

    var addMouseWheelEventListener = function (scrollHandler) {
        if (window.addEventListener) {
            // IE9+, Chrome, Safari, Opera
            window.addEventListener("mousewheel", scrollHandler, false);
            // Firefox
            window.addEventListener("DOMMouseScroll", scrollHandler, false);
        }
        else {
            // // IE 6/7/800px	
            window.attachEvent("onmousewheel", scrollHandler);
        }
    }
    addMouseWheelEventListener(handleWheel);
};

function download(filename) {
    /// create an "off-screen" anchor tag
    canvas = baseDrawLayer.getCanvas();
    context = canvas.getContext();

    canvasData = context.getImageData(0, 0, imageObj.width, imageObj.height);

    for (i = 0; i < canvasData.data.length; i += 4) {
        canvasData.data[i + 3] = 255;
    }
    context.putImageData(canvasData, 0, 0);

    var lnk = document.createElement('a'), e;

    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    lnk.href = canvas.toDataURL("image/png;base64");

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null);

        lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
        lnk.fireEvent("onclick");
    }
}



$(document).ready(function () {

    function changeDrawColor(button) {
        drawColor = window.getComputedStyle(button).backgroundColor;

        //Dunno why but this is nesceserry.... But it is.
        draw_state = ERASE;
        //trigger brush color inside magnifying glass
        jQuery.event.trigger({ type: 'keypress', which: 68 });
        draw_state = DRAW;
    }

    var btnDownload = document.getElementById("btndownload");
    btnDownload.onclick = function () {

        download('jatog.png');
    }
    var btn1 = document.getElementById("btnmarker1");
    btn1.onclick = function () {
        changeDrawColor(this);;
        //drawGlassBrush();
    };
    //Initiate first drawing color
    btn1.onclick();


    var btn2 = document.getElementById("btnmarker2");
    btn2.onclick = function () {
        changeDrawColor(this);
    };
    var btn3 = document.getElementById("btnmarker3");
    btn3.onclick = function () {
        changeDrawColor(this);
    };
    var btn4 = document.getElementById("btnmarker4");
    btn4.onclick = function () {
        changeDrawColor(this);
    };
    var btn5 = document.getElementById("btnmarker5");
    btn5.onclick = function () {
        changeDrawColor(this);
    };

    $(document).keypress(function (ev){
        if (ev.key=="a"){
            btn1.onclick()
        }
        if (ev.key=="z"){
            btn2.onclick()
        }
        if (ev.key=="e"){
            btn3.onclick()
        }
        if (ev.key=="q"){
            btn4.onclick()
        }
        if (ev.key=="s"){
            btn5.onclick()
        }
    })

})


// image load end
// loading demo image here

imageObj.src = STATIC_ROOT + '/some.png'

