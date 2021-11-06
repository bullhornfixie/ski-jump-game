import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON from 'cannon'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Color } from 'three'

const ballDropPosition = {x: 0, y: 3, z: -30}

// GUI
const gui = new dat.GUI()
const debugObject = {}

debugObject.createSphere = () => {
  createSphere(
    Math.random() * 0.5,
    {
      x: ballDropPosition.x,
      y: ballDropPosition.y,
      z: ballDropPosition.z,
    }
  )
}
gui.add(debugObject, 'createSphere')

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


// Axes Helper
const axesHelper = new THREE.AxesHelper( 10 );
axesHelper.setColors('yellow', 'red', 'blue' )
scene.add( axesHelper );

// Textures 
const texture = new THREE.TextureLoader().load(
  './textures/snow-texture.jpg'
)

// Models 

let getMeshes = null

const loadModels = () => {

const mtlLoader = new MTLLoader()

// Load materials for objects
mtlLoader.load(
  '/models/Tree/Forest_Assets_obj/Forest Assets.mtl',
  (materials) => {
    materials.preload()
    console.log(materials)
    
    // Load 3D objects 
    const objLoader = new OBJLoader()
    objLoader.setMaterials( materials )
    objLoader.load(
      '/models/Tree/Forest_Assets_obj/Forest Assets.obj',
      (object) => {

        // Extract snow related objects 
        getMeshes = [...object.children]

        addModels({x: -3, y: -1, z: 0}) // model section 1
     }       
    )
   }
  )
 }

const addModels = (data) => {
  if(getMeshes !== null) {
    getMeshes.map((m) => {

      if(m.name.includes('Snow')) {
        m.position.x = data.x
        m.position.y = data.y
        m.position.z = data.y
        scene.add(m)    
      }
     }
    )   
   }
  }

loadModels()


// Physics 

// World 
const world = new CANNON.World()
world.gravity.set(0, -100, 0) // Vec3 Class is same as Vector3 but for physics


// What happens when plastic collides with concrete 
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial, 
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7
  }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

const gradient = 0.03

// Floor physics 
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
// floorBody.material = defaultContactMaterial
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  // rotate floor 180 and incline by 0.01 so ball rolls 
  Math.PI * 0.5 - gradient
)
world.addBody(floorBody)


// Floor 3D
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 100), // width / height 
  new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.3,
    roughness: 0.4,
    map: texture
  }
 )
)

floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5 + gradient
scene.add(floor)

// Ramp physics
// const rampShape = new CANNON.Plane(1, 0.5)
// const rampBody = new CANNON.Body(1, 0.5)
// // floorBody.material = defaultContactMaterial
// rampBody.mass = 0
// rampBody.addShape(rampShape)
// rampBody.quaternion.setFromAxisAngle(
//   new CANNON.Vec3(-1.1, 0, 0),
//   // rotate floor 180 and incline by 0.01 so ball rolls 
//   Math.PI * 0.5 - gradient
// )
// world.addBody(rampBody)

// Ramp 3D 
// const ramp = new THREE.Mesh(
//   new THREE.PlaneGeometry(4, 30), // width / height 
//   new THREE.MeshStandardMaterial({
//     color: '#000000',
//     metalness: 0.3,
//     roughness: 0.4,
//     map: texture
//   }
//  )
// )
// ramp.rotation.x = -1.7
// ramp.rotation.y = 0
// ramp.rotation.z = 0

// scene.add(ramp)

// BoxRamp 3D
const ramp = new THREE.Mesh(
  new THREE.BoxBufferGeometry(2, 2, 10), // width / height 
  new THREE.MeshStandardMaterial({
    color: '#000000',
    metalness: 0.3,
    roughness: 0.4,
  }
 )
)
ramp.rotation.set(-0.1, 0, 0)
ramp.position.y = -0.9
scene.add(ramp)

// Box Ramp Physics 
const boxShape = new CANNON.Box(new CANNON.Vec3(2, 2, 10));
const boxBody = new CANNON.Body({ mass: 0 });
boxBody.addShape(boxShape);
boxBody.position.set(0, -1.8, 0);

const axis = new CANNON.Vec3(-0.1, 0, 0)
const angle = Math.PI / 3
boxBody.quaternion.setFromAxisAngle(axis, angle)
world.addBody(boxBody);


// Lights 
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

// Sizes 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera 
const camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 5, 100)
camera.position.set(0, 10, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Utils 
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.4,
    roughness: 0.1,
    color: 'blue'
})

const createSphere = (radius, position) => {

    // THREE.js mesh 
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true 
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body 
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial,
    })
    body.position.copy(position)
    world.addBody(body)

    // Save in objectsToUpdate array
    objectsToUpdate.push({
      mesh: mesh,
      body: body 
    })
}

createSphere(0.5, {
  x: ballDropPosition.x,
  y: ballDropPosition.y,
  z: ballDropPosition.z
})

// Animate
const clock = new THREE.Clock()
let oldElapsedTime = 0 

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics world 
    world.step(1 / 60, deltaTime, 3) // fixed time stamp, time elapsed, catch up for delay

    for(const object of objectsToUpdate)
    {
      object.mesh.position.copy(object.body.position)
    }

    // Update mixer (only needed for objects with animation)
    // if(mixer !== null) {
    //   mixer.update(deltaTime)
    // }
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()