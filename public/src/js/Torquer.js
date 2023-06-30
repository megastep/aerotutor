import * as THREE from '../../node_modules/three/build/three.module.js';

const piOver180 = Math.PI / 180;
// const gravity = 9.80665;

// Stability Derivatives -
// cL0,cLq,cLAlpha,cLAlphadot,cLDeltaElev,cYr,cYp,cYBeta,
// cYDeltaRud,cD0,cDq,cDAlpha,cn0,cnr,cnp,cnBeta,
// cnDeltaRud,cnDeltaAil,cm0,cmq,cmAlpha,cmAlphadot,cmDeltaElev,
// cl0,clr,clp,clBeta,clDeltaRud,clDeltaAil
// const stabilityDerivatives = 

// //Cessna 172 h<4100 m, cruising speed=65 m/s
// [[0.3100,3.9000,5.1430,0.0000,0.4300,0.2100,-0.0370,-0.3100,0.1870,0.0310,
// 0.0000,0.1300,0.0000,-0.0990,-0.0300,0.0650,-0.0657,-0.0530,-0.0150,
// -12.4000,-0.8900,0.0000,-1.2800,0.0000,0.0960,-0.4700,-0.0890,0.0147,-0.1780],

// //Boeing 747 h=0, M=0.3, alpha=5.7
// [1.110,5.400,5.700,6.700,0.338,0.0000,0.0000,-0.960,0.1750,0.1020,
// 0.0000,0.660,0.000,-0.300,-0.1210,0.150,-0.1090,0.0064,0.000,
// -20.800,-1.260,-3.200,-1.340,0.0000,0.101,-0.450,-0.221,0.0070,0.0461],

// //Boeing 747 h=020000 ft, M=0.5, alpha=6.8
// [0.680,5.130,4.670,6.530,0.356,0.0000,0.0000,-0.900,0.1448,0.0393,
// 0.0000,0.366,0.000,-0.278,-0.0687,0.147,-0.1081,0.0015,0.000,
// -20.700,-1.146,-3.350,-1.430,0.0000,0.212,-0.323,-0.193,0.0039,0.0129],

// //Boeing 747 h=020000 ft, M=0.8, alpha=0
// [0.266,5.010,4.240,5.990,0.270,0.0000,0.0000,-0.810,0.0841,0.0174,
// 0.0000,0.084,0.000,-0.265,0.0028,0.179,-0.0988,0.0008,0.000,
// -20.500,-0.629,-5.400,-1.060,0.0000,0.098,-0.315,-0.164,0.0090,0.0120],

// //Boeing 747 h=040000 ft, M=0.8, alpha=4.6
// [0.660,6.000,4.920,5.910,0.367,0.0000,0.0000,-0.880,0.1157,0.0415,
// 0.0000,0.425,0.000,-0.327,-0.0415,0.195,-0.1256,0.0002,0.000,
// -24.000,-1.033,-6.410,-1.450,0.0000,0.300,-0.334,-0.277,0.0070,0.0137],

// //Boeing 747 h=040000 ft, M=0.9, alpha=2.4
// [0.521,6.940,5.570,5.530,0.300,0.0000,0.0000,-0.920,0.0620,0.0415,
// 0.0000,0.527,0.000,-0.333,0.0230,0.207,-0.0914,-0.0027,0.000,
// -25.100,-1.613,-8.820,-1.200,0.0000,0.193,-0.296,-0.095,0.0052,0.0139],

// //F-104 h=50000 ft, Starfighter speed=1031.4 knots (530.6 m/s)
// [0.122,1.9,2.005,0.82,0.523,0,0,-1.045,0.87,0.048,0.0000,
// 0.384,0,-0.649,-0.093,0.242,-0.0435,-0.0025,-0.028,-4.83,-1.308,
// -2.05,-1.31,0,0.154,-0.272,-0.093,0.0079,-0.0173],

// //New Horizons Space Probe
// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];

// const aeroSurfaceDimensions =
// //Cessna 172
// [[1.4935,10.9118,16.1651],
// //Boeing 747 on approach, gear up, flaps 20 deg
// [8.32,59.74,510.97],
// //Boeing 747 clean aircraft 1
// [8.32,59.74,510.97],
// //Boeing 747 clean aircraft 2
// [8.32,59.74,510.97],
// //Boeing 747 clean aircraft 3
// [8.32,59.74,510.97],
// //Boeing 747 clean aircraft 4
// [8.32,59.74,510.97],
// //F-104 Starfighter
// [2.9261,6.6751,18.2090],
// //New Horizons Probe
// [0,0,0]
// ];

class Torquer {
  constructor() {
    this._omega = new THREE.Vector3(0, 0, 0);
    this._quat = new THREE.Quaternion();
    this._dcm = new THREE.Matrix4();
    // the reason that _dcm (direction cosine matrix) is a Matrix4 and
    // not a Matrix3 is because the THREE function makeRotationFromQuaternion
    // exists only for Matrix4. We are sometimes forced to convert that to a
    // 3x3 matrix using the THREE function setFromMatrix4.
    this._vel = new THREE.Vector3();
    this._h = 0.0025;
    this._torque = new THREE.Vector3(0, 0, 0);

    this._torqueOption = 1;
    // 1 = no torque
    // 2 = space frame torque
    // 3 = body frame torque
    // 4 = acs stabilization
    // 5 = gravity gradient torque
    // 6 = torque on a top
    // 7 = aerodynamic torque
    this._constantTorque = new THREE.Vector3(0, 0, 0);
    this._axesOrientation = 'Y Up';
    this._mass = 1;
    this._inertiaMatrix = new THREE.Matrix3();
    this._T = 0;
    this._3muOverR3 = 1;
    this._totalGGEnergy0 = 0;
    this._ggCorrection = 1;
    this._topXDistance = 1;
    this._topGravity = 1;

    this._nullVector = new THREE.Vector3(0, 0, 0);
    this._xUnitVector = new THREE.Vector3(1, 0, 0);
    this._yUnitVector = new THREE.Vector3(0, 1, 0);
    this._zUnitVector = new THREE.Vector3(0, 0, 1);
    this._q0 = new THREE.Quaternion();
    this._v0 = new THREE.Vector3();
    this._v1 = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._mat0 = new THREE.Matrix3();
    this._mat1 = new THREE.Matrix3();

    // this._aeroAirspeed = 0;
    // this._aeroAirDensity = 0;
    // this._aeroAzimuth = 0;
    // this._aeroGamma = 0;
    // this._aeroThrustMag = 0;
    // this._aeroAlpha = 0;
    // this._aeroMeanChord = 0;
    // this._aeroWingspan = 0;
    // this._aeroWingArea = 0;
    // this._vehicleOption = 0;
    // this._aeroAlpha = 0;
    // this._aeroBeta = 0;
    // this._aeroDynamicPressure = 0;
    // this._aeroLift = 0;
    // this._aeroSideForce = 0;
    // this._aeroDrag = 0;
    // this._aeroQ = 0;
    // this._aeroBodyToSpace = new THREE.Matrix3();
    // this._aeroSpaceToWind = new THREE.Matrix3();
    // this._aeroBodyToWind = new THREE.Matrix3();
    // this._uvw = new THREE.Vector3();
    // this._aeroThrust = new THREE.Vector3();
    // this._aeroMG = new THREE.Vector3();
    this._acsDeadzoneOmega = 0;
    this._acsTorque = 0;
  }

  shareTorqueData(){
    return [this._torque, this._torqueOption, this._omega, this._quat, this._dcm, this._vel, this._h, this._T];
  }

  shareAeroTorqueData(){
    // return [this._aeroAirDensity,this._aeroAirspeed,
    // this._uvw.x,this._uvw.y,this._uvw.z,
    // this._aeroAzimuth/piOver180,this._aeroGamma/piOver180,
    // this._aeroAlpha/piOver180,this._aeroBeta/piOver180,this._aeroDynamicPressure,
    // this._aeroLift,this._aeroSideForce,this._aeroDrag,
    // this._aeroThrust.x, this._aeroThrust.y, this._aeroThrust.z,
    // this._aeroMG.x, this._aeroMG.y, this._aeroMG.z];
  }

  receiveTorqueData(torque, torqueOption, omega, quat, dcm, vel, h, T){
    this._torque = torque;
    this._torqueOption = torqueOption;
    this._omega = omega;
    this._quat = quat;
    this._dcm = dcm;
    this._vel = vel;
    this._h = h;
    this._T = T;
  }

  reset(){
    this._dcm.makeRotationFromQuaternion(this._quat);
    this._v0.copy(this._omega);
    this._v0.applyMatrix3(this._inertiaMatrix);
    this._T = 0.5*this._v0.dot(this._omega);
    // console.log(this._totalGGEnergy0);
    // debugger;
    this._totalGGEnergy0 = this._T + this.computeGravityGradientPotential();
    this._ggCorrection = 1;
  }

  setTorqueOption(value){
    this._torqueOption = value;
  }

  setConstantTorque(tauX, tauY, tauZ){
    this._constantTorque.set(tauX, tauY, tauZ);
  }

  setAxesOrientation(xyz){
    this._axesOrientation = xyz;
  }

  setInertiaMatrix(ixx, iyy, izz, ixz = 0){
    this._inertiaMatrix.set(ixx, 0, -ixz, 0, iyy, 0, -ixz, 0, izz);
    this.reset();
  }

  setMass(value){
    this._mass = Number(value);
  }

  set3MuOverR3(value){
    this._3muOverR3 = Number(value);
    this.reset();
  }

  setTopXDistance(value){
    this._topXDistance = Number(value);
  }

  setTopGravity(value){
    this._topGravity = Number(value);
  }

  setTorque(torqueOption, torqueMagnitude, x, y, z){
    if (torqueOption === 2 || torqueOption === 3){ // body or space frame torque
      const xyz = new THREE.Vector3(x, y, z);
      xyz.normalize();
      xyz.multiplyScalar(torqueMagnitude);
      this._torque.copy(xyz);
      this._constantTorque.copy(this._torque);
    }
    
    this._torqueOption = torqueOption;
    this.doTorque();
  }

  nullTorque(){
    this._torque.copy(this._nullVector);
  }

  doTorque(){
    switch (this._torqueOption){
      case 1:
        // 1 = no torque
        this._torque.copy(this._nullVector);
        break;
      case 2:
        // 2 = space frame torque
        // _constantTorque is expressed in the space frame when using this option
        // so we need to rotate it into the body frame
        this._torque.copy(this._constantTorque);
        this._q0.copy(this._quat);
        this._q0.invert(); // _quat is body to space so need to invert it
        this._torque.applyQuaternion(this._q0);
        break;
      case 3:
        // 3 = body frame torque
        this._torque.copy(this._constantTorque);
        break;
      case 4:
        // 4 = acs stabilization
        // an ACS (attitude control system) is imagined to exist on
        // the object.  The ACS consists of thrusters that impart
        // a force couple about each of the body axes.  If the
        // magnitude of the component of omega in one direction (P, Q,
        // or R) is larger than the "dead zone" value, then a torque is
        // applied to reduce the magnitude of that component.  The final
        // orientation is of no concern.  A real controller would have
        // to compute omega based on Euler angle rates or quaternion rates,
        // or it might not compute omega at all.  It would also employ a
        // much more sophisticated algorithm that could steer the vehicle
        // to a desired attitude
        const acsdz = this._acsDeadzoneOmega;
        const torqueMag = this._acsTorque;
        this._torque.x = 0;
        this._torque.y = 0;
        this._torque.z = 0;

        if (this._omega.x > acsdz){
          this._torque.x = -torqueMag;
        }else if (this._omega.x < -acsdz){
          this._torque.x = torqueMag;
        }

        if (this._omega.y > acsdz){
          this._torque.y = -torqueMag;
        }else if (this._omega.y < -acsdz){
          this._torque.y = torqueMag;
        }

        if (this._omega.z > acsdz){
          this._torque.z = -torqueMag;
        }else if (this._omega.z < -acsdz){
          this._torque.z = torqueMag;
        }
        break;
      case 5:
        //https://www.planetary.org/space-images/simulated-new-horizons-spacecraft
        // if using the new horizons art, give credit to the people on this link above
        // 5 = gravity gradient torque

        // the gravity gradient torque equals
        // (3mu/R^3)e1 cross Ig dot e1, where e1 is a unit vector from
        // the planet to the cm of the object, Ig is the inertia dyadic
        // of the object, mu is the gravity constant, and R is the distance
        // to the center of the planet ("Spacecraft Dynamics", T. Kane et al,
        // 1983 McGraw Hill, p. 235).  The dot product of a dyadic with a
        // vector is another vector.
        
        // *** This program does NOT model orbital motion!  It is assumed   ***
        // *** that the object remains at the same static position above    ***
        // *** the planet by whatever means.  Centrifugal acceleration and  ***
        // *** change in the inertial direction of gravity are not modeled. ***

        // mu (GM) for earth is 3.986004418E+14 m^3/s^2 according to Wikipedia.
        // R for a body in low earth orbit is about 6500000 meters.
        // mu / R^3 then equals about 1.451422E-06.  This program sets the
        // variable _3muOverR3 equal to whatever the user wants.  The purpose
        // of this program is to give the user an intuitive feel for rotating
        // rigid bodies and the torques on them, so we set this value much larger
        // in order to see the gravity gradient effect.

        // The planet is assumed to be in the "down" direction for whatever
        // inertial axis orientation the user chooses.  e1 is a unit vector.
        // If Z points down, then e1 points in the -Z direction, for example.  
        // Products of inertia are zero for this program which simplifies the
        // gravity gradient torque to be this:

        // gravity gradient torque = [e1.y * e1.z * (izz - iyy)
        //                            e1.z * e1.x * (ixx - izz)             
        //                            e1.x * e1.y * (iyy - ixx)]

        // We want e in body coordinates, so we just use the direction
        // cosine matrix elements.
        let e1x, e1y, e1z;

        switch (this._axesOrientation){
          case 'X Up':
          case 'X Down':
            e1x = this._dcm.elements[0];
            e1y = this._dcm.elements[4];
            e1z = this._dcm.elements[8];
            break;
          case 'Y Up':
          case 'Y Down':
            e1x = this._dcm.elements[1];
            e1y = this._dcm.elements[5];
            e1z = this._dcm.elements[9];
            break;
          case 'Z Up':
          case 'Z Down':
            e1x = this._dcm.elements[2];
            e1y = this._dcm.elements[6];
            e1z = this._dcm.elements[10];
            break;
        }

        const elements = this._inertiaMatrix.elements;
        // _intertiaMatrix is a 4x4 matrix for reasons explained elsewhere
        const ixx = elements[0];
        const iyy = elements[4];
        const izz = elements[8];

        // torque due to gravity gradient
        this._torque.x = this._3muOverR3*e1y*e1z*(izz - iyy);
        this._torque.y = this._3muOverR3*e1z*e1x*(ixx - izz);
        this._torque.z = this._3muOverR3*e1x*e1y*(iyy - ixx);

        // adjust the angular velocity such that the total energy remains
        // constant.  This reduces the possiblility that energy can increase
        // or decrease due to numerical errors.  _totalGGEnergy0 is set
        // in the reset() function.
        const totalGGEnergy = this._T + this.computeGravityGradientPotential();
        let correction = this._totalGGEnergy0/totalGGEnergy;
        
        // the correction has a possibility of into entering an
        // unstable situation and this logic below prevents that
        if (!(correction > 1 && this._ggCorrection < 1)){
          this._ggCorrection = correction;
          this._omega.x *= correction;
          this._omega.y *= correction;
          this._omega.z *= correction;
          // console.log(this._ggCorrection); 
        }
        break;
      case 6:
        // 6 = torque on a top
        
        // this option computes the torque that would occur if a
        // force were applied along the x body vector a distance of
        // "_topXDistance" from the center of mass with the force direction
        // in the "up" direction for whatever the user chooses.  For a real
        // spinning top, this would be where the point of the top is.
        // This program does not currently display a table top nor does
        // it force the 3D model to look like a top.  In fact, the object
        // does not even have to spin!
        // To use this option effectively, set the omega vector to point
        // along or nearly along the X body direction.  Set the orientation
        // however you like.  The torque vector should remain in a plane
        // perpendicular to the "up" and "down" directions.  The angular momentum
        // vector should chase the torque vector around the object.
        this._torque.copy(this._xUnitVector);
        this._torque.multiplyScalar(this._topXDistance);
        // _torque is set here to the r in rXf, the cross product happens later

        switch (this._axesOrientation){
          case 'X Up':
            this._v1.copy(this._xUnitVector);
            break;
          case 'X Down':
            this._v1.copy(this._xUnitVector);
            this._v1.multiplyScalar(-1);
            break;
          case 'Y Up':
            this._v1.copy(this._yUnitVector);
            break;
          case 'Y Down':
            this._v1.copy(this._yUnitVector);
            this._v1.multiplyScalar(-1);
            break;
          case 'Z Up':
            this._v1.copy(this._zUnitVector);
            break;
          case 'Z Down':
            this._v1.copy(this._zUnitVector);
            this._v1.multiplyScalar(-1);
            break;
        }

        this._v1.multiplyScalar(this._topGravity);
        this._v1.multiplyScalar(this._mass);
        this._q0.copy(this._quat);
        this._q0.invert(); // _quat is body to space, but want space to body
        this._v1.applyQuaternion(this._q0);// bring _v1 into body frame
          // _v1 is now the f in rXf
        this._torque.cross(this._v1);// torque is rXf
        break;
      case 7:
          // 7 = aerodynamic torque
          this.computeAeroForceAndTorque();
          break;
    }
  }

  makeAeroSpaceToWindMatrix(){
    let chi = this._aeroAzimuth;
    let gamma = this._aeroGamma;
    let sinChi = Math.sin(chi);
    let cosChi = Math.cos(chi);
    let sinGamma = Math.sin(gamma);
    let cosGamma = Math.cos(gamma);
    this._aeroSpaceToWind.set(cosChi*cosGamma, -sinChi, cosChi*sinGamma,
    sinChi*cosGamma, cosChi, sinChi*sinGamma, -sinGamma, 0, cosGamma);
  }

  setInertialVelocity(){
    this._vel.set(this._aeroAirspeed, 0, 0);
    this._mat0.copy(this._aeroSpaceToWind);
    this._mat0.transpose();
    this._vel.applyMatrix3(this._mat0);
  }

  computeDynamicPressure(){
    this._aeroQ = 0.5*this._aeroAirDensity*(this._aeroAirspeed)*(this._aeroAirspeed);
  }

  computeThrust(){
    // this sets the thrust to be equal to the initial drag force
    // at zero alpha and pitch rate and no control deflections
    // NOT CURRENTLY USED
    // const [cL0,cLq,cLAlpha,cLAlphadot,cLDeltaElev,cYr,cYp,cYBeta,
    //   cYDeltaRud,cD0,cDq,cDAlpha,cn0,cnr,cnp,cnBeta,
    //   cnDeltaRud,cnDeltaAil,cm0,cmq,cmAlpha,cmAlphadot,cmDeltaElev,
    //   cl0,clr,clp,clBeta,clDeltaRud,clDeltaAil] = stabilityDerivatives[this._vehicleOption];
    //   this._aeroThrustMag = (1.5)*cD0*(this._aeroQ)*(this._aeroWingArea);
  }

  setAeroVehicleOption(option){
    // this._vehicleOption = option;

    // if (option !== 'select-an-object'){
    //   const [c, b, S] = aeroSurfaceDimensions[option];
    //   this._aeroMeanChord = c;
    //   this._aeroWingspan = b;
    //   this._aeroWingArea = S;
    // }
  }

  computeAeroForceAndTorque(){
    // const q = this._aeroQ;

    // if (q === 0){
    //   return;
    // }

    // this._aeroBodyToSpace.setFromMatrix4(this._dcm);
    // this._aeroBodyToWind.multiplyMatrices(this._aeroBodyToSpace,this._aeroSpaceToWind);

    // const alpha = -Math.asin(this._aeroBodyToWind.elements[6]);
    // const beta = -Math.asin(this._aeroBodyToWind.elements[1]);
    // const alphadot = (alpha - this._aeroAlpha)/this._h;
    // this._aeroAlpha = alpha;

    // const [cL0,cLq,cLAlpha,cLAlphadot,cLDeltaElev,cYr,cYp,cYBeta,
    //   cYDeltaRud,cD0,cDq,cDAlpha,cn0,cnr,cnp,cnBeta,
    //   cnDeltaRud,cnDeltaAil,cm0,cmq,cmAlpha,cmAlphadot,cmDeltaElev,
    //   cl0,clr,clp,clBeta,clDeltaRud,clDeltaAil] = stabilityDerivatives[this._vehicleOption];

    // const cL = cL0 + cLAlpha*alpha + cLAlphadot*alphadot + cLq*this._omega.y;
    // const cY = cYBeta*beta + cYr*this._omega.z + cYp*this._omega.x;
    // const cD = cD0 + cDAlpha*alpha + cDq*this._omega.y;
    // // console.log(this._aeroAzimuth, this._aeroGamma, alpha, beta, alphadot);
    // // console.log(cL, cY, cD);
    // this._torque.x = cl0 + clBeta*beta + clp*this._omega.x + clr*this._omega.z;
    // this._torque.y = cm0 + cmAlpha*alpha + cmAlphadot*alphadot + cmq*this._omega.y;
    // this._torque.z = cn0 + cnBeta*beta + cnp*this._omega.x + cnr*this._omega.z;
    // // console.log(this._torque.x, this._torque.x, this._torque.x);

    // // set vector _v0 equal to the forces in the wind frame
    // const lift = cL*q*(this._aeroWingArea);
    // const sideForce = cY*q*(this._aeroWingArea);
    // const drag = cD*q*(this._aeroWingArea);
    // // console.log(lift, sideForce, drag);

    // this._torque.x *= q*(this._aeroWingArea)*(this._aeroWingspan);
    // this._torque.y *= q*(this._aeroWingArea)*(this._aeroMeanChord);
    // this._torque.z *= q*(this._aeroWingArea)*(this._aeroWingspan);

    // // vector _v0 is the force acting on the aircraft expressed
    // // in the wind frame (v, v, w)
    // this._v0.x = -drag;
    // this._v0.y = sideForce;
    // this._v0.z = -lift;

    // // set _v1 equal to the thrust force vector expressed in the body
    // // frame.  It is all in the x-body direction.  This is generally not
    // // the case, but we make this simplification anyway.  Next we rotate
    // // this vector to the wind frame and set _aeroThrust equal to it for
    // // display purposes
    // this._v1.set(630, 0, 0);
    // // this._v1.set(this._aeroThrustMag, 0, 0);
    // this._v1.applyMatrix3(this._aeroBodyToWind);
    // this._aeroThrust.copy(this._v1);

    // // set _v2 equal to the gravitational force vector expressed in the
    // // space frame.  It is all in the z-space direction.  Next we rotate
    // // this vector to the wind frame and set _aeroMG equal to it for display
    // // purposes
    // this._v2.set(0, 0, gravity*(this._mass));
    // this._v2.applyMatrix3(this._aeroSpaceToWind);
    // this._aeroMG.copy(this._v2);

    // // now we add thrust (_v1) and gravity (_v2) to the aerodynamic force (_v0)
    // this._v0.add(this._v1);
    // this._v0.add(this._v2);

    // // then set _mat0 equal to the transpose of _aeroSpaceToWind,
    // // which turns it into a "wind to space" direction cosine matrix.
    // // multiply vector _v0 above by this matrix to rotate it to the inertial
    // // frame
    // this._mat0.copy(this._aeroSpaceToWind);
    // this._mat0.transpose();
    // this._v0.applyMatrix3(this._mat0);

    // // _v0 is now the total force vector in the inertial frame.  Multiplying
    // // it by h/mass gives the incremental change in velocity over the
    // // time period h in the inertial frame
    // // 
    // this._v0.multiplyScalar((this._h)/(this._mass));

    // // add _v0 to the total velocity
    // this._vel.add(this._v0);

    // // set _v0 equal to a unit vector in the direction of _vel
    // this._v0.copy(this._vel);
    // this._v0.normalize();

    // // take the cross product of _v0 with the z (space) vector
    // // and normalize it to get _v1
    // this._v1.set(0,0,1);
    // this._v1.cross(this._v0);
    // this._v1.normalize();

    // // take the cross product of _v0 and _v1 to get _v2
    // // the unit vectors are perpendicular so the cross product does not
    // // need to be normalized
    // this._v2.crossVectors(this._v0, this._v1);


    // // console.log(this._aeroSpaceToWind.elements[0],this._aeroSpaceToWind.elements[1],this._aeroSpaceToWind.elements[2],this._aeroSpaceToWind.elements[3],this._aeroSpaceToWind.elements[4],this._aeroSpaceToWind.elements[5],this._aeroSpaceToWind.elements[6],this._aeroSpaceToWind.elements[7],this._aeroSpaceToWind.elements[8]);
    // // create the space to wind direction cosine matrix using the
    // // vectors _v0, _v1, and _v2
    // this._aeroSpaceToWind.set(this._v0.x,this._v1.x,this._v2.x,
    //   this._v0.y,this._v1.y,this._v2.y,this._v0.z,this._v1.z,this._v2.z);
    //   // console.log(this._aeroSpaceToWind.elements[0],this._aeroSpaceToWind.elements[1],this._aeroSpaceToWind.elements[2],this._aeroSpaceToWind.elements[3],this._aeroSpaceToWind.elements[4],this._aeroSpaceToWind.elements[5],this._aeroSpaceToWind.elements[6],this._aeroSpaceToWind.elements[7],this._aeroSpaceToWind.elements[8]);

    // this._aeroAlpha = alpha;
    // this._aeroBeta = beta;
    // this._aeroDynamicPressure = q;
    // this._aeroLift = lift;
    // this._aeroSideForce = sideForce;
    // this._aeroDrag = drag;

    // // make the uvw vector, which is just vel in the space frame
    // this._uvw.copy(this._vel);
    // this._mat0.copy(this._aeroSpaceToWind);
    // this._mat0.transpose();
    // this._uvw.applyMatrix3(this._mat0);

    // this._aeroAirspeed = this._uvw.length();
  }

  computeGravityGradientPotential(){
    // See "Spacecraft Dynamics", T. Kane et al, 1983 McGraw Hill, p. 134.
    // They define V as mu * m / R * (1 + sum) + C,
    // where sum is (tr(I) - 3*I11) / (2mR^2) plus higher order terms and
    // C is an arbitrary constant.  I11 is the moment of inertia about
    // a vector from the planet to the body.  For them it was the X moment
    // of inertia, but we choose X, Y or Z.  V is basically the potential
    // energy stored in the body due to the fact that it is not rotated into
    // the lowest energy state for the gravity gradient.
    // We simplify the equation to just V = _3muOverR3 / 6 * (tr(I) - 3*I11)

    const trace =  this._inertiaMatrix.elements[0]
           + this._inertiaMatrix.elements[4] + this._inertiaMatrix.elements[8];
    this._mat0.setFromMatrix4(this._dcm); // dcm is the direction cosine matrix
    this._mat1.copy(this._mat0);
    this._mat1.transpose();
    this._mat0.multiply(this._inertiaMatrix);
    this._mat0.multiply(this._mat1);
    // _mat0 is now an inertia matrix expressed in a basis with the
    // first vector in the up/down direction
    let i11;

    switch (this._axesOrientation){
      case 'X Up':
      case 'X Down':
         i11 = this._mat0.elements[0]
        break;
      case 'Y Up':
      case 'Y Down':
         i11 = this._mat0.elements[4]
        break;
      case 'Z Up':
      case 'Z Down':
         i11 = this._mat0.elements[8]
        break;
    }

    return -(this._3muOverR3/6*(trace - 3*i11));
  }

  setAeroAirspeed(airspeed){
    this._aeroAirspeed = airspeed;
  }

  setAeroAirDensity(airDensity){
    this._aeroAirDensity = airDensity;
  }

  setAeroAzimuth(azimuth){
    this._aeroAzimuth = azimuth*piOver180;
  }

  setAeroGamma(gamma){
    this._aeroGamma = gamma*piOver180;
  }

  setAeroThrustMagnitude(thrust){
    this._aeroThrustMag = thrust;
  }

  setACSDeadzoneOmega(dzo){
    this._acsDeadzoneOmega = Number(dzo);
  }

  setACSTorque(torqueMag){
    this._acsTorque = Number(torqueMag);
  }
}

export default Torquer;
