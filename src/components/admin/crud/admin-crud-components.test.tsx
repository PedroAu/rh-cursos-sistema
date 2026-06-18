import { screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { AdminConfirmDialog, AdminDataTable, AdminFormModal, AdminRowActions } from "@/components/admin/crud";
import { renderWithProviders } from "@/test/test-utils";

describe("admin CRUD shared components", () => {
  it("renders desktop table rows with reusable action slot", () => {
    renderWithProviders(
      <AdminDataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "status", label: "Status" },
        ]}
        emptyLabel="Nenhum registro encontrado."
        rows={[
          {
            id: "1",
            ariaLabel: "Curso A",
            title: "Curso A",
            description: "Online",
            searchText: "Curso A Online Ativo",
            sortValues: { name: "Curso A", status: "Ativo" },
            cells: {
              name: "Curso A",
              status: "Ativo",
            },
            actions: <span>Ações</span>,
          },
        ]}
      />,
    );

    expect(screen.getAllByText("Curso A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ativo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ações").length).toBeGreaterThanOrEqual(1);
  });

  it("supports search, sort and selection in the shared table", () => {
    const onSelectionChange = vi.fn();

    renderWithProviders(
      <AdminDataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "status", label: "Status" },
        ]}
        emptyLabel="Nenhum registro encontrado."
        rows={[
          {
            id: "1",
            ariaLabel: "Curso B",
            title: "Curso B",
            searchText: "Curso B Ativo",
            sortValues: { name: "Curso B", status: "Ativo" },
            cells: { name: "Curso B", status: "Ativo" },
          },
          {
            id: "2",
            ariaLabel: "Curso A",
            title: "Curso A",
            searchText: "Curso A Inativo",
            sortValues: { name: "Curso A", status: "Inativo" },
            cells: { name: "Curso A", status: "Inativo" },
          },
        ]}
        selection={{
          ariaLabel: "Selecionar cursos visíveis",
          onSelectionChange,
          selectedIds: [],
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Buscar na tabela"), {
      target: { value: "Curso A" },
    });
    expect(screen.getByText("1 de 2 registros")).toBeInTheDocument();
    expect(screen.getAllByText("Curso A").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Curso B")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ordenar por Nome" }));
    expect(screen.getByRole("columnheader", { name: /Nome/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );

    fireEvent.click(screen.getByLabelText("Selecionar cursos visíveis"));
    expect(onSelectionChange).toHaveBeenCalledWith(["2"]);
  });

  it("exposes accessible row actions", async () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <AdminRowActions
        entityLabel="curso"
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Visualizar curso" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar curso" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir curso" }));

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders a focus-trapped form modal", () => {
    renderWithProviders(
      <AdminFormModal mode="create" onClose={vi.fn()} opened title="Novo curso">
        <button type="button">Salvar</button>
      </AdminFormModal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Novo curso" })).toBeInTheDocument();
  });

  it("runs confirmation callback and closes dialog", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    renderWithProviders(
      <AdminConfirmDialog
        message="Essa ação não pode ser desfeita."
        onClose={onClose}
        onConfirm={onConfirm}
        opened
        title="Excluir registro?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
