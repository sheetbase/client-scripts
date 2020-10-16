export interface Options {
  tsconfigPath: string;
  deployDir: string;
  commonjsConfig: {
    namedExports: Record<string, string[]>;
  };
  bundles: Bundle[];
}

interface Bundle {
  input: string;
  file: string;
  name: string;
}

export class OptionService {
  private options: Options;

  constructor() {
    this.options = {
      tsconfigPath: './tsconfig-sheetbase.json',
      deployDir: '.deploy',
      commonjsConfig: {
        namedExports: {
          'node_modules/pubsub-js/src/pubsub.js': ['publish', 'subscribe'],
          'node_modules/localforage/dist/localforage.js': ['createInstance'],
          'node_modules/papaparse/papaparse.js': ['parse'],
        },
      },
      bundles: [
        {
          input: './src/public-api.js',
          file: 'sheetbase.js',
          name: 'sheetbase',
        },
        {
          input: './src/lib/exports.js',
          file: 'sheetbase-app.js',
          name: 'sheetbase.app',
        },
        {
          input: './src/api/exports.js',
          file: 'sheetbase-api.js',
          name: 'sheetbase.api',
        },
      ],
    };
  }

  getOptions() {
    return this.options;
  }
}
