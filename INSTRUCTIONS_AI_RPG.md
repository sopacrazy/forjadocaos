# Configuração do Modo RPG com IA

Você implementou um sistema de batalha e narrativa impulsionado por IA!

## 1. Configurar Chave da API

Para que a "Mestre (IA)" funcione, você precisa adicionar sua chave da OpenAI no arquivo `.env.local`.

1. Abra o arquivo `.env.local` na raiz do projeto.
2. Adicione a seguinte linha:

```env
VITE_OPENAI_API_KEY=sk-sua-chave-aqui
```

3. Salve o arquivo.
4. Reinicie o servidor de desenvolvimento (`Ctrl+C` e depois `npm run dev`) para carregar a nova chave.

## 2. Funcionalidades Adicionadas

### Arena de Batalha (PvP com IA)
- A IA controla o inimigo de forma inteligente.
- Ela descreve as ações do inimigo e suas falas.
- O sistema rola dados automaticamente (e.g., Ataque: 1d20+10).

### Modo História
- Clique no botão "Ir para História" no topo da Arena de Batalha.
- A IA assume o papel de Mestre (Dungeon Master).
- Ela descreve o cenário, NPCs e reage a qualquer coisa que você fizer, não apenas combate.

## 3. Como Jogar
1. Abra o menu "Batalhas".
2. Entre na "Arena de Batalha".
3. Digite sua ação (o que você faz) e sua fala (o que você diz).
4. A IA responderá narrando o resultado e agindo como o inimigo ou mestre.
