import * as THREE from '../../node_modules/three/build/three.module.js';
import SixDOFObject from './SixDOFObject.js';
import VectorSetObject from './VectorSet.js';
import PoinsotAndCones from './PoinsotAndCones.js';
import {OrbitControls} from './OrbitControls.js';
// import {GLTFLoader} from './GLTFLoader.js';
// import {initAudio, playSound} from './audio.js';

// if ('serviceWorker' in navigator){
//   navigator.serviceWorker
//   .register('./sw.js')
//   .then(function(){
//   });
// }

let scene, camera, renderer;
let background = null;
let jupiter = null;
let sun = null;

// let airplaneObject;

// function foo() {

//   // Instantiate a loader
//   const loader = new GLTFLoader();

//   // Optional: Provide a DRACOLoader instance to decode compressed mesh data
//   // const dracoLoader = new DRACOLoader();
//   // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
//   // loader.setDRACOLoader( dracoLoader );

//   // Load a glTF resource
//   loader.load(
// 	// resource URL
// 	'models/uploads_files_4140769_plane.glb',
// 	// called when the resource is loaded
// 	function (gltf){

// 		scene.add(gltf.scene);

// 		gltf.animations; // Array<THREE.AnimationClip>
// 		gltf.scene; // THREE.Group
// 		gltf.scenes; // Array<THREE.Group>
// 		gltf.cameras; // Array<THREE.Camera>
// 		gltf.asset; // Object
// 	},
// 	// called while loading is progressing
// 	function (xhr) {
// 		cl((xhr.loaded / xhr.total * 100) + '% loaded');
// 	},
// 	// called when loading has errors
// 	function (error){
// 		cl( 'An error happened' );
// 	}
// );




  // function loadModel() {
  //   object.traverse(function(child){
  //     // if (child.isMesh) child.material.map = texture;
  //   });

  //   // object.position.y = - 95;
  //   scene.add(airplaneObject);
  // }

  // const manager = new THREE.LoadingManager(loadModel);

  // function onProgress(xhr){
  //   if (xhr.lengthComputable){
  //   	const percentComplete = xhr.loaded / xhr.total * 100;
  //   	cl('model ' + Math.round(percentComplete, 2) + '% downloaded');
  //   }
  // }

  // function onError() {}

  // const loader = new GLTFLoader(manager);
  // loader.load('models/uploads_files_4140769_plane.glb', function (obj){
  //   airplaneObject = obj;
  // }, onProgress, onError);
// }

const cameraRadius = 25;
let nominalCameraPos = new THREE.Vector3(-cameraRadius, 0, 0);
const centerOfRotation = [0, 0, 0];
let clock = null;
let sdo = null; //"six degree of freedom object" (we mostly care about rotational)
let vso = null; //"vector set object" (handles all of the vectors)
let pac = null; //"Poinsot and cones" (handles the Poinsot ellipsoid and plane,
                //polode and herpolhode, and the space and body cones)
let orbitControls = null;
let cpx, cpy, cpz; // camera position
let playing = false;
const piOver180 = Math.PI / 180;
const masses = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const muOverR3Choices = [0.000001451422, 0.0001451422, 0.01451422, 0.0725711, 0.1451422, 0.2902844, 0.725711, 1.451422];
const muOverR3ChoiceDisplay = ['LEO', '100 X LEO', '10K X LEO', '50K X LEO',
 '100K X LEO', '200K X LEO', '500K X LEO', '1M X LEO'];
let muOverR3 = muOverR3Choices[5];
// const aeroAltitudeChoices = [0, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 12000, 14000];// meters
// const aeroDensityChoices = [1.225, 1.1116, 1.0065, 0.9093, 0.8194, 0.6601, 0.5258, 0.4135, 0.3119, 0.2279];// kg/m3
// const aeroSpeedOfSoundChoices = [340.3,336.4,332.5,328.6,324.6,316.5,308.1,299.5,295.1,295.1];
// const aeroAirspeedChoices = [25, 50, 100, 150, 200, 250, 300, 400, 500];// m/sec

const defaultMass = 1;
const defaultDimX = 4;
const defaultDimY = 4;
const defaultDimZ = 7;
const defaultAttitudeOption = 1;//1=Euler angles, 2=quaternion
const defaultEuler1 = -10;
const defaultEuler2 = -20;
const defaultEuler3 = -30;
const defaultEulerOrder = 'ZYX';
const defaultOmegaMagnitude = 10;
const defaultMaxOmega = 720;//degrees/sec
const defaultOmHihat = 0;
const defaultOmHjhat = 100;
const defaultOmHkhat = 100;
const defaultOmegaOrH = 'omega';
const defaultTorqueOption = 1;//No Torque

const defaultOrientation = 'Z Down';
const defaultEnvironment = 'atmosphere';
const defaultShowObject = true;
const defaultShowBodyFrame = true;
const defaultShowBodyXVector = true;
const defaultShowBodyYVector = true;
const defaultShowBodyZVector = true;
const defaultShowSpaceFrame = true;
const defaultShowAngularVelocity = true;
const defaultShowAngularMomentum = true;
const defaultShowTorque = true;
const defaultShowCones = false;
const defaultShowPoinsot = false;

const defaultObjectTransparency = 0;
const defaultBodyFrameTransparency = 0;
const defaultSpaceFrameTransparency = 0;
const defaultOmegaTransparency = 0;
const defaultHTransparency = 0;
const defaultTorqueTransparency = 0;
const defaultConesTransparency = 50;
const defaultPoinsotTransparency = 100;
// 95 is arbirary, close enough to being completely invisible
const maxTransparency = 95;

const defaultBodyFrameColor = 'yellow';
const defaultSpaceFrameColor = 'blue';
const defaultOmegaColor = 'green';
const defaultHColor = 'purple';
const defaultTorqueColor = 'red';
const defaultBodyConeColor = 'orange';
const defaultSpaceConeColor = 'red';
const defaultEllipsoidColor = 'blue';
const defaultPlaneColor = 'green';

const defaultObjectOffset = false;
const defaultBodyFrameOffset = false;
const defaultSpaceFrameOffset = true;
const defaultOmegaOffset = false;
const defaultHOffset = false;
const defaultTorqueOffset = false;
const defaultConesOffset = false;
const defaultPoinsotOffset = false;

const defaultObjectMassProperties =  'select-an-object';
const defaultObjectAppearance = 'axis-labels';
const defaultVectorSize = 6;
const defaultTorqueMag = 4;
const defaultTorqueIhat = 1;
const defaultTorqueJhat = 0;
const defaultTorqueKhat = 0;
const defaultTorqueACSDZ = 0.5;
const defaultTorqueACSTorque = 0.1;
const defaultTorqueGG = 5;
const defaultTorqueTopX = 1;
const defaultTorqueTopGrav = 1;

let aerotutorData = [
  {name:'mass', value:defaultMass},
  {name:'length', value:defaultDimX},
  {name:'width', value:defaultDimY},
  {name:'height', value:defaultDimZ},
  {name:'attitudeOption', value:defaultAttitudeOption},
  {name:'eulerAngle1', value:defaultEuler1},
  {name:'eulerAngle2', value:defaultEuler2},
  {name:'eulerAngle3', value:defaultEuler3},
  {name:'eulerOrder', value:defaultEulerOrder},
  {name:'omegaMagnitude', value:defaultOmegaMagnitude},
  {name:'maxOmega', value:defaultMaxOmega},
  {name:'omHihat', value:defaultOmHihat},
  {name:'omHjhat', value:defaultOmHjhat},
  {name:'omHkhat', value:defaultOmHkhat},
  {name:'omegaOrH', value:defaultOmegaOrH},
  {name:'torqueOption', value:defaultTorqueOption},
  {name:'axesOrientation', value:defaultOrientation},
  {name:'environment', value:defaultEnvironment},
  {name:'showObject', value:defaultShowObject},
  {name:'showBodyFrame', value:defaultShowBodyFrame},
  {name:'showBodyXVector', value:defaultShowBodyXVector},
  {name:'showBodyYVector', value:defaultShowBodyYVector},
  {name:'showBodyZVector', value:defaultShowBodyZVector},
  {name:'showSpaceFrame', value:defaultShowSpaceFrame},
  {name:'showAngularVelocity', value:defaultShowAngularVelocity},
  {name:'showAngularMomentum', value:defaultShowAngularMomentum},
  {name:'showTorque', value:defaultShowTorque},
  {name:'showCones', value:defaultShowCones},
  {name:'showPoinsot', value:defaultShowPoinsot},
  {name:'objectTransparency', value:defaultObjectTransparency},
  {name:'bodyFrameTransparency', value:defaultBodyFrameTransparency},
  {name:'spaceFrameTransparency', value:defaultSpaceFrameTransparency},
  {name:'omegaTransparency', value:defaultOmegaTransparency},
  {name:'hTransparency', value:defaultHTransparency},
  {name:'torqueTransparency', value:Number(defaultTorqueTransparency)},
  {name:'conesTransparency', value:Number(defaultConesTransparency)},
  {name:'poinsotTransparency', value:Number(defaultPoinsotTransparency)},
  {name:'bodyFrameColor', value:defaultBodyFrameColor},
  {name:'spaceFrameColor', value:defaultSpaceFrameColor},
  {name:'omegaColor', value:defaultOmegaColor},
  {name:'hColor', value:defaultHColor},
  {name:'torqueColor', value:defaultTorqueColor},
  {name:'bodyConeColor', value:defaultBodyConeColor},
  {name:'spaceConeColor', value:defaultSpaceConeColor},
  {name:'ellipsoidColor', value:defaultEllipsoidColor},
  {name:'planeColor', value:defaultPlaneColor},
  {name:'objectOffset', value:defaultObjectOffset},
  {name:'bodyFrameOffset', value:defaultBodyFrameOffset},
  {name:'spaceFrameOffset', value:defaultSpaceFrameOffset},
  {name:'omegaOffset', value:defaultOmegaOffset},
  {name:'hOffset', value:defaultHOffset},
  {name:'torqueOffset', value:defaultTorqueOffset},
  {name:'conesOffset', value:defaultConesOffset},
  {name:'poinsotOffset', value:defaultPoinsotOffset},
  {name:'objectMassProperties', value:defaultObjectMassProperties},
  {name:'objectAppearance', value:defaultObjectAppearance},
  {name:'vectorSize', value:defaultVectorSize},
  {name:'torqueMag', value:defaultTorqueMag},
  {name:'torqueIhat', value:defaultTorqueIhat},
  {name:'torqueJhat', value:defaultTorqueJhat},
  {name:'torqueKhat', value:defaultTorqueKhat},
  {name:'torqueACSDZ', value:defaultTorqueACSDZ},
  {name:'torqueACSTorque', value:defaultTorqueACSTorque},
  {name:'torqueGG', value:defaultTorqueGG},
  {name:'torqueTopX', value:defaultTorqueTopX},
  {name:'torqueTopGrav', value:defaultTorqueTopGrav}
];

let mass = defaultMass;
let dimX = defaultDimX;
let dimY = defaultDimY;
let dimZ = defaultDimZ;
let attitudeOption = defaultAttitudeOption;
let euler1 = defaultEuler1;
let euler2 = defaultEuler2;
let euler3 = defaultEuler3;
let eulerOrder = defaultEulerOrder;
let quatW = 0;
let quatX = 0;
let quatY = 0;
let quatZ = 0;
let omegaMag = defaultOmegaMagnitude;
let maxOmega = defaultMaxOmega;
let omHihat = defaultOmHihat;
let omHjhat = defaultOmHjhat;
let omHkhat = defaultOmHkhat;
let omegaOrH = defaultOmegaOrH;
let torqueOption = defaultTorqueOption;
let environment = defaultEnvironment;
let showBodyXVector = defaultShowBodyXVector;
let showBodyYVector = defaultShowBodyYVector;
let showBodyZVector = defaultShowBodyZVector;
let objectTransparency = defaultObjectTransparency;
let bodyFrameTransparency = defaultBodyFrameTransparency;
let spaceFrameTransparency = defaultSpaceFrameTransparency;
let omegaTransparency = defaultOmegaTransparency;
let hTransparency = defaultHTransparency;
let torqueTransparency = defaultTorqueTransparency;
let conesTransparency = defaultConesTransparency;
let poinsotTransparency = defaultPoinsotTransparency;
let bodyFrameColor = defaultBodyFrameColor;
let spaceFrameColor = defaultSpaceFrameColor;
let omegaColor = defaultOmegaColor;
let hColor = defaultHColor;
let torqueColor = defaultTorqueColor;
let bodyConeColor = defaultBodyConeColor;
let spaceConeColor = defaultSpaceConeColor;
let ellipsoidColor = defaultEllipsoidColor;
let planeColor = defaultPlaneColor;
let objectOffset = defaultObjectOffset;
let bodyFrameOffset = defaultBodyFrameOffset;
let spaceFrameOffset = defaultSpaceFrameOffset;
let omegaOffset = defaultOmegaOffset;
let hOffset = defaultHOffset;
let torqueOffset = defaultTorqueOffset;
let conesOffset = defaultConesOffset;
let poinsotOffset = defaultPoinsotOffset;
let objectMassProperties = defaultObjectMassProperties;
let objectAppearance = defaultObjectAppearance;
let vectorSize = defaultVectorSize;
let torqueMag = defaultTorqueMag;
let torqueIhat = defaultTorqueIhat;
let torqueJhat = defaultTorqueJhat;
let torqueKhat = defaultTorqueKhat;
let torqueACSDZ = defaultTorqueACSDZ;
let torqueACSTorque = defaultTorqueACSTorque;
let torqueGG = defaultTorqueGG;
let torqueTopX = defaultTorqueTopX;
let torqueTopGrav = defaultTorqueTopGrav;

const sixDOFworld = document.getElementById('sixDOF-world');
const playPauseButton = document.getElementById('play-pause-btn');
const resetButton = document.getElementById('reset-btn');

const numericalButton = document.getElementById('numerical-btn');
const attitudeButton = document.getElementById('attitude-btn');
const massPropButton = document.getElementById('mass-prop-btn');
const rotationRateButton = document.getElementById('rotation-btn');
const torqueButton = document.getElementById('torque-btn');
const preferencesButton = document.getElementById('preferences-btn');

const attitudeOptionButton1 = document.getElementById('attitude-input-btn1');
const attitudeOptionButton2 = document.getElementById('attitude-input-btn2');
const zeroEuler1Button = document.getElementById("zero-euler1-btn");
const zeroEuler2Button = document.getElementById("zero-euler2-btn");
const zeroEuler3Button = document.getElementById("zero-euler3-btn");
const euler1Slider = document.getElementById("euler1-slider");
const euler2Slider = document.getElementById("euler2-slider");
const euler3Slider = document.getElementById("euler3-slider");
const euler1Display = document.getElementById("euler1-display");
const euler2Display = document.getElementById("euler2-display");
const euler3Display = document.getElementById("euler3-display");
const zeroQuaternionAngleButton = document.getElementById("zero-quat-angle-btn");
const zeroQuaternionIhatButton = document.getElementById("zero-quatX-btn");
const zeroQuaternionJhatButton = document.getElementById("zero-quatY-btn");
const zeroQuaternionKhatButton = document.getElementById("zero-quatZ-btn");
const quaternianAngleDisplay = document.getElementById("quat-angle-display");
const quaternianAngleSlider = document.getElementById("quat-angle");
const quaternianIhatDisplay = document.getElementById("quat-ihat-display");
const quaternianIhatSlider = document.getElementById("quat-ihat-slider");
const quaternianJhatDisplay = document.getElementById("quat-jhat-display");
const quaternianJhatSlider = document.getElementById("quat-jhat-slider");
const quaternianKhatDisplay = document.getElementById("quat-khat-display");
const quaternianKhatSlider = document.getElementById("quat-khat-slider");
const quatWDisplay = document.getElementById("quatW-display");
const quatXDisplay = document.getElementById("quatX-display");
const quatYDisplay = document.getElementById("quatY-display");
const quatZDisplay = document.getElementById("quatZ-display");
const massSlider = document.getElementById("mass-slider");
const dimXSlider = document.getElementById("dimX-slider");
const dimYSlider = document.getElementById("dimY-slider");
const dimZSlider = document.getElementById("dimZ-slider");
const massDisplay = document.getElementById("mass-display");
const dimXDisplay = document.getElementById("dimX-display");
const dimYDisplay = document.getElementById("dimY-display");
const dimZDisplay = document.getElementById("dimZ-display");
const ixxNumber = document.getElementById("ixx-number");
const iyyNumber = document.getElementById("iyy-number");
const izzNumber = document.getElementById("izz-number");
const zeroOmegaIhatButton = document.getElementById("zero-omegax-btn");
const zeroOmegaJhatButton = document.getElementById("zero-omegay-btn");
const zeroOmegaKhatButton = document.getElementById("zero-omegaz-btn");
const omegaMagnitudeSlider = document.getElementById("omegaMag");
const omegaIhatSlider = document.getElementById("omegaIhat");
const omegaJhatSlider = document.getElementById("omegaJhat");
const omegaKhatSlider = document.getElementById("omegaKhat");
const omegaMagnitudeDisplay = document.getElementById("omegaMag-display");
const hMagnitudeDisplay = document.getElementById("hMag-display");
const omegaIhatDisplay = document.getElementById("omega-ihat-display");
const omegaJhatDisplay = document.getElementById("omega-jhat-display");
const omegaKhatDisplay = document.getElementById("omega-khat-display");
const omegaPDisplay = document.getElementById("omegaP-display");
const omegaQDisplay = document.getElementById("omegaQ-display");
const omegaRDisplay = document.getElementById("omegaR-display");
const torqueOptionButton = document.getElementById("torque-option-btn");
const zeroTorqueXButton = document.getElementById("zero-torqueIhat-btn");
const zeroTorqueYButton = document.getElementById("zero-torqueJhat-btn");
const zeroTorqueZButton = document.getElementById("zero-torqueKhat-btn");
const torqueOptionDisplay = document.getElementById("torque-option");

const torqueMagnitudeSlider = document.getElementById("torqueMag");
const torqueIhatSlider = document.getElementById("torqueIhat");
const torqueJhatSlider = document.getElementById("torqueJhat");
const torqueKhatSlider = document.getElementById("torqueKhat");
const acsDeadZoneSlider = document.getElementById("acs-omega-dead-zone-slider");
const acsTorqueMagnitudeSlider = document.getElementById("acs-torque-magnitude-slider");
const torqueMuOverR3Slider = document.getElementById("torque-muOverR3");
const torqueTopXDistanceSlider = document.getElementById("torque-top-xdistance");
const torqueTopGravitySlider = document.getElementById("torque-top-gravity");

const torqueMagnitudeDisplay = document.getElementById("torqueMag-display");
const torqueIhatDisplay = document.getElementById("torqueIhat-display");
const torqueJhatDisplay = document.getElementById("torqueJhat-display");
const torqueKhatDisplay = document.getElementById("torqueKhat-display");
const torqueLDisplay = document.getElementById("torqueL-display");
const torqueMDisplay = document.getElementById("torqueM-display");
const torqueNDisplay = document.getElementById("torqueN-display");
const acsDeadZoneDisplay = document.getElementById( "acs-omega-dead-zone");
const acsTorqueMagnitudeDisplay = document.getElementById( "acs-torque-magnitude");
const torqueMuOverR3Display = document.getElementById("torque-muOverR3-display");
const torqueTopXDistanceDisplay = document.getElementById("torque-top-xdistance-display");
const torqueTopGravityDisplay = document.getElementById("torque-top-gravity-display");

const numericalGeneralButton = document.getElementById("numerical-general-btn");
// const numericalAeroButton = document.getElementById("numerical-aero-btn");
let numericalDisplayIsGeneral = true;
const presetMassPropertiesMenu = document.getElementById("preset-mass-properties-menu");
// const aeroAltitudeSlider = document.getElementById("aero-altitude-slider");
// const aeroAirSpeedSlider = document.getElementById("aero-air-speed-slider");
// const aeroAzimuthSlider = document.getElementById("aero-chi-slider");
// const aeroGammaSlider = document.getElementById("aero-gamma-slider");
// const aeroThrustSlider = document.getElementById("aero-thrust-slider");
// const aeroAirSpeedDisplay = document.getElementById( "aero-air-speed");//V
// const aeroAltitudeDisplay = document.getElementById( "aero-altitude");//Alt
// const aeroChiDisplay = document.getElementById( "aero-chi");//chi (azimuth)
// const aeroGammaDisplay = document.getElementById( "aero-gamma");
// const aeroAirSpeed2Display = document.getElementById( "aero-air-speed2");//V
// const aeroAltitude2Display = document.getElementById( "aero-altitude2");//Alt
// const aeroChi2Display = document.getElementById( "aero-chi2");//chi (azimuth)
// const aeroGamma2Display = document.getElementById( "aero-gamma2");
// const aeroThrustDisplay = document.getElementById( "aero-thrust");
// const aeroDensityDisplay = document.getElementById( "aero-air-density");//rho
// const aeroLiftDisplay = document.getElementById( "aero-lift");
// const aeroSideForceDisplay = document.getElementById( "aero-side-force");
// const aeroDragDisplay = document.getElementById( "aero-drag");
// const aeroDynamicPressureDisplay = document.getElementById( "aero-dynamic-pressure");//q
// const aeroMachDisplay = document.getElementById("aero-mach");
// const aeroAlphaDisplay = document.getElementById("aero-alpha");
// const aeroBetaDisplay = document.getElementById("aero-beta");
// const aeroBankDisplay = document.getElementById("aero-bank");//Phi (bank)
// const aeroPsiDisplay = document.getElementById("aero-psi");
// const aeroThetaDisplay = document.getElementById("aero-theta");
// const aeroPhiDisplay = document.getElementById("aero-phi");
// const aeroUDisplay = document.getElementById("aero-u");
// const aeroVDisplay = document.getElementById("aero-v");
// const aeroWDisplay = document.getElementById("aero-w");
// const aeroThrustXDisplay = document.getElementById("aero-thrust-x");
// const aeroThrustYDisplay = document.getElementById("aero-thrust-y");
// const aeroThrustZDisplay = document.getElementById("aero-thrust-z");
// const aeroMGXDisplay = document.getElementById("aero-mg-x");
// const aeroMGYDisplay = document.getElementById("aero-mg-y");
// const aeroMGZDisplay = document.getElementById("aero-mg-z");

const generalButton = document.getElementById('general-btn');
const axisOrientationButton = document.getElementById('axis-orientation-btn');
const eulerAngleOrderButton = document.getElementById('euler-angle-order-btn');
const bodyFrameButton = document.getElementById('body-frame-btn');
const spaceFrameButton = document.getElementById('space-frame-btn');
const omegaButton = document.getElementById('omega-btn');
const hButton = document.getElementById('h-btn');
const torquePrefsButton = document.getElementById('torque-prefs-btn');
const conesButton = document.getElementById('cones-btn');
const poinsotButton = document.getElementById('poinsot-btn');
const prefsReturnButton = document.getElementById('prefs-return-btn');

const numericalElementsGeneral = document.getElementById('numerical-elements-general');
const attitudeEulerElements = document.getElementById('attitude-euler-elements');
const attitudeQuaternionElements = document.getElementById('attitude-quaternion-elements');
const massPropElements = document.getElementById('mass-prop-elements');
const rotationElements = document.getElementById('rotation-elements');
const torqueFrameElements = document.getElementById('torque-frame-elements');
// const aeroElements = document.getElementById('aero-elements');
const acsElements = document.getElementById('acs-elements');
// const numericalElementsAero = document.getElementById('numerical-elements-aero');
const torqueGGElements = document.getElementById('torque-gg-elements');
const torqueTopElements = document.getElementById('torque-top-elements');
const torqueOptionElements = document.getElementById('torque-option-elements');
const generalElements = document.getElementById('general-elements');
const axisOrientationElements = document.getElementById('axis-orientation-elements');
const eulerAngleOrderElements = document.getElementById('euler-angle-order-elements');
const bodyFrameElements = document.getElementById('body-frame-elements');
const spaceFrameElements = document.getElementById('space-frame-elements');
const omegaElements = document.getElementById('omega-elements');
const hElements = document.getElementById('h-elements');
const torqueElements = document.getElementById('torque-elements');
const conesElements = document.getElementById('cones-elements');
const poinsotElements = document.getElementById('poinsot-elements');

const objectAppearanceChoiceMenu = document.getElementById("object-appearance-choice-menu");
const objectTransparencySlider = document.getElementById("transparency-block");
const objectTransparencyDisplay = document.getElementById("transparency-block-display");
const maxOmegaSlider = document.getElementById("max-omega");
const maxOmegaDisplay = document.getElementById("max-omega-display");
const vectorSizeSlider = document.getElementById("vector-size");
const bodyFrameTransparencySlider = document.getElementById("transparency-body-frame");
const bodyFrameTransparencyDisplay = document.getElementById("transparency-body-frame-display");
const spaceFrameTransparencySlider = document.getElementById("transparency-space-frame");
const spaceFrameTransparencyDisplay = document.getElementById("transparency-space-frame-display");
const omegaTransparencySlider = document.getElementById("transparency-omega");
const omegaTransparencyDisplay = document.getElementById("transparency-omega-display");
const hTransparencySlider = document.getElementById("transparency-h");
const hTransparencyDisplay = document.getElementById("transparency-h-display");
const torqueTransparencySlider = document.getElementById("transparency-torque");
const torqueTransparencyDisplay = document.getElementById("transparency-torque-display");
const conesTransparencySlider = document.getElementById("transparency-cones");
const conesTransparencyDisplay = document.getElementById("transparency-cones-display");
const poinsotTransparencySlider = document.getElementById("transparency-poinsot");
const poinsotTransparencyDisplay = document.getElementById("transparency-poinsot-display");

const objectOffsetCheckbox = document.getElementById("offset-object");
const bodyFrameOffsetCheckbox = document.getElementById("offset-body-frame");
const spaceFrameOffsetCheckbox = document.getElementById("offset-space-frame");
const omegaOffsetCheckbox = document.getElementById("offset-omega");
const hOffsetCheckbox = document.getElementById("offset-h");
const torqueOffsetCheckbox = document.getElementById("offset-torque");
const conesOffsetCheckbox = document.getElementById("offset-cones");
const poinsotOffsetCheckbox = document.getElementById("offset-poinsot");

const ixxDisplay = document.getElementById("ixx-display");
const iyyDisplay = document.getElementById("iyy-display");
const izzDisplay = document.getElementById("izz-display");
const dcm11Number = document.getElementById("dcm11-number");
const dcm12Number = document.getElementById("dcm12-number");
const dcm13Number = document.getElementById("dcm13-number");
const dcm21Number = document.getElementById("dcm21-number");
const dcm22Number = document.getElementById("dcm22-number");
const dcm23Number = document.getElementById("dcm23-number");
const dcm31Number = document.getElementById("dcm31-number");
const dcm32Number = document.getElementById("dcm32-number");
const dcm33Number = document.getElementById("dcm33-number");
const omegaPNumber = document.getElementById("omega-P-number");
const omegaQNumber = document.getElementById("omega-Q-number");
const omegaRNumber = document.getElementById("omega-R-number");
const hXNumber = document.getElementById("hx-number");
const hYNumber = document.getElementById("hy-number");
const hZNumber = document.getElementById("hz-number");
const tauLNumber = document.getElementById("tau-L-number");
const tauMNumber = document.getElementById("tau-M-number");
const tauNNumber = document.getElementById("tau-N-number");
const quatWNumber = document.getElementById("quatW-number");
const quatXNumber = document.getElementById("quatX-number");
const quatYNumber = document.getElementById("quatY-number");
const quatZNumber = document.getElementById("quatZ-number");
const kineticEnergy = document.getElementById("kinetic-energy-number");
const showBodyXVectorCheckbox = document.getElementById("body-x");
const showBodyYVectorCheckbox = document.getElementById("body-y");
const showBodyZVectorCheckbox = document.getElementById("body-z");
const orientationRadios = document.querySelectorAll('input[name="orientation-radio"]');
const eulerOrderRadios = document.querySelectorAll('input[name="euler-order-radio"]');
const omegaOrHRadios = document.querySelectorAll('input[name="omega-or-H-radio"]');
const omegaOrHOmegaRadio = document.getElementById("omega-or-H-omega");
const omegaOrHHRadio = document.getElementById("omega-or-H-H");
const environmentRadios = document.querySelectorAll('input[name="environment-radio"]');

const bodyFrameColorMenu = document.getElementById("body-frame-color-menu");
const spaceFrameColorMenu = document.getElementById("space-frame-color-menu");
const omegaColorMenu = document.getElementById("omega-color-menu");
const hColorMenu = document.getElementById("h-color-menu");
const torqueColorMenu = document.getElementById("torque-color-menu");
const bodyConeColorMenu = document.getElementById("body-cone-color-menu");
const spaceConeColorMenu = document.getElementById("space-cone-color-menu");
const ellipsoidColorMenu = document.getElementById("inertia-ellipsoid-color-menu");
const planeColorMenu = document.getElementById("invariable-plane-color-menu");

objectAppearanceChoiceMenu.addEventListener('change', () => {
  objectAppearance = objectAppearanceChoiceMenu.value;
  sdo.constructBlock(objectAppearance);
  replaceAerotutorData('objectAppearance',objectAppearance);
  saveToLocalStorage();
});

const setMassProperties = function(option){
  objectMassProperties = option;
  replaceAerotutorData('objectMassProperties',objectMassProperties);

  if (option === 'select-an-object'){
    replaceAerotutorData('mass',mass);
    replaceAerotutorData('length',dimX);
    replaceAerotutorData('width',dimY);
    replaceAerotutorData('height',dimZ);
    sdo.setDimensionsAndInertiaProperties(mass, dimX, dimY, dimZ);
    massPropButton.disabled = false;
  }else{
    sdo.setPresetMassProperties(option);
    massPropButton.disabled = true;
  }

  displayMomentsOfInertia();
  //moments of inertia are not displayed correctly for other than
  //the first case, need to fix this
  displayNumerical(true);

  if (torqueOption === 1){
    pac.showPoinsot(poinsotTransparency < maxTransparency);

    if (dimX === dimY || dimX === dimZ || dimY === dimZ){
      pac.showCones(conesTransparency < maxTransparency);
    }
  }

  resetAttitudeAndRates();
  saveToLocalStorage();
  sdo._needsRefresh = true;
}

presetMassPropertiesMenu.addEventListener('change', () => {
  setMassProperties(presetMassPropertiesMenu.value);
});

bodyFrameColorMenu.addEventListener('change', () => {
  bodyFrameColor = bodyFrameColorMenu.value;
  setBodyFrameColor(bodyFrameColor, true);
  saveToLocalStorage();
});

spaceFrameColorMenu.addEventListener('change', () => {
  spaceFrameColor = spaceFrameColorMenu.value;
  setSpaceFrameColor(spaceFrameColor, true);
  saveToLocalStorage();
});

omegaColorMenu.addEventListener('change', () => {
  omegaColor = omegaColorMenu.value;
  setOmegaColor(omegaColor, true);
  saveToLocalStorage();
});

hColorMenu.addEventListener('change', () => {
  hColor = hColorMenu.value;
  setHColor(hColor, true);
  saveToLocalStorage();
});

torqueColorMenu.addEventListener('change', () => {
  torqueColor = torqueColorMenu.value;
  setTorqueColor(torqueColor, true);
  saveToLocalStorage();
});

bodyConeColorMenu.addEventListener('change', () => {
  bodyConeColor = bodyConeColorMenu.value;
  setBodyConeColor(bodyConeColor, true);
  saveToLocalStorage();
});

spaceConeColorMenu.addEventListener('change', () => {
  spaceConeColor = spaceConeColorMenu.value;
  setSpaceConeColor(spaceConeColor, true);
  saveToLocalStorage();
});

ellipsoidColorMenu.addEventListener('change', () => {
  ellipsoidColor = ellipsoidColorMenu.value;
  setEllipsoidColor(ellipsoidColor, true);
  saveToLocalStorage();
});

planeColorMenu.addEventListener('change', () => {
  planeColor = planeColorMenu.value;
  setPlaneColor(planeColor, true);
  saveToLocalStorage();
});

const setBodyFrameColor = function(color, save=false){
  vso.setColor('bodyFrame', color);

  if (save){
    replaceAerotutorData('bodyFrameColor',color);
  }
}

const setSpaceFrameColor = function(color, save=false){
  vso.setColor('spaceFrame', color);

  if (save){
    replaceAerotutorData('spaceFrameColor',color);
  }
}

const setOmegaColor = function(color, save=false){
  vso.setColor('omega', color);

  if (save){
    replaceAerotutorData('omegaColor',color);
  }
}

const setHColor = function(color, save=false){
  vso.setColor('h', color);

  if (save){
    replaceAerotutorData('hColor',color);
  }
}

const setTorqueColor = function(color, save=false){
  vso.setColor('torque', color);

  if (save){
    replaceAerotutorData('torqueColor',color);
  }
}

const setBodyConeColor = function(color, save=false){
  // sdo.setColor('bodyCone', color);
  pac.setColor('bodyCone', color);

  if (save){
    replaceAerotutorData('bodyConeColor',color);
  }
}

const setSpaceConeColor = function(color, save=false){
  // sdo.setColor('spaceCone', color);
  pac.setColor('spaceCone', color);

  if (save){
    replaceAerotutorData('spaceConeColor',color);
  }
}

const setEllipsoidColor = function(color, save=false){
  // sdo.setColor('ellipsoid', color);
  pac.setColor('ellipsoid', color);

  if (save){
    replaceAerotutorData('ellipsoidColor',color);
  }
}

const setPlaneColor = function(color, save=false){
  // sdo.setColor('plane', color);
  pac.setColor('plane', color);

  if (save){
    replaceAerotutorData('planeColor',color);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  renderer.setSize(sixDOFworld.clientWidth, sixDOFworld.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

window.addEventListener("orientationchange", () => {
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  renderer.setSize(sixDOFworld.clientWidth, sixDOFworld.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.clear();
  renderer.render(scene, camera);
});

const replaceAerotutorData = function(name, value){
  aerotutorData.forEach(o => {
    if (o.name === name){
      o.value = value;
    }});
}

const displayEulerAngles = function(){
  euler1Display.innerHTML = +euler1Slider.value;
  euler2Display.innerHTML = +euler2Slider.value;
  euler3Display.innerHTML = +euler3Slider.value;
  displayNumerical(true);
}

const displayOmegaValues = function(){
  let omx = omegaIhatSlider.value;
  let omy = omegaJhatSlider.value;
  let omz = omegaKhatSlider.value;
  let omm = Number(omegaMagnitudeSlider.value)/10;
  const rss = Math.sqrt(omx*omx + omy*omy + omz*omz);

  if (rss === 0){
    omegaIhatDisplay.innerHTML = "?";
    omegaJhatDisplay.innerHTML = "?";
    omegaKhatDisplay.innerHTML = "?";
    omegaPDisplay.innerHTML = "?";
    omegaQDisplay.innerHTML = "?";
    omegaRDisplay.innerHTML = "?";
    return;
  }

  omx = Number(omx/rss).toFixed(2).toString();
  omy = Number(omy/rss).toFixed(2).toString();
  omz = Number(omz/rss).toFixed(2).toString();
  omegaMagnitudeDisplay.innerHTML = Number(omm).toFixed(2).toString();
  hMagnitudeDisplay.innerHTML = Number(sdo.getAngularMomentumMagnitude()).toFixed(2).toString();
  // the slider goes from 0 to 100, but the displayed
  // value should go from 0 to 10
  omegaIhatDisplay.innerHTML = omx;
  omegaJhatDisplay.innerHTML = omy;
  omegaKhatDisplay.innerHTML = omz;
  omegaPDisplay.innerHTML = Number(omx*omm).toFixed(2).toString();
  omegaQDisplay.innerHTML = Number(omy*omm).toFixed(2).toString();
  omegaRDisplay.innerHTML = Number(omz*omm).toFixed(2).toString();
}

const constructPaC = function(){
  pac.receiveEphemeralData(...sdo.sharePaCEphemeralData());
  pac.receiveNonEphemeralData(...sdo.sharePaCNonEphemeralData());
  pac.construct();
}

const resetAttitudeAndRates = function(includeRates = true){
  sdo.setEulerAngles(euler1,euler2,euler3);
  sdo.reset();
  syncQuatToObject();

  if (includeRates){
    sdo.setOmega(omegaOrH,omegaMag,omHihat,omHjhat,omHkhat);

    // if (torqueOption === 7){
    //   updateAeroTorquer();
    //   // sdo.computeAeroForceAndTorque();
    //   displayNumerical();
    // }
    constructPaC();
  }

  if (torqueOption === 1){
    pac.showCones(conesTransparency < maxTransparency);
    pac.showPoinsot(poinsotTransparency < maxTransparency);
  }

  sdo._needsRefresh = true;
  vso._needsRefresh = true;
  pac._needsRefresh = true;

  sdo.refresh();
  vso.refresh();
  pac.refresh();
  displayEulerAngles();
  displayNumerical(true);
  haltPlay();
}

const displayMomentsOfInertia = function(){
  let ixx = 0;
  let iyy = 0;
  let izz = 0;

  if (objectMassProperties === 'select-an-object'){
    // allow one dimension to be zero but not two or more,
    // this is not necessary if we check before the function
    // but might be good for safety
    const p1 = dimX === 0;
    const p2 = dimY === 0;
    const p3 = dimZ === 0;
    
    if ((p1 && p2) || (p1 && p3) || (p2 && p3)){
      ixx = 0;
      iyy = 0;
      izz = 0;
    }else{
      ixx = Math.round((dimY*dimY + dimZ*dimZ)*mass/12*100)/100;
      iyy = Math.round((dimX*dimX + dimZ*dimZ)*mass/12*100)/100;
      izz = Math.round((dimX*dimX + dimY*dimY)*mass/12*100)/100;
    }
  }else{
    // preset mass properties can have products of inertia, but we
    // choose not to display them
    [ixx, iyy, izz] = sdo.getMomentsOfInertia();
  }

  ixxNumber.innerHTML = ixx;
  iyyNumber.innerHTML = iyy;
  izzNumber.innerHTML = izz;
  ixxDisplay.innerHTML = ixx;
  iyyDisplay.innerHTML = iyy;
  izzDisplay.innerHTML = izz;
}

const handleMassPropsSliders = function(){
  displayMomentsOfInertia();
  sdo.setDimensionsAndInertiaProperties(mass, dimX, dimY, dimZ);
  sdo.reset();
  resetAttitudeAndRates();
  //make sure that massSlider, dimXSlider, dimYSlider, and dimZSlider are
  //such that there are not too many choices, otherwise things get called many
  //times here as the slider is being moved. use onpointerup instead of oninput
}

massSlider.oninput = function(){
  mass = masses[+massSlider.value];
  massDisplay.innerHTML = mass;
  handleMassPropsSliders();
}

dimXSlider.oninput = function(){
  const temp = +dimXSlider.value;

  if ((temp === 0 && dimY === 0) || (temp === 0 && dimZ === 0) ){
    dimXSlider.value = 1;
    return;
  }

  dimX = temp;
  dimXDisplay.innerHTML = dimX;
  handleMassPropsSliders();
}

dimYSlider.oninput = function(){
  const temp = +dimYSlider.value;

  if ((temp === 0 && dimX === 0) || (temp === 0 && dimZ === 0) ){
    dimYSlider.value = 1;
    return;
  }

  dimY = temp;
  dimYDisplay.innerHTML = dimY;
  handleMassPropsSliders();
}

dimZSlider.oninput = function(){
  const temp = +dimZSlider.value;

  if ((temp === 0 && dimX === 0) || (temp === 0 && dimY === 0) ){
    dimZSlider.value = 1;
    return;
  }

  dimZ = temp;
  dimZDisplay.innerHTML = dimZ;
  handleMassPropsSliders();
}

const doMassPropOnPointerUp = function(){
  displayNumerical(true);

  if (objectMassProperties !== 'select-an-object'){
    presetMassPropertiesMenu.value = 'select-an-object';
    objectMassProperties = 'select-an-object';
    replaceAerotutorData('objectMassProperties',objectMassProperties);
    replaceAerotutorData('mass',mass);
    replaceAerotutorData('length',dimX);
    replaceAerotutorData('width',dimY);
    replaceAerotutorData('height',dimZ);
  }

  saveToLocalStorage();
}

massSlider.onpointerup = function(){
  replaceAerotutorData('mass',mass);
  doMassPropOnPointerUp();
}

dimXSlider.onpointerup = function(){
  replaceAerotutorData('length',dimX);
  doMassPropOnPointerUp();
}

dimYSlider.onpointerup = function(){
  replaceAerotutorData('width',dimY);
  doMassPropOnPointerUp();
}

dimZSlider.onpointerup = function(){
  replaceAerotutorData('height',dimZ);
  doMassPropOnPointerUp();
}

const syncQuatToObject = function(){
  const [qw, qx, qy, qz] = sdo.getQuaternionElements();
  quatW = qw;
  quatX = qx;
  quatY = qy;
  quatZ = qz;
}

const setQuatSlidersToQuat = function(){
  let rss = Math.sqrt(quatX*quatX + quatY*quatY + quatZ*quatZ);

  if (rss === 0){
    //quatX is chosen at random, any unit vector is okay to use
    quatX = 1;
    rss = 1;
  }

  const lamdaX = quatX/rss;
  const lamdaY = quatY/rss;
  const lamdaZ = quatZ/rss;

  //safety check so that acos does not fail
  quatW = quatW > 1 ? 1 : quatW;
  quatW = quatW < -1 ? -1 : quatW;
  let theta = 2*Math.acos(quatW)/piOver180;
  
  //acos returns angle from 0 to 2pi but want negative angles
  if (theta >= 180){
    theta = theta - 360;
  }

  //possibly unnecessary check so that theta goes
  //from -180 to 179 like quaternianAngleSlider
  theta = theta > 179 ? 179 : theta;
  theta = theta < -180 ? -180 : theta;

  //slider ihat, jhat, and khat values range from -100 to 100
  quaternianAngleSlider.value = theta;
  quaternianIhatSlider.value = lamdaX*100;
  quaternianJhatSlider.value = lamdaY*100;
  quaternianKhatSlider.value = lamdaZ*100;
  quaternianAngleDisplay.innerHTML = Number(theta).toFixed(0).toString();
  quaternianIhatDisplay.innerHTML = Number(lamdaX).toFixed(2).toString();
  quaternianJhatDisplay.innerHTML = Number(lamdaY).toFixed(2).toString();
  quaternianKhatDisplay.innerHTML = Number(lamdaZ).toFixed(2).toString();
  quatWDisplay.innerHTML = Number(quatW).toFixed(4).toString();
  quatXDisplay.innerHTML = Number(quatX).toFixed(4).toString();
  quatYDisplay.innerHTML = Number(quatY).toFixed(4).toString();
  quatZDisplay.innerHTML = Number(quatZ).toFixed(4).toString();
}

const syncEulerAnglesToObject = function(){
  const [e1, e2, e3] = sdo.getEulerAngles();
  euler1 = e1;
  euler2 = e2;
  euler3 = e3;
}

torqueOptionButton.addEventListener('click', () => {
  torqueOption++;
  torqueOption = torqueOption > 6 ? 1 : torqueOption;
  replaceAerotutorData('torqueOption',torqueOption);
  saveToLocalStorage();
  handleMainButtons('torque');
  resetAttitudeAndRates();
});

attitudeOptionButton1.addEventListener('click', () => {
  setQuatSlidersToQuat();
  sdo.refresh();
  vso.refresh();
  pac.refresh();
  attitudeOption = attitudeOption === 1 ? 2 : 1;
  handleMainButtons('attitude');
  replaceAerotutorData('attitudeOption',2);
  saveToLocalStorage();
});

attitudeOptionButton2.addEventListener('click', () => {
  euler1Slider.value = euler1;
  euler2Slider.value = euler2;
  euler3Slider.value = euler3;
  displayEulerAngles();
  sdo.refresh();
  vso.refresh();
  pac.refresh();
  attitudeOption = attitudeOption === 1 ? 2 : 1;
  handleMainButtons('attitude');
  replaceAerotutorData('attitudeOption',1);
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
});

const handleEulerOnInput = function(){
  euler1 = euler1Slider.value;
  euler2 = euler2Slider.value;
  euler3 = euler3Slider.value;
  sdo.setEulerAngles(euler1, euler2, euler3);
  syncQuatToObject();
  displayEulerAngles();
  haltPlay();
  vso._needsRefresh = true;
  pac._needsRefresh = true;
}

euler1Slider.oninput = function(){
  handleEulerOnInput();
}

euler2Slider.oninput = function(){
  handleEulerOnInput();
}

euler3Slider.oninput = function(){
  handleEulerOnInput();
}

euler1Slider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',this.value);
  saveToLocalStorage();
}

euler2Slider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle2',this.value);
  saveToLocalStorage();
}

euler3Slider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle3',this.value);
  saveToLocalStorage();
}

zeroEuler1Button.addEventListener('click', () => {
  euler1Slider.value = 0;
  handleEulerOnInput();
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',0);
  saveToLocalStorage();
});

zeroEuler2Button.addEventListener('click', () => {
  euler2Slider.value = 0;
  handleEulerOnInput();
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle2',0);
  saveToLocalStorage();
});

zeroEuler3Button.addEventListener('click', () => {
  euler3Slider.value = 0;
  handleEulerOnInput();
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle3',0);
  saveToLocalStorage();
});

const setAndDisplayQuaternionValues = function(){
  let thetaOver2 = Number(quaternianAngleSlider.value)/2*piOver180;
  let ihat = quaternianIhatSlider.value;
  let jhat = quaternianJhatSlider.value;
  let khat = quaternianKhatSlider.value;
  let rss = Math.sqrt(ihat*ihat + jhat*jhat + khat*khat);
  const sinThetaOver2 = Math.sin(thetaOver2);
  const cosThetaOver2 = Math.cos(thetaOver2);

  if (rss === 0){
    quaternianIhatDisplay.innerHTML = "?";
    quaternianJhatDisplay.innerHTML = "?";
    quaternianKhatDisplay.innerHTML = "?";
    quatWDisplay.innerHTML = "?";
    quatXDisplay.innerHTML = "?";
    quatYDisplay.innerHTML = "?";
    quatZDisplay.innerHTML = "?";
    return;
  }

  ihat = ihat/rss;
  jhat = jhat/rss;
  khat = khat/rss;

  quatW = cosThetaOver2;
  quatX = sinThetaOver2*ihat;
  quatY = sinThetaOver2*jhat;
  quatZ = sinThetaOver2*khat;

  // normalize the quaternion
  rss = Math.sqrt(quatW*quatW + quatX*quatX + quatY*quatY + quatZ*quatZ);

  if (rss === 0){
    quatW = 1;
    quatX = 0;
    quatY = 0;
    quatZ = 0;
  }else{
    quatW = quatW/rss;
    quatX = quatX/rss;
    quatY = quatY/rss;
    quatZ = quatZ/rss;
  }

  quaternianAngleDisplay.innerHTML = quaternianAngleSlider.value;
  quaternianIhatDisplay.innerHTML = Number(ihat).toFixed(2).toString();
  quaternianJhatDisplay.innerHTML = Number(jhat).toFixed(2).toString();
  quaternianKhatDisplay.innerHTML = Number(khat).toFixed(2).toString();
  quatWDisplay.innerHTML = Number(quatW).toFixed(4).toString();
  quatXDisplay.innerHTML = Number(quatX).toFixed(4).toString();
  quatYDisplay.innerHTML = Number(quatY).toFixed(4).toString();
  quatZDisplay.innerHTML = Number(quatZ).toFixed(4).toString();
  sdo.syncDCMtoQuat();
}

const handleQuatOnInput = function(){
  setAndDisplayQuaternionValues();
  sdo.setEulerAnglesFromQuaternion(quatW, quatX, quatY, quatZ);
  syncEulerAnglesToObject();
  haltPlay();
  vso._needsRefresh = true;
  pac._needsRefresh = true;
}

quaternianAngleSlider.oninput = function(){
  handleQuatOnInput();
}

quaternianIhatSlider.oninput = function(){
  handleQuatOnInput();
}

quaternianJhatSlider.oninput = function(){
  handleQuatOnInput();
}

quaternianKhatSlider.oninput = function(){
  handleQuatOnInput();
}

quaternianAngleSlider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
}

quaternianIhatSlider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
}

quaternianJhatSlider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
}

quaternianKhatSlider.onpointerup = function(){
  resetAttitudeAndRates(false);
  sdo.syncDCMtoQuat();
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
}

zeroQuaternionAngleButton.addEventListener('click', () => {
  quaternianAngleSlider.value = 0;
  handleQuatOnInput();
  resetAttitudeAndRates(false);
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
});

zeroQuaternionIhatButton.addEventListener('click', () => {
  quaternianIhatSlider.value = 0;
  handleQuatOnInput();
  resetAttitudeAndRates(false);
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
});

zeroQuaternionJhatButton.addEventListener('click', () => {
  quaternianJhatSlider.value = 0;
  handleQuatOnInput();
  resetAttitudeAndRates(false);
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
});

zeroQuaternionKhatButton.addEventListener('click', () => {
  quaternianKhatSlider.value = 0;
  handleQuatOnInput();
  resetAttitudeAndRates(false);
  replaceAerotutorData('eulerAngle1',euler1);
  replaceAerotutorData('eulerAngle2',euler2);
  replaceAerotutorData('eulerAngle3',euler3);
  saveToLocalStorage();
});

const haltPlay = function(){
  if (playing){
    playing = false;
    playPauseButton.innerHTML = `<i class="material-icons">play_arrow</i>`;
    sdo._realTime = 0;
    sdo._simulationTime = 0;
    clock.getDelta();
  }
}

omegaMagnitudeSlider.oninput = function(){
  displayOmegaValues();
  haltPlay();
}

omegaIhatSlider.oninput = function(){
  displayOmegaValues();
  haltPlay();
}

omegaJhatSlider.oninput = function(){
  displayOmegaValues();
  haltPlay();
}

omegaKhatSlider.oninput = function(){
  displayOmegaValues();
  haltPlay();
}

const handleOmegaSliderOnpointerup = function(){
  omegaMag = omegaMagnitudeSlider.value/10;
  // slider goes from 0 to 100, we want 10 to be the
  // upper limit, so we divide by 10 here
  omHihat = omegaIhatSlider.value;
  omHjhat = omegaJhatSlider.value;
  omHkhat = omegaKhatSlider.value;
  resetAttitudeAndRates();
  vso._needsRefresh = true;
  displayOmegaValues();
}

omegaMagnitudeSlider.onpointerup = function(){
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omegaMagnitude',this.value);
  saveToLocalStorage();
}

omegaIhatSlider.onpointerup = function(){
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHihat',this.value);
  saveToLocalStorage();
}

omegaJhatSlider.onpointerup = function(){
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHjhat',this.value);
  saveToLocalStorage();
}

omegaKhatSlider.onpointerup = function(){
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHkhat',this.value);
  saveToLocalStorage();
}

zeroOmegaIhatButton.addEventListener('click', () => {
  omegaIhatSlider.value = 0;
  displayOmegaValues();
  haltPlay();
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHihat',0);
  saveToLocalStorage();
});

zeroOmegaJhatButton.addEventListener('click', () => {
  omegaJhatSlider.value = 0;
  displayOmegaValues();
  haltPlay();
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHjhat',0);
  saveToLocalStorage();
});

zeroOmegaKhatButton.addEventListener('click', () => {
  omegaKhatSlider.value = 0;
  displayOmegaValues();
  haltPlay();
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omHkhat',0);
  saveToLocalStorage();
});

const displayTorqueValues = function(){
  let taux = torqueIhatSlider.value;
  let tauy = torqueJhatSlider.value;
  let tauz = torqueKhatSlider.value;
  let taumag = torqueMagnitudeSlider.value/5;
  // the slider goes from 0 to 50, but the value should go from 0 to 10
  const rss = Math.sqrt(taux*taux + tauy*tauy + tauz*tauz);

  if (rss === 0){
    torqueIhatDisplay.innerHTML = "?";
    torqueJhatDisplay.innerHTML = "?";
    torqueKhatDisplay.innerHTML = "?";
    torqueLDisplay.innerHTML = "?";
    torqueMDisplay.innerHTML = "?";
    torqueNDisplay.innerHTML = "?";
    return;
  }

  torqueMagnitudeDisplay.innerHTML = taumag;
  torqueIhatDisplay.innerHTML = Number(taux/rss).toFixed(2).toString();
  torqueJhatDisplay.innerHTML = Number(tauy/rss).toFixed(2).toString();
  torqueKhatDisplay.innerHTML = Number(tauz/rss).toFixed(2).toString();
  torqueLDisplay.innerHTML = Number(taux*taumag/rss).toFixed(2).toString();//?
  torqueMDisplay.innerHTML = Number(tauy*taumag/rss).toFixed(2).toString();//?
  torqueNDisplay.innerHTML = Number(tauz*taumag/rss).toFixed(2).toString();//?
  displayNumerical(true);
}

// const updateAeroTorquer = function(){
//   const airspeed = aeroAirspeedChoices[+aeroAirSpeedSlider.value];
//   const airDensity = aeroDensityChoices[+aeroAltitudeSlider.value];
//   const azimuth = aeroAzimuthSlider.value;
//   const gamma = aeroGammaSlider.value;
//   const thrust = aeroThrustSlider.value;

//   aeroAirSpeed2Display.innerHTML = Number(airspeed).toFixed(0).toString();
//   aeroChi2Display.innerHTML = Number(azimuth).toFixed(0).toString();
//   aeroGamma2Display.innerHTML = Number(gamma).toFixed(0).toString();
//   aeroThrustDisplay.innerHTML = Number(thrust).toFixed(1).toString();

//   sdo.setAeroAirspeed(airspeed);
//   sdo.setAeroAirDensity(airDensity);
//   sdo.setAeroAzimuth(azimuth);
//   sdo.setAeroGamma(gamma);
//   sdo.setAeroThrustMagnitude(thrust);//slider goes from 0 to 100, need to match drag
//   sdo.makeAeroSpaceToWindMatrix();
//   sdo.setInertialVelocity();
//   sdo.computeDynamicPressure();
// }

// aeroAirSpeedSlider.oninput = function(){
//   haltPlay();
//   updateAeroTorquer();
//   displayNumerical();
// }

// aeroAltitudeSlider.oninput = function(){
//   haltPlay();
//   aeroAltitudeDisplay.innerHTML = aeroAltitudeChoices[+aeroAltitudeSlider.value];
//   aeroAltitude2Display.innerHTML = aeroAltitudeChoices[+aeroAltitudeSlider.value];
//   updateAeroTorquer();
//   displayNumerical();
// }

// aeroAzimuthSlider.oninput = function(){
//   haltPlay();
//   updateAeroTorquer();
//   displayNumerical();
// }

// aeroGammaSlider.oninput = function(){
//   haltPlay();
//   updateAeroTorquer();
//   displayNumerical();
// }

// aeroThrustSlider.oninput = function(){
//   haltPlay();
//   updateAeroTorquer();
//   displayNumerical();
// }

torqueMagnitudeSlider.oninput = function(){
  displayTorqueValues();
  haltPlay();
}

torqueIhatSlider.oninput = function(){
  displayTorqueValues();
  haltPlay();
}

torqueJhatSlider.oninput = function(){
  displayTorqueValues();
  haltPlay();
}

torqueKhatSlider.oninput = function(){
  displayTorqueValues();
  haltPlay();
}

acsDeadZoneSlider.oninput = function(){
  haltPlay();
  torqueACSDZ = Number(acsDeadZoneSlider.value)/10;
  acsDeadZoneDisplay.innerHTML = Number(acsdz).toFixed(2).toString();
  sdo.setACSDeadzoneOmega(torqueACSDZ*piOver180);
  displayNumerical();
}

acsTorqueMagnitudeSlider.oninput = function(){
  haltPlay();
  const acsTorque = Number(acsTorqueMagnitudeSlider.value)/100;
  acsTorqueMagnitudeDisplay.innerHTML = Number(acsTorque).toFixed(2).toString();
  sdo.setACSTorque(acsTorque);
  displayNumerical();
}

torqueMuOverR3Slider.oninput = function(){
  torqueGG = +torqueMuOverR3Slider.value;
  muOverR3 = muOverR3Choices[torqueGG];
  torqueMuOverR3Display.innerHTML = muOverR3ChoiceDisplay[+torqueMuOverR3Slider.value];
  sdo.set3MuOverR3(3*muOverR3);
  haltPlay();
}

torqueTopXDistanceSlider.oninput = function(){
  torqueTopX = Number(torqueTopXDistanceSlider.value);
  torqueTopXDistanceDisplay.innerHTML = torqueTopX;
  sdo.setTopXDistance(torqueTopX);
  haltPlay();
}

torqueTopGravitySlider.oninput = function(){
  torqueTopGrav = torqueTopGravitySlider.value;
  torqueTopGravityDisplay.innerHTML = torqueTopGrav;
  sdo.setTopGravity(torqueTopGrav);
  haltPlay();
}

const handleTorqueSlidersOnpointerup = function(option){
  switch (option){
    case 1:// space or body frame
      torqueMag = torqueMagnitudeSlider.value/5;
      // slider goes from 0 to 50, we want 10 to be the
      // upper limit, so we divide by 5 here
      torqueIhat = torqueIhatSlider.value;
      torqueJhat = torqueJhatSlider.value;
      torqueKhat = torqueKhatSlider.value;
      sdo.setTorque(torqueOption, torqueMag, torqueIhat, torqueJhat, torqueKhat);
      vso.receiveVectorData(...sdo.shareVectorData());
      vso._needsRefresh = true;
      replaceAerotutorData('torqueMag',torqueMag);
      replaceAerotutorData('torqueIhat',torqueIhat);
      replaceAerotutorData('torqueJhat',torqueJhat);
      replaceAerotutorData('torqueKhat',torqueKhat);
      break;
    case 2:// acs
      replaceAerotutorData('torqueACSDZ',torqueACSDZ);
      replaceAerotutorData('torqueACSTorque',torqueACSTorque);
      break;
    case 3:// gravity gradient
      replaceAerotutorData('torqueGG',torqueGG);
      break;
    case 4:// top
      replaceAerotutorData('torqueTopX',torqueTopX);
      replaceAerotutorData('torqueTopGrav',torqueTopGrav);
      break;
  }

  saveToLocalStorage();
  resetAttitudeAndRates();
  haltPlay();
  displayTorqueValues();
}

torqueMagnitudeSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(1);
}

torqueIhatSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(1);
}

torqueJhatSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(1);
}

torqueKhatSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(1);
}

zeroTorqueXButton.addEventListener('click', () => {
  torqueIhatSlider.value = 0;
  handleTorqueSlidersOnpointerup(1);
});

zeroTorqueYButton.addEventListener('click', () => {
  torqueJhatSlider.value = 0;
  handleTorqueSlidersOnpointerup(1);
});

zeroTorqueZButton.addEventListener('click', () => {
  torqueKhatSlider.value = 0;
  handleTorqueSlidersOnpointerup(1);
});

acsDeadZoneSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(2);
}

acsTorqueMagnitudeSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(2);
}

torqueMuOverR3Slider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(3);
}

torqueTopXDistanceSlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(4);
}

torqueTopGravitySlider.onpointerup = function(){
  handleTorqueSlidersOnpointerup(4);
}

const setTransparency = function(thing, transparency){
  const opacity = (100 - transparency)/100;
  sdo.setOpacity(thing, opacity);
  vso.setOpacity(thing, opacity);
  pac.setOpacity(thing, opacity);

  switch (thing){
    case 'object':
      objectTransparencyDisplay.innerHTML = transparency;
      break;
    case 'bodyFrame':
      bodyFrameTransparencyDisplay.innerHTML = transparency; 
      break;
    case 'spaceFrame':
      spaceFrameTransparencyDisplay.innerHTML = transparency;
      break;
    case 'omega':
      omegaTransparencyDisplay.innerHTML = transparency;
      break;
    case 'h':
      hTransparencyDisplay.innerHTML = transparency;
      break;
    case 'torque':
      torqueTransparencyDisplay.innerHTML = transparency;
      break;
    case 'cones':
      conesTransparencyDisplay.innerHTML = transparency;
      break;
    case 'poinsot':
      poinsotTransparencyDisplay.innerHTML = transparency;
      break;
  }
}

objectTransparencySlider.oninput = function(){
  objectTransparencyDisplay.innerText = objectTransparencySlider.value;
  setTransparency('object',this.value);
}

objectTransparencySlider.onpointerup = function(){
  setTransparency('object',this.value);
  replaceAerotutorData('objectTransparency',this.value);
  sdo.showObject(this.value < maxTransparency);
  replaceAerotutorData('showObject',this.value < maxTransparency);
  saveToLocalStorage();
}

bodyFrameTransparencySlider.onpointerup = function(){
  setTransparency('bodyFrame',this.value);
  replaceAerotutorData('bodyFrameTransparency',this.value);
  vso.showBodyFrame(this.value < maxTransparency);
  saveToLocalStorage();
}

bodyFrameTransparencySlider.oninput = function(){
  bodyFrameTransparencyDisplay.innerText = bodyFrameTransparencySlider.value;
  setTransparency('bodyFrame',this.value);
}

spaceFrameTransparencySlider.onpointerup = function(){
  replaceAerotutorData('spaceFrameTransparency',this.value);
  vso.showSpaceFrame(this.value < maxTransparency);
  saveToLocalStorage();
}

spaceFrameTransparencySlider.oninput = function(){
  spaceFrameTransparencyDisplay.innerText = spaceFrameTransparencySlider.value;
  setTransparency('spaceFrame',this.value);
}

omegaTransparencySlider.oninput = function(){
  omegaTransparencyDisplay.innerText = omegaTransparencySlider.value;
  setTransparency('omega',this.value);
}

omegaTransparencySlider.onpointerup = function(){
  setTransparency('omega',this.value);
  replaceAerotutorData('omegaTransparency',this.value);
  vso.showOmega(this.value < maxTransparency);
  saveToLocalStorage();
}

hTransparencySlider.onpointerup = function(){
  setTransparency('h',this.value);
  replaceAerotutorData('hTransparency',this.value);
  vso.showAngularMomentum(this.value < maxTransparency);
  saveToLocalStorage();
}

hTransparencySlider.oninput = function(){
  hTransparencyDisplay.innerText = hTransparencySlider.value;
  setTransparency('h',this.value);
}

torqueTransparencySlider.onpointerup = function(){
  setTransparency('torque',this.value);
  replaceAerotutorData('torqueTransparency',this.value);
  vso.showTorque(this.value < maxTransparency);
  saveToLocalStorage();
}

torqueTransparencySlider.oninput = function(){
  torqueTransparencyDisplay.innerText = torqueTransparencySlider.value;
  setTransparency('torque',this.value);
}

conesTransparencySlider.onpointerup = function(){
  setTransparency('cones',this.value);
  replaceAerotutorData('conesTransparency',this.value);

  if (torqueOption === 1){
    pac.showCones(this.value < maxTransparency);
  }
  
  saveToLocalStorage();
}

conesTransparencySlider.oninput = function(){
  conesTransparencyDisplay.innerText = conesTransparencySlider.value;
  setTransparency('cones',this.value);
}

poinsotTransparencySlider.onpointerup = function(){
  setTransparency('poinsot',this.value);
  replaceAerotutorData('poinsotTransparency',this.value);
  pac.showPoinsot(this.value < maxTransparency);
  saveToLocalStorage();
}

poinsotTransparencySlider.oninput = function(){
  poinsotTransparencyDisplay.innerText = poinsotTransparencySlider.value;
  setTransparency('poinsot',this.value);
}

const setEnvironment = function(env, getFromRadios=false){
  for (let radio of environmentRadios) {
    if (getFromRadios){
      if (radio.checked){
        replaceAerotutorData('environment',radio.value);
        saveToLocalStorage();
      }
    }else{
      radio.checked = radio.value === env;
    }

    if (radio.checked){
      loadBackground(radio.value);
    }
  }
}

maxOmegaSlider.oninput = function(){
  maxOmegaDisplay.innerText = maxOmegaSlider.value;
}

maxOmegaSlider.onpointerup = function(){
  maxOmega = Number(this.value);
  replaceAerotutorData('maxOmega',maxOmega);
  saveToLocalStorage();
}

vectorSizeSlider.onpointerup = function(){
  vso.setVectorSize(this.value);
  pac.setConeSize(this.value);
  replaceAerotutorData('vectorSize',this.value);
  saveToLocalStorage();
}

omegaOrHOmegaRadio.addEventListener('click', () => {
  omegaOrH = 'omega';
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omegaOrH',omegaOrH);
  saveToLocalStorage();
});

omegaOrHHRadio.addEventListener('click', () => {
  omegaOrH = 'H';
  handleOmegaSliderOnpointerup();
  replaceAerotutorData('omegaOrH',omegaOrH);
  saveToLocalStorage();
});

const setOmegaOrHChoice = function(omOrH, getFromRadios=false){
  for (let radio of omegaOrHRadios) {
    if (getFromRadios){
      if (radio.checked){
        replaceAerotutorData('omegaOrH',radio.value);
      }
    }else{
      radio.checked = radio.value === omOrH;
    }

    if (radio.checked){
      omegaOrH = radio.value;
    }
  }
}

objectOffsetCheckbox.addEventListener('change', () => {
  sdo.setOrigin('object', objectOffsetCheckbox.checked);
  replaceAerotutorData('objectOffset',objectOffsetCheckbox.checked);
  saveToLocalStorage();
  sdo.refresh();
});

bodyFrameOffsetCheckbox.addEventListener('change', () => {
  vso.setOrigin('bodyFrame', bodyFrameOffsetCheckbox.checked);
  replaceAerotutorData('bodyFrameOffset',bodyFrameOffsetCheckbox.checked);
  saveToLocalStorage();
  vso.refresh();
});

spaceFrameOffsetCheckbox.addEventListener('change', () => {
  vso.setOrigin('spaceFrame', spaceFrameOffsetCheckbox.checked);
  replaceAerotutorData('spaceFrameOffset',spaceFrameOffsetCheckbox.checked);
  saveToLocalStorage();
  vso.refresh();
});

omegaOffsetCheckbox.addEventListener('change', () => {
  vso.setOrigin('omega', omegaOffsetCheckbox.checked);
  replaceAerotutorData('omegaOffset',omegaOffsetCheckbox.checked);
  saveToLocalStorage();
  vso.refresh();
});

hOffsetCheckbox.addEventListener('change', () => {
  vso.setOrigin('h', hOffsetCheckbox.checked);
  replaceAerotutorData('hOffset',hOffsetCheckbox.checked);
  saveToLocalStorage();
  vso.refresh();
});

torqueOffsetCheckbox.addEventListener('change', () => {
  vso.setOrigin('torque', torqueOffsetCheckbox.checked);
  replaceAerotutorData('torqueOffset',torqueOffsetCheckbox.checked);
  saveToLocalStorage();
  vso.refresh();
});

conesOffsetCheckbox.addEventListener('change', () => {
  pac.setOrigin('cones', conesOffsetCheckbox.checked);
  replaceAerotutorData('conesOffset',conesOffsetCheckbox.checked);
  saveToLocalStorage();
  pac.refresh();
});

poinsotOffsetCheckbox.addEventListener('change', () => {
  pac.setOrigin('poinsot', poinsotOffsetCheckbox.checked);
  replaceAerotutorData('poinsotOffset',poinsotOffsetCheckbox.checked);
  saveToLocalStorage();
  pac.refresh();
});

const doPlayPause = function(){
  playing = playing ? false : true;
  playPauseButton.innerHTML = playing ? `<i class="material-icons">pause</i>` : `<i class="material-icons">play_arrow</i>`;
  sdo._realTime = 0;
  sdo._simulationTime = 0;
  clock.getDelta();
}

playPauseButton.addEventListener('click', () => {
  doPlayPause();
});

resetButton.addEventListener('click', () => {
  displayMaxOmega(false);
  resetAttitudeAndRates();
});

const showBodyVector = function(){
  vso.showBodyAxis(showBodyXVectorCheckbox.checked, showBodyYVectorCheckbox.checked, showBodyZVectorCheckbox.checked);
  renderer.clear();
  renderer.render(scene, camera);
}

showBodyXVectorCheckbox.addEventListener('change', () => {
  showBodyVector();
  replaceAerotutorData('showBodyXVector',showBodyXVectorCheckbox.checked);
  saveToLocalStorage();
});

showBodyYVectorCheckbox.addEventListener('change', () => {
  showBodyVector();
  replaceAerotutorData('showBodyYVector',showBodyYVectorCheckbox.checked);
  saveToLocalStorage();
});

showBodyZVectorCheckbox.addEventListener('change', () => {
  showBodyVector();
  replaceAerotutorData('showBodyZVector',showBodyZVectorCheckbox.checked);
  saveToLocalStorage();
});

const handleAllRadioButtons = function(){
  for (let radio of eulerOrderRadios) {
    if (radio.checked) {
      sdo.setEulerOrder(radio.value);
      replaceAerotutorData('eulerOrder',radio.value);
    }
  }

  for (let radio of orientationRadios) {
    if (radio.checked) {
      sdo.setOrientation(radio.value);
      vso.setOrientation(radio.value);
      pac.setOrientation(radio.value);
      replaceAerotutorData('axesOrientation',radio.value);
    }
  }

  setEnvironment(environment, true);
  setOmegaOrHChoice(omegaOrH, true);
}

// numericalGeneralButton.addEventListener('click', () => {
//   numericalElementsGeneral.style.display = 'grid';
//   // numericalElementsAero.style.display = 'none';
//   numericalDisplayIsGeneral = numericalDisplayIsGeneral ? false : true;
//   displayNumerical();
// });

// numericalAeroButton.addEventListener('click', () => {
//   numericalElementsGeneral.style.display = 'none';
//   numericalElementsAero.style.display = 'grid';
//   numericalDisplayIsGeneral = numericalDisplayIsGeneral ? false : true;
//   displayNumerical();
// });

const displayNumerical = function(display = false){
  if ((display || numericalElementsGeneral.style.display === 'grid' /* || numericalElementsAero.style.display === 'grid'*/) && sdo != null){
    if (numericalDisplayIsGeneral){
      const omegaX = Number(sdo._omega.x).toFixed(3).toString();
      const omegaY = Number(sdo._omega.y).toFixed(3).toString();
      const omegaZ = Number(sdo._omega.z).toFixed(3).toString();
      const hX = Number(sdo._Hinertial.x).toFixed(2).toString();
      const hY = Number(sdo._Hinertial.y).toFixed(2).toString();
      const hZ = Number(sdo._Hinertial.z).toFixed(2).toString();
      const tauX = Number(sdo._torque.x).toFixed(3).toString();
      const tauY = Number(sdo._torque.y).toFixed(3).toString();
      const tauZ = Number(sdo._torque.z).toFixed(3).toString();
      const dcm11 = Number(sdo._dcm.elements[0]).toFixed(3).toString();
      const dcm12 = Number(sdo._dcm.elements[4]).toFixed(3).toString();
      const dcm13 = Number(sdo._dcm.elements[8]).toFixed(3).toString();
      const dcm21 = Number(sdo._dcm.elements[1]).toFixed(3).toString();
      const dcm22 = Number(sdo._dcm.elements[5]).toFixed(3).toString();
      const dcm23 = Number(sdo._dcm.elements[9]).toFixed(3).toString();
      const dcm31 = Number(sdo._dcm.elements[2]).toFixed(3).toString();
      const dcm32 = Number(sdo._dcm.elements[6]).toFixed(3).toString();
      const dcm33 = Number(sdo._dcm.elements[10]).toFixed(3).toString();
      let [qw, qx, qy, qz] = sdo.getQuaternionElements();
      qw = Number(qw).toFixed(4).toString();
      qx = Number(qx).toFixed(4).toString();
      qy = Number(qy).toFixed(4).toString();
      qz = Number(qz).toFixed(4).toString();

      omegaPNumber.innerHTML = omegaX.charAt(0) === '-' ? omegaX : ` ${omegaX}`;
      omegaQNumber.innerHTML = omegaY.charAt(0) === '-' ? omegaY : ` ${omegaY}`;
      omegaRNumber.innerHTML = omegaZ.charAt(0) === '-' ? omegaZ : ` ${omegaZ}`;
      hXNumber.innerHTML = hX.charAt(0) === '-' ? hX : ` ${hX}`;
      hYNumber.innerHTML = hY.charAt(0) === '-' ? hY : ` ${hY}`;
      hZNumber.innerHTML = hZ.charAt(0) === '-' ? hZ : ` ${hZ}`;
      tauLNumber.innerHTML = tauX.charAt(0) === '-' ? tauX : ` ${tauX}`;
      tauMNumber.innerHTML = tauY.charAt(0) === '-' ? tauY : ` ${tauY}`;
      tauNNumber.innerHTML = tauZ.charAt(0) === '-' ? tauZ : ` ${tauZ}`;
      dcm11Number.innerText = dcm11.charAt(0) === '-' ? dcm11 : ` ${dcm11}`;
      dcm12Number.innerText = dcm12.charAt(0) === '-' ? dcm12 : ` ${dcm12}`;
      dcm13Number.innerText = dcm13.charAt(0) === '-' ? dcm13 : ` ${dcm13}`;
      dcm21Number.innerText = dcm21.charAt(0) === '-' ? dcm21 : ` ${dcm21}`;
      dcm22Number.innerText = dcm22.charAt(0) === '-' ? dcm22 : ` ${dcm22}`;
      dcm23Number.innerText = dcm23.charAt(0) === '-' ? dcm23 : ` ${dcm23}`;
      dcm31Number.innerText = dcm31.charAt(0) === '-' ? dcm31 : ` ${dcm31}`;
      dcm32Number.innerText = dcm32.charAt(0) === '-' ? dcm32 : ` ${dcm32}`;
      dcm33Number.innerText = dcm33.charAt(0) === '-' ? dcm33 : ` ${dcm33}`;
      quatWNumber.innerHTML = qw.charAt(0) === '-' ? qw : ` ${qw}`;
      quatXNumber.innerHTML = qx.charAt(0) === '-' ? qx : ` ${qx}`;
      quatYNumber.innerHTML = qy.charAt(0) === '-' ? qy : ` ${qy}`;
      quatZNumber.innerHTML = qz.charAt(0) === '-' ? qz : ` ${qz}`;

      const ke = sdo.getKineticEnergy();
      kineticEnergy.innerHTML = Number(ke).toFixed(2).toString();
    }else{
      // let [airDensity,airspeed,u,v,w,
      //   azimuth,gamma,alpha,beta,dynamicPressure,
      //   lift,sideForce,drag,thx, thy, thz,
      //   mgx, mgy, mgz] = sdo.getAeroTorqueData();
      // alpha = Number(alpha).toFixed(1).toString();
      // beta = Number(beta).toFixed(1).toString();
      // lift = Number(lift).toFixed(0).toString();
      // sideForce = Number(sideForce).toFixed(0).toString();
      // drag = Number(drag).toFixed(0).toString();
      // dynamicPressure = Number(dynamicPressure).toFixed(1).toString();
      // const [e1, e2, e3] = sdo.getEulerAngles();
      // aeroAlphaDisplay.innerHTML = alpha;
      // aeroBetaDisplay.innerHTML = beta;
      // aeroAirSpeedDisplay.innerHTML = Number(airspeed).toFixed(0).toString();
      // aeroMachDisplay.innerHTML = Number(airspeed/aeroSpeedOfSoundChoices[+aeroAltitudeSlider.value]).toFixed(1).toString();
      // aeroChiDisplay.innerHTML = Number(azimuth).toFixed(1).toString();
      // aeroGammaDisplay.innerHTML = Number(gamma).toFixed(1).toString();
      // aeroLiftDisplay.innerHTML = lift;
      // aeroSideForceDisplay.innerHTML = sideForce;
      // aeroDragDisplay.innerHTML = drag;
      // aeroAltitudeDisplay.innerHTML = aeroAltitudeChoices[+aeroAltitudeSlider.value];
      // aeroDensityDisplay.innerHTML = Number(airDensity).toFixed(4).toString();
      // aeroDynamicPressureDisplay.innerHTML = dynamicPressure;
      // // aeroBankDisplay.innerHTML = 0;//??????
      // aeroPsiDisplay.innerHTML = Number(e1).toFixed(1).toString();
      // aeroThetaDisplay.innerHTML = Number(e2).toFixed(1).toString();
      // aeroPhiDisplay.innerHTML = Number(e3).toFixed(1).toString();
      // aeroUDisplay.innerHTML = Number(u).toFixed(1).toString();
      // aeroVDisplay.innerHTML = Number(v).toFixed(1).toString();
      // aeroWDisplay.innerHTML = Number(w).toFixed(1).toString();
      // aeroThrustXDisplay.innerHTML = Number(thx).toFixed(0).toString();
      // aeroThrustYDisplay.innerHTML = Number(thy).toFixed(0).toString();
      // aeroThrustZDisplay.innerHTML = Number(thz).toFixed(0).toString();
      // aeroMGXDisplay.innerHTML = Number(mgx).toFixed(0).toString();
      // aeroMGYDisplay.innerHTML = Number(mgy).toFixed(0).toString();
      // aeroMGZDisplay.innerHTML = Number(mgz).toFixed(0).toString();
    }
  }
}

const handleTorqueOptionButton = function(){
  switch (torqueOption){
    case 1:
      torqueOptionDisplay.innerHTML = 'No Torque';
      break;
    case 2:
      torqueOptionDisplay.innerHTML = 'Space Frame';
      torqueFrameElements.style.display = 'grid';
      break;
    case 3:
      torqueOptionDisplay.innerHTML = 'Body Frame';
      torqueFrameElements.style.display = 'grid';
      break;
    case 4:
      acsElements.style.display = 'grid';
      torqueOptionDisplay.innerHTML = 'ACS Stabilization';
      break;
    case 5:
      torqueGGElements.style.display = 'grid';
      torqueOptionDisplay.innerHTML = 'Gravity Gradient';
      torqueMuOverR3Slider.value = muOverR3Choices.indexOf(muOverR3);
      torqueMuOverR3Display.innerHTML = muOverR3ChoiceDisplay[+torqueMuOverR3Slider.value];
      sdo.set3MuOverR3(3*muOverR3);
      break;
    case 6:
      torqueTopElements.style.display = 'grid';
      torqueOptionDisplay.innerHTML = 'Top';
      sdo.setTopXDistance(torqueTopX);
      sdo.setTopGravity(torqueTopGrav);
      torqueTopXDistanceDisplay.innerHTML = torqueTopX;
      torqueTopGravityDisplay.innerHTML = torqueTopGrav;
      break;
    case 7:
      // aeroElements.style.display = 'grid';
      // torqueOptionDisplay.innerHTML = 'Aerodynamic';
      // updateAeroTorquer();
      break;
  }

  pac.showCones(false);
  pac.showPoinsot(false);

  if (torqueOption === 2 || torqueOption === 3){
    handleTorqueSlidersOnpointerup();
  }else{
    sdo.setTorque(torqueOption, torqueMag, torqueIhat, torqueJhat, torqueKhat);
    vso.receiveVectorData(...sdo.shareVectorData());
    vso._needsRefresh = true;
  }

  if (torqueOption === 1){
    pac.showCones(conesTransparency < maxTransparency);
    pac.showPoinsot(poinsotTransparency < maxTransparency);
  }

  sdo.reset();
  sdo.refresh();
  vso.refresh();
  pac.refresh();
  displayNumerical();
}

const handleMainButtons = function(button){
  numericalButton.disabled = false;
  attitudeButton.disabled = false;
  massPropButton.disabled = false;
  rotationRateButton.disabled = false;
  torqueButton.disabled = false;
  numericalElementsGeneral.style.display = 'none';
  // numericalElementsAero.style.display = 'none';
  attitudeEulerElements.style.display = 'none';
  attitudeQuaternionElements.style.display = 'none';
  massPropElements.style.display = 'none';
  rotationElements.style.display = 'none';
  torqueFrameElements.style.display = 'none';
  // aeroElements.style.display = 'none';
  acsElements.style.display = 'none';
  torqueGGElements.style.display = 'none';
  torqueTopElements.style.display = 'none';
  torqueOptionElements.style.display = 'none';

  switch (button){
    case 'numerical':
      // if (numericalDisplayIsGeneral){
        numericalElementsGeneral.style.display = 'grid';
        // numericalElementsAero.style.display = 'none';
      // }else{
      //   numericalElementsGeneral.style.display = 'none';
      //   numericalElementsAero.style.display = 'grid';
      // }

      numericalButton.disabled = true;
      displayNumerical();
      break;
    case 'attitude':
      if (attitudeOption === 1){
        attitudeEulerElements.style.display = 'grid';
      }else{
        attitudeQuaternionElements.style.display = 'grid';
        setQuatSlidersToQuat();
        sdo.refresh();
        vso.refresh();
        pac.refresh();
      }
      attitudeButton.disabled = true;
      break;
    case 'massProp':
      massPropElements.style.display = 'grid';
      massPropButton.disabled = true;
      break;
    case 'rates':
      rotationElements.style.display = 'grid';
      rotationRateButton.disabled = true;
      displayOmegaValues();
      break;
    case 'torque':
      torqueOptionElements.style.display = 'grid';
      torqueButton.disabled = true;
      handleTorqueOptionButton();
      break;
    case 'none':
      break;
  }
}

numericalButton.addEventListener('click', () => {
  handleMainButtons('numerical');
});

attitudeButton.addEventListener('click', () => {
  handleMainButtons('attitude');
});

massPropButton.addEventListener('click', () => {
  handleMainButtons('massProp');
});

rotationRateButton.addEventListener('click', () => {
  handleMainButtons('rates');
});

torqueButton.addEventListener('click', () => {
  handleMainButtons('torque');
});

preferencesButton.addEventListener('click', () => {
  haltPlay();
  toggleShowPrefs();
});

const handlePreferencesButtons = function(button){
  axisOrientationButton.disabled = false;
  eulerAngleOrderButton.disabled = false;
  generalButton.disabled = false;
  bodyFrameButton.disabled = false;
  spaceFrameButton.disabled = false;
  omegaButton.disabled = false;
  hButton.disabled = false;
  torquePrefsButton.disabled = false;
  conesButton.disabled = false;
  poinsotButton.disabled = false;
  
  axisOrientationElements.style.display = 'none';
  eulerAngleOrderElements.style.display = 'none';
  generalElements.style.display = 'none';
  bodyFrameElements.style.display = 'none';
  spaceFrameElements.style.display = 'none';
  omegaElements.style.display = 'none';
  hElements.style.display = 'none';
  torqueElements.style.display = 'none';
  conesElements.style.display = 'none';
  poinsotElements.style.display = 'none';

  switch (button){
    case 'axisOrientation':
      axisOrientationElements.style.display = 'grid';
      axisOrientationButton.disabled = true;
      break;
    case 'eulerAngleOrder':
      eulerAngleOrderElements.style.display = 'grid';
      eulerAngleOrderButton.disabled = true;
      break;
    case 'general':
      generalElements.style.display = 'grid';
      generalButton.disabled = true;
      break;
    case 'bodyFrame':
      bodyFrameElements.style.display = 'grid';
      bodyFrameButton.disabled = true;
      break;
    case 'spaceFrame':
      spaceFrameElements.style.display = 'grid';
      spaceFrameButton.disabled = true;
      break;
    case 'omega':
      omegaElements.style.display = 'grid';
      omegaButton.disabled = true;
      break;
    case 'h':
      hElements.style.display = 'grid';
      hButton.disabled = true;
      break;
    case 'torque':
      torqueElements.style.display = 'grid';
      torquePrefsButton.disabled = true;
      break;
    case 'cones':
      conesElements.style.display = 'grid';
      conesButton.disabled = true;
      break;
    case 'poinsot':
      poinsotElements.style.display = 'grid';
      poinsotButton.disabled = true;
      break;
    case 'none':
      break;
  }
}

axisOrientationButton.addEventListener('click', () => {
  handlePreferencesButtons('axisOrientation');
});

eulerAngleOrderButton.addEventListener('click', () => {
  handlePreferencesButtons('eulerAngleOrder');
});

generalButton.addEventListener('click', () => {
  handlePreferencesButtons('general');
});

bodyFrameButton.addEventListener('click', () => {
  handlePreferencesButtons('bodyFrame');
});

spaceFrameButton.addEventListener('click', () => {
  handlePreferencesButtons('spaceFrame');
});

omegaButton.addEventListener('click', () => {
  handlePreferencesButtons('omega');
});

hButton.addEventListener('click', () => {
  handlePreferencesButtons('h');
});

torquePrefsButton.addEventListener('click', () => {
  handlePreferencesButtons('torque');
});

conesButton.addEventListener('click', () => {
  handlePreferencesButtons('cones');
});

poinsotButton.addEventListener('click', () => {
  handlePreferencesButtons('poinsot');
});

prefsReturnButton.addEventListener('click', () => {
  toggleShowPrefs();
});

const saveToLocalStorage = function(){
  localStorage.setItem('aerotutorData', JSON.stringify(aerotutorData));
}

const toggleShowPrefs = function(){
  if (sixDOFworld.style.display === 'none'){
    sixDOFworld.style.display = 'block';
    numericalButton.style.display = 'block';
    attitudeButton.style.display = 'block';
    massPropButton.style.display = 'block';
    rotationRateButton.style.display = 'block';
    torqueButton.style.display = 'block';
    preferencesButton.style.display = 'block';
    playPauseButton.style.display = 'block';
    resetButton.style.display = 'block';

    axisOrientationButton.style.display = 'none';
    eulerAngleOrderButton.style.display = 'none';
    generalButton.style.display = 'none';
    bodyFrameButton.style.display = 'none';
    spaceFrameButton.style.display = 'none';
    omegaButton.style.display = 'none';
    hButton.style.display = 'none';
    torquePrefsButton.style.display = 'none';
    conesButton.style.display = 'none';
    poinsotButton.style.display = 'none';
    prefsReturnButton.style.display = 'none';
    handleAllRadioButtons();
    handlePreferencesButtons('none');
  }else{
    sixDOFworld.style.display = 'none';
    numericalButton.style.display = 'none';
    attitudeButton.style.display = 'none';
    massPropButton.style.display = 'none';
    rotationRateButton.style.display = 'none';
    torqueButton.style.display = 'none';
    preferencesButton.style.display = 'none';
    playPauseButton.style.display = 'none';
    resetButton.style.display = 'none';

    axisOrientationButton.style.display = 'block';
    eulerAngleOrderButton.style.display = 'block';
    generalButton.style.display = 'block';
    bodyFrameButton.style.display = 'block';
    spaceFrameButton.style.display = 'block';
    omegaButton.style.display = 'block';
    hButton.style.display = 'block';
    torquePrefsButton.style.display = 'block';
    conesButton.style.display = 'block';
    poinsotButton.style.display = 'block';
    prefsReturnButton.style.display = 'block';
    handleMainButtons('none');
  }
}

const loadBackground = function(option='atmosphere'){
  switch (option){
    case 'atmosphere':
      if (background != null){
        background = null;
      }

      background = new THREE.CubeTextureLoader().load(['src/img/stormydays_ft.jpg','src/img/stormydays_bk.jpg','src/img/stormydays_up.jpg','src/img/stormydays_dn.jpg','src/img/stormydays_rt.jpg','src/img/stormydays_lf.jpg']);

      scene.background = background;

      if (jupiter != null){
        scene.remove(jupiter);
      }

      if (sun != null){
        scene.remove(sun);
      }
      break;

    case 'space':
      if (background != null){
        background = null;
      }

      background = new THREE.CubeTextureLoader().load(['src/img/stars.jpg','src/img/stars.jpg','src/img/stars.jpg','src/img/stars.jpg','src/img/stars.jpg','src/img/stars.jpg']);

      scene.background = background;
      const tl = new THREE.TextureLoader();

      if (jupiter === null){
        jupiter = null;
        const jupiterGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
        const jupiterTexture = tl.load('./src/img/jupiter.png');
        const jupiterMat = new THREE.MeshBasicMaterial({
          map: jupiterTexture,
          visible: true,
          side: THREE.DoubleSide,
          color: 0xffffff,
          transparent: true,
          opacity: 1
        });
        jupiter = new THREE.Mesh(jupiterGeometry, jupiterMat);
        jupiter.receiveShadow = false;
        jupiter.castShadow = false;
        jupiter.position.set(0,-30,0);
        jupiter.rotation.x = 0.5 * Math.PI;
      }
    
      if (sun === null){
        const sunGeometry = new THREE.PlaneGeometry(15, 15, 1, 1);
        const sunTexture = tl.load('./src/img/sun.jpg');
        const sunMat = new THREE.MeshBasicMaterial({
          map: sunTexture,
          visible: true,
          side: THREE.DoubleSide,
          color: 0xffffff,
        });
        sun = new THREE.Mesh(sunGeometry, sunMat);
        sun.receiveShadow = false;
        sun.castShadow = false;
        sun.position.set(-100,50,100);
      }

      scene.add(jupiter);
      scene.add(sun);
      break;
  }
}

const initTHREE = function() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  clock.getElapsedTime(); // sets 'oldTime'
  
  const ambientLight = new THREE.AmbientLight(0x707070);
  const sunLight = new THREE.SpotLight(0xffffff);

  sunLight.position.set(-20, 20, 20);
  sunLight.castShadow = false;
  sunLight.decay = 0;
  sunLight.intensity = 1;
  scene.add(ambientLight);
  scene.add(sunLight);

  // const dirLight = new THREE.DirectionalLight(0xffffff, 0.625);
  // dirLight.position.set(1, 1, 1).normalize();
  // scene.add(dirLight);

  renderer = new THREE.WebGLRenderer({
    devicePixelRatio: window.devicePixelRatio,
    alpha: true,
  });

  renderer.setClearColor(0x000000);
  renderer.setSize(sixDOFworld.clientWidth, sixDOFworld.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.aspect = 1;
  camera.position.set(nominalCameraPos.x, nominalCameraPos.y, nominalCameraPos.z);
  camera.lookAt(centerOfRotation);
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sixDOFworld.appendChild(renderer.domElement);
  orbitControls = new OrbitControls(camera, renderer.domElement);
  // orbitControls.enableDamping;
  orbitControls.enableZoom = false;
};

const getFromLocalStorage = function(){
  // localStorage.clear(); //uncomment temorarily to change aerotutorData format
  const data = JSON.parse(localStorage.getItem('aerotutorData'));
  return data;
}

const createAndInitialize = function(data, camera){
  let axesOrientation = defaultOrientation;

  if (data){
    aerotutorData = JSON.parse(JSON.stringify(data));

    for (let o of data) {
      switch (o.name){
          case 'mass':
            mass = +o.value;
            break;
          case 'length':
            dimX = o.value;
            break;
          case 'width':
            dimY = +o.value;
            break;
          case 'height':
            dimZ = +o.value;
            break;
          case 'attitudeOption':
            attitudeOption = o.value;
            break;
          case 'eulerAngle1':
            euler1  = o.value;
            break;
          case 'eulerAngle2':
            euler2  = o.value;
            break;
          case 'eulerAngle3':
            euler3  = o.value;
            break;
          case 'eulerOrder':
            eulerOrder  = o.value;
            break;
          case 'omegaMagnitude':
            omegaMag  = o.value/10;//stored value is from 0 to 100
            break;
          case 'maxOmega':
            maxOmega = o.value;
            break;
          case 'omHihat':
            omHihat  = o.value;
            break;
          case 'omHjhat':
            omHjhat  = o.value;
            break;
          case 'omHkhat':
            omHkhat  = o.value;
            break;
          case 'omegaOrH':
            omegaOrH = o.value;
            break;
          case 'torqueOption':
            torqueOption = o.value;
            break;
          case 'axesOrientation':
            axesOrientation  = o.value;
            break;
          case 'environment':
            environment = o.value;
            break;
          case 'showBodyXVector':
            showBodyXVector  = o.value;
            break;
          case 'showBodyYVector':
            showBodyYVector  = o.value;
            break;
          case 'showBodyZVector':
            showBodyZVector  = o.value;
            break;
          case 'objectTransparency':
            objectTransparency  = o.value;
            break;
          case 'bodyFrameTransparency':
            bodyFrameTransparency  = o.value;
            break;
          case 'spaceFrameTransparency':
            spaceFrameTransparency  = o.value;
            break;
          case 'omegaTransparency':
            omegaTransparency  = o.value;
            break;
          case 'hTransparency':
            hTransparency  = o.value;
            break;
          case 'torqueTransparency':
            torqueTransparency  = o.value;
            break;
          case 'conesTransparency':
            conesTransparency  = o.value;
            break;
          case 'poinsotTransparency':
            poinsotTransparency  = o.value;
            break;
          case 'bodyFrameColor':
            bodyFrameColor  = o.value;
            break;
          case 'spaceFrameColor':
            spaceFrameColor  = o.value;
            break;
          case 'omegaColor':
            omegaColor  = o.value;
            break;
          case 'hColor':
            hColor  = o.value;
            break;
          case 'torqueColor':
            torqueColor  = o.value;
            break;
          case 'bodyConeColor':
            bodyConeColor  = o.value;
            break;
          case 'spaceConeColor':
            spaceConeColor  = o.value;
            break;
          case 'ellipsoidColor':
            ellipsoidColor  = o.value;
            break;
          case 'planeColor':
            planeColor  = o.value;
            break;
          case 'objectOffset':
            objectOffset  = o.value;
            break;
          case 'bodyFrameOffset':
            bodyFrameOffset  = o.value;
            break;
          case 'spaceFrameOffset':
            spaceFrameOffset  = o.value;
            break;
          case 'omegaOffset':
            omegaOffset  = o.value;
            break;
          case 'hOffset':
            hOffset  = o.value;
            break;
          case 'torqueOffset':
            torqueOffset  = o.value;
            break;
          case 'conesOffset':
            conesOffset  = o.value;
            break;
          case 'poinsotOffset':
            poinsotOffset  = o.value;
            break;
          case 'objectMassProperties':
            objectMassProperties  = o.value;
            break;
          case 'objectAppearance':
            objectAppearance  = o.value;
            break;
          case 'vectorSize':
            vectorSize  = o.value;
            break;
          case 'torqueMag':
            torqueMag  = o.value;
            break;
          case 'torqueIhat':
            torqueIhat  = o.value;
            break;
          case 'torqueJhat':
            torqueJhat  = o.value;
            break;
          case 'torqueKhat':
            torqueKhat  = o.value;
            break;
          case 'torqueACSDZ':
            torqueACSDZ  = o.value;
            break;
          case 'torqueACSTorque':
            torqueACSTorque  = o.value;
            break;
          case 'torqueGG':
            torqueGG  = o.value;
            break;
          case 'torqueTopX':
            torqueTopX  = o.value;
            break;
          case 'torqueTopGrav':
            torqueTopGrav  = o.value;
            break;
      }
    }
  }

  sdo = new SixDOFObject(mass, dimX, dimY, dimZ, scene, camera, objectAppearance, objectMassProperties);
  vso = new VectorSetObject(scene, camera);
  pac = new PoinsotAndCones(scene);
  displayMomentsOfInertia();
  sdo.setEulerOrder(eulerOrder);
  euler1Slider.value = euler1;
  euler2Slider.value = euler2;
  euler3Slider.value = euler3;
  handleEulerOnInput();
  massSlider.value = masses.indexOf(mass);
  dimXSlider.value = dimX;
  dimYSlider.value = dimY;
  dimZSlider.value = dimZ;
  omegaMagnitudeSlider.value = omegaMag*10;
  maxOmegaSlider.value = maxOmega;
  maxOmegaDisplay.innerText = maxOmega;
  omegaIhatSlider.value = omHihat;
  omegaJhatSlider.value = omHjhat;
  omegaKhatSlider.value = omHkhat;
  objectTransparencySlider.value = objectTransparency;
  objectTransparencyDisplay.innerText = objectTransparency;
  bodyFrameTransparencySlider.value = bodyFrameTransparency;
  spaceFrameTransparencySlider.value = spaceFrameTransparency;
  omegaTransparencySlider.value = omegaTransparency;
  hTransparencySlider.value = hTransparency;
  torqueTransparencySlider.value = torqueTransparency;
  conesTransparencySlider.value = conesTransparency;
  poinsotTransparencySlider.value = poinsotTransparency;
  torqueMagnitudeSlider.value = torqueMag*5;
  torqueIhatSlider.value = torqueIhat;
  torqueJhatSlider.value = torqueJhat;
  torqueKhatSlider.value = torqueKhat;
  acsDeadZoneSlider.value = torqueACSDZ*10;
  acsTorqueMagnitudeSlider.value = torqueACSTorque*100;
  torqueTopXDistanceSlider.value = torqueTopX;
  torqueTopGravitySlider.value = torqueTopGrav;
  torqueMagnitudeDisplay.innerHTML = torqueMag;
  torqueIhatDisplay.innerHTML = torqueIhat;
  torqueJhatDisplay.innerHTML = torqueJhat;
  torqueKhatDisplay.innerHTML = torqueKhat;
  acsDeadZoneDisplay.innerHTML = torqueACSDZ;
  acsTorqueMagnitudeDisplay.innerHTML = torqueACSTorque;
  muOverR3 = muOverR3Choices[torqueGG];
  torqueMuOverR3Display.innerHTML = muOverR3ChoiceDisplay[torqueGG];
  sdo.set3MuOverR3(3*muOverR3);
  torqueTopXDistanceDisplay.innerHTML = torqueTopX;
  torqueTopGravityDisplay.innerHTML = torqueTopGrav;

  for (let radio of eulerOrderRadios) {
    radio.checked = radio.value === eulerOrder ? true : false;
  }
  
  for (let radio of orientationRadios) {
    radio.checked = radio.value === axesOrientation ? true : false;
  }
  
  showBodyXVectorCheckbox.checked = showBodyXVector;
  showBodyYVectorCheckbox.checked = showBodyYVector;
  showBodyZVectorCheckbox.checked = showBodyZVector;
  massDisplay.innerHTML = mass;
  dimXDisplay.innerHTML = dimX;
  dimYDisplay.innerHTML = dimY;
  dimZDisplay.innerHTML = dimZ;
  
  objectOffsetCheckbox.checked = objectOffset;
  bodyFrameOffsetCheckbox.checked = bodyFrameOffset;
  spaceFrameOffsetCheckbox.checked = spaceFrameOffset;
  omegaOffsetCheckbox.checked = omegaOffset;
  hOffsetCheckbox.checked = hOffset;
  conesOffsetCheckbox.checked = conesOffset;
  poinsotOffsetCheckbox.checked = poinsotOffset;

  bodyFrameColorMenu.value = bodyFrameColor;
  spaceFrameColorMenu .value = spaceFrameColor;
  omegaColorMenu.value = omegaColor;
  hColorMenu.value = hColor;
  torqueColorMenu.value = torqueColor;
  bodyConeColorMenu.value = bodyConeColor;
  spaceConeColorMenu.value = spaceConeColor;
  ellipsoidColorMenu.value = ellipsoidColor;
  planeColorMenu.value = planeColor;

  sdo.setOffsetBooleans(objectOffset);
  vso.setOffsetBooleans(bodyFrameOffset, spaceFrameOffset, omegaOffset, hOffset, torqueOffset);
  pac.setOffsetBooleans(conesOffset, poinsotOffset);
  sdo.setOrientation(axesOrientation);
  vso.setOrientation(axesOrientation);
  pac.setOrientation(axesOrientation);

  presetMassPropertiesMenu.value = objectMassProperties;
  objectAppearanceChoiceMenu.value = objectAppearance;
}

const completeInitialization = function(continueAnimation = true) {
  if (continueAnimation && !(vso._constructionComplete)) {
    requestAnimationFrame(completeInitialization);
  }
  
  if (vso._constructionComplete){
    sdo._constructionComplete = true;
    pac._constructionComplete = true;
    handleMainButtons('numerical');
    handlePreferencesButtons('none');
    
    camera.aspect = 1;
    camera.updateProjectionMatrix();

    cpx = camera.position.x;
    cpy = camera.position.y;
    cpz = camera.position.z;

    renderer.setSize(sixDOFworld.clientWidth, sixDOFworld.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    setTransparency('object',objectTransparency);
    setTransparency('bodyFrame',bodyFrameTransparency);
    setTransparency('spaceFrame',spaceFrameTransparency);
    setTransparency('omega',omegaTransparency);
    setTransparency('h',hTransparency);
    setTransparency('torque',torqueTransparency);
    setTransparency('cones',conesTransparency);
    setTransparency('poinsot',poinsotTransparency);
    axisOrientationButton.style.display = 'none';
    eulerAngleOrderButton.style.display = 'none';
    generalButton.style.display = 'none';
    bodyFrameButton.style.display = 'none';
    spaceFrameButton.style.display = 'none';
    omegaButton.style.display = 'none';
    hButton.style.display = 'none';
    torquePrefsButton.style.display = 'none';
    conesButton.style.display = 'none';
    poinsotButton.style.display = 'none';
    prefsReturnButton.style.display = 'none';

    sdo.showObject(objectTransparency < maxTransparency);
    vso.showBodyFrame(bodyFrameTransparency < maxTransparency);
    vso.showBodyAxis(showBodyXVector, showBodyYVector, showBodyZVector);
    vso.showSpaceFrame(spaceFrameTransparency < maxTransparency);
    vso.showOmega(omegaTransparency < maxTransparency);
    vso.showAngularMomentum(hTransparency < maxTransparency);
    vso.showTorque(torqueTransparency < maxTransparency);

    setEnvironment(environment);
    setOmegaOrHChoice(omegaOrH);
    pac.showCones(false);
    pac.showPoinsot(false);

    if (torqueOption === 1){
      pac.showCones(conesTransparency < maxTransparency);
      pac.showPoinsot(poinsotTransparency < maxTransparency);
    }

    // if (torqueOption === 7){
    //   updateAeroTorquer();
    // }

    displayTorqueValues();
    setBodyFrameColor(bodyFrameColor);
    setSpaceFrameColor(spaceFrameColor);
    setOmegaColor(omegaColor);
    setHColor(hColor);
    setTorqueColor(torqueColor);
    setBodyConeColor(bodyConeColor);
    setSpaceConeColor(spaceConeColor);
    setEllipsoidColor(ellipsoidColor);
    setPlaneColor(planeColor);
    resetAttitudeAndRates();

    sdo.setTorque(torqueOption, torqueMag, torqueIhat, torqueJhat, torqueKhat);
    displayNumerical(true);
    vso.setVectorSize(vectorSize);
    vso._needsRefresh = true;
    pac.setConeSize(vectorSize);
    vectorSizeSlider.value = Number(vectorSize);
    // updateAeroTorquer();
    // aeroAltitude2Display.innerHTML = aeroAltitudeChoices[+aeroAltitudeSlider.value];
  }
};

const displayMaxOmega = function(trueOrFalse){
  if (trueOrFalse === false){
    numericalButton.innerHTML = '1&nbsp;2&nbsp;3';
    massPropButton.innerHTML = 'mass';
    attitudeButton.innerHTML = '&psi;&nbsp;&theta;&nbsp;&phi;';
    rotationRateButton.innerHTML = '&omega;&nbsp;/&nbsp;H';
    torqueButton.innerHTML = '&tau;';
    preferencesButton.innerHTML = 'pref';
    numericalButton.style.backgroundColor = 'rgb(125,125,255)';
    attitudeButton.style.backgroundColor = 'rgb(125,125,255)';
    massPropButton.style.backgroundColor = 'rgb(125,125,255)';
    rotationRateButton.style.backgroundColor = 'rgb(125,125,255)';
    torqueButton.style.backgroundColor = 'rgb(125,125,255)';
    preferencesButton.style.backgroundColor = 'rgb(125,125,255)';
    resetButton.style.backgroundColor = 'rgb(125,125,255)';
    playPauseButton.style.backgroundColor = 'rgb(125,125,255)';
  }else{
    numericalButton.innerHTML = 'max';
    massPropButton.innerHTML = '&omega;';
    attitudeButton.innerHTML = 'max';
    rotationRateButton.innerHTML = '&omega;';
    torqueButton.innerHTML = 'max';
    preferencesButton.innerHTML = '&omega;';
    numericalButton.style.backgroundColor = 'red';
    attitudeButton.style.backgroundColor = 'red';
    massPropButton.style.backgroundColor = 'red';
    rotationRateButton.style.backgroundColor = 'red';
    torqueButton.style.backgroundColor = 'red';
    preferencesButton.style.backgroundColor = 'red';
    resetButton.style.backgroundColor = 'red';
    playPauseButton.style.backgroundColor = 'red';
  }
}

const animate = function(continueAnimation = true) {
  if (continueAnimation) {
    requestAnimationFrame(animate);
  }
  
  orbitControls.update();

  if (cpx !== camera.position.x && cpy !== camera.position.y && cpz !== camera.position.z){
    cpx = camera.position.x;
    cpy = camera.position.y;
    cpz = camera.position.z;
    vso._needsRefresh = true;
    pac._needsRefresh = true;
  } 

  renderer.clear();
  renderer.render(scene, camera);
  
  if (playing){
    const dt = clock.getDelta();// dt for 60 fps is 0.01666
    sdo.simulate(dt);
    pac.receiveEphemeralData(...sdo.sharePaCEphemeralData());
    pac.computeHodeCurvePoint();
    vso._needsRefresh = true;
    pac._needsRefresh = true;

    if (sdo.getOmegaMagnitude() > maxOmega){
      displayMaxOmega(true);
      doPlayPause();
    }

    displayNumerical();
  }

  sdo.refresh();
  vso.receiveVectorData(...sdo.shareVectorData());
  vso.refresh();
  pac.refresh();
};

const data = getFromLocalStorage();
initTHREE();
createAndInitialize(data, camera);
completeInitialization();
animate();
