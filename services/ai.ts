import OpenAI from 'openai';

// Initialize OpenAI client
// Note: dangerouslyAllowBrowser is true because we are running this client-side in Vite.
// specific for this user's prototyping needs. In production, this should be a backend call.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true 
});

export interface AIPayload {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  mode: 'combat' | 'story' | 'combat_intro';
  context: {
    playerName: string;
    enemyName?: string;
    scenario?: string;
  };
}

const SYSTEM_PROMPTS = {
  combat: (context: any) => `
Você é um Mestre de RPG (Dungeon Master) avançado controlando um inimigo em um combate de RPG de Mesa.
Seu personagem é: ${context.enemyName || 'O Inimigo'}.
O jogador é: ${context.playerName || 'O Herói'}.
Cenário: ${context.scenario || 'Uma floresta escura'}.

Seu Papel:
1. Aja como o inimigo. Reaja à última ação do jogador.
2. Seja dramático, estratégico e ameaçador (ou o que combinar com o inimigo).
3. Descreva suas ações em *itálico*.
4. Escreva suas falas (diálogo) em **negrito**.
5. IMPORTANTE: Responda SEMPRE em PORTUGUÊS (Brasil).
6. Você DEVE incluir a mecânica de combate no final do seu turno se você atacar, neste formato exato (sem traduzir os campos de mecânica, apenas os valores se necessário):
   [MECHANICS]
   Attack: 1d20+5
   Damage: 2d6+3 Fire
   Difficulty: 15
   [/MECHANICS]

Mantenha sua resposta envolvente mas concisa (menos de 150 palavras).
Se o jogador tentar fazer algo impossível, narre a falha.
`,
  story: (context: any) => `
Você é um Mestre de RPG (Narrador) avançado para um RPG de Mesa de fantasia sombria.
O jogador é: ${context.playerName || 'O Herói'}.
Cena Atual: ${context.scenario || 'Um local misterioso'}.

Seu Papel:
1. Narre a história, o ambiente e as reações dos NPCs.
2. Apresente desafios, escolhas e mistérios.
3. Se o combate começar, mude perfeitamente para descrever a ação.
4. Descreva o mundo em *itálico* para atmosfera, texto normal para narração.
5. Diálogo de NPC deve ser em **negrito**.
6. IMPORTANTE: Responda SEMPRE em PORTUGUÊS (Brasil).

Mantenha a história andando. Pergunte "O que você faz?" ou apresente uma situação clara no final.
`,
  combat_intro: (context: any) => `
Você é um Narrador de RPG de elite descrevendo o início de um confronto épico.
O cenário é: ${context.scenario || 'Uma arena antiga'}.
O herói (jogador) é: ${context.playerName}.
O inimigo (adversário) é: ${context.enemyName}.

Sua tarefa única:
1. Descreva a entrada dramática do inimigo ou o momento em que o confronto se torna inevitável.
2. Descreva o ambiente e a tensão no ar.
3. Termine com o inimigo fazendo uma provocação ou preparando sua arma.
4. NÃO faça ataques mecânicos ainda (sem rolar dados). Apenas prepare o palco.
5. Responda em PORTUGUÊS (Brasil).
6. Use *itálico* para narração e **negrito** para a fala do inimigo.

Mantenha curto (max 100 palavras) e impactante.
`
};

export const generateAIResponse = async (payload: AIPayload) => {
  if (!apiKey) {
    console.warn("OpenAI API Key is missing. Please check your .env file.");
    return {
      content: `**[SYSTEM]**: OpenAI API Key is missing. Please add VITE_OPENAI_API_KEY to your .env file to enable the AI.\n\n_The enemy stands frozen in time, waiting for the developer to pay the cosmic bill._`,
      mechanics: null
    };
  }

  const systemPrompt = SYSTEM_PROMPTS[payload.mode](payload.context);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and capable for RPG
      messages: [
        { role: "system", content: systemPrompt },
        ...payload.messages
      ],
      temperature: 0.8, // Slightly creative
      max_tokens: 300,
    });

    const fullContent = response.choices[0].message.content || "";
    
    // Parse mechanics if present
    const mechanicsMatch = fullContent.match(/\[MECHANICS\]([\s\S]*?)\[\/MECHANICS\]/);
    let mechanics = null;
    let content = fullContent;

    if (mechanicsMatch) {
      const mechanicsText = mechanicsMatch[1];
      content = fullContent.replace(mechanicsMatch[0], '').trim();
      
      // improved parsing
      const attackMatch = mechanicsText.match(/Attack:\s*(.*)/i);
      const damageMatch = mechanicsText.match(/Damage:\s*(.*)/i);
      const diffMatch = mechanicsText.match(/Difficulty:\s*(\d+)/i);

      mechanics = {
        attack: attackMatch ? attackMatch[1].trim() : undefined,
        damage: damageMatch ? damageMatch[1].trim() : undefined,
        difficulty: diffMatch ? parseInt(diffMatch[1]) : 10
      };
    }

    return {
      content,
      mechanics
    };

  } catch (error) {
    console.error("AI Error:", error);
    return {
      content: `**[SYSTEM ERROR]**: The arcane connection has been severed (API Error). \n\n${(error as any).message}`,
      mechanics: null
    };
  }
};
