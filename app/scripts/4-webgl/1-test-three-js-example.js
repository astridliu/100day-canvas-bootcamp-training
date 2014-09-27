
var container, stats;

var camera, scene, renderer;

var mesh, parent_node;
var line;

var radius, segments, material, geometry;

init();
animate();

function init() {

    //container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 9000;

    scene = new THREE.Scene();

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({ vertexColors: true });

    var positions = [];
    var next_positions_index = 0;
    var colors = [];
    var indices_array = [];

    // --------------------------------
    var iteration_count = 4;
    var rangle = 60 * Math.PI / 180.0;

    function add_vertex(v) {

        if (next_positions_index == 0xffff) throw new Error("Too many points");

        positions.push(v.x, v.y, v.z);
        colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
        return next_positions_index++;
    }

    // simple Koch curve
    function snowflake_iteration(p0, p4, depth) {

        if (--depth < 0) {

            var i = next_positions_index-1; // p0 already there
            add_vertex(p4);
            indices_array.push(i, i+1);
            return;
        }

        var v = p4.clone().sub(p0);
        var v_tier = v.clone().multiplyScalar(1.0/3.0);
        var p1 = p0.clone().add(v_tier);

        var angle = Math.atan2(v.y, v.x) + rangle;
        var length = v_tier.length();
        var p2 = p1.clone();
        p2.x += Math.cos(angle) * length;
        p2.y += Math.sin(angle) * length;

        var p3 = p0.clone().add(v_tier).add(v_tier);

        snowflake_iteration(p0, p1, depth);
        snowflake_iteration(p1, p2, depth);
        snowflake_iteration(p2, p3, depth);
        snowflake_iteration(p3, p4, depth);
    }

    function snowflake(points, loop, x_offset) {

        for (var iteration = 0; iteration != iteration_count; ++iteration) {

            add_vertex(points[0]);
            for (var p_index=0, p_count=points.length-1; p_index != p_count; ++p_index) {
                snowflake_iteration(points[p_index], points[p_index+1], iteration);
            }

            if (loop) snowflake_iteration(points[points.length-1], points[0], iteration);

            // translate input curve for next iteration
            for (var p_index=0, p_count=points.length; p_index != p_count; ++p_index) {
                points[p_index].x += x_offset;
            }

        }
    }

    var y = 0;
    snowflake
    (
        [
            new THREE.Vector3(0, y+0, 0),
            new THREE.Vector3(500, y+0, 0)
        ],
        false, 600
    );

    y += 600;
    snowflake
    (
        [
            new THREE.Vector3(0, y+0, 0),
            new THREE.Vector3(250, y+400, 0),
            new THREE.Vector3(500, y+0, 0)
        ],
        true, 600
    );

    y += 600;
    snowflake
    (
        [
            new THREE.Vector3(0, y+0, 0),
            new THREE.Vector3(500, y, 0),
            new THREE.Vector3(500, y+500, 0),
            new THREE.Vector3(0, y+500, 0),
        ],
        true, 600
    );

    y += 1000;
    snowflake
    (
        [
            new THREE.Vector3(250, y+0, 0),
            new THREE.Vector3(500, y+0, 0),
            new THREE.Vector3(250, y+0, 0),
            new THREE.Vector3(250, y+250, 0),
            new THREE.Vector3(250, y+0, 0),
            new THREE.Vector3(0, y, 0),
            new THREE.Vector3(250, y+0, 0),
            new THREE.Vector3(250, y-250, 0),
            new THREE.Vector3(250, y+0, 0),
        ],
        false, 600
    );
    // --------------------------------

    geometry.addAttribute( 'index', new Uint16Array( indices_array ), 1 );
    geometry.addAttribute( 'position', new Float32Array( positions ), 3 );
    geometry.addAttribute( 'color', new Float32Array( colors ), 3 );
    geometry.computeBoundingSphere();

    mesh = new THREE.Line( geometry, material, THREE.LinePieces );
    mesh.position.x -= 1200;
    mesh.position.y -= 1200;

    parent_node = new THREE.Object3D();
//    parent_node.add(mesh);

    //scene.add( parent_node );

        radius   = 100,
        segments = 64,
        material = new THREE.LineBasicMaterial( { color: 0x0000ff } ),
        geometry = new THREE.CircleGeometry( radius, segments );

    console.log(geometry);

// Remove center vertex
    geometry.vertices.shift();

    line = new THREE.Line( geometry, material );
    console.log(line.geometry);
    scene.add( line );

    renderer = new THREE.WebGLRenderer( { antialias: false, canvas: document.getElementById('c') } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    //container.appendChild( renderer.domElement );

    //

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {


    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {
    //line.geometry.parameters.radius = 100 + 100 * Math.random();
    line.scale.x += .1;

    var time = Date.now() * 0.001;

    //mesh.rotation.x = time * 0.25;
    //mesh.rotation.y = time * 0.5;
    parent_node.rotation.z = time * 0.5;

    renderer.render( scene, camera );

}