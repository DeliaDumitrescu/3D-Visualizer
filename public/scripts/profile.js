const createScene = (canvas, engine, modelName) => {

        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));

        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

        BABYLON.SceneLoader.ImportMeshAsync("", "/", "data/" + modelName);
    
        return scene;
}

async function loadModels() {

        let canvases = document.getElementsByClassName("modelCanvas");
        for (i = 0; i < canvases.length; i++) {
                let canvas = canvases[i]
                
                engine = new BABYLON.Engine(canvas, true);

                // modelName format: username/modelId
                let modelName = canvas.getAttribute("id");

                const scene = createScene(canvas, engine, modelName);

                engine.runRenderLoop(function () {
                        scene.render();
                });
        }
}

loadModels()