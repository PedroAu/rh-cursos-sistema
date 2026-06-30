export interface DesignTokens {
  colors: Record<string, string>;
  fontSize: Record<string, [string, Record<string, string>] | string>;
  fontFamily: Record<string, string>;
  fontWeight: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  lineHeight: Record<string, string>;
}

export const tokens: DesignTokens;
export default tokens;
