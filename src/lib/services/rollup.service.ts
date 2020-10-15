import {rollup, OutputOptions, Plugin} from 'rollup';
import * as resolve from 'rollup-plugin-node-resolve';
import * as commonjs from 'rollup-plugin-commonjs';

interface RollupPluginConfig {
  resolve?: Record<string, unknown>;
  commonjs?: Record<string, unknown>;
}

export class RollupService {
  constructor() {}

  async bundleCode(
    input: string,
    outputs: OutputOptions[],
    pluginConfig: RollupPluginConfig = {}
  ) {
    const {resolve: resolveConfigs, commonjs: commonjsConfigs} = pluginConfig;
    const bundle = await rollup({
      input,
      plugins: [
        ((resolve as unknown) as (cfg: unknown) => Plugin)(resolveConfigs),
        ((commonjs as unknown) as (cfg: unknown) => Plugin)(commonjsConfigs),
      ],
    });
    for (const output of outputs) {
      await bundle.write(output);
    }
  }
}
