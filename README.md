# Painel Fazenda GTA RP

Sistema interno para controle de farm com persistencia real em Supabase, login individual, ranking semanal e painel administrativo.

## Tecnologias

- HTML
- CSS
- JavaScript
- Supabase

## O que foi corrigido

- Usuarios agora sao salvos no banco
- Login consulta o banco
- Registros de farm sao persistidos no banco
- Ranking semanal e calculado com dados do banco
- Verificacao de quem nao entregou compara usuarios cadastrados com registros do dia
- Chave de armazenamento local unificada em `painel-fazenda-gta`
- Limpeza automatica das chaves legadas `painel-farm-gta-rp` e `painel-fazenda-gta-rp-v2`

## Estrutura principal

- [index.html](C:\Users\Windows\Documents\FARM\index.html)
- [style.css](C:\Users\Windows\Documents\FARM\style.css)
- [script.js](C:\Users\Windows\Documents\FARM\script.js)
- [supabase-config.js](C:\Users\Windows\Documents\FARM\supabase-config.js)
- [supabase-config.example.js](C:\Users\Windows\Documents\FARM\supabase-config.example.js)
- [supabase-schema.sql](C:\Users\Windows\Documents\FARM\supabase-schema.sql)

## Tabelas do banco

### `usuarios`

- `id`
- `nome`
- `usuario`
- `senha`
- `tipo`
- `data_criacao`

### `registros`

- `id`
- `usuario`
- `farm`
- `materiais`
- `dinheiro`
- `restantes`
- `print`
- `data`
- `status`

## Como configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo [supabase-schema.sql](C:\Users\Windows\Documents\FARM\supabase-schema.sql).
4. Copie a URL do projeto e a chave anon.
5. Edite [supabase-config.js](C:\Users\Windows\Documents\FARM\supabase-config.js).

Exemplo:

```js
window.SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  anonKey: "sua-chave-anon-aqui",
};
```

## Conta inicial

Depois de executar o SQL inicial, a conta padrao sera:

- Usuario: `admin`
- Senha: `123456`

## Como usar

1. Configure o Supabase.
2. Abra [index.html](C:\Users\Windows\Documents\FARM\index.html) no navegador.
3. Entre com `admin`.
4. Cadastre os membros no painel administrativo.
5. Cada membro faz login com seu proprio usuario.
6. Os registros passam a ficar salvos permanentemente no banco.

## Observacoes importantes

- O sistema continua sendo frontend estatico, mas os dados agora ficam no Supabase.
- A sessao atual do usuario fica apenas no navegador para manter o login aberto, usando a chave unica `painel-fazenda-gta`.
- O campo `print` esta sendo salvo no banco como `data URL` da imagem enviada.
- O SQL ja inclui politicas RLS abertas para permitir o uso direto pelo navegador com chave `anon`.
- As senhas estao sendo armazenadas em texto puro porque voce pediu a tabela exatamente com o campo `senha`. Em producao, o ideal e migrar isso para hash/autenticacao segura.

## Deploy na Vercel

1. Envie o projeto ao GitHub.
2. Importe o repositorio na Vercel.
3. Mantenha deploy estatico.
4. Garanta que [supabase-config.js](C:\Users\Windows\Documents\FARM\supabase-config.js) esteja com os dados corretos antes de publicar.
