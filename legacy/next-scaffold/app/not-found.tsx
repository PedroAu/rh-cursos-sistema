import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="surface-card stack-lg" style={{ padding: "48px" }}>
          <span className="eyebrow">Página não encontrada</span>
          <div className="section-heading">
            <h1>Essa rota ainda não faz parte da jornada planejada.</h1>
            <p>
              Você pode voltar para a home, explorar os cursos ou acessar a agenda das
              próximas turmas.
            </p>
          </div>
          <div className="button-row">
            <Link className="button" href="/">
              Ir para a homepage
            </Link>
            <Link className="button-outline" href="/cursos">
              Ver catálogo
            </Link>
            <Link className="button-outline" href="/agenda">
              Abrir agenda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
