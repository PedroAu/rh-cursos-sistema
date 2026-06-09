export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

function addError(errors: ValidationError[], field: string, message: string) {
  errors.push({ field, message });
}

export function validateCourse(
  form: Record<string, string>,
  modules?: Array<{ title: string; description: string; topics: string[]; duration: string }>
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.title?.trim()) {
    addError(errors, "title", "Nome do curso é obrigatório");
  }

  if (!form.pathId?.trim()) {
    addError(errors, "pathId", "Selecione uma trilha");
  }

  if (!form.modality?.trim()) {
    addError(errors, "modality", "Selecione uma modalidade");
  }

  if (!form.durationLabel?.trim()) {
    addError(errors, "durationLabel", "Carga horária é obrigatória");
  }

  if (!form.price?.trim()) {
    addError(errors, "price", "Preço é obrigatório");
  } else if (isNaN(Number(form.price)) || Number(form.price) < 0) {
    addError(errors, "price", "Preço deve ser um número válido (>= 0)");
  }

  if (!form.level?.trim()) {
    addError(errors, "level", "Nível é obrigatório");
  }

  if (!form.status?.trim()) {
    addError(errors, "status", "Status é obrigatório");
  }

  if (!form.shortDescription?.trim()) {
    addError(errors, "shortDescription", "Descrição curta é obrigatória");
  }

  if (!form.fullDescription?.trim()) {
    addError(errors, "fullDescription", "Descrição completa é obrigatória");
  }

  if (form.objectives && form.objectives !== "[]") {
    try {
      const obj = JSON.parse(form.objectives);
      if (!Array.isArray(obj)) {
        addError(errors, "objectives", "Objetivos deve ser um array JSON válido");
      }
    } catch {
      addError(errors, "objectives", "Formato JSON inválido nos objetivos");
    }
  }

  if (form.benefits && form.benefits !== "[]") {
    try {
      const ben = JSON.parse(form.benefits);
      if (!Array.isArray(ben)) {
        addError(errors, "benefits", "Benefícios deve ser um array JSON válido");
      }
    } catch {
      addError(errors, "benefits", "Formato JSON inválido nos benefícios");
    }
  }

  if (modules && modules.length > 0) {
    modules.forEach((mod, i) => {
      if (!mod.title?.trim()) {
        addError(errors, "modules", `Módulo ${i + 1}: título é obrigatório`);
      }
      if (!mod.description?.trim()) {
        addError(errors, "modules", `Módulo ${i + 1}: descrição é obrigatória`);
      }
      if (!mod.duration?.trim()) {
        addError(errors, "modules", `Módulo ${i + 1}: duração é obrigatória`);
      }
      if (!mod.topics || mod.topics.length === 0 || !mod.topics.some(t => t?.trim())) {
        addError(errors, "modules", `Módulo ${i + 1}: adicione pelo menos um tópico`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateClass(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.courseId?.trim()) {
    addError(errors, "courseId", "Selecione um curso");
  }

  if (!form.startDate?.trim()) {
    addError(errors, "startDate", "Data de início é obrigatória");
  } else {
    const date = new Date(form.startDate);
    if (isNaN(date.getTime())) {
      addError(errors, "startDate", "Data inválida");
    }
  }

  if (!form.modality?.trim()) {
    addError(errors, "modality", "Selecione uma modalidade");
  }

  if (!form.status?.trim()) {
    addError(errors, "status", "Selecione um status");
  }

  if (!form.location?.trim() && form.modality === "Presencial") {
    addError(errors, "location", "Local é obrigatório para turmas presenciais");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateStudent(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.name?.trim()) {
    addError(errors, "name", "Nome é obrigatório");
  }

  if (!form.email?.trim()) {
    addError(errors, "email", "Email é obrigatório");
  } else if (!isValidEmail(form.email)) {
    addError(errors, "email", "Email inválido");
  }

  if (!form.organization?.trim()) {
    addError(errors, "organization", "Empresa/órgão é obrigatório");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateLead(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.name?.trim()) {
    addError(errors, "name", "Nome é obrigatório");
  }

  if (!form.email?.trim()) {
    addError(errors, "email", "Email é obrigatório");
  } else if (!isValidEmail(form.email)) {
    addError(errors, "email", "Email inválido");
  }

  if (!form.courseInterest?.trim()) {
    addError(errors, "courseInterest", "Selecione um curso de interesse");
  }

  if (!form.origin?.trim()) {
    addError(errors, "origin", "Selecione uma origem");
  }

  if (!form.status?.trim()) {
    addError(errors, "status", "Selecione um status");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateEnrollment(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.status?.trim()) {
    addError(errors, "status", "Status é obrigatório");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateInstructor(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.name?.trim()) {
    addError(errors, "name", "Nome é obrigatório");
  }

  if (!form.email?.trim()) {
    addError(errors, "email", "Email é obrigatório");
  } else if (!isValidEmail(form.email)) {
    addError(errors, "email", "Email inválido");
  }

  if (!form.specialty?.trim()) {
    addError(errors, "specialty", "Especialidade é obrigatória");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateBlogPost(form: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.title?.trim()) {
    addError(errors, "title", "Título é obrigatório");
  }

  if (!form.category?.trim()) {
    addError(errors, "category", "Selecione uma categoria");
  }

  if (!form.author?.trim()) {
    addError(errors, "author", "Autor é obrigatório");
  }

  if (!form.status?.trim()) {
    addError(errors, "status", "Status é obrigatório");
  }

  if (!form.summary?.trim()) {
    addError(errors, "summary", "Resumo é obrigatório");
  } else if (form.summary.length < 20) {
    addError(errors, "summary", "Resumo deve ter pelo menos 20 caracteres");
  }

  if (!form.content?.trim()) {
    addError(errors, "content", "Conteúdo é obrigatório");
  } else if (form.content.length < 100) {
    addError(errors, "content", "Conteúdo deve ter pelo menos 100 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function getErrorMessage(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}

export function getErrorsForDisplay(errors: ValidationError[]): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  errors.forEach(e => {
    if (!result[e.field]) {
      result[e.field] = e.message;
    }
  });
  return result;
}
