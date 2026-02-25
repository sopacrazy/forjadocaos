// Importing React to fix the "Cannot find namespace 'React'" error on line 6
import React from 'react';

export interface Rank {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface Mythology {
  name: string;
  description: string;
  image: string;
}