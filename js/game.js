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
var myShotsQueue = [];

// Sons utilizados no jogo
var jumpFX = document.getElementById('jumpfx');
var gameoverFX = document.getElementById('gameoverfx');
var backgroundFX = document.getElementById('backgroundfx');
var shootFX = document.getElementById('shootfx');
var potionFX = document.getElementById('potionfx');
var explosionFX = document.getElementById('explosionfx');
var ammoReloadFX = document.getElementById('ammoreloadfx');
var potionReloadFX = document.getElementById('potionreloadfx');

/** 
 * Função que inica o jogo
 * É chamada ao clicar no botão "Start" ou ao reiniciar o jogo
 */
function startGame(){
	// Verificação parar evitar que o jogo seja reiniciado caso o botão oculto seja clicado por estar em foco
	if(gameArea.started == 0){
		gameArea.start();
		document.getElementsByTagName('canvas').focus;
		document.getElementById('startButton').parentNode.style.display = "none";
		backgroundFX.play();
		gameArea.started = 1;
	}
}

/** 
 * Função utilizada para adicionar um efeito de FadeIn em um áudio
 * @param {string} audioID ID do áudio a ser feito o FadeIn
 */
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
    }, 200);

}

/**
 * Resume o jogo caso o jogador morra e utilize uma poção
 */
function resumeGame(){
	// Remove o obstáculo em que o jogador se encontra
	obstacles.splice(0, 1);

	gameArea.resume();
	fadeInAudio('backgroundfx');
}

/**
 * Classe do obstáculo
 */
function obstacle(){
	// Gera aleatóriamente a altura do obstáculo
	this.height = Math.floor(minHeight + Math.random() * (maxHeight - minHeight + 1));

	// Gera aleatóriamente a largura do obstáculo
	this.width = Math.floor(minWidth + Math.random() * (maxWidth - minWidth + 1));
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;

	/**
	 * Desenha o obstáculo no canvas
	 */
	this.draw = function(){
		gameArea.context.fillStyle = "green";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}

	/**
	 * Ajusta a posição do obstáculo para caso exista uma poção ou o um tiro muito próximos
	 */
	this.adjust = function () {
		for (var i = 0; i < potions.length; i++) {
			if (this.x - potions[i].x - this.height / 4 < 30){
				this.x += potions[i].width + 20 + this.height / 4;
			}
		}

		for (var i = 0; i < shots.length; i++) {
			if (this.x - shots[i].x - this.height / 4 < 30){
				this.x += shots[i].width + 20 + this.height / 4;
			}
		}
	}
}

/**
 * Classe da poção
 */
function potion(){
	this.height = 10;
	this.width = 10;
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;

	/**
	 * Desenha a poção no canvas
	 */
	this.draw = function(){
		gameArea.context.fillStyle = "red";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}

	/**
	 * Ajusta a posição da poção caso exista um obstáculo muito próximo
	 */
	this.adjust = function () {
		for (var i = 0; i < obstacles.length; i++) {
			if (this.x - obstacles[i].x - obstacles[i].height / 4 < 30) {
				this.x += obstacles[i].width + 20 + obstacles[i].height / 4;
				break;
			}
		}
	}
}

/**
 * Classe do tiro
 */
function shot(){
	this.height = 10;
	this.width = 10;
	this.x = 1200;
	this.y = gameArea.canvas.height - this.height;

	/**
	 * Desenha o tiro no canvas
	 */
	this.draw = function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.fillRect(this.x, this.y, this.width, this.height);
	}

	/**
	 * Ajusta a posição do tiro caso exista um obstáculo muito próximo
	 */
	this.adjust = function () {
		for (var i = 0; i < obstacles.length; i++) {
			if (this.x - obstacles[i].x - (obstacles[i].height) / 4 < 30) {
				this.x += obstacles[i].width + 20 + obstacles[i].height / 4;
				break;
			}
		}
	}
}

/**
 * Classe para atirar os projéteis
 */
function shootProjectile(){
	this.speedX = 0;
	this.x = player.x;
	this.y = player.y;

	/**
	 * Desenha o projétil no canvas
	 */
	this.draw = function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.fillRect(this.x, this.y, 10, 10);
	}

	/**
	 * Ajusta a posição do projétil
	 */
	this.newPos = function(){		
		if(this.speedX < 1180){
			this.speedX = 2;
		}
		
		this.x = this.x + this.speedX;
		
		if(this.speedX == 2 && this.x == 1180){
			this.speedX = 0;
			myShotsQueue.shift();
		}
	}

	/**
	 * Verifica se o projétil atingiu um obstáculo
	 * @param {obstacle} obs Obstáculo a se fazer a verificação
	 */
	this.crashWith = function(obs){
		if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
			return true;
		
		return false;
	}
}

/**
 * Verifica se o frame atual está no intervalo de frames desejado
 * @param {number} n Intervalo de frames a ser verificado
 */
function everyInterval(n){
	if(gameArea.frame % n == 0)
		return true;
	
	return false;
}

/**
 * Função chamada quando um evento "KeyDown" é detectado durante o jogo
 * @param {KeyboardEvent} e Parâmetro enviado pelo navegador que indica o evento disparado
 */
function playerAction(e){
	let keyCode = e.code;

	// Verifica se a tecla pressionada foi a tecla "Seta para Cima"
	if(keyCode === "ArrowUp"){
		if(player.speedY == 0){
			player.speedY = -2;
			jumpFX.play();
		}
	}
	// Verifica se a tecla pressionada foi a tecla "Espaço"
	else if(keyCode === "Space"){
		if(myShots.length > 0){
			shootFX.play();
			myShotsQueue.push(myShots[myShots.length - 1]);
			myShots.pop();
		}
	}
}

/**
 * Gera um intervalo aleatório entre obstáculos
 */
function randGap(){
	return Math.floor(minGap + Math.random() * (maxGap - minGap + 1));
}

/**
 * Atualiza o Highscore
 */
function updateHighscore(){
	if(gameArea.score > gameArea.highscore){
		localStorage.setItem('highscore', Math.floor(gameArea.score));
	}
}

/**
 * Texto que representa o score atual
 */
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

/**
 * Texto que representa o highscore
 */
var highScoreText = {
	x: 934,
	y: 100,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

/**
 * Texto que representa o número de tiros disponíveis
 */
var shootText = {
	x: 40,
	y: 50,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

/**
 * Texto que representa o número de poções disponíveis
 */
var potionText = {
	x: 40,
	y: 100,
	update: function(text){
		gameArea.context.fillStyle = "black";
		gameArea.context.font = "30px Consolas";
		gameArea.context.fillText(text, this.x, this.y);
	}
}

/**
 * Texto que aparece quando o jogador morre
 */
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

/**
 * Objeto que guarda informações sobre o jogador
 */
var player = {
	x: 20,
	y: 470,
	speedY: 0,

	/**
	 * Atualiza a posição do jogador no canvas
	 */
	update: function(){
		gameArea.context.fillStyle = "black";
		gameArea.context.fillRect(this.x, this.y, 30, 30);
	},

	/**
	 * Calcula a nova posição do jogador com base na velocidade vertical
	 */
	newPos: function(){
		if(this.y < 280){
			this.speedY = 2;	
		}
		
		this.y = this.y + this.speedY;
		
		if(this.speedY == 2 && this.y == 470){
			this.speedY = 0;
		}
	},

	/**
	 * Verifica se o jogador colidiu com um objeto
	 * @param {obstacle|potion|shot} obs Objeto a verificar a colisão
	 */
	crashWith: function(obs){
		if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
			return true;
		
		return false;
	}
}

/**
 * Objeto que guarda informações sobre a área de jogo
 */
var gameArea = {
	// Variável de controle para caso o jogo tenha sido iniciado ou não
	started: 0,

	// Cria o canvas e guarda ele no começo do jogo
	canvas: document.createElement('canvas'),

	/**
	 * Começa o jogo
	 */
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

		// Faz com que a função updateGameArea seja chamada a cada 5ms
		this.interval = setInterval(this.updateGameArea, 5);

		// Adiciona um EventListener para quando uma tecla é pressionada
		window.addEventListener('keydown', playerAction);
	},

	/**
	 * Resume o jogo caso o jogador utilze uma poção
	 */
	resume: function(){
		this.interval = setInterval(this.updateGameArea, 5);
		window.addEventListener('keydown', playerAction);
	},

	/**
	 * Atualiza a área de jogo
	 */
	updateGameArea: function(){
		
		// Verifica se o jogador colidiu com algum obstáculo e chama a função "stop" caso sim
		for(i = 0; i<obstacles.length; i++){
			if(player.crashWith(obstacles[i])){
				gameArea.stop();
				return;
			}
		}

		// Verifica se o jogador colidiu com uma poção e adiciona a poção na lista de poções e remove a poção do canvas
		for(i = 0; i < potions.length; i++){
			if(player.crashWith(potions[i])){
				if(myPotions.length < 2){
					potionReloadFX.pause();
					potionReloadFX.currentTime = 0;
					
					myPotions.push(1);
					
					potionReloadFX.play();
				}
				
				potions.splice(i, 1);
				break;
			}
		}

		// Verifica se o jogador colidiu com um tiro e adiciona o tiro na lista de tiros e remove o tiro do canvas
		for(i = 0; i < shots.length; i++){
			if(player.crashWith(shots[i])){
				if(myShots.length < 5){
					ammoReloadFX.pause();
					ammoReloadFX.currentTime = 0;
					
					myShots.push(new shootProjectile());
					
					ammoReloadFX.play();
				}
				
				shots.splice(i, 1);
				break;
			}
		}
		
		// Verifica se um tiro colidiu com um obstáculo e remove o obstáculo do canvas
		for(i = 0; i < myShotsQueue.length; i++){
			for(j = 0; j < obstacles.length; j++){
				if(myShotsQueue[i].crashWith(obstacles[j])){
					explosionFX.pause();
					explosionFX.currentTime = 0;
					
					obstacles.splice(j, 1);
					myShotsQueue.splice(i, 1);
					
					explosionFX.play();
					break;
				}
			}
		}
		
		// Limpa o canvas
		gameArea.clear();
		
		// Verifica se um obstáculo deve ser colocado na tela com base no parâmetro frame
		if(everyInterval(gap)){
			obstacles.push(new obstacle());
			gap = randGap();
			gameArea.frame = 0;
			obstacles[obstacles.length - 1].adjust();
		}

		// Desenha os obstáculos na tela
		for(i=0; i<obstacles.length; i++){
			obstacles[i].x -= 1;
			if (obstacles[i].x < 0 - obstacles[i].width) {
				obstacles.splice(i, 1);
				i--;
				continue;
			}
			
			obstacles[i].draw();	
		}
		
		// Verifica se uma poção deve ser colocada na tela com base no score do jogador
		if (Math.floor(gameArea.score * 100) % 7100 == 0 && Math.floor(gameArea.score) != 0) {
			potions.push(new potion());
			potions[potions.length - 1].adjust();
		}
		
		// Desenha as poções na tela
		for (var i = 0; i < potions.length; i++){
			potions[i].x -= 1;
			if (potions[i].x < 0 - potions[i].width){
				potions.splice(i, 1);
				i--;
				continue;
			}
			
			potions[i].draw();
		}

		// Verifica se um tiro deve ser colocado na tela com base no score do jogador
		if (Math.floor(gameArea.score * 100) % 2300 == 0 && Math.floor(gameArea.score) != 0) {
			shots.push(new shot());
			shots[shots.length - 1].adjust();
		}
		
		// Desenha os tiros na tela
		for(var i = 0; i < shots.length; i++){
			shots[i].x -= 1;
			if (shots[i].x < 0 - shots[i].width){
				shots.splice(i, 1);
				i--;
				continue;
			}

			shots[i].draw();
		}
		
		// Atualiza a posição do player na tela
		player.newPos();
		player.update();

		gameArea.frame += 1;
		gameArea.score += 0.01;
		scoreText.update("Score: " + Math.floor(gameArea.score));
		
		// Atualiza o highscore
		if(gameArea.highscore <= gameArea.score){
			highScoreText.update("Highscore: " + Math.floor(gameArea.score));
		}else{
			highScoreText.update("Highscore: " + Math.floor(gameArea.highscore));
		}
		
		// Desenha os tiros que foram disparados na tela e calcula a nova posição deles
		for(var i = 0; i < myShotsQueue.length; i++){
			myShotsQueue[i].draw();
			myShotsQueue[i].newPos();
		}
		
		// Desenha a quantidade de tiros disponíveis na tela
		var shotDraw = "";
		for(var i = 0; i < myShots.length; i++){
			shotDraw += "●";
		}
		shootText.update("Tiros: " + shotDraw);
		
		// Desenha a quantidade de poções disponíveis na tela
		var potionDraw = "";
		for(var i = 0; i < myPotions.length; i++){
			potionDraw += "♥";
		}
		potionText.update("Poção: " + potionDraw);
	},

	/**
	 * Limpa todo o canvas
	 */
	clear: function(){
		gameArea.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	/**
	 * Para o jogo quando o jogador morre
	 */
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

/**
 * Função chamada quando um evento "KeyDown" é detectado após o jogador morrer
 * @param {KeyboardEvent} e Parâmetro enviado pelo navegador que indica o evento disparado
 */
function restart(e){
	let keyCode = e.code;
	
	// Verifica se a tecla "Espaço" foi pressionada e reinicia o jogo
	if (keyCode === "Space"){
		gameArea.started = 0;
		replay.clearText();
		backgroundFX.currentTime = 0;
		startGame();
		obstacles = [];
		potions = [];
		shots = [];
		myShots = [];
		myShotsQueue = [];
		myPotions = [];

		window.removeEventListener("keydown", restart);
	}
	// Verifica se a tecla "P" foi pressionada e continua o jogo caso o jogador possua poções
	else if (keyCode === "KeyP" && myPotions.length > 0) {
		myPotions.shift();
		replay.clearText();
		potionFX.currentTime = 0;
		potionFX.play();
		resumeGame();

		window.removeEventListener("keydown", restart);
	}
}