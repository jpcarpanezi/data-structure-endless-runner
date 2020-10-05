function openModal(id){
	document.getElementById(id).style.display = 'block';
}

function closeModal(id){
	document.getElementById(id).style.display = 'none';
}


function startGame(){
	if(gameArea.started == 0){
		gameArea.start();
		document.getElementsByTagName('canvas').focus;
		document.getElementById('startButton').parentNode.style.display = "none";
		backgroundFX.play();
		gameArea.started = 1;
	}
}