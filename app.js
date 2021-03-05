// imports

import * as THREE from './three/build/three.module.js';
import { GUI } from './three/examples/jsm/libs/dat.gui.module.js';
import { MapControls } from './three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from "./three/examples/jsm/controls/TransformControls.js";
import { Drone } from './drone.js';

// variables

let controls,
    camera,
    scene,
    renderer,
    mouse;

var json_object;

const clock = new THREE.Clock();
var timer = 0;

const drones = [];
var framerate;

var ANIMATE = true;

// import JSON

var loader = new Promise( function( resolve, reject ) {

    loadJSON( 'waypoints.json', function ( result ) {

        json_object = JSON.parse( result );

        resolve();

    });

});
loader.then( () => {

    framerate = json_object.framerate;

    for (let i in json_object.drones) {

        drones.push( new Drone( json_object.drones[i].id, json_object.drones[i].waypoints ));

    }

    init();

    animate();

});

// threeJS functions

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 3000, 3000, 3000 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    $( "#renderer" ).append( renderer.domElement );
    resizeCanvas();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );

    controls = new MapControls( camera, renderer.domElement );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 0;
    controls.maxDistance = 2000;

    controls.maxPolarAngle = Math.PI / 2;

    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener(
        "click",
        function ( event ) {
            playStopAnimation();
        },
        false
    );

    for ( let i in drones ) {

        for ( let h in drones[ i ].curveHandles) {
            scene.add( drones[ i ].curveHandles[ h ] );
        }

        scene.add( drones[ i ].line );

        scene.add( drones[ i ].mesh );

    }

    // lights

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

    //

    window.addEventListener( 'resize', onWindowResize, false );

    const gui = new GUI();
    gui.add( controls, 'screenSpacePanning' );

}

function playStopAnimation() {

    if ( ANIMATE ) {
        clock.stop();
    }
    else {
        clock.start();
    }
    ANIMATE = !ANIMATE;

}

function resizeCanvas(){
    var con = $( "#renderer" ),
        aspect = window.innerHeight / window.innerWidth,
        width = con.width(),
        height = con.height();

    renderer.setSize( width, Math.round( width * aspect ) );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    resizeCanvas();

}

function animate() {

    requestAnimationFrame( animate );

    controls.update();

    if ( ANIMATE ) {

        timer += clock.getDelta();

        for ( let i in drones ) {

            drones[ i ].animate( timer * framerate );

        }

    }

    render();

}

function render() {

    renderer.render( scene, camera );

}
