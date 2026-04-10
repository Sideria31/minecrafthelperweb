import * as nbt from 'prismarine-nbt';
import pako from 'pako';

// Fonction pour extraire la valeur réelle peu importe le type NBT
const getValue = (tag) => {
  if (tag === undefined || tag === null) return tag;
  if (typeof tag === 'object' && 'value' in tag) return getValue(tag.value);
  return tag;
};

export const parseNbtToMaterials = async (arrayBuffer) => {
  let data = new Uint8Array(arrayBuffer);

  // 1. Décompression si Gzip
  if (data[0] === 0x1f && data[1] === 0x8b) {
    data = pako.ungzip(data);
  }

  // 2. Parsing (utilise le Buffer global configuré dans main.jsx)
  const { parsed } = await nbt.parse(Buffer.from(data));
  
  // 3. Extraction selon la structure "Create" identifiée
  const root = getValue(parsed);
  const palette = getValue(root.palette) || [];
  const blocks = getValue(root.blocks) || [];

  const counts = {};

  blocks.forEach((block) => {
    const b = getValue(block);
    const stateIndex = getValue(b.state);
    const paletteEntry = getValue(palette[stateIndex]);

    if (paletteEntry) {
      const rawName = getValue(paletteEntry.Name) || "Unknown";
      // Transformation : "minecraft:stone" -> "Stone"
      const cleanName = String(rawName).split(':').pop().replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      counts[cleanName] = (counts[cleanName] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([name, total], index) => ({
      id: `nbt-${name}-${index}`, // Génère un ID unique
      name: name,
      total: total,
      done: false // État initial indispensable pour la checkbox
    }))
    .sort((a, b) => b.total - a.total);
};

export const parseTxtToMaterials = (content) => {
  const lines = content.split('\n');
  const results = [];
  lines.forEach((line, index) => { // Ajoute l'index ici
    if (line.includes('|') && !line.includes('Item') && !line.includes('---')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        results.push({
          id: `txt-${parts[1]}-${index}`, // ID unique
          name: parts[1],
          total: parseInt(parts[2]),
          done: false // État initial
        });
      }
    }
  });
  return results.sort((a, b) => b.total - a.total);
};