var minHeight = 20;
var maxHeight = 100;
var minWidth = 10;
var maxWidth = 20;
var minGap = 200;
var maxGap = 500;
var gap = randGap();
var obstacles = [];
var potions = [];
var shots = [];
var myShots = [];
var myPotions = [];

var jumpFX = document.getElementById('jumpfx');
var gameoverFX = document.getElementById('gameoverfx');
var backgroundFX = document.getElementById('backgroundfx');
var shootFX = document.getElementById('shootfx');
var potionFX = document.getElementById('potionfx');

function startGame(){
	gameArea.start();
	backgroundFX.play();
}


function fadeInAudio(audioID){
    var sound = document.getElementById(audioID);
	
	sound.play();
	sound.volume = 0;

    var fadeAudio = setInterval(function(){
        if(sound.volume < 1){
			volume = sound.volume;
			volume += 0.1;
			
            if(volume > 1){
				volume = 1;
			}
			
			sound.volume = volume;
        }
		
        if(sound.volume == 1){
            clearInterval(fadeAudio);
        }
    }, 600);

}

function resumeGame(){
	obstacles.splice(0, 1);
	gameArea.resume();
	fadeInAudio('backgroundfx');
	//setTimeout(() => backgroundFX.play(), 600);
}

function obstacle(){
	this.height = Math.floor(minHeight + Math.random() * (maxHeight - minHeight + 1));
	this.width = Math.floor(minWidth + Math.random() * (maxWidth - minWidth + 1));
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;
	this.draw = function(){
		gameArea.context.fillStyle = "green";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}
}

function potion(){
	this.height = 10;
	this.width = 10;
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;
	this.color = "red";
	this.draw = function(){
		gameArea.context.fillStyle = "red";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}
	this.adjust = function () {
		for (var i = 0; i < obstacles.length; i++) {
			if (obstacles[i].x == this.x || (obstacles[i].x < this.x && obstacles[i].x > this.x - this.width)) { // TODO: Melhorar detecção colisão
				this.x += obstacles[i].width + 50;
				this.y -= 10;
			}
		}
	}
}

function shot(){
	this.height = 10;
	this.width = 10;
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;
	this.draw = function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}
	this.adjust = function () {
		for (var i = 0; i < obstacles.length; i++) {
			if (obstacles[i].x == this.x || (obstacles[i].x < this.x && obstacles[i].x > this.x - this.width)) { // TODO: Melhorar detecção colisão
				this.x += obstacles[i].width + 50;
				this.y -= 10;
			}
		}
	}
}

function everyInterval(n){
	if(gameArea.frame % n == 0)
		return true;
	
	return false;
}

function playerAction(e){
	let keyCode = e.keyCode;
	
	if(keyCode == 38){
		player.speedY = -2;
		jumpFX.play();
	}else if(keyCode == 32){
		if(myShots.length){
			shootFX.play();
			myShots.pop();
		}
	}
}

function randGap(){
	return Math.floor(minGap + Math.random() * (maxGap - minGap + 1));
}

function updateHighscore(){
	if(gameArea.score > gameArea.highscore){
		localStorage.setItem('highscore', Math.floor(gameArea.score));
	}
}

var scoreText = {
	x: 1000,
	y: 50,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.textAlign = "left";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

var highScoreText = {
	x: 934,
	y: 100,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

var shootText = {
	x: 40,
	y: 50,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

var potionText = {
	x: 40,
	y: 100,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

var replay = {
	insertText: function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "20px Consolas";
		gameArea.context.textAlign = "center";
		if(myPotions.length > 0){
			gameArea.context.fillText("Você morreu", 600, 225);
			gameArea.context.fillText("Pressione espaço para reiniciar", 600, 255);
			gameArea.context.fillText("ou pressione P para usar a poção de reviver", 600, 285);
		}else{
			gameArea.context.fillText("Você morreu", 600, 235);
			gameArea.context.fillText("Pressione espaço para reiniciar", 600, 265);
		}
	},
	clearText: function(){
		gameArea.context.fillText("", 500, 100);
	}
}

var player = {
	x: 20,
	y: 470,
	speedY: 0,
	update: function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.fillRect(this.x, this.y, 30, 30);
	},
	newPos: function(){
		if(this.y < 280){
			this.speedY = 2;	
		}
		
		this.y = this.y + this.speedY;
		
		if(this.speedY == 2 && this.y == 470){
			this.speedY = 0;
		}
	},
	crashWith: function(obs){
		if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
			return true;
		
		return false;
	}
}

var gameArea = {
	canvas: document.createElement('canvas'),
	start: function(){
		this.canvas.height = 500;
		this.canvas.width = 1200;
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.context = this.canvas.getContext('2d');
		this.frame = 0;
		this.score = 0;
		if(localStorage.getItem('highscore') === null){
			this.highscore = 0;
		}else{
			this.highscore = localStorage.getItem('highscore');
		}
		scoreText.update("Score: 0");
		this.interval = setInterval(this.updateGameArea, 5);
		window.addEventListener('keydown', playerAction);
	},
	resume: function(){
		this.interval = setInterval(this.updateGameArea, 5);
		window.addEventListener('keydown', playerAction);
	},
	updateGameArea: function(){
		
		for(i = 0; i<obstacles.length; i++){
			if(player.crashWith(obstacles[i])){
				gameArea.stop();
				return;
			}
		}

		for(i = 0; i < potions.length; i++){
			if(player.crashWith(potions[i])){
				if(myPotions.length < 2){
					myPotions.push(1);
				}
				
				potions.splice(i, 1);
				break;
			}
		}

		for(i = 0; i < shots.length; i++){
			if(player.crashWith(shots[i])){
				if(myShots.length < 5){
					myShots.push(1);
				}
				
				shots.splice(i, 1);
				break;
			}
		}
		
		gameArea.clear();
		
		if(everyInterval(gap)){
			obstacles.push(new obstacle());
			gap = randGap();
			gameArea.frame = 0;
		}

		
		for(i=0; i<obstacles.length; i++){
			obstacles[i].x -= 1;
			if (obstacles[i].x < 0 - obstacles[i].width) {
				obstacles.splice(i, 1);
				i--;
				continue;
			}
			
			obstacles[i].draw();	
		}

		if (everyInterval(100)) {
			potions.push(new potion());
			potions[potions.length - 1].adjust();
		}
		
		for (var i = 0; i < potions.length; i++){
			potions[i].x -= 1;
			if (potions[i].x < 0 - potions[i].width){
				potions.splice(i, 1);
				i--;
				continue;
			}
			
			potions[i].draw();
		}

		if (everyInterval(109)){
			shots.push(new shot());
			shots[shots.length - 1].adjust();
		}
		
		for (var i = 0; i < shots.length; i++){
			shots[i].x -= 1;
			if (shots[i].x < 0 - shots[i].width){
				shots.splice(i, 1);
				i--;
				continue;
			}

			shots[i].draw();
		}
		
		player.newPos();
		player.update();
		gameArea.frame += 1;
		gameArea.score += 0.01;
		scoreText.update("Score: " + Math.floor(gameArea.score));
		
		var shotDraw = "";
		for(var i = 0; i < myShots.length; i++){
			shotDraw += "●";
		}
		
		shootText.update("Tiros: " + shotDraw);
		
		var potionDraw = "";
		for(var i = 0; i < myPotions.length; i++){
			potionDraw += "♥";
		}
		
		potionText.update("Poção: " + potionDraw);
		
		if(gameArea.highscore <= gameArea.score){
			highScoreText.update("Highscore: " + Math.floor(gameArea.score));
		}else{
			highScoreText.update("Highscore: " + Math.floor(gameArea.highscore));
		}
	},
	clear: function(){
		gameArea.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop: function(){
		clearInterval(this.interval);
		updateHighscore();
		backgroundFX.pause();
		gameoverFX.play();

		replay.insertText();
		window.removeEventListener("keydown", playerAction);
		window.addEventListener("keydown", restart);
	}
}

function restart(e){
	let keyCode = e.keyCode;

	if (keyCode == 32){
		replay.clearText();
		backgroundFX.currentTime = 0;
		startGame();
		obstacles = [];
		potions = [];
		shots = [];
		myShots = [];
		myPotions = [];

		window.removeEventListener("keydown", restart);
	}else if (keyCode == 80 && myPotions.length > 0) {
		myPotions.shift();
		replay.clearText();
		potionFX.currentTime = 0;
		potionFX.play();
		resumeGame();

		window.removeEventListener("keydown", restart);
	}
}