/**
 * Declarações de tipo para o gate anti-drift OpenAPI (REC-406). Espelham as
 * funções puras exportadas por `check-openapi-drift.mjs`, permitindo importá-las
 * em testes TypeScript sem `any` implícito.
 */

export type EndpointMap = Map<string, string[]>;

export type EndpointDiff = {
  missingFromSpec: string[];
  extraInSpec: string[];
  methodMismatches: Array<{
    path: string;
    missingMethods: string[];
    extraMethods: string[];
  }>;
};

export function normalizeDynamicSegments(path: string): string;
export function normalizeRoutePath(
  filePath: string,
  rootDir: string,
  suffixToRemove: string | RegExp
): string;
export function detectMethods(content: string): string[];
export function listCodeEndpoints(): EndpointMap;
export function buildSpecEndpoints(spec: unknown): EndpointMap;
export function diffEndpoints(codeEndpoints: EndpointMap, specEndpoints: EndpointMap): EndpointDiff;
