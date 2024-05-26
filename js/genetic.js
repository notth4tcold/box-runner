var GeneticAlgorithm = function(max_units, top_units){
	this.max_units = max_units;
	this.top_units = top_units;
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	this.Population = [];
}

GeneticAlgorithm.prototype = {
	reset : function(){
		this.iteration = 1;
		this.mutateRate = 1; 
		this.best_population = 0;
		this.best_fitness = 0; 
		this.best_score = 0;
	},
	
	createPopulation : function(){
		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){
			var newUnit = new synaptic.Architect.Perceptron(1, 8, 1);
			
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			 
			this.Population.push(newUnit);
		}
	},
	
	activateBrain : function(p){
		var inputs = [p.fitness_curr];
		var outputs = this.Population[p.index].activate(inputs);
		p.act = outputs;
		if (outputs[0] > 0.5) p.jump();
	},
	
	evolvePopulation : function(){
		var Winners = this.organize(); // get a sortedpopulation by score
		var score = 0;
		var score_v = 0;
		var v = 0;
		var parentA;
		var parentB;
		
		if (this.mutateRate == 1 && Winners[0].fitness < 0){ //-----------------------------------
			this.createPopulation();
		} else {                                             // Se entrar antes de começar o game
			this.mutateRate = 0.2;
		}                                                    //-----------------------------------
		
		this.Population[0] = Winners[0]; //elitismo
		this.Population[1] = Winners[1];
		
		for (var i=this.top_units; i<this.max_units-1; i+=2){
			for(var j=0; j<this.max_units; j++){  //get score total
				score += Winners[j].score;
			}
			do{
				v = 0;
				score_v = this.random(0,score);
				for(var j=this.max_units-1; j>0; j--){  //get parentA
					if(v < score_v) v += Winners[j].score;
					else{
						parentA = Winners[j].toJSON();
						break;
					}
				}
			}while (parentA == null);
			do{
				v = 0;
				score_v = this.random(0,score); //get parentB
				for(var j=this.max_units-1; j>0; j--){
					if(v < score_v) v += Winners[j].score;
					else{
						parentB = Winners[j].toJSON(); //verificar se ta saindo aq
						break;
					}
				}
			}while (parentA == parentB || parentB == null);
			
			var offspring = this.crossOver(parentA, parentB);
			offspring[0] = this.mutation(offspring[0]);
			offspring[1] = this.mutation(offspring[1]);
			
			var newUnitA = synaptic.Network.fromJSON(offspring[0]);
			var newUnitB = synaptic.Network.fromJSON(offspring[1]);
			
			newUnitA.index = this.Population[i].index;
			newUnitB.index = this.Population[i+1].index;
			newUnitA.fitness = 0;
			newUnitB.fitness = 0;
			newUnitA.score = 0;
			newUnitB.score = 0;
			newUnitA.isWinner = false;
			newUnitB.isWinner = false;
			
			this.Population[i] = newUnitA;
			this.Population[i+1] = newUnitB;
		}
		
		if (Winners[0].fitness > this.best_fitness){
			this.best_population = this.iteration;
			this.best_fitness = Winners[0].fitness;
			this.best_score = Winners[0].score;
		}
		
		this.Population.sort(function(unitA, unitB){
			return unitA.index - unitB.index;
		});
		
		start = true;  //start game
		gameover = false;
	},

	organize : function(){
		var sortedPopulation = this.Population.sort(
			function(unitA, unitB){
				return unitB.score - unitA.score;
			}
		);
		for (var i=0; i<this.top_units; i++) this.Population[i].isWinner = true;
		return sortedPopulation;
	},
	
	crossOver : function(parentA, parentB) {
		var cutPoint = this.random(0, parentA.neurons.length-1);
		
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return [parentA,parentB];
	},
	
	mutation : function (offspring){
		for (var i = 0; i < offspring.neurons.length; i++){
			offspring.neurons[i]['bias'] = this.mutate(offspring.neurons[i]['bias']);
		}
		
		for (var i = 0; i < offspring.connections.length; i++){
			offspring.connections[i]['weight'] = this.mutate(offspring.connections[i]['weight']);
		}
		
		return offspring;
	},
	
	mutate : function (gene){
		if (Math.random() < this.mutateRate) {
			var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
			gene *= mutateFactor;
		}
		return gene;
	},
	
	random : function(min, max){
		return Math.floor(Math.random()*(max-min+1) + min);
	},
	
	getRandomUnit : function(array){
		return array[this.random(0, array.length-1)];
	}
}