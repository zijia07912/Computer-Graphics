//name: Zi Jia Tan
var canvas;
var gl;
var program1, program2;
var SORtheta = 360;
var maxZ = 0;

var Cylinder =
{
	minmax: null,
	drawNormal: null,
	indices: null,
	vertices: null,
	normal: null,
};

var Crock =
{
	minmax: null,
	drawNormal: null,
	indices: null,
	vertices: null,
	normal: null,
};
var currentShape, currentMaterial;

var shininessSlider, fovSlider;
var normalFlag = false, eyelight = false;
//light properties
var light = {
    position: vec4(1.0, 1.0, 1.0, 1.0),
	ambient: vec4(0.3, 0.3, 0.3, 1.0),
    diffuse: vec4(1.0, 1.0, 1.0, 1.0),
	specular: vec4(1.0, 1.0, 1.0, 1.0),
};

//material 1: chrome
var chrome = {
    ambient: vec4(0.25, 0.25, 0.25, 1.0),
    diffuse: vec4(0.4, 0.4, 0.4, 1.0),
    specular: vec4(0.774597, 0.774597, 0.774597, 1.0),
    shininess: 60,
};

//material 2: turqoise
var turqoise = {
    ambient: vec4(0.1, 0.18725, 0.1745, 1.0),
    diffuse: vec4(0.396, 0.74151, 0.69102, 1.0),
    specular: vec4(0.297254, 0.30829, 0.306678, 1.0),
    shininess: 10,
};

//view property
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};

// perspective property
var perspProj = 
 {
	fov: 60,
	aspect: 1,
	near: 0.1,
	far:  10
 };

// mouse interaction
var mouse =
{
    prevX: 0,
    prevY: 0,
    leftDown: false,
    rightDown: false,
};

//matrix variables
var mvMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalprojMatrixLoc, normalmvMatrixLoc;
var lightprojMatrixLoc, lightmvMatrixLoc;

//buffer variables for program1
var vBuffer, vPosition, normalBuffer, vNormal, indicesBuffer;
var lightBuffer, lightPosition, lightColorLoc, specularColorLoc;

//buffer variables for program2
var nBuffer, nPosition;

// material variable
var lightPositionLoc, ambientProductLoc, diffuseProductLoc, specularProductLoc, shininessLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
	shininessSlider = document.getElementById("shininess");
	fovSlider = document.getElementById("fov");
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    perspProj.aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    program2 = initShaders( gl, "normal-shader", "fragment-shader2" );

	cylinder();
	crock();
	
	Cylinder =
	{
		minmax: CYmaxZ,
		drawNormal: CYdrawNormal,
		indices: CYindiceArray,
		vertices: CYverticeArray,
		normal: CYnormalArray,
	};
	Crock =
	{
		minmax: GOmaxZ,
		drawNormal: GOdrawNormal,
		indices: GOindiceArray,
		vertices: GOverticeArray,
		normal: GOnormalArray,
	};

	console.log(`Cylinder minmax: (-${Cylinder.minmax}, 1, ${Cylinder.minmax})`);
	console.log(`Crock minmax: (-${Crock.minmax}, 1, ${Crock.minmax})`);

    //compute light properties for materials
    chrome.ambientProduct = mult(chrome.ambient, light.ambient);
    chrome.diffuseProduct = mult(chrome.diffuse, light.diffuse);
    chrome.specularProduct = mult(chrome.specular, light.specular);

    turqoise.ambientProduct = mult(turqoise.ambient, light.ambient);
    turqoise.diffuseProduct = mult(turqoise.diffuse, light.diffuse);
    turqoise.specularProduct = mult(turqoise.specular, light.specular);

    gl.useProgram( program1 );
        // vertex array attribute buffer
        vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        vPosition = gl.getAttribLocation( program1, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        normalBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );

		vNormal = gl.getAttribLocation( program1, "vNormal" );
  		gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
  		gl.enableVertexAttribArray( vNormal );

		indicesBuffer = gl.createBuffer();
    	

		lightBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, lightBuffer );

		lightPosition = gl.getAttribLocation( program1, "vPosition" );
		gl.vertexAttribPointer( lightPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( lightPosition );

	gl.useProgram( program2 );
		nBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );

		nPosition = gl.getAttribLocation( program1, "vPosition" );
		gl.vertexAttribPointer( nPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( nPosition );


	// get all material properties and pre-calculate (use chrome as default)
	gl.useProgram(program1);
		lightPositionLoc = gl.getUniformLocation( program1, "lightPosition");
		ambientProductLoc = gl.getUniformLocation( program1, "ambientProduct");
		diffuseProductLoc = gl.getUniformLocation( program1, "diffuseProduct");
		specularProductLoc = gl.getUniformLocation( program1, "specularProduct");
		shininessLoc = gl.getUniformLocation( program1, "shininess");

		

	//initialize the shapes and material
	currentShape = Cylinder;
	maxZ = currentShape.minmax;
	viewer.eye = vec3(0.0, 0.0, 3*maxZ);
	viewer.radius = 3*maxZ;
	gl.useProgram( program1 );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.vertices), gl.STATIC_DRAW );

	gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.normal), gl.STATIC_DRAW );

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(currentShape.indices), gl.STATIC_DRAW );

	gl.useProgram( program2 );
	gl.vertexAttribPointer( nPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( nPosition );
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.drawNormal), gl.STATIC_DRAW );

	gl.useProgram(program1);
	currentMaterial = chrome;
		gl.uniform4fv(ambientProductLoc, flatten(currentMaterial.ambientProduct));
		gl.uniform4fv(diffuseProductLoc, flatten(currentMaterial.diffuseProduct));
		gl.uniform4fv(specularProductLoc, flatten(currentMaterial.specularProduct));
		shininessSlider.value = currentMaterial.shininess;

    fovSlider.value = perspProj.fov;
	viewer.eye = vec3(0.0, 0.0, 3*maxZ);
	viewer.radius = 3*maxZ;
    mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
	projectionMatrix = perspective(fovSlider.value, perspProj.aspect, perspProj.near, perspProj.far);
	console.log(`Initial view: Eye = (${viewer.eye}), At = (${viewer.at}), Up = (${viewer.up})`);
	console.log(`Initial perspective: FoV = (${perspProj.fov}), Aspect = (${perspProj.aspect}), 
				Near = (${perspProj.near}), Far = (${perspProj.far})`);
	console.log(`Initial light position: (${light.position})`);			
    modelViewMatrixLoc = gl.getUniformLocation( program1, "mvMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program1, "projMatrix" );

	normalprojMatrixLoc = gl.getUniformLocation(program2, "projMatrix");
	normalmvMatrixLoc = gl.getUniformLocation( program2, "mvMatrix" );




	// ========================== Button and slider event listener ==============================
	document.getElementById("cylinder").onclick = function()
	{
		currentShape = Cylinder;
		maxZ = currentShape.minmax;
		viewer.eye = vec3(0.0, 0.0, 3*maxZ);
		viewer.radius = 3*maxZ;
		gl.useProgram( program1 );
		gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.vertices), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.normal), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(currentShape.indices), gl.STATIC_DRAW );

		gl.useProgram( program2 );
		gl.vertexAttribPointer( nPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( nPosition );
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.drawNormal), gl.STATIC_DRAW );
	};
	document.getElementById("crock").onclick = function()
	{
		currentShape = Crock;
		maxZ = currentShape.minmax;
		viewer.eye = vec3(0.0, 0.0, 3*maxZ);
		viewer.radius = 3*maxZ;
		gl.useProgram( program1 );
		gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.vertices), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.normal), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(currentShape.indices), gl.STATIC_DRAW );

		gl.useProgram( program2 );
		gl.vertexAttribPointer( nPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( nPosition );
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.drawNormal), gl.STATIC_DRAW );
	};
    document.getElementById("chrome").onclick = function()
	{
		gl.useProgram(program1);
		currentMaterial = chrome;
		gl.uniform4fv(ambientProductLoc, flatten(currentMaterial.ambientProduct));
		gl.uniform4fv(diffuseProductLoc, flatten(currentMaterial.diffuseProduct));
		gl.uniform4fv(specularProductLoc, flatten(currentMaterial.specularProduct));
		shininessSlider.value = currentMaterial.shininess;
		
	};
    document.getElementById("turqoise").onclick = function()
	{
		gl.useProgram(program1);
		currentMaterial = turqoise;
		gl.uniform4fv(ambientProductLoc, flatten(currentMaterial.ambientProduct));
		gl.uniform4fv(diffuseProductLoc, flatten(currentMaterial.diffuseProduct));
		gl.uniform4fv(specularProductLoc, flatten(currentMaterial.specularProduct));
		shininessSlider.value = currentMaterial.shininess;
	};
    document.getElementById("eyelight").onclick = function()
	{
		gl.useProgram(program1);
		if (eyelight) 
		{
			light.position = vec4(1.0, 1.0, 1.0, 1.0);
			console.log(`Light position: (${light.position})`);
			eyelight = false;
		} 
		else 
		{
			light.position = vec4(0.0, 0.0, 0.0, 0.0);
			console.log(`Light position: (${light.position})`);
			eyelight = true;
		}
	};
    document.getElementById("normal").onclick = function()
	{
		normalFlag = !normalFlag;
	};
	document.getElementById("whiteLight").onclick = function()
	{
		light.ambient= vec4(0.3, 0.3, 0.3, 1.0);
		light.specular= vec4(1.0, 1.0, 1.0, 1.0);

		currentMaterial.ambientProduct = mult(currentMaterial.ambient, light.ambient);
		currentMaterial.specularProduct = mult(currentMaterial.specular, light.specular);
		gl.uniform4fv(ambientProductLoc, flatten(currentMaterial.ambientProduct));
		gl.uniform4fv(specularProductLoc, flatten(currentMaterial.specularProduct));
	};
	document.getElementById("redLight").onclick = function()
	{
		light.ambient= vec4(1.0, 0.6, 0.6, 1.0);
		light.specular= vec4(1.0, 0.2, 0.2, 1.0);

		currentMaterial.ambientProduct = mult(currentMaterial.ambient, light.ambient);
		currentMaterial.specularProduct = mult(currentMaterial.specular, light.specular);

		gl.uniform4fv(ambientProductLoc, flatten(currentMaterial.ambientProduct));
		gl.uniform4fv(specularProductLoc, flatten(currentMaterial.specularProduct));
	};

    // ========================== Camera control via mouse ============================================
	// There are 4 event listeners: onmouse down, up, leave, move
	//
	// on onmousedown event
	// check if left/right button not already down
	// if just pressed, flag event with mouse.leftdown/rightdown and stores current mouse location
    document.getElementById("gl-canvas").onmousedown = function (event)
    {
        if(event.button == 0 && !mouse.leftDown)
        {
            mouse.leftDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
        else if (event.button == 2 && !mouse.rightDown)
        {
            mouse.rightDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
    };

	// onmouseup event
	// set flag for left or right mouse button to indicate that mouse is now up
    document.getElementById("gl-canvas").onmouseup = function (event)
    {
        // Mouse is now up
        if (event.button == 0)
        {
            mouse.leftDown = false;
        }
        else if(event.button == 2)
        {
            mouse.rightDown = false;
        }

    };

	// onmouseleave event
	// if mouse leaves canvas, then set flags to indicate that mouse button no longer down.
	// This might not actually be the case, but it keeps input from the mouse when outside of app
	// from being recorded/used.
	// (When re-entering canvas, must re-click mouse button.)
    document.getElementById("gl-canvas").onmouseleave = function ()
    {
        // Mouse is now up
        mouse.leftDown = false;
        mouse.rightDown = false;
    };

	// onmousemove event
	// Move the camera based on mouse movement.
	// Record the change in the mouse location
	// If left mouse down, move the eye around the object based on this change
	// If right mouse down, move the eye closer/farther to zoom
	// If changes to eye made, then update modelview matrix

    document.getElementById("gl-canvas").onmousemove = function (event)
    {
		// only record changes if mouse button down
		if (mouse.leftDown || mouse.rightDown) {
			
			// Get changes in x and y at this point in time
			var currentX = event.clientX;
			var currentY = event.clientY;
			
			// calculate change since last record
			var deltaX = event.clientX - mouse.prevX;
			var deltaY = event.clientY - mouse.prevY;

			// Compute camera rotation on left click and drag
			if (mouse.leftDown)
			{				
				// Perform rotation of the camera
				//
				if (viewer.up[1] > 0)
				{
					viewer.theta -= 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				else
				{
					viewer.theta += 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				
				// Wrap the angles
				var twoPi = 6.28318530718;
				if (viewer.theta > twoPi)
				{
					viewer.theta -= twoPi;
				}
				else if (viewer.theta < 0)
				{
					viewer.theta += twoPi;
				}

				if (viewer.phi > twoPi)
				{
					viewer.phi -= twoPi;
				}
				else if (viewer.phi < 0)
				{
					viewer.phi += twoPi;
				}

			} // end mouse.leftdown
			else if(mouse.rightDown)
			{
				
				// Perform zooming; don't get too close           
				viewer.radius -= 0.01 * deltaX;
				viewer.radius = Math.max(0.1, viewer.radius);
			}
			
			
			// Recompute eye and up for camera
			var threePiOver2 = 4.71238898;
			var piOver2 = 1.57079632679;		
			var pi = 3.14159265359;
			
			//console.log("viewer.radius = ",viewer.radius);
			
			// pre-compute this value
			var r = viewer.radius * Math.sin(viewer.phi + piOver2);
			
			// eye on sphere with north pole at (0,1,0)
			// assume user init theta = phi = 0, so initialize to pi/2 for "better" view
			
			viewer.eye = vec3(r * Math.cos(viewer.theta + piOver2), viewer.radius * Math.cos(viewer.phi + piOver2), r * Math.sin(viewer.theta + piOver2));
			
			//add vector (at - origin) to move 
			for(k=0; k<3; k++)
				viewer.eye[k] = viewer.eye[k] + viewer.at[k];
			
			//console.log("theta=",viewer.theta,"  phi=",viewer.phi);
			//console.log("eye = ",viewer.eye[0],viewer.eye[1],viewer.eye[2]);
			//console.log("at = ",viewer.at[0],viewer.at[1],viewer.at[2]);
			//console.log(" ");
			
			// modify the up vector
			// flip the up vector to maintain line of sight cross product up to be to the right
			// true angle is phi + pi/2, so condition is if angle < 0 or > pi
			
			if (viewer.phi < piOver2 || viewer.phi > threePiOver2) {
				viewer.up = vec3(0.0, 1.0, 0.0);
			}
			else {
				viewer.up = vec3(0.0, -1.0, 0.0);
			}
			//console.log("up = ",viewer.up[0],viewer.up[1],viewer.up[2]);
			//console.log("update viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);
			
			// Recompute the view
			mvMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
			
			 

			mouse.prevX = currentX;
			mouse.prevY = currentY;
		
		} // end if button down

    };
        
    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//draw normal (program2)
	if(normalFlag)
	{
		gl.useProgram( program2 );
		// gl.uniform1f(shininessLoc, shininessSlider.value);
		gl.uniformMatrix4fv(normalmvMatrixLoc, false, flatten(mvMatrix));
		gl.uniformMatrix4fv(normalprojMatrixLoc, false, flatten(projectionMatrix));

		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.vertexAttribPointer( nPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( nPosition );
		gl.drawArrays(gl.LINES, 0, currentShape.drawNormal.length);
	}

    //draw shape (program1)
    gl.useProgram( program1 );
	//calculate projectionMatrix again before drawing
	mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
	projectionMatrix = perspective(fovSlider.value, perspProj.aspect, perspProj.near, perspProj.far);
	//get shininess value again before drawing
	gl.uniform1f(shininessLoc, shininessSlider.value);
	gl.uniform4fv(lightPositionLoc, flatten(light.position));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(currentShape.vertices), gl.STATIC_DRAW );

	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );
    gl.drawElements( gl.TRIANGLES, currentShape.indices.length, gl.UNSIGNED_SHORT, 0 );

    requestAnimFrame( render );
}


