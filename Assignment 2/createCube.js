//code are built based on cube.js 
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    //use math.random() for random colors
    var vertexColors = [
        [ 0, 1, 0.8, 1.0 ], 
        [ 0.6, 1, 0.7, 1.0 ],  
        [ 0, 0.9, 0.8, 1.0 ],  
        [ 0.1, 1, 0.8, 1.0 ],  
        [ 0.7, 0.9, 0.8, 1.0 ],  
        [ 0.3, 0.9, 0.9, 1.0 ],  
        [ 0.7, 1, 0.8, 1.0 ],  
        [ 0.4, 1, 0.8, 1.0 ]   
    ];

    var indices = [ a, b, c, a, c, d ];

    console.log("indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
    }
    console.log("colors = ",vertexColors[a]);
}


function random(min, max) {
    var temp = Math.random() * (max - min) + min;
    while(temp == 0)
    {
        random(min,max);
    }
    return temp;
}

