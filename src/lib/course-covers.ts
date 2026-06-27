// Mapeamento de imagem de capa padrão por trilha (asset de UI).
// Single source of truth para os fallbacks de capa de curso usados tanto na
// camada de apresentação (admin) quanto nos mappers Supabase. Os caminhos
// correspondem aos arquivos reais em `public/images/courses/`.
export const courseCoverByPath: Record<string, string> = {
  "path-dp": "/images/courses/departamento-pessoal-esocial.jpg",
  "path-licitacoes": "/images/courses/licitacoes-contratos.jpg",
  "path-pessoas": "/images/courses/pessoas-lideranca.jpg",
  "path-comunicacao": "/images/courses/comunicacao-atendimento.jpg",
  "path-auditoria": "/images/courses/auditoria-tributaria.jpg",
  "path-tech": "/images/courses/tecnologia-inovacao.jpg"
};

export const defaultCourseCover = courseCoverByPath["path-tech"];
