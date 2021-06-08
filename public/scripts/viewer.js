let AnimationsEnum = {
        none : 0,
        turntable : 1,
        swing : 2,
        jumpTurn : 3,
        hover : 4,
}

let crtAnimation = AnimationsEnum.none;

let directionalLights = [];

let color_pickers = [
        new ColorPickerControl({ container: document.querySelector('.light1-color-picker')}),
        new ColorPickerControl({ container: document.querySelector('.light2-color-picker')}),
        new ColorPickerControl({ container: document.querySelector('.light3-color-picker')}),
        new ColorPickerControl({ container: document.querySelector('.light4-color-picker')})
];

let intensitySliders = [
        document.getElementById("intensityLight1"),
        document.getElementById("intensityLight2"),
        document.getElementById("intensityLight3"),
        document.getElementById("intensityLight4"),
]

let environmentColorPicker = new ColorPickerControl({ container: document.querySelector('.environment-color-picker')});
let environmentLight = null;

let environmentIntensitySlider = document.getElementById("intensityEnvironment");

let animationSpeed = 1.0;

const createScene =  () => {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const hemisphericLight = new BABYLON.HemisphericLight("HemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    
    environmentLight = hemisphericLight;
    
    const directionalLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 1, 0), scene);
    const directionalLight2 = new BABYLON.DirectionalLight("DirectionalLight2", new BABYLON.Vector3(0, 1, 0), scene);
    const directionalLight3 = new BABYLON.DirectionalLight("DirectionalLight3", new BABYLON.Vector3(0, 1, 0), scene);
    const directionalLight4 = new BABYLON.DirectionalLight("DirectionalLight4", new BABYLON.Vector3(0, 1, 0), scene);

    scene.clearColor = hemisphericLight.diffuse * hemisphericLight.intensity;

    directionalLights.push(directionalLight);
    directionalLights.push(directionalLight2);
    directionalLights.push(directionalLight3);
    directionalLights.push(directionalLight4);

    BABYLON.SceneLoader.ImportMesh("", "/", modelName, scene); //empty string all meshes
    
    return scene;
}

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
// Add your code here matching the playground format
const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene

var rotationKnob = JogDial(document.getElementById('rotationJogDial'), {
        wheelSize:'160px', knobSize:'70px', minDegree:null, maxDegree:null, degreeStartAt: 0
});

rotationKnob.angle(90);

function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }

let accumulatedViewerTime = 0.0;

engine.runRenderLoop(function () {

        let deltaTime = (scene.getEngine().getDeltaTime() / 1000.0) * animationSpeed;
        accumulatedViewerTime += deltaTime;
        let iterationIndex = 0;

        directionalLights.forEach(light => {
                let rotation = rotationKnob.info.now.rotation;
                while (rotation < 0)
                        rotation += 360.0;
                while (rotation > 360.0)
                        rotation -= 360.0;

                let radians = ((rotation / 360.0) * (Math.PI * 2.0)) - (Math.PI / 2.0);
                light.direction = new BABYLON.Vector3(0.5, Math.sin(radians), Math.cos(radians));

                let colorPicker = color_pickers[iterationIndex];
                let rgbColor = hexToRgb(colorPicker.color.toHEX());
                light.diffuse = new BABYLON.Vector3(rgbColor.r / 255.0, rgbColor.g / 255.0, rgbColor.b / 255.0);
                light.intensity = intensitySliders[iterationIndex].value / 100.0;

                iterationIndex++;
        });

        if (environmentLight) {
                let colorPicker = environmentColorPicker;
                let rgbColor = hexToRgb(colorPicker.color.toHEX());
                environmentLight.diffuse = new BABYLON.Vector3(rgbColor.r / 255.0, rgbColor.g / 255.0, rgbColor.b / 255.0);
                environmentLight.intensity = environmentIntensitySlider.value / 100.0;
        }

        let mesh = scene.meshes[0];

        if (mesh) {
                switch (crtAnimation) {
                        case AnimationsEnum.none:
                                {
                                accumulatedViewerTime = 0.0;
                                mesh.rotation.x = 0.0;
                                mesh.rotation.y = 0.0;
                                mesh.rotation.z = 0.0;
                                mesh.position.y = 0.0;
                                }
                                break;
                        case AnimationsEnum.turntable: 
                                {
                                accumulatedViewerTime = 0.0;
                                mesh.rotationQuaternion = null;
                                mesh.rotation.x = 0.0;
                                mesh.rotation.y += deltaTime;
                                mesh.rotation.z = 0.0;
                                mesh.position.y = 0.0;
                                }
                                break;
                        case AnimationsEnum.swing:
                                {
                                mesh.rotationQuaternion = null;
                                mesh.rotation.x = 0.0;
                                mesh.rotation.y = ((Math.sin(accumulatedViewerTime) + 1.0) / 2.0) * 2.0 * Math.PI;
                                mesh.rotation.z = 0.0;
                                mesh.position.y = 0.0;
                                }
                                break;
                        case AnimationsEnum.jumpTurn:
                                {
                                mesh.rotationQuaternion = null;
                                mesh.rotation.x = ((Math.sin(accumulatedViewerTime) + 1.0) / 2.0) * 0.2 * Math.PI;
                                mesh.rotation.z = ((Math.sin(accumulatedViewerTime) + 1.0) / 2.0) * 0.3 * Math.PI;
                                mesh.rotation.y += deltaTime;
                                mesh.position.y = ((Math.sin(accumulatedViewerTime) + 1.0) / 2.0) * 2.0;
                                }
                                break;
                        case AnimationsEnum.hover:
                                {
                                mesh.rotationQuaternion = null;
                                mesh.rotation.x = 0.0;
                                mesh.rotation.z = 0.0;
                                mesh.rotation.y = 0.0;
                                mesh.position.y = ((Math.sin(accumulatedViewerTime) + 1.0) / 2.0) * 2.0;  
                                }
                                break;
                }
        }

        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

function noneAnimation() {
        crtAnimation = AnimationsEnum.none;
}

function turntableAnimation() {
        crtAnimation = AnimationsEnum.turntable;
}

function swingAnimation() {
        crtAnimation = AnimationsEnum.swing;
}

function jumpTurnAnimation() {
        crtAnimation = AnimationsEnum.jumpTurn;
}

function hoverAnimation() {
        crtAnimation = AnimationsEnum.hover;
}

function doubleSpeed() {
        animationSpeed = 2.0;
}

function speed() {
        animationSpeed = 1.5;
}

function normalSpeed() {
        animationSpeed = 1.0;
}

function halfSpeed() {
        animationSpeed = 0.5;
}