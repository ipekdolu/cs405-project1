function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
    0.8660254, -0.25, 0, 0.15,
    0.25, 0.8660254, -0.4330127, -0.125,
    -0.4330127, 0, 0.8660254, 0,
    0, 0, 0, 1
]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
const degToRad = (angle) => angle * Math.PI / 180;

const translationMatrix = new Float32Array([
    1, 0, 0, 0.3,
    0, 1, 0, -0.25,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

const scalingMatrix = new Float32Array([
    0.5, 0, 0, 0,
    0, 0.5, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

const rotationXMatrix = new Float32Array([
    1, 0, 0, 0,
    0, Math.cos(degToRad(30)), -Math.sin(degToRad(30)), 0,
    0, Math.sin(degToRad(30)), Math.cos(degToRad(30)), 0,
    0, 0, 0, 1
]);

const rotationYMatrix = new Float32Array([
    Math.cos(degToRad(45)), 0, Math.sin(degToRad(45)), 0,
    0, 1, 0, 0,
    -Math.sin(degToRad(45)), 0, Math.cos(degToRad(45)), 0,
    0, 0, 0, 1
]);

const rotationZMatrix = new Float32Array([
    Math.cos(degToRad(60)), -Math.sin(degToRad(60)), 0, 0,
    Math.sin(degToRad(60)), Math.cos(degToRad(60)), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

// Combine the transformations
const tempMatrix = new Float32Array(16);
const finalMatrix = new Float32Array(16);

const multiplyMatrices = (result, a, b) => {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            tempMatrix[j * 4 + i] =
                a[j * 4] * b[i] +
                a[j * 4 + 1] * b[i + 4] +
                a[j * 4 + 2] * b[i + 8] +
                a[j * 4 + 3] * b[i + 12];
        }
    }
    for (let i = 0; i < 16; i++) {
        result[i] = tempMatrix[i];
    }
};

multiplyMatrices(tempMatrix, translationMatrix, scalingMatrix);
multiplyMatrices(finalMatrix, tempMatrix, rotationXMatrix);
multiplyMatrices(tempMatrix, finalMatrix, rotationYMatrix);
multiplyMatrices(finalMatrix, tempMatrix, rotationZMatrix);

const cs = new Float32Array(finalMatrix);
return getTransposeMatrix(cs);
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
let animationStartTime = null;
const animationDuration = 10000; // 10 seconds in milliseconds

function getPeriodicMovement(currentTime) {
    if (!animationStartTime) {
        animationStartTime = currentTime;
    }

    const elapsedTime = currentTime - animationStartTime;

    if (elapsedTime <= animationDuration / 2) {
        // First 5 seconds: Transition to the calculated transformation in Task 2
        const progress = elapsedTime / (animationDuration / 2);
        const interpolatedMatrix = interpolateMatrices(
            getIdentityMatrix(), // Initial position matrix
            getModelViewMatrix(), // Transformation matrix from Task 2
            progress
        );
        return interpolatedMatrix;
    } else if (elapsedTime <= animationDuration) {
        // Last 5 seconds: Return to the initial position
        const progress = (elapsedTime - animationDuration / 2) / (animationDuration / 2);
        const interpolatedMatrix = interpolateMatrices(
            getModelViewMatrix(), // Transformation matrix from Task 2
            getIdentityMatrix(), // Initial position matrix
            progress
        );
        return interpolatedMatrix;
    } else {
        // Restart the animation
        animationStartTime = currentTime;
        return getModelViewMatrix(); // Start from the transformation matrix
    }
}

function interpolateMatrices(matrixA, matrixB, progress) {
    const interpolatedMatrix = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        interpolatedMatrix[i] = matrixA[i] * (1 - progress) + matrixB[i] * progress;
    }
    return interpolatedMatrix;
}

// Helper function to create an identity matrix
function getIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}


