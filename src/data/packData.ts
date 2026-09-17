import { BlockData, PackMetadata, AddonFeature } from '../types';

export const PACK_METADATA: PackMetadata = {
  name: "slm_visual_pack-real (HDR & Eau Transparente)",
  version: "1.0.0",
  headerUUID: "299866ba-0319-471f-97f7-e251b5ada2a5",
  moduleUUID: "88a00b80-d44d-4bca-a92a-00fda99513b6",
  minEngineVersion: "[1, 20, 0]",
  targetPlatform: "Minecraft Bedrock Edition (Android / iOS / Windows)",
  fileCount: 178,
  packSizeKB: 4850
};

export const BLOCKS_DATA: BlockData[] = [
  {
    id: 'grass_block',
    name: 'Bloc d\'Herbe Photoréaliste (Grass Block)',
    category: 'blocks',
    description: 'Tapis dense de 1600 brins d\'herbe individuels effilés et trèfles botaniques, surplombant un terreau fertile sombre avec racines organiques descendantes.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/grass_block_top.png',
      top: '/realism_pack/textures/blocks/grass_block_top.png',
      side: '/realism_pack/textures/blocks/grass_block_side.png',
      bottom: '/realism_pack/textures/blocks/dirt.png',
      normal: '/realism_pack/textures/blocks/grass_top_normal.png',
      mer: '/realism_pack/textures/blocks/grass_top_mer.png'
    }
  },
  {
    id: 'dirt',
    name: 'Terre Meuble Friable Photoréaliste (Dirt)',
    category: 'blocks',
    description: 'Terreau organique friable non compacté: mottes cellulaires 3D, cailloux et graviers minéraux en saillie, veinules de racines et micro-relief accentué.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/dirt.png',
      normal: '/realism_pack/textures/blocks/dirt_normal.png',
      mer: '/realism_pack/textures/blocks/dirt_mer.png'
    }
  },
  {
    id: 'stone',
    name: 'Roche Naturelle (Stone)',
    category: 'blocks',
    description: 'Structure cristalline et ardoisée, micro-fissures organiques non répétitives et inclusions minérales de quartz.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/stone.png',
      normal: '/realism_pack/textures/blocks/stone_normal.png',
      mer: '/realism_pack/textures/blocks/stone_mer.png'
    }
  },
  {
    id: 'cobblestone',
    name: 'Pierre Taillée (Cobblestone)',
    category: 'blocks',
    description: 'Enchevêtrement de pierres arrondies scellées dans un mortier granuleux avec relief 3D accentué.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/cobblestone.png',
      normal: '/realism_pack/textures/blocks/cobblestone_normal.png',
      mer: '/realism_pack/textures/blocks/cobblestone_mer.png'
    }
  },
  {
    id: 'sand',
    name: 'Sable Fin (Sand)',
    category: 'blocks',
    description: 'Grains de silice calibrés, micro-ondulations de dunes et teinte chaude Golden Hour.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/sand.png',
      normal: '/realism_pack/textures/blocks/sand_normal.png',
      mer: '/realism_pack/textures/blocks/sand_mer.png'
    }
  },
  {
    id: 'log_oak',
    name: 'Bûche de Chêne (Oak Log)',
    category: 'blocks',
    description: 'Écorce fibreuse verticale avec sillons profonds, lichen discret, et cernes de croissance concentriques sur la section.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/log_oak.png',
      side: '/realism_pack/textures/blocks/log_oak.png',
      top: '/realism_pack/textures/blocks/log_oak_top.png',
      bottom: '/realism_pack/textures/blocks/log_oak_top.png',
      normal: '/realism_pack/textures/blocks/log_oak_normal.png',
      mer: '/realism_pack/textures/blocks/log_oak_mer.png'
    }
  },
  {
    id: 'planks_oak',
    name: 'Planches de Chêne (Oak Planks)',
    category: 'blocks',
    description: 'Lattes de bois aux veinures horizontales, joints biseautés réalistes et têtes de clous forgés discrètes.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/planks_oak.png',
      normal: '/realism_pack/textures/blocks/planks_oak_normal.png',
      mer: '/realism_pack/textures/blocks/planks_oak_mer.png'
    }
  },
  {
    id: 'leaves_oak',
    name: 'Feuillage de Chêne (Oak Leaves)',
    category: 'blocks',
    description: 'Foliage dense et volumineux avec découpes transparentes organiques, sans effet aplati de photo plaquée.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/blocks/leaves_oak.png',
      normal: '/realism_pack/textures/blocks/leaves_oak_normal.png'
    }
  },
  {
    id: 'glass',
    name: 'Verre Architectural (Glass)',
    category: 'blocks',
    description: 'Bordures fines biseautées, cœur ultra-transparent sans zébrures grossières vanilla, surface hautement réfléchissante.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/glass.png',
      normal: '/realism_pack/textures/blocks/glass_normal.png',
      mer: '/realism_pack/textures/blocks/glass_mer.png'
    }
  },
  {
    id: 'brick',
    name: 'Briques de Terre Cuite (Bricks)',
    category: 'blocks',
    description: 'Briques cuites aux nuances chaleureuses, joints de ciment réguliers et texture poreuse naturelle.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/brick.png',
      normal: '/realism_pack/textures/blocks/brick_normal.png',
      mer: '/realism_pack/textures/blocks/brick_mer.png'
    }
  },
  {
    id: 'deepslate',
    name: 'Ardoise Profonde (Deepslate)',
    category: 'blocks',
    description: 'Roche métamorphique sombre aux strates cisaillées, reflets ardoisés profonds pour les cavernes abyssales.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/blocks/deepslate.png',
      normal: '/realism_pack/textures/blocks/deepslate_normal.png'
    }
  },
  {
    id: 'gravel',
    name: 'Gravier Minéral (Gravel)',
    category: 'blocks',
    description: 'Lit de galets fluviatiles et grains concassés aux multiples teintes de grès et d\'ardoise.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: false,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/gravel.png',
      normal: '/realism_pack/textures/blocks/gravel_normal.png'
    }
  },
  {
    id: 'iron_ore',
    name: 'Minerai de Fer (Iron Ore)',
    category: 'blocks',
    description: 'Roche hôte d\'ardoise naturelle avec nodules d\'hématite et de fer brut incrustés. PBR: roche diélectrique mate et filons métalliques réfléchissants.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/iron_ore.png',
      normal: '/realism_pack/textures/blocks/iron_ore_normal.png',
      mer: '/realism_pack/textures/blocks/iron_ore_mer.png'
    }
  },
  {
    id: 'water',
    name: 'Eau Photoréaliste Bleu Clair Transparente (slm_visual_pack-real)',
    category: 'blocks',
    description: 'Animation cyclique 32 images (128×4096 flipbook) en bleu clair limpide à opacité réduite pour voir le fond marin en transparence parfaite, avec caustiques PBR et reflets spéculaires.',
    resolution: '128×128 (32 frames animées)',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/water_still_single.png',
      normal: '/realism_pack/textures/blocks/water_normal.png',
      mer: '/realism_pack/textures/blocks/water_mer.png'
    }
  },
  {
    id: 'diamond_ore',
    name: 'Minerai de Diamant (Diamond Ore)',
    category: 'blocks',
    description: 'Cristaux de diamant cyan étincelants incrustés dans la roche. PBR: facettes réfractives hautement brillantes avec émission subtile.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/diamond_ore.png',
      normal: '/realism_pack/textures/blocks/diamond_ore_normal.png',
      mer: '/realism_pack/textures/blocks/diamond_ore_mer.png'
    }
  },
  {
    id: 'gold_ore',
    name: 'Minerai d\'Or (Gold Ore)',
    category: 'blocks',
    description: 'Pépites et veines d\'or natif chatoyantes à la teinte nostalgique. PBR: réflectance métallique native dorée.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/gold_ore.png',
      normal: '/realism_pack/textures/blocks/gold_ore_normal.png',
      mer: '/realism_pack/textures/blocks/gold_ore_mer.png'
    }
  },
  {
    id: 'coal_ore',
    name: 'Minerai de Charbon (Coal Ore)',
    category: 'blocks',
    description: 'Nodules d\'anthracite noir lustré incrustés dans la pierre naturelle avec strates de sédimentation.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/coal_ore.png',
      normal: '/realism_pack/textures/blocks/coal_ore_normal.png',
      mer: '/realism_pack/textures/blocks/coal_ore_mer.png'
    }
  },
  {
    id: 'emerald_ore',
    name: 'Minerai d\'Émeraude (Emerald Ore)',
    category: 'blocks',
    description: 'Prismes d\'émeraude vert jade translucide aux arêtes géométriques nettes et facettes miroitantes.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/emerald_ore.png',
      normal: '/realism_pack/textures/blocks/emerald_ore_normal.png',
      mer: '/realism_pack/textures/blocks/emerald_ore_mer.png'
    }
  },
  {
    id: 'redstone_ore',
    name: 'Minerai de Redstone (Redstone Ore)',
    category: 'blocks',
    description: 'Poussière de cristal rouge rubis hautement réactive avec canal émissif actif pour brillance dans l\'obscurité.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/redstone_ore.png',
      normal: '/realism_pack/textures/blocks/redstone_ore_normal.png',
      mer: '/realism_pack/textures/blocks/redstone_ore_mer.png'
    }
  },
  {
    id: 'lapis_ore',
    name: 'Minerai de Lapis-Lazuli (Lapis Ore)',
    category: 'blocks',
    description: 'Gisements bleu outremer profond marbrés d\'inclusions dorées de pyrite authentiques.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/lapis_ore.png',
      normal: '/realism_pack/textures/blocks/lapis_ore_normal.png',
      mer: '/realism_pack/textures/blocks/lapis_ore_mer.png'
    }
  },
  {
    id: 'copper_ore',
    name: 'Minerai de Cuivre (Copper Ore)',
    category: 'blocks',
    description: 'Veines de cuivre brut métallique orangé parsemées de fines traces d\'oxydation vert-de-gris.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/copper_ore.png',
      normal: '/realism_pack/textures/blocks/copper_ore_normal.png',
      mer: '/realism_pack/textures/blocks/copper_ore_mer.png'
    }
  },
  {
    id: 'cobblestone_mossy',
    name: 'Pierre Moussue (Mossy Cobblestone)',
    category: 'blocks',
    description: 'Cobblestone ancestral envahi de mousse et lichens végétaux vibrants pour donjons et ruines.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/cobblestone_mossy.png',
      normal: '/realism_pack/textures/blocks/cobblestone_mossy_normal.png',
      mer: '/realism_pack/textures/blocks/cobblestone_mossy_mer.png'
    }
  },
  {
    id: 'log_birch',
    name: 'Bûche de Bouleau (Birch Log)',
    category: 'blocks',
    description: 'Écorce blanche satinée aux lenticelles et crevasses sombres caractéristiques avec cœur clair.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/log_birch.png',
      side: '/realism_pack/textures/blocks/log_birch.png',
      top: '/realism_pack/textures/blocks/log_birch_top.png',
      normal: '/realism_pack/textures/blocks/log_birch_normal.png',
      mer: '/realism_pack/textures/blocks/log_birch_mer.png'
    }
  },
  {
    id: 'planks_birch',
    name: 'Planches de Bouleau (Birch Planks)',
    category: 'blocks',
    description: 'Lames de bois clair nordique blond avec rainures douces et grain régulier haute définition.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/planks_birch.png',
      normal: '/realism_pack/textures/blocks/planks_birch_normal.png',
      mer: '/realism_pack/textures/blocks/planks_birch_mer.png'
    }
  },
  {
    id: 'log_spruce',
    name: 'Bûche de Sapin (Spruce Log)',
    category: 'blocks',
    description: 'Écorce sombre résineuse des taïgas boréales avec reliefs profonds et mousse alpine.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/log_spruce.png',
      side: '/realism_pack/textures/blocks/log_spruce.png',
      top: '/realism_pack/textures/blocks/log_spruce_top.png',
      normal: '/realism_pack/textures/blocks/log_spruce_normal.png',
      mer: '/realism_pack/textures/blocks/log_spruce_mer.png'
    }
  },
  {
    id: 'planks_spruce',
    name: 'Planches de Sapin (Spruce Planks)',
    category: 'blocks',
    description: 'Planches de chalet brun chocolat chaud avec texture de bois noble et biseaux nets.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/planks_spruce.png',
      normal: '/realism_pack/textures/blocks/planks_spruce_normal.png',
      mer: '/realism_pack/textures/blocks/planks_spruce_mer.png'
    }
  },
  {
    id: 'crafting_table',
    name: 'Table d\'Artisanat (Crafting Table)',
    category: 'blocks',
    description: 'Atelier de menuisier avec grille 3x3 de travail sur le dessus et outils suspendus détaillés sur les côtés.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/crafting_table_top.png',
      top: '/realism_pack/textures/blocks/crafting_table_top.png',
      side: '/realism_pack/textures/blocks/crafting_table_side.png',
      normal: '/realism_pack/textures/blocks/crafting_table_top_normal.png',
      mer: '/realism_pack/textures/blocks/crafting_table_top_mer.png'
    }
  },
  {
    id: 'bookshelf',
    name: 'Bibliothèque (Bookshelf)',
    category: 'blocks',
    description: 'Rayonnages en chêne sculpté garnis de grimoires reliés en cuir de couleurs variées avec signets dorés.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/bookshelf.png',
      normal: '/realism_pack/textures/blocks/bookshelf_normal.png',
      mer: '/realism_pack/textures/blocks/bookshelf_mer.png'
    }
  },
  {
    id: 'tnt',
    name: 'Bloc de TNT (TNT)',
    category: 'blocks',
    description: 'Bâtons d\'explosifs ficelés dans une sangle blanche siglée TNT en relief avec amorces.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/tnt_side.png',
      side: '/realism_pack/textures/blocks/tnt_side.png',
      top: '/realism_pack/textures/blocks/tnt_top.png',
      bottom: '/realism_pack/textures/blocks/tnt_bottom.png',
      normal: '/realism_pack/textures/blocks/tnt_side_normal.png',
      mer: '/realism_pack/textures/blocks/tnt_side_mer.png'
    }
  },
  {
    id: 'netherrack',
    name: 'Roche du Nether (Netherrack)',
    category: 'blocks',
    description: 'Roche poreuse infernale rouge bordeaux avec veines de magma incandescentes et porosité organique.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/netherrack.png',
      normal: '/realism_pack/textures/blocks/netherrack_normal.png',
      mer: '/realism_pack/textures/blocks/netherrack_mer.png'
    }
  },
  {
    id: 'obsidian',
    name: 'Obsidienne Cristalline (Obsidian)',
    category: 'blocks',
    description: 'Verre volcanique ultra-dense noir violacé avec fractures conchoïdales et reflets spéculaires intenses.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/obsidian.png',
      normal: '/realism_pack/textures/blocks/obsidian_normal.png',
      mer: '/realism_pack/textures/blocks/obsidian_mer.png'
    }
  },
  {
    id: 'glowstone',
    name: 'Pierre Lumineuse (Glowstone)',
    category: 'blocks',
    description: 'Agrégat cristallin d\'ambre doré émettant une vive radiance chaude avec canal émissif PBR.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/glowstone.png',
      normal: '/realism_pack/textures/blocks/glowstone_normal.png',
      mer: '/realism_pack/textures/blocks/glowstone_mer.png'
    }
  },
  {
    id: 'sandstone',
    name: 'Grès Naturel (Sandstone)',
    category: 'blocks',
    description: 'Roche sédimentaire dorée du désert avec strates d\'érosion éolienne et surface douce.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/sandstone_normal.png',
      side: '/realism_pack/textures/blocks/sandstone_normal.png',
      top: '/realism_pack/textures/blocks/sandstone_top.png',
      bottom: '/realism_pack/textures/blocks/sandstone_bottom.png',
      normal: '/realism_pack/textures/blocks/sandstone_normal_normal.png',
      mer: '/realism_pack/textures/blocks/sandstone_normal_mer.png'
    }
  },
  {
    id: 'clay',
    name: 'Bloc d\'Argile (Clay)',
    category: 'blocks',
    description: 'Pâte minérale alluviale lisse gris-bleuté avec surface satinée et micro-grains fins.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/clay.png',
      normal: '/realism_pack/textures/blocks/clay_normal.png',
      mer: '/realism_pack/textures/blocks/clay_mer.png'
    }
  },
  {
    id: 'diamond_sword',
    name: 'Épée en Diamant (Diamond Sword)',
    category: 'items',
    description: 'Lame taillée dans le diamant pur aux reflets cyan cristallins, garde en acier et poignée en cuir texturé.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/diamond_sword.png'
    }
  },
  {
    id: 'iron_pickaxe',
    name: 'Pioche en Fer (Iron Pickaxe)',
    category: 'items',
    description: 'Tête en fer forgé avec biseau poli, manche en frêne renforcé par des lanières de cuir.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/iron_pickaxe.png'
    }
  },
  {
    id: 'apple',
    name: 'Pomme Rouge Organique (Apple)',
    category: 'items',
    description: 'Fruit rougeoyant gorgé de lumière avec tige en bois naturel et jeune feuille de verger.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/apple.png'
    }
  },
  {
    id: 'sun',
    name: 'Soleil Golden Hour (Sun)',
    category: 'environment',
    description: 'Astre éclatant nimbé d\'une couronne chaude dorée, conférant une ambiance crépusculaire cinématique.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/environment/sun.png'
    }
  },
  {
    id: 'dirt_path',
    name: 'Chemin de Terre Battu (Dirt Path)',
    category: 'blocks',
    description: 'Terre tassée couleur ocre clair avec graviers alluviaux incrustés, micro-poussière et ornières de roues subtiles.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/dirt_path_top.png',
      normal: '/realism_pack/textures/blocks/dirt_path_top_normal.png',
      mer: '/realism_pack/textures/blocks/dirt_path_top_mer.png'
    }
  },
  {
    id: 'concrete_black',
    name: 'Route Asphaltée Bitumée (Asphalt Road)',
    category: 'blocks',
    description: 'Enrobé bitumineux photoréaliste de haute qualité avec agrégats minéraux de quartz et marquage routier blanc continu.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/concrete_black.png',
      normal: '/realism_pack/textures/blocks/concrete_black_normal.png',
      mer: '/realism_pack/textures/blocks/concrete_black_mer.png'
    }
  },
  {
    id: 'stripped_oak_log',
    name: 'Charpente Poutre de Bois (Timber Beam)',
    category: 'blocks',
    description: 'Poutre massive en bois équarri pour charpentes de toit et ponts, avec veinures longitudinales et ferrure de renfort rivetée.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/stripped_oak_log.png',
      normal: '/realism_pack/textures/blocks/stripped_oak_log_normal.png',
      mer: '/realism_pack/textures/blocks/stripped_oak_log_mer.png'
    }
  },
  {
    id: 'smartphone',
    name: 'Smartphone Moderne OLED (Compass / Recovery)',
    category: 'items',
    description: 'Téléphone portable moderne avec châssis titane, écran OLED tactile haute résolution, perforations appareil photo et reflets de verre.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/compass_item.png'
    }
  },
  {
    id: 'paintbrush',
    name: 'Pinceau d\'Artiste (Brush / Feather)',
    category: 'items',
    description: 'Pinceau d\'atelier pour peinture avec manche en acajou verni, virole métallique polie et soies naturelles chargées de peinture bleue.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/brush.png'
    }
  },
  {
    id: 'clouds',
    name: 'Nuages Vaporeux Organiques (Clouds)',
    category: 'environment',
    description: 'Nuages cumulus doux et vaporeux aux bords estompés et non carrés, avec gradients d\'opacité progressive.',
    resolution: '256×256',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/environment/clouds.png'
    }
  },
  {
    id: 'crosshair',
    name: 'Réticule UI Épuré (Crosshair)',
    category: 'ui',
    description: 'Viseur minimaliste haute précision sans encombrer la vue joueur sur écran tactile Android.',
    resolution: '64×64',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/ui/cross_hair.png'
    }
  },
  {
    id: 'road_builder',
    name: 'Déployeur de Route Préfabriquée (Road Builder)',
    category: 'items',
    description: 'Outil de chantier routier holographique préfabriqué: permet d\'édifier instantanément de longues sections d\'asphalte avec marquages blancs de signalisation.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/road_builder.png'
    }
  },
  {
    id: 'bridge_spawner',
    name: 'Générateur de Pont Préfabriqué (Bridge Spawner)',
    category: 'items',
    description: 'Module d\'ingénierie civile pour déployer des ponts suspendus réalistes avec piliers de soutien, haubans en acier et tablier en bois équarri.',
    resolution: '128×128',
    hasNormal: false,
    hasMER: false,
    hasTextureSet: false,
    textures: {
      diffuse: '/realism_pack/textures/items/bridge_spawner.png'
    }
  },
  {
    id: 'slope_roof',
    name: 'Pente de Toiture Lisse 45° (Roof Slope)',
    category: 'blocks',
    description: 'Bloc géométrique non cubique brisant l\'aspect carré de Minecraft: pente continue inclinée à 45° avec texture de charpente en chêne équarri.',
    resolution: '128×128',
    hasNormal: true,
    hasMER: true,
    hasTextureSet: true,
    textures: {
      diffuse: '/realism_pack/textures/blocks/stripped_oak_log.png',
      normal: '/realism_pack/textures/blocks/stripped_oak_log_normal.png',
      mer: '/realism_pack/textures/blocks/stripped_oak_log_mer.png'
    }
  }
];

export const ADDON_FEATURES: AddonFeature[] = [
  {
    id: 'smartphone',
    name: 'Smartphone Moderne OLED',
    type: 'item',
    identifier: 'realism:smartphone',
    description: 'Véritable smartphone fonctionnel avec écran tactile OLED, indicateur GPS de coordonnées, balise sonore et torche intégrée.',
    recipe: '1 Lingot de fer + 1 Vitre + 2 Redstones',
    icon: '/realism_pack/textures/items/compass_item.png',
    specialEffect: 'Écran OLED haute résolution, vibration haptique et boussole intégrée'
  },
  {
    id: 'paintbrush',
    name: 'Pinceau d\'Artiste Peintre',
    type: 'item',
    identifier: 'realism:paintbrush',
    description: 'Outil de peinture pour appliquer des pigments, vernir le bois ou créer des toiles artistiques personnalisées.',
    recipe: '1 Plume + 1 Pépite de fer + 1 Bâton',
    icon: '/realism_pack/textures/items/brush.png',
    specialEffect: 'Capacité de peindre et modifier les textures des surfaces'
  },
  {
    id: 'road_builder',
    name: 'Kit Route Longue Préfabriquée',
    type: 'item',
    identifier: 'realism:road_builder',
    description: 'Déployeur d\'infrastructure routière préfabriquée pour créer des autoroutes modernes sans poser bloc par bloc.',
    recipe: '1 Bloc d\'asphalte + 8 Poudres de Redstone',
    icon: '/realism_pack/textures/items/road_builder.png',
    specialEffect: 'Génération instantanée de 16 blocs de route bitumée alignés'
  },
  {
    id: 'bridge_spawner',
    name: 'Kit Pont Suspendu Préfabriqué',
    type: 'item',
    identifier: 'realism:bridge_spawner',
    description: 'Module d\'érection de pont franchissant rivières, ravins et canyons avec tablier en charpente et câbles de suspension.',
    recipe: '3 Planches de chêne + 2 Lingots de fer + 4 Ficelles',
    icon: '/realism_pack/textures/items/bridge_spawner.png',
    specialEffect: 'Déploie une travée de pont solide avec garde-corps et piliers'
  },
  {
    id: 'slope_roof',
    name: 'Pente de Toiture Lisse (45°)',
    type: 'block',
    identifier: 'realism:slope_roof',
    description: 'Bloc géométrique à pan incliné brisant l\'aspect bloc cubique strict de Minecraft pour des toits et rampes photoréalistes.',
    recipe: '6 Planches de chêne en escalier dans l\'établi',
    icon: '/realism_pack/textures/blocks/stripped_oak_log.png',
    specialEffect: 'Collision continue et transition fluide sans marches cubiques'
  },
  {
    id: 'asphalt_road',
    name: 'Route Bitumée Haute Vitesse',
    type: 'block',
    identifier: 'realism:asphalt_road',
    description: 'Enrobé routier noir avec granulats de quartz et coefficient de friction réduit (0.15) pour courir plus vite.',
    recipe: '4 Graviers + 4 Pierres + 1 Charbon',
    icon: '/realism_pack/textures/blocks/concrete_black.png',
    specialEffect: 'Accélération naturelle du joueur en sprint (vitesse autoroute)'
  },
  {
    id: 'charpente_beam',
    name: 'Poutre de Charpente Rivetée',
    type: 'block',
    identifier: 'realism:charpente_beam',
    description: 'Poutre en chêne massif équarri avec ferrures métalliques rivetées pour supporter ponts et toitures.',
    recipe: '2 Bûches écorcées + 1 Pépite de fer',
    icon: '/realism_pack/textures/blocks/stripped_oak_log.png',
    specialEffect: 'Texture continue et résistance mécanique renforcée'
  }
];
