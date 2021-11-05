# Ski Jumping Game

## Intro 
This project was born from my Three.js journey. In this course I come across a library called `cannon.js` to use physics in a three.js scene. Loaded with new knowledge and curiousity, I wanted to create my own project which encapsulates physics and 3D graphics. 

My goal is to create a fun game where the player starts at the top of ski slope and has to manoeuvre between the trees and hit the ski jump at the end successfully. Turning and hitting trees will reduce speed and the distance cleared on launching from ski jump, thus reducing game points. 

It's an ambitous project with a lot of hurdles to overcome!

## Production Walkthrough 

### Create a slope 

**Goal** <br>
Create a plane which faces the camera head on and inclines. 

**Solution** <br>
- Rectangular plane `15 x 20`
- Move camera higher up `camera.position.y = 12`
- Zoom camera out `camera.position.z = 6`
- Adjust angle of floor plane in 3D world and physics would by -0.02

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

### Camera follows ball

**Goal** <br>
Currently, the game ski slope is short and thus, the game will be short. The camera is fixed in a single position. Som if I make the ski slope longer, the player won't be able to see the skier when it's out of view. 

I need to extend the length of the plane and get the camera to follow the ball as it rolls down. 

This ball will eventually become a 3D skier model or a sledge - see how complex the modelling is for both options. Main thing is to get the physics working. # ski-jumping-game
