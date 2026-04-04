# Painel Fazenda GTA RP

Sistema interno para controle de farm de uma familia GTA RP, com login individual, upload obrigatorio de print, ranking semanal, painel administrativo e acompanhamento automatico de metas.

## Tecnologias

- HTML
- CSS
- JavaScript
- localStorage

## Funcionalidades

- Login por usuario e senha
- Perfis `Admin` e `Membro`
- Registro de farm com:
  - nome automatico pelo login
  - tipo de farm
  - materiais recebidos
  - dinheiro sujo arrecadado
  - materiais restantes
  - print obrigatorio do bau
  - data automatica
  - status automatico
- Controle automatico:
  - segunda a sexta obrigatorio
  - sabado e domingo opcional
- Painel administrador para:
  - ver todos os registros
  - ver ranking semanal
  - ver quem nao entregou
  - cadastrar membros
  - editar membros
  - excluir membros
- Painel do membro para:
  - registrar farm
  - enviar print
  - ver historico proprio
- Exportacao de backup em JSON
- Layout escuro, moderno e responsivo

## Conta inicial

Ao abrir o sistema pela primeira vez, a conta padrao sera:

- Usuario: `admin`
- Senha: `123456`

Depois do login, o administrador pode cadastrar os demais membros no painel.

## Como usar

1. Abra `index.html` no navegador.
2. Entre com a conta `admin`.
3. Cadastre os membros com nome, usuario, senha e tipo.
4. Cada membro faz login com sua propria conta.
5. O membro registra a entrega do dia e envia o print do bau.
6. O administrador acompanha ranking, pendencias e historico semanal.

## Como cadastrar membros

1. Entre como administrador.
2. Acesse a area `Gestao de membros`.
3. Preencha:
   - Nome
   - Usuario
   - Senha
   - Tipo (`Admin` ou `Membro`)
4. Clique em `Salvar membro`.

## Regras do sistema

- Cada usuario possui apenas um registro por dia.
- Se o membro enviar novamente no mesmo dia, o registro anterior e atualizado.
- O sistema compara membros cadastrados com os registros do dia para marcar:
  - `Entregue`
  - `Nao entregou`
  - `Opcional`
- O ranking semanal e recalculado automaticamente com base nas entregas da semana atual.
- O reset diario e logico: ao mudar o dia, o painel comeca uma nova leitura diaria sem apagar o historico antigo.

## Estrutura do projeto

```text
/
|-- index.html
|-- style.css
|-- script.js
|-- README.md
`-- src/
    |-- assets/
    |   `-- README.md
    |-- components/
    |   `-- README.md
    `-- pages/
        `-- README.md
```

## Deploy na Vercel

Como o projeto e estatico, basta:

1. Enviar os arquivos para o GitHub.
2. Importar o repositorio na Vercel.
3. Definir o framework como `Other`.
4. Publicar sem comando de build.

## Observacoes

- Os dados ficam salvos no `localStorage` do navegador.
- Para usar em equipe com dados compartilhados entre varios usuarios, o proximo passo ideal e conectar um backend ou banco de dados real.
