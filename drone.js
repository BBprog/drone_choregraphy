import * as THREE from './three/build/three.module.js';
import { STLLoader } from './three/examples/jsm/loaders/STLLoader.js';


class Drone {

    calcDistToWp() {
        let to = this.waypoints[ this.currentWp + 1 ];

        this.step = { "x" : (to.position.lng_X - this.position.lng_X),
                      "y" : (to.position.alt_Y - this.position.alt_Y),
                      "z" : (to.position.lat_Z - this.position.lat_Z)};
    }

    getWayPoints() {
        var points = [];

        for (let i in this.waypoints) {
            let pos = this.waypoints[i].position;
            const point = { x:pos.lng_X, y:pos.alt_Y, z:pos.lat_Z };
            points.push( point );
        }

        return points;
    }

    constructor( id, waypoints ) {
        this.id = id;
        this.waypoints = waypoints;
        this.currentWp = 0;
        this.position = waypoints[0].position;

        var pts = this.getWayPoints();

        const boxGeometry = new THREE.BoxGeometry( 5, 5, 5 );
        const boxMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, flatShading: true } );

        this.curveHandles = [];

        for ( let i in pts ) {
            const handle = new THREE.Mesh( boxGeometry, boxMaterial );
            handle.position.copy( pts[i] );
            this.curveHandles.push( handle );
        }

        this.curve = new THREE.CatmullRomCurve3(
            this.curveHandles.map( ( handle ) => handle.position )
        );
        this.curve.curveType = "centripetal";
        this.curve.closed = false;

        const points = this.curve.getPoints( 50 );
        this.line = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints( points ),
            new THREE.LineBasicMaterial( { color: 0x00ff00 } )
        );
    }

    loadMesh( mesh ) {
        this.mesh = mesh;

        this.mesh.position.x = this.position.lng_X;
        this.mesh.position.y = this.position.alt_Y;
        this.mesh.position.z = this.position.lat_Z;
    }

    getWayPoint( id ) {
        return this.waypoints[id];
    }

    updatePosition( pos ) {
        this.position.lng_X = pos.lng_X;
        this.position.alt_Y = pos.alt_Y;
        this.position.lat_Z = pos.lat_Z;

        this.mesh.position.set( this.position.lng_X,
                                this.position.alt_Y,
                                this.position.lat_Z );
    }

    setPositionByFrame( frame ) {
        if (frame <= 0) {
            this.updatePosition( this.waypoints[ 0 ].position );
            return;
        }
        if (frame >= this.waypoints[ this.waypoints.length - 1 ].frame) {
            this.updatePosition( this.waypoints[ this.waypoints.length - 1 ].position );
            return;
        }

        let idWp = 0;
        while ( frame > this.waypoints[ idWp ].frame ) {
            idWp++;
        }

        let from = this.waypoints[ idWp - 1 ];
        let to = this.waypoints[ idWp ];

        let range = to.frame - from.frame;
        let ellapsed = ( frame - from.frame ) / range;

        let newPos = {
            lng_X : from.position.lng_X + ( to.position.lng_X - from.position.lng_X ) * ellapsed,
            alt_Y : from.position.alt_Y + ( to.position.alt_Y - from.position.alt_Y ) * ellapsed,
            lat_Z : from.position.lat_Z + ( to.position.lat_Z - from.position.lat_Z ) * ellapsed
        };

        this.updatePosition( newPos );
    }

    animate( dt ) {

        if ( this.currentWp >= this.waypoints.length - 1 ) return;

        let ellapsed = this.waypoints[ this.currentWp + 1 ].frame - dt;

        while ( ellapsed <= 0 ) {

            this.currentWp++;

            ellapsed = this.waypoints[ this.currentWp + 1 ].frame - dt;

        }

        this.calcDistToWp();

        this.position.lng_X += this.step.x / ellapsed;
        this.position.alt_Y += this.step.y / ellapsed;
        this.position.lat_Z += this.step.z / ellapsed;

        this.mesh.position.set( this.position.lng_X,
                                this.position.alt_Y,
                                this.position.lat_Z );
    }

}

export { Drone }
