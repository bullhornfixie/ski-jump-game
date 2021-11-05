import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON from 'cannon'

// console.log(CANNON)

// GUI
const gui = new dat.GUI()
const debugObject = {}
debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        {
          x: (Math.random() - 0.5) * 3,
          y: 3,
          z: (Math.random() - 0.5) * 3 
        }
    )
}
gui.add(debugObject, 'createSphere')

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// Textures 
const texture = new THREE.TextureLoader().load(
  './textures/snow-texture.jpg'
)


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


// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
// floorBody.material = defaultContactMaterial
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  Math.PI * 0.5 - 0.02
)
world.addBody(floorBody)


// Floor 
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 20), // width / height 
    new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.3,
        roughness: 0.4,
        map: texture
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5 - 0.02
scene.add(floor)

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
const camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 12, 6)
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

createSphere(0.5, {x: 0, y: 2, z: -7})

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
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()