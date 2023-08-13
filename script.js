const level = document.getElementById('level')

window.addEventListener('load',function(){
    
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    class InputHandler{

        constructor(game){
            this.game = game;
            

            window.addEventListener('keydown',(e)=>{
                if (( (e.key === 'ArrowUp' ) ||
                (e.key === 'ArrowDown')
                ) && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                      
                }else if (e.key === ' ' ) {
                    this.game.player.shootTop()
                }
                else if (e.key ==='d'){
                    this.game.debug = !this.game.debug;
                }
                else if (e.key === 'p'){
                    this.game.pause = !this.pause;
                }

            })

            window.addEventListener('keyup',(e)=>{
                if (this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1)
                }
                
            })
            }


    }






    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x+50;
            this.y = y+28;
            this.width = 25;
            this.height = 13;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
            this.audio = document.getElementById('shoot')
        }
        update(){
             this.x += this.speed;
             if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }

        draw(context){
           
            context.fillStyle = "white";
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image,this.x, this.y);
            
        }

    }







    class Particle {
        constructor(game, x, y){
            this.x = x;
            this.y = y;
            this.game = game;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random()*3);
            this.frameY = Math.floor(Math.random()*3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 +0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 -3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() *0.2 -0.1;
            this.bounced = 0;
            this.bottombounceboundary = Math.random() * 80 +40;
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
            if(this.y > this.game.height - this.bottombounceboundary && (this.bounced <2)){
                this.bounced += 1;
                this.speedY *= -0.5;
            }
        }
        draw(context){
           context.save();
           context.translate(this.x,this.y);
           context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize , 
                    this.frameY * this.spriteSize , this.spriteSize,
                 this.spriteSize, this.size*-0.4, this.size*-0.3, this.size , this.size);
                if(this.game.debug==true)context.strokeRect(this.x, this.y, this.size , this.size);
           context.restore();
        }
    }

    class Player {
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 1;
            this.maxSpeed = 5; 
            this.projectiles = [];
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrameX =37;
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimmer =0; 
            this.powerUpLimit = 10000;
            


        }
        update(deltaTime){
            
            if (this.game.keys.includes('ArrowUp')) {this.speedY = -this.maxSpeed} 
            else if (this.game.keys.includes('ArrowDown')){this.speedY = this.maxSpeed}
            else{ this.speedY = 0;}
            this.y += this.speedY;

            // handle vertical boundary
            if (this.y > this.game.height - this.height*0.5){
                this.y = this.game.height -this.height * 0.5;
            }
            if (this.y < 0 -this.height *0.5){
                this.y =  -this.height * 0.5;
            }

            //handle Projectile
            this.projectiles.forEach(projectile =>{
                projectile.update()
            })
            this.frameX ++;

            if (this.frameX >= this.maxFrameX) this.frameX = 0 ;

            
            this.projectiles = this.projectiles.filter(projectile =>!projectile.markedForDeletion )

            if(this.powerUp){
                this.frameX += 1;
                if (this.powerUpTimmer > this.powerUpLimit){
                    this.powerUp = false;
                    this.powerUpTimmer = 0;
                    this.frameY = 0;
                }
                else{
                    this.powerUpTimmer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }

            }
        }
        draw(context){
            this.projectiles.forEach(projectile =>{
                projectile.draw(context)
            })
            if (this.game.debug){context.strokeRect(this.x,this.y,this.width,this.height);} 
            if (this.game.debug){context.fillText("x and y corrdinate are " +this.x +", "+ this.y,this.x, this.y+10)} 
            const remainingTime =( (this.powerUpLimit - this.powerUpTimmer) * 0.001).toFixed(1); 
            if (this.game.debug && this.powerUp){context.fillText("remaining Time is :"+remainingTime,this.x, this.y)} 
            context.drawImage(this.image,this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop(){
            if (this.game.ammo >0){
            this.projectiles.push(new Projectile(this.game, this.x, this.y));
            this.game.ammo --;
            if (this.powerUp) this.shootBottom();
            
            }
        }
        shootBottom(){
            if (this.game.ammo >0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175 -25)); 
                }
        }

        enterPowerUp(){
            this.powerUpTimmer = 0;
            this.powerUp = true;
            if(this.game.ammo < this.game.maxAmmo){
            this.game.ammo = this.game.maxAmmo;
            }
        }


    }







    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() *- 1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.maxFrameX = 37;
            this.frameY = 0;
        }
        update(){
            
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width <0){
                this.markedForDeletion = true;
            }
            
            if (this.frameX < this.maxFrameX){
                this.frameX++ ;   
            }
            
            else {this.frameX = 0;}
           
            
        }
        draw(context){
            
            if (this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height );
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height )
            context.fillStyle = 'white';
            if (this.game.debug) context.fillText(this.lives,this.x,this.y);
            if (this.game.debug) context.fillText(this.type,this.x + 10,this.y)
            if (this.game.debug) context.fillText((this.x ).toFixed(1) + " : "+ (this.y).toFixed(1),this.x+65,this.y)
        }

    }

    class Angler1 extends Enemy{
        constructor(game){
            super(game);
            this.type = 'Angler1';
            this.width = 228 ;
            this.height = 169 ;
            this.lives = 2;
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random()*3);
            document.getElementById('backgr').play() 
        }
    }

    class Angler2 extends Enemy{
        constructor(game){
            super(game);
            this.type = 'Angler2';
            this.lives = 3;
            this.score = this.lives;
            this.width = 213 ;
            this.height = 165 ;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random()*2);
        }
    }

    class Lucky extends Enemy{
        constructor(game){
            super(game);
            this.type = 'lucky';
            this.lives = 1;
            this.score = this.lives;
            this.width = 99 ;
            this.height = 95 ;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random()*2);
        }
    }

    class HyperWhale extends Enemy{
        constructor(game){
            super(game);
            this.type = 'hyper';
            this.lives = 33;
            this.score = 10;
            this.width = 400 ;
            this.height = 227 ;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('hive');
            this.frameY = Math.floor(Math.random()*2);
            this.speedX = Math.random() *- 1.2 - 0.2;

        }
    }

    class Drone extends Enemy{
        constructor(game,x,y){
            super(game);
            this.type = 'drone';
            this.lives = 2;
            this.score = 2;
            this.width = 115 ;
            this.height = 95 ;
            this.y = y;
            this.x = x;
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random()*2);
            this.speedX = Math.random() *- 4.2 - 0.2;

        }
    }




    class Layer{
        constructor(game, image ,speedModifier) {
            this.game =game;
            this.image =image;
            this.speedModifier =speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;

        }

        update(){
            if (this.x <= -this.width )this.x = 0 ;
            this.x -= this.game.speed * this.speedModifier;
        }

        draw(context){
            context.drawImage(this.image, this.x ,this.y);
            context.drawImage(this.image, this.x + this.width ,this.y);              
            
        }

    }
    

    class Background {
        constructor(game){
            this.game = game;
            this.image1 =document.getElementById('layer1');
            this.image2 =document.getElementById('layer2');
            this.image3 =document.getElementById('layer3');
            this.image4 =document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 1);
            this.layer2 = new Layer(this.game, this.image2, 1);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 2);
            this.layers = [this.layer1, this.layer2, this.layer3];

        }
        update(){
            this.layers.forEach(layer =>{
                layer.update();
            })
        }

        draw(context){
            this.layers.forEach(layer =>{
                layer.draw(context);
            })
        }

    }

    class Ui {
        constructor (game){
            this.game = game;
            this.fontSize = 35;
            // this.fontFamily = 'Helvetica';
            this.color = 'yellow';
            
            
        }
        draw(context){
            context.save()
            context.fillStyle ='white';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor ='black';
            // score 
            context.font = '25px Bangers';
            context.fillText("score :"+this.game.score,20,40)
            let currnet_amo = Math.floor(this.game.ammo);
            if(this.game.debug==true){context.fillText("current Ammo : "+currnet_amo,this.game.width-200,60)};

            
            // timmmer
            const formatedTime = (this.game.gameTime*0.001).toFixed(1); 
            context.fillText("Timmer:  "+ formatedTime,this.game.width-200,20);
            context.fillText("Level:  "+ this.game.Curlevel,this.game.width-200,40);

            // game over msg 
            if(this.game.gameOver){
                context.textAlign = 'center';
                let msg1, msg2, msg3;
                let scoreboard = this.game.totalScore + this.game.score; 
                msg3= "Total Score : " + scoreboard;
                if(this.game.score > this.game.winningScore){
                    msg1 = "Most Wondrous!";
                    msg2 ="Well Done Explorer ";

                }
                else{
                    // blazes =a large and often dangerous fire
                    msg1 = "Blazes";
                    msg2 = "Get my Repair Kit";
                    

                }
                context.font = '50px Bangers';
                context.fillText(msg1,this.game.width*0.5, this.game.height*0.5);
                context.font = '25px Bangers';
                context.fillText(msg2,this.game.width*0.5, this.game.height*0.5 +26);
                context.font = '40px Bangers white';
                context.fillText(msg3,this.game.width*0.5, this.game.height*0.5 + 60);

            
            }
                 // show ammo 
                 if (this.game.player.powerUp) context.fillStyle = 'red';
                 for (let i=0 ; i< this.game.ammo; i++){
                     context.fillRect(20+5 *i, 50 ,3, 20 )
                    
                 }
                
            context.restore();

        }
    }


    class Game{
        
        constructor(width, height){
            this.Curlevel = 1;
            this.levelUp = false;
            this.width = width;
            this.height = height;
            this.player = new Player(this); 
            this.input = new InputHandler(this);
            this.background = new Background(this);
            this.enemy = new Enemy(this);
            this.keys = [];
            this.ammo = 50;
            this.maxAmmo = 50;
            this.ammoTimmer = 0;
            this.ammoInterval = 900;
            this.enemies = []
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.gameOver = false;
            this.score = 0;
            this.totalScore = 0;
            this.winningScore = 100;
            this.gameTime = 0;
            this.gameTimelimit =50000;
            this.speed = 1;
            this.debug = false;
            this.pause = true;
            this.Angler1Pred = this.Angler1Pred = 0.4;
            this.hyperPred = 0.85;
            this.luckyPred = 0.91
            
            this.ui= new Ui(this);


        }
       
        update(deltaTime){
            
           if (!this.gameOver) this.gameTime += deltaTime
            if (this.gameTime > this.gameTimelimit){
                this.gameOver =true;
                // this.totalScore += this.score;
            }
            this.background.update()
            this.background.layer4.update()
            this.player.update(deltaTime);
            if (this.ammoTimmer > this.ammoInterval){
                if (this.ammo < this.maxAmmo){
                    this.ammo++ ;
                    this.ammoTimmer =0;
                }
            }
            else{
                this.ammoTimmer += deltaTime;
            }
            this.particles.forEach(particle => particle.update());
           this.particles = this.particles.filter(
                            particle =>!particle.markedForDeletion)
         
            this.enemies.forEach(enemy =>{
                enemy.update();
                if (this.checkCollison(this.player,enemy)){
                    enemy.markedForDeletion = true;
                    for (let i = 0 ;i < enemy.lives ;i++){
                        this.particles.push(new Particle(this, enemy.x + enemy.width* 0.5,
                            enemy.y + enemy.height *0.5))
                    }
                   
                    
                    if (enemy.type ==='lucky'){
                        this.player.enterPowerUp();
                    }
                    else if(!this.gameOver){ this.score = this.score - Math.floor(enemy.score*0.5)} ;
                }
                this.player.projectiles.forEach(projectile=>{
                    if(this.checkCollison(projectile,enemy)){
                        enemy.lives --;
                        projectile.markedForDeletion =true;  
                        this.particles.push(new Particle(this, enemy.x + enemy.width* 0.5,
                            enemy.y + enemy.height *0.5))
                            
                        
                        
                        if (enemy.lives <= 0){
                            if(enemy.type=="hyper"){
                                document.getElementById("audio").play()
                                for(let i =0 ; i<5;i++){
                                    this.enemies.push(new Drone(this,enemy.x +Math.random()*enemy.width
                                        ,enemy.y + Math.random() * enemy.height));
                                }
                            }
                            enemy.markedForDeletion =true;
                            for (let i = 0 ;i < enemy.lives ;i++){
                                this.particles.push(new Particle(this, enemy.x + enemy.width* 0.5,
                                    enemy.y + enemy.height *0.5))
                            }
                            
                            if (this.score >= this.winningScore){                                
                                this.levelUp =true;
                                this.gameOver = true;
                            }
                            if (!this.gameOver){this.score += enemy.score};
                        }
                    }
                    
                    
                })

            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
                

            }
            else{
                this.enemyTimer += deltaTime;
            }

            if(this.levelUp == true){
                this.Curlevel = this.Curlevel +1 ;
                this.totalScore += this.score;
                this.score = 0;
                this.hyperPred -= 0.05
                this.winningScore = this.winningScore *2;
                this.gameOver = false;
                this.gameTime =0;
                this.levelUp = false;
                
            }
        
        }

        draw(context){     
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            
             this.particles.forEach(particle => {particle.draw(context)})

             this.enemies.forEach(enemy =>{
            enemy.draw(context);
            })
            

            this.background.layer4.draw(context);

                        
        }


        addEnemy(){
            const randomize =Math.random();
            if(level.value=='pro' || level.value == 'advance'){
                if (randomize <this.Angler1Pred){
                    this.enemies.push(new Angler1(this));
                    }
                    else if (randomize >0.4 && randomize <0.65){
                        this.enemies.push(new Angler2(this));
                    }
                    if (randomize >0.65 && randomize <0.90){this.enemies.push(new HyperWhale(this))}
                    else if (randomize > 0.90){
                        this.enemies.push(new Lucky(this));
                    }
            }
            else{
                
                if (randomize <this.Angler1Pred){
                    this.enemies.push(new Angler1(this));
                    }
                    else if (randomize >this.Angler1Pred && randomize <this.hyperPred){
                        this.enemies.push(new Angler2(this));
                    }
                    if (randomize >this.hyperPred && randomize <this.luckyPred){this.enemies.push(new HyperWhale(this))}
                    else{
                        this.enemies.push(new Lucky(this));
                    }
              
            }
           
        }

        checkCollison(rect1, rect2){

            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height -20 &&
                rect1.height + rect1.y > rect2.y )
            
        }
    }



    const game = new Game(canvas.width,canvas.height);
   
    let lastTime =0;

    function animate(timeStamp){
        // delta time is nothing but time gap btw next frame in terms of milliseconds
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
       let a =true;
        window.addEventListener('focus',()=>a=true);
      window.addEventListener('blur',()=>{a=false})
       
            game.update(deltaTime)
            game.update(0)
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
animate(0)
    

})