using NoteKeeper.Dominio.Modulos.Categorias;
using NoteKeeper.Dominio.Modulos.Notas;
using Xunit;

namespace NoteKeeper.Tests.Compartilhado;

public sealed class EntidadesTests
{
    [Theory]
    [InlineData("pasta")]
    [InlineData("livro")]
    [InlineData("maleta")]
    [InlineData("casa")]
    [InlineData("estrela")]
    [InlineData("coracao")]
    public void Categoria_AceitaIconesDisponiveis(string icone)
    {
        var categoria = new Categoria(Guid.NewGuid(), "Trabalho", icone);
        Assert.Equal(icone, categoria.Icone);
        Assert.Empty(categoria.Validar());
    }

    [Fact]
    public void Categoria_UsaPastaPorPadrao()
    {
        Assert.Equal("pasta", new Categoria(Guid.NewGuid(), "Trabalho").Icone);
    }

    [Fact]
    public void Categoria_RejeitaIconeDesconhecido()
    {
        var categoria = new Categoria(Guid.NewGuid(), "Trabalho", "invalido");
        Assert.Contains(categoria.Validar(), erro => erro.Campo == "icone");
    }

    [Fact]
    public void Categoria_AplicaTrimEValidacaoDeTitulo()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();

        // Act
        var categoria = new Categoria(usuarioId, "  Trabalho  ");

        // Assert
        Assert.Equal("Trabalho", categoria.Titulo);
        Assert.Equal("TRABALHO", categoria.TituloNormalizado);
        Assert.Empty(categoria.Validar());
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    public void Categoria_RejeitaTituloCurto(string titulo)
    {
        // Arrange
        var usuarioId = Guid.NewGuid();

        // Act
        var categoria = new Categoria(usuarioId, titulo);

        // Assert
        Assert.NotEmpty(categoria.Validar());
    }

    [Fact]
    public void Nota_PermiteDescricaoVaziaENotaSemCategorias()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();

        // Act
        var nota = new Nota(usuarioId, "Ideia", null, StatusNota.Ativa);

        // Assert
        Assert.Empty(nota.Validar());
        Assert.Empty(nota.NotasCategorias);
    }

    [Fact]
    public void Nota_RejeitaDescricaoMaiorQueTrezentosCaracteres()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var descricao = new string('a', 301);

        // Act
        var nota = new Nota(usuarioId, "Ideia", descricao, StatusNota.Ativa);

        // Assert
        Assert.Contains(nota.Validar(), erro => erro.Campo == "descricao");
    }

    [Fact]
    public void Nota_NormalizaTituloSemDistinguirCaixa()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();

        // Act
        var nota = new Nota(usuarioId, "  Minha Nota ", null, StatusNota.Arquivada);

        // Assert
        Assert.Equal("Minha Nota", nota.Titulo);
        Assert.Equal("MINHA NOTA", nota.TituloNormalizado);
    }
}
