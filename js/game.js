var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var intro = false;
var start = false;
var play = false;
var gameover = false;

var firstBox;
var lastBox;
var targetBox;

var score = 0;

var textPoint;
var textInOut;
var textGen;
var textAct0;
var textAct1;
var textAct2;
var textAct3;
var textAct4;
var textAct5;
var textAct6;
var textAct7;
var textAct8;
var textAct9;
var textAct10;
var textAct11;

var bmdStatus;

var boxGroup;
var playerGroup;
var GA;

/*                          */
/*====== Mummy Object ======*/
/*                          */
var Mummy = function (game, x, y, index) {
	Phaser.Sprite.call(this, game, x, y, 'ms'+index);
	this.index = index;
	this.animations.add('walk');
	this.animations.play('walk',50,true);
	this.game.physics.arcade.enableBody(this);
	this.body.collideWorldBounds = true;
};

Mummy.prototype = Object.create(Phaser.Sprite.prototype);
Mummy.prototype.constructor = Mummy;

Mummy.prototype.death = function(){
	this.alpha = 0.5;
	this.kill();
};

Mummy.prototype.jump = function(){
	if(this.body.y > 200){
		this.body.velocity.y = -500;
		this.jump_curr++;
	}
};

Mummy.prototype.restart = function(iteration){
	this.fitness_prev = (iteration == 1) ? 0 : this.fitness_curr;
	this.fitness_curr = 0; // this is the distance
	this.alpha = 1;
	this.score_prev = (iteration == 1) ? 0: this.score_curr;
	this.score_curr = 0; // this is the score(box jumped through)
	this.dist_score_prev = (iteration == 1) ? 0: this.score_curr;
	this.dist_fitness_curr = 0; // this is the sum of all distances that i get
	this.jump_curr = 0;
	this.act = 0;
	this.reset(game.rnd.integerInRange(90, 100), game.world.randomY);
};

Mummy.prototype.getDist = function(){
	return this.dist;
}

/*                        */
/*====== Box Object ======*/
/*                        */
var Box = function (game) {
	Phaser.Sprite.call(this, game, 0, 0, 'box');
	var rand = game.rnd.realInRange(1, 1);
	this.scale.setTo(rand, rand);
	this.game.physics.arcade.enableBody(this);
	this.body.allowGravity = false;
	this.body.immovable = true;
};

Box.prototype = Object.create(Phaser.Sprite.prototype);
Box.prototype.constructor = Box;

/*                             */
/*====== BoxGroup Object ======*/
/*                             */
var BoxGroup = function(game, parent, index){
	Phaser.Group.call(this, game, parent);
	this.index = index;
	this.box = new Box(this.game);
	this.add(this.box);
};

BoxGroup.prototype = Object.create(Phaser.Group.prototype);
BoxGroup.prototype.constructor = BoxGroup;

BoxGroup.prototype.restart = function(x) {
	this.box.reset(0, 0);
	this.x = x;
	this.y = 220;
	this.setAll('body.velocity.x', -200);
};

BoxGroup.prototype.getBoxX = function() {
	return this.box.world.x;
};

function preload() {
	game.load.image('box', './images/block.png');
	game.load.spritesheet('ms0', './images/mummy (1).png', 37, 45, 18);
	game.load.spritesheet('ms1', './images/mummy (2).png', 37, 45, 18);
	game.load.spritesheet('ms2', './images/mummy (3).png', 37, 45, 18);
	game.load.spritesheet('ms3', './images/mummy (4).png', 37, 45, 18);
	game.load.spritesheet('ms4', './images/mummy (5).png', 37, 45, 18);
	game.load.spritesheet('ms5', './images/mummy (6).png', 37, 45, 18);
	game.load.spritesheet('ms6', './images/mummy (7).png', 37, 45, 18);
	game.load.spritesheet('ms7', './images/mummy (8).png', 37, 45, 18);
	game.load.spritesheet('ms8', './images/mummy (9).png', 37, 45, 18);
	game.load.spritesheet('ms9', './images/mummy (10).png', 37, 45, 18);
	game.load.spritesheet('ms10', './images/mummy (11).png', 37, 45, 18);
	game.load.spritesheet('ms11', './images/mummy (12).png', 37, 45, 18);
	game.load.image('imgGround', './images/img_ground.png');
	game.load.image('imgCloud', './images/abstract-clouds.png');
	game.load.image('box', './images/block.png');
}

function create() {
	game.stage.backgroundColor = '#8bb8ef';
	// keep game running if it loses the focus
	game.stage.disableVisibilityChange = true;
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 1400;
	game.world.setBounds(0, 0, 800, 250);
	
	ground = this.game.add.tileSprite(0, this.game.height-350, this.game.width, 100, 'imgGround');
	ground.autoScroll(-200, 0);
	cloud = this.game.add.tileSprite(0, -50, 800, 300, 'imgCloud');
	cloud.autoScroll(-100, 0);
	
	GA = new GeneticAlgorithm(12, 2);
	
	//Players
	playerGroup = game.add.group();
    for (var i = 0; i < 12; i ++)
    {
        playerGroup.add(new Mummy(game, game.rnd.integerInRange(90, 100), game.world.randomY, i));
    }
	
	//Boxs
	boxGroup = game.add.group();
    for (var i = 0; i < 4; i++)
    {
		new BoxGroup(game, boxGroup, i);
    }
	
	
	bmdStatus = this.game.make.bitmapData(250, this.game.height);
	bmdStatus.addToWorld(this.game.width - bmdStatus.width, 0);
	
	
	//textPoint settings
	textPoint = game.add.text(game.world.centerX, game.world.centerY, "0", {
        font: "65px Arial",
        fill: "#ff0044",
        align: "center"
    });
	textPoint.anchor.setTo(0.5, 0.5);
	
	//textGeneration settings
	textGen = game.add.text(20, 40, '', { font: "14px Arial", fill: "#000000", align: "center" });
	
	//textAct settings
	textInOut = game.add.text(602, 3, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct0 = game.add.text(680, 30, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct1 = game.add.text(680, 78, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct2 = game.add.text(680, 126, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct3 = game.add.text(680, 174, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct4 = game.add.text(680, 222, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct5 = game.add.text(680, 270, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct6 = game.add.text(680, 318, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct7 = game.add.text(680, 366, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct8 = game.add.text(680, 414, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct9 = game.add.text(680, 462, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct10 = game.add.text(680, 510, '', { font: "14px Arial", fill: "#000000", align: "center" });
	textAct11 = game.add.text(680, 558, '', { font: "14px Arial", fill: "#000000", align: "center" });
	
	intro = true;
}

function update() {
	vartext();
	if(intro){
		GA.reset();
		GA.createPopulation();
		start = true;
		intro = false;
	}
	if(start){
		score = 0;
		vartext();
		boxGroup.forEach(function(box){
			box.restart(900 + box.index * game.rnd.integerInRange(250, 300));
		}, this);
		firstBox = boxGroup.getAt(0);
		lastBox = boxGroup.getAt(boxGroup.length-1);
		targetBox = boxGroup.getAt(0);
		
		playerGroup.forEach(function(mummy){
			mummy.restart(GA.iteration);
		}, this);
		
		start = false;
		play = true;
	}
	if(play){
		var isNextTarget = false;
		drawStatus();	
		playerGroup.forEachAlive(function(p){
			p.fitness_curr = targetBox.getBoxX() - p.x;
			p.dist_fitness_curr += p.fitness_curr;
			p.score_curr = score;
			game.physics.arcade.collide(p, targetBox, onDeath, null, this);
			
			if (p.alive){
				GA.activateBrain(p);
				if (p.x > targetBox.getBoxX() && targetBox.getBoxX() != 0){
					isNextTarget = true;
				}
			}
		}, this);
		if (isNextTarget){
			score++;
			targetBox = boxGroup.getAt((targetBox.index+1) % boxGroup.length);
			isNextTarget = false;
		}
		
		if (firstBox.getBoxX() < -100){
			firstBox.restart(firstBox.getBoxX() + game.rnd.integerInRange(1100, 1200));
			firstBox = boxGroup.getAt((firstBox.index+1) % boxGroup.length);
			lastBox = boxGroup.getAt((lastBox.index+1) % boxGroup.length);
		}
	}
	if(gameover){
		textPoint.setText("gameover");
		GA.evolvePopulation();
		GA.iteration++;
	}
}

function onDeath(player){
	GA.Population[player.index].fitness = player.fitness_curr;
	GA.Population[player.index].score = player.dist_fitness_curr / ((player.jump_curr+1) / (player.score_curr+1));
	
	player.death();
	if (playerGroup.countLiving() == 0){
		play = false;
		gameover = true;
	}
}

function drawStatus(){
	bmdStatus.fill(255, 226, 226); // clear bitmap data by filling it with a blue light color
	bmdStatus.rect(0, 0, 2, bmdStatus.height, "#888"); // draw the HUD header rect
	
	playerGroup.forEach(function(mummy){
		var y = 60 + mummy.index*48;
		
		this.bmdStatus.draw(mummy, 10, y-48); // draw bird's image
		this.bmdStatus.rect(0, y, this.bmdStatus.width, 2, "#888"); // draw line separator
		
		if (mummy.alive){
			this.bmdStatus.rect(90, y, 9, -mummy.fitness_curr/20, "#000088"); // input 1
			if (mummy.act<0.5) this.bmdStatus.rect(60, y, 9, -20, "#880000");
			else this.bmdStatus.rect(60, y, 9, -40, "#008800");
		}
		
	}, this);
}

function vartext(){
	textPoint.setText(score);
	textInOut.setText("Sai    Ent");
	if(GA.iteration) textGen.setText("Geracao: "+GA.iteration);
	playerGroup.forEach(function(p){
		if(p.index == 0) textAct0.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 1) textAct1.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 2) textAct2.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 3) textAct3.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 4) textAct4.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 5) textAct5.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 6) textAct6.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 7) textAct7.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 8) textAct8.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 9) textAct9.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 10) textAct10.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
		if(p.index == 11) textAct11.setText("Pontos:     "+parseFloat(p.dist_fitness_curr / ((p.jump_curr+1) / (p.score_curr+1))).toFixed(0));
	}, this);
}

function render (){
}