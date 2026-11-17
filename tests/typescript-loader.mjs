import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
export async function resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const url = new URL(specifier, context.parentURL);
    for (const suffix of ['', '.ts', '.tsx', '/index.ts']) {
      const candidate = new URL(url.href + suffix);
      if (/\.[cm]?[jt]sx?$/.test(candidate.pathname) && existsSync(candidate)) {
        return { url: candidate.href, shortCircuit: true };
      }
    }
  }
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (new URL(url).pathname.endsWith('.css')) return { format: 'module', source: 'export {};', shortCircuit: true };
  if (/\.(ts|tsx)$/.test(new URL(url).pathname)) {
    const result = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
      fileName: fileURLToPath(url),
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    return { format: 'module', source: result.outputText, shortCircuit: true };
  }
  return next(url, context);
}
