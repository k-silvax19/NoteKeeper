using NoteKeeper.Dominio.Compartilhado;
using NoteKeeper.Dominio.Modulos.Notas;

namespace NoteKeeper.Dominio.Modulos.Categorias;

public sealed class Categoria
{
    public const int TamanhoMaximoTitulo = 100;
    public const int TamanhoMinimoTitulo = 2;

    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Icone { get; private set; } = "pasta";
    public string Titulo { get; private set; } = string.Empty;
    public string TituloNormalizado { get; private set; } = string.Empty;
    public List<NotaCategoria> NotasCategorias { get; private set; } = [];

    private Categoria() { }

    public Categoria(Guid usuarioId, string titulo, string? icone = null)
    {
        Id = Guid.CreateVersion7();
        UsuarioId = usuarioId;
        AlterarTitulo(titulo);
        AlterarIcone(icone ?? "pasta");
    }

    public IReadOnlyList<ErroValidacao> Validar()
    {
        if (Titulo.Length < TamanhoMinimoTitulo)
        {
            return [new("titulo", "Título deve ter entre 2 e 100 caracteres.")];
        }

        if (Titulo.Length > TamanhoMaximoTitulo)
        {
            return [new("titulo", "Título deve ter entre 2 e 100 caracteres.")];
        }

        if (Icone is not ("pasta" or "livro" or "maleta" or "casa" or "estrela" or "coracao"))
            return [new("icone", "Selecione um ?cone v?lido.")];

        return [];
    }

    public void AlterarIcone(string icone) => Icone = icone;

    public void AlterarTitulo(string titulo)
    {
        Titulo = titulo?.Trim() ?? string.Empty;

        TituloNormalizado = Titulo.ToUpperInvariant();
    }
}
