var minHeight = 20;
var maxHeight = 100;
var minWidth = 10;
var maxWidth = 20;
var minGap = 200;
var maxGap = 500;
var gap = randGap();
var obstacles = [];

var jumpFX = document.getElementById('jumpfx');
var gameoverFX = document.getElementById('gameoverfx');
var backgroundFX = document.getElementById('backgroundfx');

function startGame(){
	gameArea.start();
	backgroundFX.play();
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

function everyInterval(n){
	if(gameArea.frame % n == 0)
		return true;
	
	return false;
}

function jump(){
	player.speedY = -2;
	jumpFX.play();
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
		window.addEventListener('keydown', jump);
	},
	updateGameArea: function(){
		for(i = 0; i<obstacles.length; i++){
			if(player.crashWith(obstacles[i])){
				gameArea.stop();
				return;
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
			obstacles[i].draw();	
		}
		
		player.newPos();
		player.update();
		gameArea.frame += 1;
		gameArea.score += 0.01;
		scoreText.update("Score: " + Math.floor(gameArea.score));
		
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
	}
}