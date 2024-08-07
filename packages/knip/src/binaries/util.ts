import { getPackageNameFromFilePath, getPackageNameFromModuleSpecifier } from '../util/modules.js';
import { isAbsolute, isInNodeModules, join } from '../util/path.js';
import { toBinary } from '../util/protocols.js';
import { _resolveSync } from '../util/resolve.js';

export const tryResolveFilePath = (cwd: string, specifier: string, acceptModuleSpecifier?: boolean) => {
  if (specifier) {
    const filePath = isAbsolute(specifier) ? specifier : join(cwd, specifier);
    if (!isInNodeModules(filePath)) {
      const resolvedFilePath = _resolveSync(filePath, cwd);
      if (resolvedFilePath) {
        return resolvedFilePath;
      }
      if (acceptModuleSpecifier) {
        return getPackageNameFromModuleSpecifier(specifier);
      }
    } else if (specifier.includes('node_modules/.bin')) {
      return toBinary(trimBinary(specifier));
    } else {
      return getPackageNameFromFilePath(specifier);
    }
  }
};

export const tryResolveSpecifiers = (cwd: string, specifiers: string[]) =>
  specifiers.map(specifier => tryResolveFilePath(cwd, specifier, true));

export const stripVersionFromSpecifier = (specifier: string) => specifier.replace(/(\S+)@.*/, '$1');

const stripNodeModulesFromPath = (command: string) => command.replace(/^(\.\/)?node_modules\//, '');

export const trimBinary = (command: string) =>
  stripVersionFromSpecifier(
    stripNodeModulesFromPath(command)
      .replace(/^(\.bin\/)/, '')
      .replace(/\$\(npm bin\)\/(\w+)/, '$1') // Removed in npm v9
  );

export const argsFrom = (args: string[], from: string) => args.slice(args.indexOf(from));
