const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d'); // We need the context to actually draw!

const canvasProperties = {
    background: 'transparent',
    position: 'fixed',
    inset: '0px',
    width: '100%',
    height: '100%',
    'z-index': '-1',
    'pointer-events': 'none' // Ensures the canvas doesn't steal mouse clicks from your UI
}

for(let prop of Object.entries(canvasProperties)) {
    canvas.style.setProperty(prop[0], prop[1])
}
document.body.prepend(canvas);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize(); // Call once to set initial size

let uplift = 1.5;
let wind = 0.5;
const pivotColor = { r: 254, g: 155, b: 34 }; // Fixed 'a' to 'b'

interface Ember {
    x: number, 
    y: number,
    size: number, 
    color: {r: number, g: number, b: number},
    weight: number, 
    speed: number, 
    opacity: number,
}

let embers: Ember[] = [];

function spawnEmber() {
    embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10, // Start slightly off-screen at the bottom
        size: Math.random() * 2.5 + 0.5,
        color: pivotColor,
        weight: Math.random() * 0.5 + 0.5, // Used to vary upward speed
        speed: (Math.random() - 0.5),      // Initial horizontal drift
        opacity: Math.random() * 0.5 + 0.5 // Start with varying brightness
    });
}

function animate() {
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() > 0.6) {
        spawnEmber();
    }

    for (let i = embers.length - 1; i >= 0; i--) {
        let p = embers[i];

        // --- PHYSICS ---
        // Lighter embers fly up faster
        p.y -= (uplift / p.weight); 
        
        // Add erratic sway to the horizontal speed
        p.speed += (Math.random() - 0.5) * 0.1; 
        p.x += wind + p.speed;

        // Slowly fade out as they rise
        p.opacity -= 0.003; 

        // --- DRAWING ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
        
        // Adds a nice fiery glow
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
        ctx.fill();

        // --- GARBAGE COLLECTION ---
        // If the ember fades out completely or flies way off screen, delete it
        if (p.opacity <= 0 || p.y < -50 || p.x < -50 || p.x > canvas.width + 50) {
            embers.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Ignite!
animate();