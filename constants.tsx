
import React from 'react';
import { Sword, Shield, Flame, Crown, Star, Zap, Eye } from 'lucide-react';
import { Rank, Mythology } from './types';

export const RANKS: Rank[] = [
  {
    id: 'E',
    name: 'Novato',
    description: 'A jornada começa aqui. Aqueles que ainda estão moldando sua essência.',
    icon: <Sword className="w-8 h-8" />,
    color: 'text-gray-400'
  },
  {
    id: 'D',
    name: 'Aprendiz',
    description: 'Já dominam o básico de sua linhagem e buscam o primeiro despertar.',
    icon: <Shield className="w-8 h-8" />,
    color: 'text-green-400'
  },
  {
    id: 'C',
    name: 'Guerreiro',
    description: 'Soldados testados no fogo do caos, prontos para missões perigosas.',
    icon: <Flame className="w-8 h-8" />,
    color: 'text-blue-400'
  },
  {
    id: 'B',
    name: 'Mestre',
    description: 'Líderes natos que compreendem as nuances do equilíbrio místico.',
    icon: <Crown className="w-8 h-8" />,
    color: 'text-purple-400'
  },
  {
    id: 'A',
    name: 'Lenda',
    description: 'Nomes sussurrados em tavernas. O poder que desafia a realidade.',
    icon: <Star className="w-8 h-8" />,
    color: 'text-yellow-400'
  },
  {
    id: 'S',
    name: 'Semideus',
    description: 'A barreira entre o mortal e o divino torna-se quase inexistente.',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-orange-400'
  },
  {
    id: 'SS',
    name: 'Avatar',
    description: 'A manifestação pura da Forja. O topo absoluto da existência.',
    icon: <Eye className="w-8 h-8" />,
    color: 'text-red-500'
  }
];

export const MYTHOLOGIES: Mythology[] = [
  {
    name: 'Grega',
    description: 'Filhos de Zeus, guerreiros de Esparta e sabedoria de Atenas.',
    image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Nórdica',
    description: 'A fúria de Thor e a magia rúnica de Odin diretamente de Midgard.',
    image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Egípcia',
    description: 'O poder solar de Ra e os segredos imortais de Anúbis.',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800'
  }
];

export const WHATSAPP_LINK = "https://wa.me/559999999999?text=Ol%C3%A1!%20Desejo%20me%20matricular%20na%20Academia%20do%20Equil%C3%ADbrio%20e%20forjar%20meu%20destino.";
