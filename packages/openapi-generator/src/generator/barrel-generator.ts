/**
 * Generate a barrel (index.ts) file that re-exports all generated form configs.
 */
export function generateBarrel(fileNames: string[]): string {
  const lines = fileNames.map((name) => {
    const moduleName = name.replace(/\.ts$/, '.js');
    return `export * from './${moduleName}';`;
  });

  lines.push('');
  return lines.join('\n');
}
