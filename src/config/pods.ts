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
      spreadsheetId: '16Vy6qM_fMwzhSfqcP8iTF87gG4mzefVqbmovoQ1e3ng',
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
    {
      slug: 'pod2',
      displayName: 'Pod 2',
      podLeadName: 'TBD',
      spreadsheetId: '1iqAXckFXv3LZ6xjm7UyUUHYHVT6UHTbmlhaob_EAkIo',
      token: process.env.POD_POD2_TOKEN!,
      clients: [],
    },
    {
      slug: 'pod3',
      displayName: 'Pod 3',
      podLeadName: 'TBD',
      spreadsheetId: '19N_8BnxhAC2v7PL5QMN9aVA6pCAAIKOVTFIy0S2clTk',
      token: process.env.POD_POD3_TOKEN!,
      clients: [],
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
