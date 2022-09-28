//name: Zi Jia Tan
var CYindiceArray = [];
var CYverticeArray = [];
var CYnormalArray = [];
var CYdrawNormal = [];
var GOindiceArray = [];
var GOverticeArray = [];
var GOnormalArray = [];
var GOnormal = [];
var GOdrawNormal = [];
var CYmaxZ, GOmaxZ=0;
function cylinder()
{
    var angle = 0;
    var point, normal;
    var increment = Math.PI * 2.0 / SORtheta; // divide 360 degree into theta

    for(var i = 0; i < SORtheta; i++) 
    {
        //formula for vertices = rotateY(angle) * g(t) = [radius*cos(angle), 1, -radius*sin(angle), 1] 
        // or [radius*cos(angle), -1, radius*-sin(angle), 1]
        var x = Math.cos(angle);
        var z = -Math.sin(angle);
        CYmaxZ = 1;
        point = vec4(x, 1, z, 1);
        //formula for normal  = [cos(angle), -0 , -sin(angle), 0]
        normal = normalize(vec4(Math.cos(angle), -0, -Math.sin(angle), 0), true); 
        CYverticeArray[i] = point;
        CYnormalArray[i] = normal;
        CYdrawNormal.push(point);
        CYdrawNormal.push(add(point, scale(0.1, normal)));

        point = vec4(x, -1, z, 1);
        CYverticeArray[i + SORtheta] = point;
        CYnormalArray[i + SORtheta] = normal;
        CYdrawNormal.push(point);
        CYdrawNormal.push(add(point, scale(0.1, normal)));

        angle += increment;
    }

    for (let i = 0; i < 1; i++) 
    {
        for (let j = 0; j < SORtheta; j++) 
        {
          quad1(
                (SORtheta) * (i + 1) + j, 
                (SORtheta) * (i+1) + (j + 1) % SORtheta,
                (SORtheta) * (i) + (j + 1) % SORtheta, 
                (SORtheta) * (i) + j 
                );
        }
    }    
}

function quad1(a, b, c, d) 
{
    var indices = [ a, b, c, a, c, d ];
    
    for ( var i = 0; i < indices.length; i++ ) 
    {
        CYindiceArray.push( indices[i] );
    }
}

function crock()
{
    var angle = 0, cos, cost, sin, sint;
    
    for(var j = -0.25; j <= 0.25; j += 0.01)
    {
        for(var i = 0; i < SORtheta; i++)
        {
            //formula for vertices = rotateY(angle) * g(t) 
            //= [(Math.sin(angle)*Math.cos(angle)) + (3*Math.cos(angle)), 1, -radius*sin(angle), 1] 
            // or [(Math.sin(angle)*Math.cos(angle)) + (3*Math.cos(angle)), -1, -radius*sin(angle), 1]
            angle = radians(i);
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            cost = Math.cos(j);
            sint = Math.sin(j);

            // // //formula for normal

            var g = 0.25*Math.cos(-j*Math.PI);
            GOmaxZ = Math.max(GOmaxZ, g);
            const rot = rotateY(i);
            const baseVec = vec4(g, j, 0, 1);
            var vert = multMatixByVector(rot, baseVec);
            var slope = -0.25*Math.PI*Math.sin(j*Math.PI)*g;
            const normal = normalize(vec4(g*cos, -slope, g*sin, 0), true);
            // const normal = normalize(vec4(a, b, c, 0), true); 
            GOverticeArray.push(vert);
            GOnormalArray.push(normal);
            GOdrawNormal.push(vert);
            GOdrawNormal.push(add(vert, scale(0.02, normal)));
            // angle += increment;
        }
    }

    for (let i = 0; i < 49; i++) 
    {
        for (let j = 0; j < SORtheta; j++) 
        {
          quad2(
                (SORtheta) * (i + 1) + j, 
                (SORtheta) * (i+1) + (j + 1) % SORtheta,
                (SORtheta) * (i) + (j + 1) % SORtheta, 
                (SORtheta) * (i) + j 
                );
        }
    }    
}

function quad2(a, b, c, d) 
{
    var indices = [ a, b, c, a, c, d ];
    
    for ( var i = 0; i < indices.length; i++ ) 
    {
        GOindiceArray.push( indices[i] );
    }
}

function multMatixByVector(matrix, vector) 
{
  let newVector = []; // holder for new vector
  for ( let i = 0; i < matrix.length; i++ ) // for the number of rows of the matrix
  {
    let newVectorValue = 0; // start with 0 for the new value of each index
    for ( let j = 0; j < vector.length; j++ )  // for the length of the vector 
      newVectorValue += matrix[i][j] * vector[j]; // get the value of the new row 

    newVector.push(newVectorValue); // push the sum of those values to the index of
  }
  return newVector;
}
