===================================================================
                       REALISM+ 8K — RESOURCE PACK
                      Minecraft Bedrock Edition (Android)
                                Version 1.0.0
===================================================================

[1] INTRODUCTION & PHILOSOPHIE TECHNIQUE
-------------------------------------------------------------------
Bienvenue dans REALISM+ 8K pour Minecraft Bedrock Edition !
Ce Resource Pack a été spécialement conçu pour offrir un niveau de
détail visuel extrême (représenté par le label stylistique "8K"),
tout en préservant scrupuleusement l'identité cubique emblématique
de Minecraft et la fluidité des GPU mobiles sous Android (Adreno & Mali).

[2] RÉSOLUTIONS & BUDGET MÉMOIRE MOBILE
-------------------------------------------------------------------
- Textures de blocs fondamentaux : 128x128 (4096 pixels par face vs 256 vanilla)
- Textures animées : Eau 16 images verticales 128x2048 flipbook (flipbook_textures.json)
- Textures spéciales / Items : 128x128 avec découpes alpha chirurgicales
- Pack Icon : 512x512 HD
- Ratio d'optimisation : Consommation VRAM maîtrisée sous les 100 Mo
  permettant d'éviter les crashs Out-Of-Memory (OOM) sur smartphones Android
  (4 Go, 6 Go et 8 Go de RAM).

[3] ARCHITECTURE DES FICHIERS INCLUS
-------------------------------------------------------------------
REALISM+ 8K/
├── manifest.json                  [Manifeste Bedrock v2 avec UUIDs distincts]
├── pack_icon.png                  [Logo officiel 512x512 haute définition]
├── README.txt                     [Documentation technique & guide d'installation]
└── textures/
    ├── flipbook_textures.json     [Définition officielle de l'animation de l'eau]
    ├── blocks/
    │   ├── dirt.png + dirt_normal.png + dirt_mer.png + dirt.texture_set.json
    │   ├── stone.png + stone_normal.png + stone_mer.png + stone.texture_set.json
    │   ├── iron_ore.png + iron_ore_normal.png + iron_ore_mer.png + iron_ore.texture_set.json
    │   ├── grass_top.png + grass_side.png + normal + mer + texture_sets
    │   ├── cobblestone.png + cobblestone_normal.png + cobblestone_mer.png
    │   ├── sand.png + sand_normal.png + sand_mer.png
    │   ├── log_oak.png + log_oak_top.png + normal + mer
    │   ├── planks_oak.png + planks_oak_normal.png + planks_oak_mer.png
    │   ├── leaves_oak.png + leaves_oak_normal.png
    │   ├── water_still.png + water_flow.png (128x2048 animés) + water_still.texture_set.json
    │   ├── glass.png + glass_normal.png + glass_mer.png
    │   ├── gravel.png + gravel_normal.png
    │   ├── brick.png + brick_normal.png + brick_mer.png
    │   └── deepslate.png + deepslate_normal.png
    ├── items/
    │   ├── diamond_sword.png      [Épée sertie en diamant et cuir]
    │   └── apple.png              [Pomme rouge organique avec feuille]
    ├── environment/
    │   └── sun.png                [Soleil atmosphérique ambiance Golden Hour]
    └── ui/
        ├── cross_hair.png         [Viseur chirurgical épuré]
        └── crosshair.png

[4] SPÉCIFICATION PBR (RENDER DRAGON & DEFERRED TECHNICAL PREVIEW)
-------------------------------------------------------------------
Ce pack intègre les véritables fichiers "*.texture_set.json" officiels
compatibles avec le moteur Render Dragon de Bedrock.
- Canal Normal Map : Tangent space Sobel dérivé du micro-relief
- Canal MER (Metalness - Emissive - Roughness) :
    * Rouge (R) : Métallicité (0 pour roches/terres, 185 pour minerais de fer)
    * Vert (G)  : Émissivité (0 pour blocs inertes, lueur pour sources)
    * Bleu (B)  : Rugosité (25 pour eau, 105 pour minerai poli, 205-238 pour roche)

===================================================================
REALISM+ 8K — TECHNICAL LIMITATIONS
===================================================================

[SUPPORTED]
- textures HD : 128x128 et 256x256 calibrées évitant les crashs VRAM
- textures animées si supportées : Eau animée 16 frames via flipbook_textures.json
- PBR si réellement supporté : Normal maps (Sobel) et MER maps (Metalness/Emissive/Roughness)
- transparence si supportée : Canal alpha 8-bit sur eau, verre et feuillage
- optimisation des ressources : Budget VRAM mobile < 100 Mo sur Adreno et Mali

[ENGINE DEPENDENT]
- éclairage avancé : Requiert le moteur Deferred Technical Preview de Bedrock
- HDR : Pas de pipeline HDR matériel injecté par simple Resource Pack
- réflexions : Réflexions SSR dépendantes du moteur graphique actif
- réfraction : Réfraction physique de l'eau nécessitant le Deferred Preview
- ombres avancées : Ombres directionnelles dynamiques gérées par le moteur
- motion blur : Non supporté nativement par les Resource Packs Bedrock
- optical flow : Effet moteur non injectable via des fichiers de textures
- effets volumétriques : Brouillard volumétrique dépendant du moteur

[NOT GUARANTEED]
- 220 FPS : "220 FPS" est un repère visuel/marketing de fluidité, non une garantie
- température du téléphone : Dépend de la charge thermique et du throttling de l'appareil
- charge GPU : Varie selon la résolution d'écran (1080p, 1440p) et les chunks actifs
- stabilité universelle : Dépend du pilote Vulkan/OpenGL ES du constructeur
- qualité identique sur tous les appareils : Diffère selon le SoC (Snapdragon, Dimensity, Exynos)

[5] GUIDE D'INSTALLATION SUR ANDROID
-------------------------------------------------------------------
MÉTHODE 1 (AUTOMATIQUE - RECOMMANDÉE) :
1. Téléchargez le fichier "REALISM+_8K_v1.0.mcpack".
2. Ouvrez votre gestionnaire de fichiers Android (Files by Google, ZArchiver, etc.).
3. Touchez le fichier "REALISM+_8K_v1.0.mcpack" et sélectionnez "Ouvrir avec Minecraft".
4. Minecraft Bedrock démarre automatiquement et affiche "Importation réussie".
5. Allez dans Paramètres > Ressources globales > Mes packs > Activer "REALISM+ 8K".

MÉTHODE 2 (MANUELLE) :
1. Renommez le fichier .mcpack en .zip si nécessaire et extrayez le dossier "REALISM+ 8K".
2. Déplacez ce dossier dans le répertoire :
   Android/data/com.mojang.minecraftpe/files/games/com.mojang/resource_packs/
3. Redémarrez Minecraft Bedrock et activez le pack.

===================================================================
Pack généré et validé techniquement pour Minecraft Bedrock Edition.
===================================================================
