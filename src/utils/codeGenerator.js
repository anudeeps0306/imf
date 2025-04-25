import { v4 as uuidv4 } from "uuid";

// Generate a random codename for gadgets
export const generateCodename = () => {
  const prefixes = ["The", "Operation", "Project", "Agent", "Mission"];
  const names = [
    "Nightingale",
    "Kraken",
    "Phoenix",
    "Shadow",
    "Specter",
    "Ghost",
    "Phantom",
    "Raven",
    "Falcon",
    "Cobra",
    "Viper",
    "Eagle",
    "Wolf",
    "Jaguar",
    "Panther",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const name = names[Math.floor(Math.random() * names.length)];

  return `${prefix} ${name}`;
};

// Generate a mission success probability (0-100%)
export const generateSuccessProbability = () => {
  return Math.floor(Math.random() * 101);
};

// Generate a self-destruct confirmation code
export const generateSelfDestructCode = () => {
  // Create a 6-character alphanumeric code
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};
