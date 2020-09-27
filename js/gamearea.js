minHeight = 20;
maxHeight = 100;
minWidth = 10;
maxWidth = 20;
minGap = 200;
maxGap = 500;
gap = randGap();
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

var scoreText = {
	x: 900,
	y: 50,
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

//var changeBackground = {
//	updateBackground: function(){
//		if(gameArea.score >= 0 && gameArea.score <= 9){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(120,154,181,1) 0%, rgba(32,64,155,1) 91%)';
//		}else if(gameArea.score >= 10 && gameArea.score <= 19){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(253,252,77,1) 0%, rgba(54,104,211,1) 91%)';
//		}else if(gameArea.score >= 20 && gameArea.score <= 29){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(221,142,30,1) 0%, rgba(25,122,177,1) 100%)';
//		}else if(gameArea.score >= 30 && gameArea.score <= 39){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(145,0,255,1) 0%, rgba(0,249,255,1) 100%)';
//		}else if(gameArea.score >= 40 && gameArea.score <= 49){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(196,130,158,1) 0%, rgba(64,123,236,1) 100%)';
//		}else if(gameArea.score >= 50 && gameArea.score <= 59){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(78,172,205,1) 0%, rgba(3,0,71,1) 100%)';
//		}else if(gameArea.score >= 60 && gameArea.score <= 69){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(238,242,253,1) 0%, rgba(51,93,131,1) 100%)';
//		}else if(gameArea.score >= 70 && gameArea.score <= 79){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(241,182,62,1) 0%, rgba(234,117,106,1) 100%)';
//		}else if(gameArea.score >= 80 && gameArea.score <= 89){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(185,232,242,1) 0%, rgba(65,134,151,1) 100%)';
//		}else if(gameArea.score >= 90 && gameArea.score <= 99){
//			gameArea.canvas.style.background = 'linear-gradient(0deg, rgba(129,0,241,1) 0%, rgba(19,46,67,1) 100%)';
//		}
//	}
//}

var gameArea = {
	canvas: document.createElement('canvas'),
	start: function(){
		this.canvas.height = 500;
		this.canvas.width = 1200;
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.context = this.canvas.getContext('2d');
		this.frame = 0;
		this.score = 0;
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
//		changeBackground.updateBackground();
		gameArea.frame += 1;
		gameArea.score += 0.01;
		scoreText.update("Score: " + Math.floor(gameArea.score));
	},
	clear: function(){
		gameArea.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop: function(){
		clearInterval(this.interval);
		backgroundFX.pause();
		gameoverFX.play();
	}
}