'use strict';

class Bruh {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
    }

    update(delta) {
        this.x += (this.targetX - this.x) * 0.5 * delta * 6;
        this.y += (this.targetY - this.y) * 0.5 * delta * 6;
    }

    render() {
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText('bruh', this.x, this.y);
    }
}

class Creeper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.followRadius = 600;
        this.angryRadius = 120;
        this.isAngry = false;
        this.isFollowing = false;
        this.angryAmount = 0.0;
        this.speed = 50;
    }

    update(delta) {
        let centerX = this.x + Creeper.headLength / 2;
        let centerY = this.y + (Creeper.headLength + Creeper.bodyHeight + Creeper.feetHeight) / 2;

        if (bruh) {
            let distanceToBruh = dist(centerX, centerY, bruh.x, bruh.y);

            if (distanceToBruh <= this.followRadius) {
                this.isFollowing = true;
            } else {
                if (this.isFollowing) {
                    // Set wandering velocity
                    let direction = Math.random() * 2 * Math.PI;
                    let speed = this.speed / 10;
                    this.dx = Math.cos(direction) * speed;
                    this.dy = Math.sin(direction) * speed;
                }
                this.isFollowing = false;
            }

            // Follow player
            if (this.isFollowing) {
                this.dx = bruh.x - centerX;
                this.dy = bruh.y - centerY;
                let length = dist(bruh.x, bruh.y, centerX, centerY);
                this.dx *= this.speed / length;
                this.dy *= this.speed / length;
            }

            // Update isAngry and angryAmount
            this.isAngry = distanceToBruh <= this.angryRadius;
            if (this.isAngry) {
                this.angryAmount = Math.min(1.0, this.angryAmount + delta);
            } else {
                this.angryAmount = Math.max(0.0, this.angryAmount - delta);
            }
        }

        this.x += this.dx * delta;
        this.y += this.dy * delta;

        this.speed += 10 * delta;
        this.followRadius += 2 * delta;
    }

    render() {
        let x = this.x;
        let y = this.y;
        let centerX = this.x + Creeper.headLength / 2;
        let centerY = this.y + (Creeper.headLength + Creeper.bodyHeight + Creeper.feetHeight) / 2;

        // Set creeper color
        let r = this.angryAmount * 255;
        let g = (1.0 - this.angryAmount) * 255 / 2;
        ctx.fillStyle = 'rgba(' + r + ', ' + g + ', 0, 1.0)';

        // Draw creeper body
        ctx.fillRect(x, y, Creeper.headLength, Creeper.headLength);
        ctx.fillRect(x + Creeper.headLength / 2 - Creeper.bodyWidth / 2, y + Creeper.headLength,
            Creeper.bodyWidth, Creeper.bodyHeight);
        ctx.fillRect(x, y + Creeper.headLength + Creeper.bodyHeight, Creeper.feetWidth, Creeper.feetHeight);

        // Render face
        ctx.fillStyle = 'black';
        for (let my = 0; my < 8; my++) {
            for (let mx = 0; mx < 8; mx++) {
                if (Creeper.face[my][mx] == 1)
                    ctx.fillRect(x + mx * 8, y + my * 8, 9, 9);
            }
        }

        // Render angry radius
        /*ctx.strokeStyle = 'red';
        ctx.beginPath();
        
        ctx.arc(centerX, centerY,
                this.angryRadius, 0, 2 * Math.PI);
        ctx.stroke();*/
    }
}
Creeper.headLength = 64;
Creeper.bodyWidth = 0.6 * Creeper.headLength;
Creeper.bodyHeight = 2.5 * Creeper.bodyWidth;
Creeper.feetWidth = Creeper.headLength;
Creeper.feetHeight = Creeper.feetWidth / 2;
Creeper.face = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let bruh;
const creepers = [];

function dist(x0, y0, x1, y1) {
    return ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** (1 / 2);
}


canvas.addEventListener('mousemove', ev => {
    if (bruh) {
        bruh.targetX = ev.clientX;
        bruh.targetY = ev.clientY;
    }
});

canvas.addEventListener('mousedown', ev => {
    if (!gameStarted) {
        startGame();
    }
})


function startGame() {
    gameStarted = true;
    bruh = new Bruh();
    creepers.length = 0;
    creepers.push(new Creeper(canvas.width / 3, 2 * canvas.height / 3));
}

function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    let highestCreeperSpeed = 0;
    for (let creeper of creepers) {
        if (creeper.speed > highestCreeperSpeed) {
            highestCreeperSpeed = creeper.speed;
        }
    }
    let r = Math.min(1.0, highestCreeperSpeed / 2000) ** 2 * 255 / 2;
    ctx.fillStyle = 'rgba(' + r + ', 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bruh)
        bruh.render();

    for (let creeper of creepers) {
        creeper.render();
    }

    // Draw title screen
    if (!gameStarted) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 64px serif';
        ctx.fillText('CREEPER', canvas.width / 2, 2 * canvas.height / 5);
        ctx.font = '24px serif';
        ctx.fillText('click to begin', canvas.width / 2, 3 * canvas.height / 5);
    }
}

function update(delta) {
    if (bruh)
        bruh.update(delta);

    for (let creeper of creepers) {
        creeper.update(delta);
    }
}


let now = Date.now() / 1000.0;
let lastRenderTime = now;

function loop() {
    now = Date.now() / 1000.0;
    let delta = Math.min(1, now - lastRenderTime);
    update(delta);
    render();
    lastRenderTime = now;
}

setInterval(loop, 0);