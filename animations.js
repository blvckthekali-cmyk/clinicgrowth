(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'animation-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let neurons = [];
    let electricPulses = [];
    let mouse = { x: -1000, y: -1000, active: false };
    let time = 0;

    const CONFIG = {
        particleCount: 60,
        neuronCount: 45,
        maxConnectDist: 160,
        mouseRadius: 200,
        glowColor: 'rgba(14, 165, 233, 0.08)'
    };

    function init() {
        resize();
        window.addEventListener('resize', () => { resize(); redistribute(); });
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
        });
        window.addEventListener('mouseleave', () => { mouse.active = false; });
        createElements();
        animate();
    }

    function createElements() {
        particles = []; neurons = [];
        for (let i = 0; i < CONFIG.particleCount; i++) particles.push(new FloatingParticle());
        for (let i = 0; i < CONFIG.neuronCount; i++) {
            const isLeft = Math.random() > 0.5;
            const x = isLeft ? Math.random() * width * 0.32 : width - Math.random() * width * 0.32;
            const y = Math.random() * height;
            neurons.push(new NeuralNode(x, y));
        }
    }

    function redistribute() {
        neurons.forEach(n => {
            const isLeft = Math.random() > 0.5;
            n.baseX = isLeft ? Math.random() * width * 0.32 : width - Math.random() * width * 0.32;
            n.baseY = Math.random() * height;
        });
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // ── Floating Particles (subtle ambient dust) ──
    class FloatingParticle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.size = Math.random() * 1.2 + 0.3;
            this.alpha = Math.random() * 0.12 + 0.03;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += 0.01;
            // Gentle mouse repulsion
            if (mouse.active) {
                const dx = this.x - mouse.x, dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius) {
                    const f = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                    this.vx += (dx / dist) * f * 0.02;
                    this.vy += (dy / dist) * f * 0.02;
                }
            }
            this.vx *= 0.995; this.vy *= 0.995;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) this.y = height + 10;
            if (this.y > height + 10) this.y = -10;
        }
        draw() {
            const flicker = this.alpha * (0.7 + 0.3 * Math.sin(this.pulsePhase));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56,189,248,${flicker})`;
            ctx.fill();
        }
    }

    // ── Neural Nodes (organic drift matching the brain areas) ──
    class NeuralNode {
        constructor(x, y) {
            this.x = x; this.y = y; this.baseX = x; this.baseY = y;
            this.phi = Math.random() * Math.PI * 2;
            this.phi2 = Math.random() * Math.PI * 2;
            this.speed = 0.003 + Math.random() * 0.006;
            this.speed2 = 0.002 + Math.random() * 0.004;
            this.range = 6 + Math.random() * 14;
            this.range2 = 3 + Math.random() * 8;
            this.size = Math.random() * 1.8 + 0.8;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.015 + Math.random() * 0.02;
        }
        update() {
            this.phi += this.speed;
            this.phi2 += this.speed2;
            this.pulsePhase += this.pulseSpeed;
            // Smooth Lissajous-style drift
            this.x = this.baseX + Math.sin(this.phi) * this.range + Math.cos(this.phi2 * 1.3) * this.range2;
            this.y = this.baseY + Math.cos(this.phi * 0.8) * this.range + Math.sin(this.phi2 * 0.7) * this.range2;
            // Gentle mouse attraction
            if (mouse.active) {
                const dx = mouse.x - this.x, dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius * 1.3) {
                    const f = (CONFIG.mouseRadius * 1.3 - dist) / (CONFIG.mouseRadius * 1.3);
                    this.x += dx * f * 0.015;
                    this.y += dy * f * 0.015;
                }
            }
        }
        draw() {
            const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase);
            const gs = this.size + pulse * 1.5;
            // Soft outer halo
            ctx.beginPath();
            ctx.arc(this.x, this.y, gs * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56,189,248,${0.008 + pulse * 0.012})`;
            ctx.fill();
            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, gs, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56,189,248,${0.25 + pulse * 0.2})`;
            ctx.shadowBlur = 4 + pulse * 3;
            ctx.shadowColor = 'rgba(14,165,233,0.5)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // ── Travelling Electric Pulse ──
    class ElectricPulse {
        constructor(s, e) {
            this.s = s; this.e = e; this.p = 0; this.alive = true;
            this.speed = 0.015 + Math.random() * 0.015;
        }
        update() { this.p += this.speed; if (this.p >= 1) this.alive = false; }
        draw() {
            const x = this.s.x + (this.e.x - this.s.x) * this.p;
            const y = this.s.y + (this.e.y - this.s.y) * this.p;
            const fade = 1 - this.p;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + fade * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,230,255,${0.4 + fade * 0.4})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(56,189,248,0.6)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // ── Subtle Lightning Arc ──
    function drawLightning(x1, y1, x2, y2, alpha) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.max(3, Math.floor(d / 8));
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const jitter = 4;
            ctx.lineTo(
                x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
                y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter
            );
        }
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(180,220,255,${alpha || 0.3})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(14,165,233,0.4)';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // ── Plus Sign Electric Effects ──
    // Subtle glow & micro-sparks aligned with the "+" symbols in the background image
    function drawPlusEffects() {
        const plusPositions = [
            { x: 0.34, y: 0.25, size: 50 },  // upper-center plus
            { x: 0.50, y: 0.48, size: 35 },  // centre plus
            { x: 0.60, y: 0.70, size: 48 },  // lower plus
            { x: 0.25, y: 0.52, size: 18 },  // small left plus
            { x: 0.72, y: 0.35, size: 18 },  // small right plus
        ];

        plusPositions.forEach((pos, idx) => {
            const px = pos.x * width;
            const py = pos.y * height;
            const sz = pos.size;
            const pulse = 0.3 + 0.7 * Math.sin(time * 0.02 + idx * 1.8);

            // Soft breathing glow
            const grad = ctx.createRadialGradient(px, py, 0, px, py, sz * 1.8);
            grad.addColorStop(0, `rgba(56,189,248,${0.035 * pulse})`);
            grad.addColorStop(0.6, `rgba(14,165,233,${0.015 * pulse})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, sz * 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Subtle micro-sparks (only 1-3 at a time, very delicate)
            const sparkCount = Math.floor(pulse * 2.5);
            for (let s = 0; s < sparkCount; s++) {
                const angle = Math.random() * Math.PI * 2;
                const r = sz * 0.4 + Math.random() * sz * 0.5;
                const sx = px + Math.cos(angle) * r;
                const sy = py + Math.sin(angle) * r;
                const len = 2 + Math.random() * 5;
                const ex = sx + Math.cos(angle + (Math.random() - 0.5)) * len;
                const ey = sy + Math.sin(angle + (Math.random() - 0.5)) * len;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = `rgba(125,211,252,${0.1 + pulse * 0.2})`;
                ctx.lineWidth = 0.4 + Math.random() * 0.6;
                ctx.stroke();
            }

            // Rare gentle flash (professional, not distracting)
            if (Math.random() < 0.003) {
                ctx.beginPath();
                ctx.arc(px, py, sz * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(125,211,252,0.08)';
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(56,189,248,0.3)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Mouse proximity: soft glow intensification
            if (mouse.active) {
                const dx = mouse.x - px, dy = mouse.y - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 160) {
                    const prox = 1 - dist / 160;
                    // Gentle glow boost
                    ctx.beginPath();
                    ctx.arc(px, py, sz * 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(56,189,248,${prox * 0.05})`;
                    ctx.fill();
                    // Rare arc from cursor (very subtle)
                    if (Math.random() < prox * 0.04) {
                        drawLightning(mouse.x, mouse.y, px, py, prox * 0.2);
                    }
                }
            }
        });
    }

    // ── Main Animation Loop ──
    function animate() {
        time++;
        ctx.clearRect(0, 0, width, height);

        // Mouse glow halo
        if (mouse.active) {
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, CONFIG.mouseRadius);
            grad.addColorStop(0, CONFIG.glowColor);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        // Floating ambient particles
        particles.forEach(p => { p.update(); p.draw(); });

        // Neural nodes update
        neurons.forEach(n => n.update());

        // Neural connections (subtle lines + rare lightning)
        ctx.lineWidth = 0.4;
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const n1 = neurons[i], n2 = neurons[j];
                const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
                if (dist < CONFIG.maxConnectDist) {
                    const alpha = 1 - dist / CONFIG.maxConnectDist;
                    ctx.strokeStyle = `rgba(56,189,248,${alpha * 0.12})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                    // Rare lightning arc
                    if (Math.random() < 0.0002) drawLightning(n1.x, n1.y, n2.x, n2.y, 0.25);
                    // Travelling pulse
                    if (Math.random() < 0.0006 && electricPulses.length < 12)
                        electricPulses.push(new ElectricPulse(n1, n2));
                }
            }
        }

        // Draw neural nodes
        neurons.forEach(n => n.draw());

        // Draw electric pulses
        for (let i = electricPulses.length - 1; i >= 0; i--) {
            electricPulses[i].update();
            if (electricPulses[i].alive) electricPulses[i].draw();
            else electricPulses.splice(i, 1);
        }

        // Plus symbol effects
        drawPlusEffects();

        requestAnimationFrame(animate);
    }

    init();
})();
