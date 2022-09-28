
var canvas;
var gl;
var uModelView; 

var points = [];
var colors = [];
var cubeArray= [];

//default values
var xAxis = vec3(1, 0, 0);
var yAxis = vec3(0, 1, 0);
var zAxis = vec3(0, 0, 1);
var axis = zAxis;
var scale = 0.1;
var index = 0;
var NumVertices  = 36; 


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    uModelView = gl.getUniformLocation( program, "uModelView" ); 


    //event listeners
    canvas.addEventListener("mousedown", function(){

        console.log("mousedown x,y = ",event.clientX,"  ", event.clientY);

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		
		var screenx = event.clientX - canvas.offsetLeft;
		var screeny = event.clientY - canvas.offsetTop;
		  
		var posX = 2*screenx/canvas.width-1;
		var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
        posZ = Math.random();
	    console.log("  clip coord x=",posX,"  y=",posY);
        addCube({
            speed: random(-1, 1),
            rotation: rotateZ(random(0,360)),
            center: translate(0,0,0),
            translation: translate(posX, posY, posZ),
            scaling: scalem(scale, scale, scale)
        })

    } );


    document.getElementById( "xButton" ).onclick = function () {
        console.log("pressed x");
        axis = xAxis;
        cubeArray.forEach(cube => {
            cube.rotation = rotate(random(0,360),axis)
        })
    };
    document.getElementById( "yButton" ).onclick = function () {
       console.log("pressed y");
        axis = yAxis;
        cubeArray.forEach(cube => {
            cube.rotation = rotate(random(0,360),axis)
        })
    };
    document.getElementById( "zButton" ).onclick = function () {
        console.log("pressed z");
        axis = zAxis;
        cubeArray.forEach(cube => {
            cube.rotation = rotate(random(0,360),axis)
        })
    };
    
    document.getElementById( "rButton" ).onclick = function () {
        console.log("pressed r");
        axis = vec3(random(-1,1), random(-1,1), random(-1,1));
        console.log("axis: ", axis);
        cubeArray.forEach(cube => {
            cube.rotation = rotate(random(0,360),axis)
        })
    };

    document.getElementById("slider").onchange = function() {
        scale = event.srcElement.value/100;
		console.log("scale = ",scale);
        cubeArray.forEach(cube => {
            cube.scaling = scalem(scale, scale, scale)
        })
    };

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cubeArray.forEach(cube => {
        cube.rotation = mult(rotate(cube.speed, axis), cube.rotation)
        cube.transform = mult(cube.translation, mult(mult(cube.scaling, cube.rotation), cube.center))
        gl.uniformMatrix4fv(uModelView, false, flatten(cube.transform));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    })
    requestAnimFrame(render);
}


function addCube(cube) {
    cubeArray.push(cube);
    console.log('New cube!');
    console.log(`Center: (${cube.translation[0][3]},${cube.translation[1][3]},${cube.translation[2][3]})`);
    console.log(`Speed: ${cube.speed}`);
}
