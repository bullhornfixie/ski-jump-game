# Ski Jump Game :snowflake: :ski:

## Intro
This project was born from my Three.js journey. In this course I come across a library called `cannon.js` to use physics in a three.js scene. Loaded with new knowledge and curiousity, I wanted to create my own project which encapsulates physics and 3D graphics. 

My goal is to create a fun game where the player starts at the top of ski slope and has to manoeuvre between the trees and hit the ski jump at the end successfully. Turning and hitting trees will reduce speed and the distance cleared on launching from ski jump, thus reducing game points. 

It's an ambitous project with a lot of hurdles to overcome!

## Getting Started
- `git clone <repo>`
- `npm i`
- `npm run dev`

## Production Walkthrough 

### Create a slope 

**Goal** <br>
Create a plane which faces the camera head on and inclines. 

**Solution** <br>
- Rectangular plane `15 x 20`
- Move camera higher up `camera.position.y = 12`
- Zoom camera out `camera.position.z = 6`
- Adjust angle of floor plane in 3D world and physics world by -0.02

### Ball to roll down slope 

**Goal** <br>
Implement physics to scene and test with a ball rolling down the slope.

**Solution** 
- Create a ball in 3D and physics world 
- Give the ball mass
- Reduce gravity in `CANNON.World()` to -189.82
- Gravitional pull will mean ball rolls down the slope
- If gravity was 0 the ball would be static 
- Move ball away from camera and to top of ski slope (at launch) `sphere.position.z = -7`

Boom! ball is at top of slope and rolls down towards camera. 

### Import 3D models to scene 

**Goal** <br>
I want to import a 3D model of a snow covered tree to scene.

**Problem** <br>
Whilst, importing the model was smooth sailing, the model had no texture or material but the geometry was fine. Why was this? is it a lighting issue?

**Solution** <br>
I was purely referencing an `OBJ` on the `OBJLoader` but I found there was also an `MTL` file in download folder. What does `MTL` mean? well, it means `material`. Ok! So maybe I  need to load the OBJ and MTL file together? and if this theory is correct how do I do it? 

I found the solution and I now have snow covered trees! :evergreen_tree:


```
const mtlLoader = new MTLLoader()

mtlLoader.load(
  '/models/Tree/Forest_Assets_obj/Forest Assets.mtl',
  (materials) => {
    materials.preload()
    console.log(materials)

    const objLoader = new OBJLoader()
    objLoader.setMaterials( materials )
    objLoader.load(
      '/models/Tree/Forest_Assets_obj/Forest Assets.obj',
      (object) => {
        scene.add(object)
      }
    )
  }
)
```

### Box ramp :package:

**Goal** <br>
Create a box ramp where the ball rolls along surface and gains air after hitting the lip.

**Prolem** <br>
There are two worlds in the scene `3D world` and `Physics world` which is invisble. There needs to be a parellel universe for each 3D object and this creates problems when you want to build more complex shapes. 

Initially, I thought a plane in `cannon.js` could be a good starting point. It's a flat surface. However, a plane in physics world is infinite with no edge. The ball was rolling down the slope and hitting the plane but not dropping off an edge. How could I rememdy this?

**Solution** <br>
Could a box, rotated on the x axis, solve the problem? and if I can find a box in the physics library, how would you rotate it on x axis? 

Thankfully cannon.js has a box and you can set the scale! after much grind I managed to align the physics box to my (visible) 3D box and the ball was rolling along, hitting the lip, and gaining some air time...score. 

### Camera follows ball :movie_camera:

**Goal** <br>
Currently, the game ski slope is short and thus, the game will be short. The camera is fixed in a single position. So if I make the ski slope longer, the player won't be able to see the skier when it's out of view. 

I need to extend the length of the plane and get the camera to follow the ball as it rolls down. 

This ball will eventually become a 3D skier model or a sledge. Let's see how complex the modelling is for both options. Main thing is to get the physics working.

**Problem** <br>
With a skewed sense of optimism, I was hoping THREE.js would come packed with an option for the camera to follow an object. `camera.lookAt()` didn't work on the sphere mesh and based on my research, this wasn't going to be straight forward.

**Solution** <br>
I had a theory, to update the `camera.position.z += 0.01` via the tick function, thus updating the camera angle on each frame. Sure enough the result was perfect and gave a really smooth zoom effect! I increased the increment to += 0.10 to keep pace with the ball speed and for it stop zooming when reaches bottom of slope. 

```
if (camera.position.z > 65.00) 
  {camera.position.z = 65.00}
  console.log(camera.position.z)
```

I now needed to return the camera to top of slope when a new a ball is launched via GUI panel. In the debug.createSphere function I added this code to solve problem.

```
console.log('new ball')
camera.position.set(4.75, 9, 35)
```

### Duplicate 3D Models

**Goal** <br>
I want to duplicate models I have already imported and use multiple times in scene - e.g. trees.

**Problem** <br>
On calling my `addModel` method twice, only 1 set of objects was appearing and not 2.

**Solution** <br>
- Casting my mind back to a previous project, I wondered if there was an issue with duplicate `uuid's` 
- Was the newest uuid overwriting previous version?
- To test theory, I created a `cloneModel` function and used a three.js method called `clone()`
- This would create a clone of the object with a unique uuid
- Sure enough it worked! 

## Resources 
[emoji cheatsheet for markdown](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md#sport)