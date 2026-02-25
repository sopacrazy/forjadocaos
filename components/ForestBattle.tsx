import React, { useState, useEffect, useRef } from 'react';
import { Construction, X } from 'lucide-react';

interface Player {
    id: string;
    nickname: string;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    color: string;
    message?: string;
    messageTimer?: number;
}

interface ForestBattleProps {
    currentUser: any;
}

const ForestBattle: React.FC<ForestBattleProps> = ({ currentUser }) => {
    // const [inBattle, setInBattle] = useState(false); // Removed for separation
    const [chatMessage, setChatMessage] = useState('');
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keysPressed = useRef<Set<string>>(new Set());
    const animationFrameRef = useRef<number>();
    const backgroundImage = useRef<HTMLImageElement | null>(null);

    // Barreiras de colisão aproximadas baseadas na imagem (x, y, width, height)
    const collisions = [
        // Árvore Superior Esquerda
        { x: 0, y: 0, w: 230, h: 200 },
        // Árvore Superior Direita
        { x: 570, y: 0, w: 230, h: 200 },
        // Árvore Inferior Esquerda
        { x: 0, y: 400, w: 230, h: 200 },
        // Árvore Inferior Direita
        { x: 570, y: 400, w: 230, h: 200 },
        // Troncos centrais e pedras
        { x: 350, y: 250, w: 100, h: 100 } // Centro aproximado
    ];

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    const PLAYER_SIZE = 32;
    const MOVE_SPEED = 3;

    const sendChatMessage = () => {
        if (chatMessage.trim() && currentPlayer) {
            const updatedPlayer = {
                ...currentPlayer,
                message: chatMessage.trim(),
                messageTimer: Date.now() + 5000 // Mensagem dura 5 segundos
            };

            setCurrentPlayer(updatedPlayer);
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setChatMessage('');

            // Limpar mensagem após 5 segundos
            setTimeout(() => {
                setCurrentPlayer(curr => {
                    if (curr && curr.id === updatedPlayer.id && curr.message === updatedPlayer.message) {
                        return { ...curr, message: undefined };
                    }
                    return curr;
                });
                setPlayers(prev => prev.map(p => {
                    if (p.id === updatedPlayer.id && p.message === updatedPlayer.message) {
                        return { ...p, message: undefined };
                    }
                    return p;
                }));
            }, 5000);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
            keysPressed.current.add(e.key.toLowerCase());
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.current.delete(e.key.toLowerCase());
    };

    // Verificar colisão
    const checkCollision = (x: number, y: number) => {
        // Verificar colisão com bordas do mapa
        if (x < 0 || x > CANVAS_WIDTH - PLAYER_SIZE || y < 0 || y > CANVAS_HEIGHT - PLAYER_SIZE) {
            return true;
        }

        // Verificar colisão com obstáculos
        for (const obs of collisions) {
            if (
                x < obs.x + obs.w &&
                x + PLAYER_SIZE > obs.x &&
                y < obs.y + obs.h &&
                y + PLAYER_SIZE > obs.y
            ) {
                return true;
            }
        }
        return false;
    };

    const getRandomPosition = () => {
        let attempts = 0;
        let x, y;

        // Tenta encontrar uma posição válida até 50 vezes
        do {
            x = Math.random() * (CANVAS_WIDTH - PLAYER_SIZE - 100) + 50;
            y = Math.random() * (CANVAS_HEIGHT - PLAYER_SIZE - 100) + 50;
            attempts++;
        } while (checkCollision(x, y) && attempts < 50);

        // Se falhar, retorna uma posição segura conhecida (caminho entre árvores)
        if (attempts >= 50) {
            return { x: 400, y: 300 }; // Centro seguro (ajustado se colidir com centro)
        }

        return { x, y };
    };

    // Start Game Logic (Auto-Join)
    useEffect(() => {
        if (currentUser && !currentPlayer) {
            // First load
            const pos = getRandomPosition();
            const newPlayer: Player = {
                id: currentUser.rpgUser.id, // Use ID real
                nickname: currentUser.character?.nome || currentUser.rpgUser.username || "Heroi",
                x: pos.x,
                y: pos.y,
                direction: 'down',
                color: currentUser.rpgUser.avatar_color || '#8B5CF6'
            };
            setCurrentPlayer(newPlayer);
            setPlayers([newPlayer]); // Single Player Mock por enquanto
        }
    }, [currentUser]);


    const updatePlayerPosition = () => {
        if (!currentPlayer) return;

        let newX = currentPlayer.x;
        let newY = currentPlayer.y;
        let newDirection = currentPlayer.direction;
        let moved = false;

        // Movimento vetorial para suavidade
        if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
            if (!checkCollision(newX, newY - MOVE_SPEED)) {
                newY -= MOVE_SPEED;
                moved = true;
            }
            newDirection = 'up';
        }
        if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
            if (!checkCollision(newX, newY + MOVE_SPEED)) {
                newY += MOVE_SPEED;
                moved = true;
            }
            newDirection = 'down';
        }
        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
            if (!checkCollision(newX - MOVE_SPEED, newY)) {
                newX -= MOVE_SPEED;
                moved = true;
            }
            newDirection = 'left';
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
            if (!checkCollision(newX + MOVE_SPEED, newY)) {
                newX += MOVE_SPEED;
                moved = true;
            }
            newDirection = 'right';
        }

        if (moved || newDirection !== currentPlayer.direction) {
            const updatedPlayer = { ...currentPlayer, x: newX, y: newY, direction: newDirection };
            setCurrentPlayer(updatedPlayer);
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
        }
    };

    const drawForest = (ctx: CanvasRenderingContext2D) => {
        // Desenhar imagem de fundo se carregada
        if (backgroundImage.current && backgroundImage.current.complete) {
            ctx.drawImage(backgroundImage.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // Fallback: fundo verde caso a imagem não carregue
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
        const centerX = player.x + PLAYER_SIZE / 2;
        const centerY = player.y + PLAYER_SIZE / 2;

        // Animação de caminhada (oscila entre -1 e 1)
        const walkCycle = Math.sin(Date.now() / 200) * 2;

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, player.y + PLAYER_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);

        // Desenhar personagem baseado na direção
        if (player.direction === 'left') {
            ctx.scale(-1, 1); // Espelhar para esquerda
        }

        // CORPO
        ctx.fillStyle = player.color;
        ctx.fillRect(-6, -4, 12, 14); // Torso

        // CABEÇA
        ctx.fillStyle = '#ffd1a3'; // Tom de pele
        ctx.fillRect(-5, -14, 10, 10); // Cabeça

        // CABELO
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(-5, -14, 10, 4); // Cabelo topo

        // OLHOS
        ctx.fillStyle = '#000000';
        if (player.direction === 'up') {
            // Olhos fechados quando olhando para cima
            ctx.fillRect(-3, -10, 2, 1);
            ctx.fillRect(1, -10, 2, 1);
        } else {
            ctx.fillRect(-3, -10, 2, 2);
            ctx.fillRect(1, -10, 2, 2);
        }

        // BRAÇOS (animados)
        ctx.fillStyle = player.color;
        const armSwing = player.direction === 'up' || player.direction === 'down' ? walkCycle : 0;

        // Braço esquerdo
        ctx.fillRect(-8, -2 + armSwing, 2, 8);
        // Braço direito
        ctx.fillRect(6, -2 - armSwing, 2, 8);

        // PERNAS (animadas)
        const legSwing = walkCycle;

        // Calça/Roupa inferior
        ctx.fillStyle = '#2c2c2c';

        if (player.direction === 'down' || player.direction === 'up') {
            // Perna esquerda
            ctx.fillRect(-5, 10, 4, 8 + legSwing);
            // Perna direita
            ctx.fillRect(1, 10, 4, 8 - legSwing);
        } else {
            // Vista lateral - pernas sobrepostas
            ctx.fillRect(-3, 10, 6, 8);
            ctx.fillRect(-2, 10 + legSwing, 4, 8);
        }

        // PÉS
        ctx.fillStyle = '#1a1a1a';
        if (player.direction === 'down' || player.direction === 'up') {
            ctx.fillRect(-5, 18 + legSwing, 4, 3);
            ctx.fillRect(1, 18 - legSwing, 4, 3);
        } else {
            ctx.fillRect(-3, 18, 6, 3);
        }

        ctx.restore();

        // Nome do jogador
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(player.nickname, centerX, player.y - 8);
        ctx.fillText(player.nickname, centerX, player.y - 8);

        // Balão de Chat
        if (player.message) {
            ctx.font = '12px Arial';
            const textWidth = ctx.measureText(player.message).width;
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 24;
            const bubbleX = centerX - bubbleWidth / 2;
            const bubbleY = player.y - 40;

            // Fundo do balão
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;

            // Desenhar retângulo arredondado
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
            ctx.fill();
            ctx.stroke();

            // Triângulo inferior (bico do balão)
            ctx.beginPath();
            ctx.moveTo(centerX, bubbleY + bubbleHeight);
            ctx.lineTo(centerX - 5, bubbleY + bubbleHeight + 5);
            ctx.lineTo(centerX + 5, bubbleY + bubbleHeight);
            ctx.fill();
            ctx.stroke();

            // Texto da mensagem
            ctx.fillStyle = '#000000';
            ctx.fillText(player.message, centerX, bubbleY + 16);
        }
    };

    // Carregar imagem de fundo e do dragão
    const dragonImage = useRef<HTMLImageElement | null>(null);
    const dragonFrame = useRef(0);
    const lastDragonFrameTime = useRef(0);
    const activeMission = useRef({
        active: false,
        startTime: 0,
        activationStartTime: 0, // Tempo iniciado sobre a flor
        introStartTime: 0,
        status: 'intro' as 'intro' | 'running' | 'moving_dragon' | 'won' | 'lost',
        flowerPos: { x: 386, y: 409, radius: 30 }, // Posição atualizada
        lightBeamOpacity: 0.3
    });
    const dragonPos = useRef({ x: 600, y: 100 }); // Inicia na direita

    const DRAGON_FRAME_COUNT = 3;
    const DRAGON_ANIMATION_SPEED = 200; // ms por frame

    useEffect(() => {
        const bgImg = new Image();
        bgImg.src = '/forest-background.jpg';
        bgImg.onload = () => {
            backgroundImage.current = bgImg;
        };

        const dragImg = new Image();
        dragImg.src = '/dragon.png';
        dragImg.onload = () => {
            dragonImage.current = dragImg;
        };

        // Iniciar missão ao entrar
        activeMission.current = {
            ...activeMission.current,
            active: true,
            introStartTime: Date.now(),
            status: 'intro'
        };
    }, []);

    const drawMissionElements = (ctx: CanvasRenderingContext2D) => {
        const { flowerPos, lightBeamOpacity, status, activationStartTime } = activeMission.current;

        // Feixe de Luz (Aparece apenas quando encontra e completa o tempo)
        if (status === 'moving_dragon' || status === 'won') {
            const pulse = Math.sin(Date.now() / 500) * 0.1 + 0.3;

            // Raio de luz vindo de cima com fade nas pontas
            const gradient = ctx.createLinearGradient(flowerPos.x, 0, flowerPos.x, flowerPos.y);
            gradient.addColorStop(0, `rgba(255, 255, 200, 0)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 200, ${pulse * 0.8})`); // Brilho suave no meio
            gradient.addColorStop(1, `rgba(255, 255, 200, 0)`); // Invisível no chão para suavidade

            ctx.save();
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(flowerPos.x - 40, 0); // Topo largo
            ctx.lineTo(flowerPos.x + 40, 0);
            ctx.lineTo(flowerPos.x + 20, flowerPos.y); // Base estreita
            ctx.lineTo(flowerPos.x - 20, flowerPos.y);
            ctx.fill();
            ctx.restore();
        }
    };

    const drawDragon = (ctx: CanvasRenderingContext2D) => {
        if (!dragonImage.current || !dragonImage.current.complete) return;

        const now = Date.now();
        if (now - lastDragonFrameTime.current > DRAGON_ANIMATION_SPEED) {
            dragonFrame.current = (dragonFrame.current + 1) % DRAGON_FRAME_COUNT;
            lastDragonFrameTime.current = now;
        }

        const frameWidth = dragonImage.current.width / DRAGON_FRAME_COUNT;
        const frameHeight = dragonImage.current.height;

        // Posição atual do dragão
        const { x: dragonX, y: dragonY } = dragonPos.current;

        // Sombra do dragão (oval grande no chão)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(dragonX + frameWidth / 2, dragonY + frameHeight + 100, 40, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sprite do Dragão (Invertido se voando para a esquerda)
        ctx.save();
        ctx.drawImage(
            dragonImage.current,
            dragonFrame.current * frameWidth, 0, frameWidth, frameHeight, // Source
            dragonX, dragonY, frameWidth, frameHeight // Destination
        );
        ctx.restore();

        // Balão de Diálogo (Intro)
        if (activeMission.current.status === 'intro') {
            const text = "A luz revela o que os olhos não veem... Procure o ponto cego.";
            ctx.font = 'bold 13px Arial';
            const maxWidth = 200; // Aumentado para melhor acomodação
            const padding = 15;
            const lineHeight = 18;

            // Quebra de linha manual
            const words = text.split(' ');
            let line = '';
            const lines: string[] = [];

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            const bubbleWidth = maxWidth + padding * 2;
            const bubbleHeight = (lines.length * lineHeight) + padding * 2;

            const bubbleX = dragonX + frameWidth / 2;
            const bubbleY = dragonY - 30; // Mais para cima

            // Fundo do balão
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Centralizar o balão em relação ao dragão
            const rectX = bubbleX - bubbleWidth / 2;
            const rectY = bubbleY - bubbleHeight;

            ctx.roundRect(rectX, rectY, bubbleWidth, bubbleHeight, 12);
            ctx.fill();
            ctx.stroke();

            // Triângulo (bico)
            ctx.beginPath();
            ctx.moveTo(bubbleX, rectY + bubbleHeight);
            ctx.lineTo(bubbleX - 6, rectY + bubbleHeight + 8);
            ctx.lineTo(bubbleX + 6, rectY + bubbleHeight);
            ctx.fill();
            ctx.stroke();

            // Texto
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Desenhar cada linha
            lines.forEach((l, i) => {
                ctx.fillText(l.trim(), bubbleX, rectY + padding + (i * lineHeight) + lineHeight / 2 - 2);
            });

            // Reset
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';
        }
    };

    const gameLoop = () => {
        updatePlayerPosition();

        // Lógica da Missão
        const mission = activeMission.current;

        // FASE 1: Introdução
        if (mission.status === 'intro') {
            if (Date.now() - mission.introStartTime > 10000) { // 10 segundos de fala
                mission.status = 'running';
                mission.startTime = Date.now(); // Começa o timer da missão
            }
        }
        // FASE 2: Procurando
        else if (mission.status === 'running') {
            const elapsed = Date.now() - mission.startTime;
            if (elapsed > 30000) {
                mission.status = 'lost';
            }

            if (currentPlayer) {
                const dx = (currentPlayer.x + PLAYER_SIZE / 2) - mission.flowerPos.x;
                const dy = (currentPlayer.y + PLAYER_SIZE / 2) - mission.flowerPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mission.flowerPos.radius) {
                    if (mission.activationStartTime === 0) {
                        mission.activationStartTime = Date.now();
                    } else {
                        const timeOnFlower = Date.now() - mission.activationStartTime;
                        if (timeOnFlower > 2000) {
                            mission.status = 'moving_dragon';
                        }
                    }
                } else {
                    mission.activationStartTime = 0;
                }
            }
        }
        // FASE 3: Dragão se Movendo (Ficar parado!)
        else if (mission.status === 'moving_dragon') {
            // Verificar se jogador saiu da posição
            let playerOnSpot = false;
            if (currentPlayer) {
                const dx = (currentPlayer.x + PLAYER_SIZE / 2) - mission.flowerPos.x;
                const dy = (currentPlayer.y + PLAYER_SIZE / 2) - mission.flowerPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mission.flowerPos.radius) {
                    playerOnSpot = true;
                }
            }

            if (!playerOnSpot) {
                // RESETA MISSÃO SE SAIR
                mission.status = 'running';
                mission.activationStartTime = 0;
                dragonPos.current = { x: 600, y: 100 }; // Dragão volta
            } else {
                // Mover Dragão
                if (dragonPos.current.x > 100) {
                    dragonPos.current.x -= 2;
                } else {
                    mission.status = 'won';
                }
            }
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limpar e desenhar
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawForest(ctx);
        drawMissionElements(ctx); // Desenha luz (apenas se moving/won)

        // Desenhar todos os jogadores (no chão)
        players.forEach(player => {
            drawPlayer(ctx, player);
        });

        // Desenhar dragão por cima (voando) e balão
        drawDragon(ctx);

        // UI da Missão
        if (mission.status === 'running' || mission.status === 'moving_dragon') {
            const elapsed = Date.now() - mission.startTime;
            const timeLeft = Math.max(0, 30 - elapsed / 1000).toFixed(1);

            // Resetar alinhamento de texto para garantir que desenhe a partir da esquerda
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';

            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`⏳ ${timeLeft}s`, 20, 30);

            if (mission.status === 'moving_dragon') {
                ctx.fillStyle = '#FFFF00';
                ctx.fillText(`NÃO SE MOVA!`, 20, 55);
            } else {
                ctx.fillText(`Encontre o segredo...`, 20, 55);
            }
        } else if (mission.status === 'won') {
            // Overlay Escuro
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Painel de Vitória
            const panelW = 420;
            const panelH = 220;
            const panelX = (CANVAS_WIDTH - panelW) / 2;
            const panelY = (CANVAS_HEIGHT - panelH) / 2;

            // Fundo do Painel com Gradiente
            const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
            gradient.addColorStop(0, '#3b0764'); // Purple 950
            gradient.addColorStop(1, '#1e1b4b'); // Slate 950

            ctx.save();
            ctx.shadowColor = 'rgba(251, 191, 36, 0.5)'; // Glow Dourado
            ctx.shadowBlur = 20;
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#fbbf24'; // Amber 400
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.roundRect(panelX, panelY, panelW, panelH, 15);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Ícone/Emoji Topo
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("🏆", CANVAS_WIDTH / 2, panelY + 50);

            // Título Épico
            ctx.font = '900 36px Arial';
            ctx.fillStyle = '#fbbf24'; // Dourado
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText("MISSÃO CUMPRIDA!", CANVAS_WIDTH / 2, panelY + 100);
            ctx.shadowBlur = 0; // Reset shadow

            // Texto Descritivo
            ctx.font = '16px Arial';
            ctx.fillStyle = '#cbd5e1'; // Slate 300
            ctx.fillText("O Dragão aceitou sua presença no reino.", CANVAS_WIDTH / 2, panelY + 140);

            // Recompensa
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#4ade80'; // Green 400
            ctx.fillText("✨ Recompensa: Segredo Desbloqueado", CANVAS_WIDTH / 2, panelY + 180);

            ctx.textAlign = 'start';
        } else if (mission.status === 'lost') {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 30px Arial';
            ctx.fillText(`❌ TEMPO ESGOTADO`, CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2);
        }


        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        if (players.length > 0) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            // Reiniciar loop se necessário
            if (!animationFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
            }

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = undefined; // Limpar ref ao desmontar
                }
            };
        }
    }, [players]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-2 overflow-hidden bg-slate-950">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="bg-slate-900 border border-green-500/30 rounded-xl p-2 md:p-4 shadow-2xl shadow-green-900/20 max-h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <h3 className="font-bold text-green-400 flex items-center gap-2">
                            🌲 Floresta Mística
                            <span className="text-xs text-slate-500 font-normal hidden md:inline">• Use WASD ou Setas</span>
                        </h3>
                        <div className="text-xs text-slate-400">
                            {players.length} {players.length === 1 ? 'viajante' : 'viajantes'}
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border-2 border-slate-700 bg-black max-h-[70vh] aspect-[4/3]">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Mobile Controls */}
                    <div className="mt-4 grid grid-cols-3 gap-2 md:hidden w-full max-w-[200px] mx-auto">
                        <div></div>
                        <button className="bg-slate-800/50 p-3 rounded-lg active:bg-slate-700 border border-slate-700" onTouchStart={(e) => { e.preventDefault(); keysPressed.current.add('w'); }} onTouchEnd={(e) => { e.preventDefault(); keysPressed.current.delete('w'); }}>⬆️</button>
                        <div></div>
                        <button className="bg-slate-800/50 p-3 rounded-lg active:bg-slate-700 border border-slate-700" onTouchStart={(e) => { e.preventDefault(); keysPressed.current.add('a'); }} onTouchEnd={(e) => { e.preventDefault(); keysPressed.current.delete('a'); }}>⬅️</button>
                        <button className="bg-slate-800/50 p-3 rounded-lg active:bg-slate-700 border border-slate-700" onTouchStart={(e) => { e.preventDefault(); keysPressed.current.add('s'); }} onTouchEnd={(e) => { e.preventDefault(); keysPressed.current.delete('s'); }}>⬇️</button>
                        <button className="bg-slate-800/50 p-3 rounded-lg active:bg-slate-700 border border-slate-700" onTouchStart={(e) => { e.preventDefault(); keysPressed.current.add('d'); }} onTouchEnd={(e) => { e.preventDefault(); keysPressed.current.delete('d'); }}>➡️</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForestBattle;
