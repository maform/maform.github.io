var camera, scene, renderer, aspectRatio, wantedWidth, wantedHeight, canvasWidth, canvasHeight, pxRatio, big, a=0;
var geometry, material, mesh1, mesh2, mesh3, object, logo, prevscroll=0;
var canvas = document.getElementById("3d");
var loader = new THREE.OBJLoader();

window.onload=init;

function init() {
    window.addEventListener( 'resize', setCanvasSize, false );
    pxRatio = window.devicePixelRatio;
    if (isNaN(parseFloat(canvas.dataset.aspect))){aspectRatio = 2.4}else{aspectRatio = parseFloat(canvas.dataset.aspect);} //if W/H aspect ratio is not given or bad make it 2.4
    if(isNaN(parseFloat(canvas.dataset.width))){wantedWidth = Infinity;wantedHeight=Infinity;}//if canvas width is not given or bad set sizes to Infinity for easy hanling
        else{wantedWidth=Math.abs(parseFloat(canvas.dataset.width));wantedHeight=wantedWidth/aspectRatio;} // abs is there due to a certain level of paranoia
	camera = new THREE.PerspectiveCamera( 50, aspectRatio, 0.01, 10 ); camera.position.set( 0, 0, 1.7 );//camera.position.z = 1;
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	
	var filledShape;
    loader.load( 'maform-logo.obj', function ( logo ) {
	logo.traverse(function ( child ) {
	    if ( child.isMesh){
	        technicalize(child);}});},);

}

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	object.rotation.x += 0.0002;
	object.rotation.y += 0.0004;
	prevscroll=prevscroll-scrolled;
	object.rotation.x += prevscroll/1000;
	prevscroll=scrolled;
	renderer.render( scene, camera );
}

function setCanvasSize() {
    if (window.innerWidth>2880){big=2;}else{big=1;}
    var windowAspect = window.innerWidth / window.innerHeight;
    if (windowAspect<aspectRatio){canvasWidth=Math.min(window.innerWidth,wantedWidth);canvasHeight=canvasWidth/aspectRatio;}//fit canvas to window
        else{canvasHeight=Math.min(window.innerHeight,wantedHeight);canvasWidth=canvasHeight*aspectRatio;} // captions would not allways fit, we will fix this maybe later
	renderer.setSize( canvasWidth*pxRatio*big, canvasHeight*pxRatio*big );
}

function technicalize(techit){
    techit=techit.geometry; // we expect a mesh so we have to turn it into a geometry for this to work
    techit.computeFaceNormals(); // maybe this is not needed?
    var dashedShape = new THREE.EdgesGeometry( techit ); // we have to create the edges form the geometry
	var meshMaterial = new THREE.MeshBasicMaterial({color: false, side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var lineDashedMaterial = new THREE.LineDashedMaterial({color: 0xcccccc, linewidth: 1 ,dashSize: 0.05, gapSize: 0.03, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var lineMaterial = new THREE.LineBasicMaterial({color: 0x555555, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
	object = new THREE.Group(); // we created the materials and this is the group for the whole thing
	mesh1 = new THREE.Mesh(techit, meshMaterial);
	object.add(mesh1);
	mesh2 = new THREE.LineSegments ( dashedShape,lineDashedMaterial);
	mesh2.computeLineDistances();
	mesh2.renderDepth = 9007199254740992;
	object.add(mesh2);	
	mesh3 = new THREE.LineSegments ( dashedShape,lineMaterial);
	object.add(mesh3); // now we added together all the components to get dashed lines on occluded edges
	
    scene.add( object );
    
  	setCanvasSize(); canvas.insertBefore(renderer.domElement, canvas.childNodes[0]);
	animate();

}
