const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameRunning = true;

const scoreText = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (e.code === "Space") {
        e.preventDefault();
        shoot();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


// STARS
const stars = [];

for(let i=0;i<350;i++){
    stars.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        size:Math.random()*2+1
    });
}


// PLAYER
const player = {
    x:canvas.width/2,
    y:canvas.height-120,
    width:50,
    height:70,
    speed:7
};


// BULLETS
const bullets = [];

function shoot(){
    if(!gameRunning) return;

    bullets.push({
        x:player.x,
        y:player.y-25,
        width:6,
        height:20,
        speed:12
    });
}


// ENEMIES
const enemies = [];

function spawnEnemy(){

    let isEnemy = Math.random() > 0.35;

    enemies.push({
        x:Math.random()*(canvas.width-60)+30,
        y:-100,
        width:50,
        height:50,
        speed:5 + Math.random()*4,
        type:isEnemy ? "enemy" : "friendly"
    });
}

setInterval(()=>{
    if(gameRunning) spawnEnemy();
},600);


// PARTICLES
const particles = [];

function createExplosion(x,y,color){

    for(let i=0;i<20;i++){
        particles.push({
            x,
            y,
            dx:(Math.random()-0.5)*6,
            dy:(Math.random()-0.5)*6,
            life:30,
            color
        });
    }
}


// DRAW STARS
function drawStars(){

    ctx.fillStyle="white";

    stars.forEach(star=>{
        ctx.beginPath();
        ctx.arc(star.x,star.y,star.size,0,Math.PI*2);
        ctx.fill();

        star.y += 0.5;

        if(star.y > canvas.height){
            star.y = 0;
        }
    });
}


// PLAYER SHIP
function drawPlayer(){

    ctx.save();

    ctx.translate(player.x,player.y);

    ctx.shadowColor="#00ffff";
    ctx.shadowBlur=20;

    ctx.fillStyle="#00ffff";

    ctx.beginPath();
    ctx.moveTo(0,-35);
    ctx.lineTo(-25,25);
    ctx.lineTo(0,10);
    ctx.lineTo(25,25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(0,-5,6,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
}


// ENEMY SHIPS
function drawEnemy(enemy){

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if(enemy.type === "enemy"){
        ctx.shadowColor="red";
        ctx.shadowBlur=20;
        ctx.fillStyle="red";
    }else{
        ctx.shadowColor="dodgerblue";
        ctx.shadowBlur=20;
        ctx.fillStyle="dodgerblue";
    }

    ctx.beginPath();
    ctx.moveTo(0,-25);
    ctx.lineTo(-25,15);
    ctx.lineTo(25,15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}


// UPDATE
function update(){

    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    player.x = Math.max(30, Math.min(canvas.width-30, player.x));
    player.y = Math.max(40, Math.min(canvas.height-40, player.y));


    bullets.forEach((bullet,index)=>{
        bullet.y -= bullet.speed;

        if(bullet.y < 0){
            bullets.splice(index,1);
        }
    });


    enemies.forEach((enemy,eIndex)=>{

        enemy.y += enemy.speed;

        if(enemy.y > canvas.height+100){
            enemies.splice(eIndex,1);
        }

        bullets.forEach((bullet,bIndex)=>{

            let hit =
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y;

            if(hit){

                bullets.splice(bIndex,1);

                if(enemy.type === "enemy"){

                    score += 5;
                    scoreText.textContent = score;

                    createExplosion(enemy.x, enemy.y, "red");

                    if(score >= 70){
                        gameRunning = false;
                        gameOverScreen.style.display = "block";
                    }

                }else{

                    score = Math.max(0, score-5);
                    scoreText.textContent = score;

                    createExplosion(enemy.x, enemy.y, "dodgerblue");
                }

                enemies.splice(eIndex,1);
            }
        });
    });


    particles.forEach((p,index)=>{

        p.x += p.dx;
        p.y += p.dy;
        p.life--;

        if(p.life <= 0){
            particles.splice(index,1);
        }
    });
}


// DRAW
function draw(){

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();

    drawPlayer();

    bullets.forEach(bullet=>{

        ctx.shadowColor="#ffff00";
        ctx.shadowBlur=15;

        ctx.fillStyle="#ffff00";
        ctx.fillRect(
            bullet.x-3,
            bullet.y,
            bullet.width,
            bullet.height
        );
    });

    enemies.forEach(drawEnemy);

    particles.forEach(p=>{

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life/30;

        ctx.beginPath();
        ctx.arc(p.x,p.y,3,0,Math.PI*2);
        ctx.fill();

        ctx.globalAlpha = 1;
    });
}


// LOOP
function gameLoop(){

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
