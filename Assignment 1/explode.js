//
//CSE 470 HW 1 Explode!  
//
/*
Written by: HW470: ZI JIA TAN
Date: 1/24/2022

Description: 
This program ..... HW470: COMPLETE THIS. DESCRIBE WHAT YOU DID.
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];

//store a color for each vertex
var colors = [];

//HW470: control the explosion
var theta = 0.0;
var thetaLoc;

//HW470: control the redraw rate
var delay = 150;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");
        
    //HW470:
    // Define  data for object 
	// See HW specs for number of vertices and parts required
	// Recommendation: each set of three points corresponds to a triangle.
	// DCH: I have used sval for scaling the object size if I am not
	// happy with my initial design. (Just an idea for you; no need to use.)
	//(During the explosion all geometry must remain in the window.)
    //
	var sval = .3;
    var pi = Math.PI;
    vertices = [
        //first triangle
        vec4(sval, 0, 0, 0),
        vec4(sval * Math.cos(pi/3), sval * Math.sin(pi/3), 0, 0), 
        vec4( 0, 0, 0, 0),
        //second triangle
        vec4(sval * Math.cos(pi/3), sval * Math.sin(pi/3), 0, 0),
        vec4( 0, 0, 0, 0),
        vec4(sval * Math.cos(2*pi/3), sval * Math.sin(2*pi/3),0,0),
        //third triangle
        vec4(0,0,0, 0),
        vec4(sval * Math.cos(2*pi/3), sval * Math.sin(2*pi/3),0, 0),
        vec4(-sval, 0, 0, 0),
        //forth triangle
        vec4(0,0,0, 0),
        vec4(sval * Math.cos(4*pi/3), sval * Math.sin(4*pi/3),0, 0),
        vec4(-sval, 0, 0, 0),
        // fifth triangle
        vec4(sval * Math.cos(4*pi/3), sval * Math.sin(4*pi/3),0, 0),
        vec4(sval * Math.cos(5*pi/3), sval * Math.sin(5*pi/3),0, 0),
        vec4(0,0,0, 0),
        //sixth triangle
        vec4(sval, 0,0, 0),
        vec4(sval * Math.cos(5*pi/3), sval * Math.sin(5*pi/3),0, 0),
        vec4(0,0,0, 0),
        //middle triangle
        vec4(0.866*sval/2, .5*sval/2,0, 0),
        vec4(-0.866*sval/2, .5*sval/2,0, 0),
        vec4(0*sval/2, -1*sval/2,0, 0),

        //outer triangle 1 
        vec4(sval + sval * Math.cos(pi/3), sval * Math.sin(pi/3),1.00, 1.0),
        vec4(sval * Math.cos(pi/3), sval * Math.sin(pi/3),1.00, 1.0),
        vec4(sval, 0,1.00, 1.0),
        //outer triangle 2
        vec4(sval * Math.cos(pi/3), sval * Math.sin(pi/3),0, 0.5),
        vec4(0,2*sval * Math.sin(pi/3),0, 0.5),
        vec4(sval * Math.cos(2*pi/3), sval * Math.sin(2*pi/3),0, 0.5),
        //outer triangle 3
        vec4(-sval + sval * Math.cos(2*pi/3), sval * Math.sin(2*pi/3),-1.0, 1.0),
        vec4(sval * Math.cos(2*pi/3), sval * Math.sin(2*pi/3),-1.0, 1.0),
        vec4(-sval, 0,-1.0, 1.0),
        //outer triangle 4
        vec4(-(sval + sval * Math.cos(pi/3)), -(sval * Math.sin(pi/3)),-1.0, -1.0),
        vec4(-(sval * Math.cos(pi/3)), -(sval * Math.sin(pi/3)),-1.0, -1.0),
        vec4(-sval, 0,-1.0, -1.0),
        //outer triangle 5
        vec4(-sval * Math.cos(pi/3), -sval * Math.sin(pi/3),0, -0.5),
        vec4(0,-2*sval * Math.sin(pi/3),0, -0.5),
        vec4(-sval * Math.cos(2*pi/3), -sval * Math.sin(2*pi/3),0, -0.5),
        //outer triangle 6
        vec4((sval + sval * Math.cos(pi/3)), -(sval * Math.sin(pi/3)), 1.0, -1.0),
        vec4((sval * Math.cos(pi/3)), -(sval * Math.sin(pi/3)), 1.0, -1.0),
        vec4(sval, 0, 1.0, -1.0)
    ];

	//HW470: Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < vertices.length; i++) {
        var tempcolor1;
        var tempcolor2;
        var tempcolor3;
        if(i%3 == 0)
        {
            tempcolor1 = Math.random();
            tempcolor2 = Math.random();
            tempcolor3 = Math.random();
        }
        colors.push(vec3(tempcolor1, tempcolor2, tempcolor3));
	};

	// HW470: Print the input vertices and colors to the console
	console.log("Input vertices and colors:");
    //print the coordinates of all triangles for debugging
      for(let i = 0; i < vertices.length; i++)
      {
          console.log(vertices[i]);
      }
      //print colors 
      for(let i = 0; i < colors.length; i++)
      {
          console.log(colors[i]);
      }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    //theta animation
    thetaLoc = gl.getUniformLocation( program, "theta" );

    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	
    // var vPosition2 = gl.getAttribLocation( program, "vPosition2" );
    // gl.vertexAttribPointer( vPosition2, 2, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( vPosition2 );
	//HW470: associate shader explode variable ("Loc" variables defined here) 
     

    console.log("Data loaded to GPU -- Now call render");

    render();
};


// =============== function render ======================

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	//HW470: send uniform(s) to vertex shader
    theta += (0.04);
	if(theta >= 1.0)
    {
        theta = 0.0;
    }

    gl.uniform1f(thetaLoc, theta);

	//HW470: draw the object
	// You will need to change this to create the exploding outer parts effect
	// Hint: you will need more than one draw function call
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length );
    
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}

