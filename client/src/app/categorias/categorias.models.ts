export interface CategoriasDto {
    readonly id: string,
    readonly icone: string;
    readonly titulo: string
}

export interface CriarCategoriasRequest {
    readonly icone: string;
    readonly titulo: string
}