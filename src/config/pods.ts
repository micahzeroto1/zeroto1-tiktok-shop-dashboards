export interface SkuConfig {
  name: string;
  columnOffset: number; // offset from first SKU column
}

export interface ClientConfig {
  slug: string;
  displayName: string;
  rawTabName: string;
  rollupTabName: string;
  token: string;
  skus?: SkuConfig[];
}

export interface PodConfig {
  slug: string;
  displayName: string;
  podLeadName: string;
  spreadsheetId: string;
  token: string;
  clients: ClientConfig[];
}

export interface AppConfig {
  pods: PodConfig[];
  ceoToken: string;
  annualGmvTarget: number;
}

export const config: AppConfig = {
  annualGmvTarget: 10_000_000,
  ceoToken: process.env.CEO_TOKEN!,
  pods: [
    {
      slug: 'kelly',
      displayName: "Kelly's Pod",
      podLeadName: 'Kelly',
      spreadsheetId: '19N_8BnxhAC2v7PL5QMN9aVA6pCAAIKOVTFIy0S2clTk',
      token: process.env.POD_KELLY_TOKEN!,
      clients: [
        {
          slug: 'nature-made',
          displayName: 'Nature Made',
          rawTabName: 'Nature_Made',
          rollupTabName: '📌Nature_Made_rollup',
          token: process.env.CLIENT_NATURE_MADE_TOKEN!,
          skus: [
            { name: 'Ashwagandha', columnOffset: 0 },
            { name: 'Magnesium', columnOffset: 1 },
            { name: 'Probiotic', columnOffset: 2 },
            { name: 'Growth', columnOffset: 3 },
          ],
        },
        {
          slug: 'merit',
          displayName: 'MERIT',
          rawTabName: 'MERIT',
          rollupTabName: '📌MERIT_rollup',
          token: process.env.CLIENT_MERIT_TOKEN!,
          skus: [
            { name: 'Creative', columnOffset: 0 },
            { name: 'Dream', columnOffset: 1 },
            { name: 'Glow', columnOffset: 2 },
          ],
        },
        {
          slug: 'more-labs',
          displayName: 'More Labs',
          rawTabName: 'More_Labs',
          rollupTabName: '📌More_Labs_rollup',
          token: process.env.CLIENT_MORE_LABS_TOKEN!,
          skus: [
            { name: 'REGULAR', columnOffset: 0 },
            { name: 'ENERGY', columnOffset: 1 },
            { name: 'Sugar free', columnOffset: 2 },
          ],
        },
        {
          slug: 'trip',
          displayName: 'Trip',
          rawTabName: 'Trip',
          rollupTabName: '📌Trip_rollup',
          token: process.env.CLIENT_TRIP_TOKEN!,
          skus: [
            { name: 'Gummies', columnOffset: 0 },
            { name: 'Strawberries', columnOffset: 1 },
            { name: 'Variety Pack', columnOffset: 2 },
            { name: 'Peach Ginger', columnOffset: 3 },
            { name: 'Ashawanda Lions Mane', columnOffset: 4 },
            { name: 'Elderflower Mint', columnOffset: 5 },
            { name: 'Magnesium Powder', columnOffset: 6 },
          ],
        },
        {
          slug: 'one-skin',
          displayName: 'One Skin',
          rawTabName: 'One_Skin',
          rollupTabName: '📌One_Skin_rollup',
          token: process.env.CLIENT_ONE_SKIN_TOKEN!,
        },
        {
          slug: 'vinergy',
          displayName: 'Vinergy',
          rawTabName: 'Vinergy',
          rollupTabName: '📌Vinergy_rollup',
          token: process.env.CLIENT_VINERGY_TOKEN!,
        },
      ],
    },
    // ─── KAITLIN'S POD ───
    {
      slug: 'kaitlin',
      displayName: "Kaitlin's Pod",
      podLeadName: 'Kaitlin',
      spreadsheetId: '16Vy6qM_fMwzhSfqcP8iTF87gG4mzefVqbmovoQ1e3ng',
      token: process.env.POD_KAITLIN_TOKEN!,
      clients: [
        {
          slug: 'forestleaf',
          displayName: 'ForestLeaf',
          rawTabName: 'ForestLeaf',
          rollupTabName: '📌ForestLeaf_rollup',
          token: process.env.CLIENT_FORESTLEAF_TOKEN!,
          skus: [
            { name: 'Beef Liver', columnOffset: 0 },
            { name: 'Beef Organs', columnOffset: 1 },
            { name: 'NAD+', columnOffset: 2 },
            { name: 'Collagen Pills', columnOffset: 3 },
            { name: 'Beet Root', columnOffset: 4 },
            { name: 'Berberine', columnOffset: 5 },
            { name: 'Seamoss', columnOffset: 6 },
            { name: 'VINEGAR', columnOffset: 7 },
            { name: 'D-Mannose', columnOffset: 8 },
            { name: 'Turmeric + ginger', columnOffset: 9 },
            { name: 'Creatine', columnOffset: 10 },
          ],
        },
        {
          slug: 'dialed-moods',
          displayName: 'Dialed Moods',
          rawTabName: 'Dialed_Moods',
          rollupTabName: '📌Dialed_Moods_rollup',
          token: process.env.CLIENT_DIALED_MOODS_TOKEN!,
          skus: [
            { name: 'Sea Moss Gummies', columnOffset: 0 },
            { name: 'Shilajit Gummies', columnOffset: 1 },
            { name: 'Electrolytes', columnOffset: 2 },
          ],
        },
        {
          slug: 'ultra-pouches',
          displayName: 'Ultra Pouches',
          rawTabName: 'Ultra_Pouches',
          rollupTabName: '📌Ultra_Pouches_rollup',
          token: process.env.CLIENT_ULTRA_POUCHES_TOKEN!,
          skus: [
            { name: 'Ultra Pouches', columnOffset: 0 },
          ],
        },
        {
          slug: 'drink-vuum',
          displayName: 'Drink VUUM',
          rawTabName: 'Drink_VUUM',
          rollupTabName: '📌Drink_VUUM_rollup',
          token: process.env.CLIENT_DRINK_VUUM_TOKEN!,
          skus: [
            { name: 'Variety Mix Protein Sparkling Water', columnOffset: 0 },
            { name: 'White Peach Ginger Protein Sparkling Water', columnOffset: 1 },
            { name: 'Raspberry Lemon Protein Sparkling Water', columnOffset: 2 },
            { name: 'Watermelon Key Lime Protein Sparkling Water', columnOffset: 3 },
          ],
        },
        {
          slug: 'slatkin-co',
          displayName: 'Slatkin & Co',
          rawTabName: 'Slatkin_&_Co',
          rollupTabName: '📌Slatkin_&_Co_rollup',
          token: process.env.CLIENT_SLATKIN_CO_TOKEN!,
        },
        {
          slug: 'arg',
          displayName: 'ARG',
          rawTabName: 'ARG',
          rollupTabName: '📌ARG_rollup',
          token: process.env.CLIENT_ARG_TOKEN!,
        },
      ],
    },

    // ─── MEREDITH'S POD ───
    {
      slug: 'meredith',
      displayName: "Meredith's Pod",
      podLeadName: 'Meredith',
      spreadsheetId: '1iqAXckFXv3LZ6xjm7UyUUHYHVT6UHTbmlhaob_EAkIo',
      token: process.env.POD_MEREDITH_TOKEN!,
      clients: [
        {
          slug: 'beam',
          displayName: 'Beam',
          rawTabName: 'Beam',
          rollupTabName: '📌Beam_rollup',
          token: process.env.CLIENT_BEAM_TOKEN!,
          skus: [
            { name: 'Creatine Creators', columnOffset: 0 },
            { name: 'Dream Creators', columnOffset: 1 },
            { name: 'Glow Creators', columnOffset: 2 },
            { name: 'Beam Kids', columnOffset: 3 },
          ],
        },
        {
          slug: 'enviromedica',
          displayName: 'Enviromedica',
          rawTabName: 'Enviromedica',
          rollupTabName: '📌Enviromedica_rollup',
          token: process.env.CLIENT_ENVIROMEDICA_TOKEN!,
          skus: [
            { name: 'Mag Bath Flakes', columnOffset: 0 },
            { name: 'Forest Calm', columnOffset: 1 },
            { name: 'Mag Oil Spray', columnOffset: 2 },
            { name: 'Bee-Ome Gold', columnOffset: 3 },
          ],
        },
        {
          slug: 'purity',
          displayName: 'Purity',
          rawTabName: 'Purity',
          rollupTabName: '📌Purity_rollup',
          token: process.env.CLIENT_PURITY_TOKEN!,
          skus: [
            { name: 'MyBiotin', columnOffset: 0 },
            { name: 'B12', columnOffset: 1 },
            { name: 'Vegan Collagen', columnOffset: 2 },
          ],
        },
        {
          slug: 'revomadic',
          displayName: 'Revomadic',
          rawTabName: 'Revomadic',
          rollupTabName: '📌Revomadic_rollup',
          token: process.env.CLIENT_REVOMADIC_TOKEN!,
          skus: [
            { name: 'Cupper', columnOffset: 0 },
            { name: 'Face Genie', columnOffset: 1 },
          ],
        },
        {
          slug: 'singles-to-go',
          displayName: 'Singles To Go',
          rawTabName: 'Singles_To_Go',
          rollupTabName: '📌Singles_To_Go_rollup',
          token: process.env.CLIENT_SINGLES_TO_GO_TOKEN!,
          skus: [
            { name: "Wyler's Light", columnOffset: 0 },
            { name: 'Margaritaville', columnOffset: 1 },
            { name: 'Flavor Aid Aguas Frescas', columnOffset: 2 },
            { name: 'Skittles', columnOffset: 3 },
            { name: 'Purekick', columnOffset: 4 },
            { name: 'Starburst', columnOffset: 5 },
            { name: 'Sonic VP', columnOffset: 6 },
          ],
        },
        {
          slug: 'pique-life',
          displayName: 'Pique Life',
          rawTabName: 'Pique_Life',
          rollupTabName: '📌Pique_Life_rollup',
          token: process.env.CLIENT_PIQUE_LIFE_TOKEN!,
          skus: [
            { name: 'Jasmine Green Tea', columnOffset: 0 },
            { name: 'Hibiscus Beauty', columnOffset: 1 },
            { name: 'Sun Goddess Matcha', columnOffset: 2 },
          ],
        },
        {
          slug: 'ritual',
          displayName: 'Ritual',
          rawTabName: 'Ritual',
          rollupTabName: '📌Ritual_rollup',
          token: process.env.CLIENT_RITUAL_TOKEN!,
          skus: [
            { name: 'Synbiotic', columnOffset: 0 },
            { name: 'Hyacera', columnOffset: 1 },
            { name: "Women's Multivitamins", columnOffset: 2 },
            { name: "Men's Multivitamin", columnOffset: 3 },
            { name: 'Mind & Muscle', columnOffset: 4 },
            { name: 'Iron Supplement', columnOffset: 5 },
            { name: "Women's 50+ Multivitamins", columnOffset: 6 },
            { name: 'Stress Relief', columnOffset: 7 },
            { name: 'Protein Powder', columnOffset: 8 },
          ],
        },
        {
          slug: 'danger-coffee',
          displayName: 'Danger Coffee',
          rawTabName: 'Danger_Coffee',
          rollupTabName: '📌Danger_Coffee_rollup',
          token: process.env.CLIENT_DANGER_COFFEE_TOKEN!,
          skus: [
            { name: 'Medium Roast Ground', columnOffset: 0 },
            { name: 'Medium Roast Whole Bean', columnOffset: 1 },
            { name: 'Decaf Ground', columnOffset: 2 },
            { name: 'Decaf Whole Bean', columnOffset: 3 },
            { name: 'Dark Roast Ground', columnOffset: 4 },
            { name: 'Dark Roast Whole Bean', columnOffset: 5 },
          ],
        },
      ],
    },
  ],
};

// Helper to find a client across all pods
export function findClient(slug: string): { pod: PodConfig; client: ClientConfig } | null {
  for (const pod of config.pods) {
    const client = pod.clients.find((c) => c.slug === slug);
    if (client) return { pod, client };
  }
  return null;
}

// Helper to find a pod
export function findPod(slug: string): PodConfig | null {
  return config.pods.find((p) => p.slug === slug) ?? null;
}
