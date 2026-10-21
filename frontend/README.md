# 📱 ContactManagerFront - Guia do Usuário

Este guia explica como configurar, instalar e utilizar a interface frontend do ContactManagerFront. O aplicativo permite gerenciar contatos com recursos de autenticação, cadastro, pesquisa e validação.

## 🛠️ Configuração Inicial do Projeto

### Pré-requisitos

Antes de começar, certifique-se de que você tem instalado:

1. Node.js
2. Angular CLI versão 19.2.1 (`npm install -g @angular/cli@19.2.1`)
3. A [API backend](https://github.com/conradocmatheus/contact-manager-back) configurada e rodando

### Configurando o Projeto

```bash
# Instale as dependências
npm install
```

### Configurando a Conexão com a API

1. Crie o arquivo `src/environments/environment.development.ts`
2. Atualize a URL da API conforme necessário:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Ajuste para a URL da sua API
};
```

### Iniciando o Servidor de Desenvolvimento

```bash
# No diretório do projeto
ng serve
```

Acesse `http://localhost:4200` no navegador para iniciar o aplicativo.

## 👤 Criando uma Conta de Usuário

1. Na tela inicial, clique no botão **"Registrar"**
2. Preencha o formulário com suas informações:
   - Nome
   - Email (será seu nome de usuário)
   - Senha
3. Clique em **"Cadastrar"**
4. Se todas as informações estiverem corretas, você receberá uma confirmação e será redirecionado para a tela de login

## 🔑 Fazendo Login

1. Na tela inicial, insira seu email e senha
2. Clique em **"Entrar"**
3. Após autenticação bem-sucedida, você será redirecionado para o painel principal (home)

## 📞 Gerenciando Contatos

### Adicionando um Novo Contato

1. No painel principal, clique no botão **"+ Novo Contato"**
2. Preencha o formulário com as informações do contato:
   - Nome
   - Sobrenome
   - Email
   - Número de telefone (formato brasileiro: exemplo 45996323232 com 10 ou 11 dígitos)
3. Clique em **"Salvar"**
4. O sistema validará automaticamente o número de telefone usando a API NumVerify por trás dos panos, mas você pode verificar isso se olhar na parte do network no devtools
5. Se a validação for bem-sucedida, o contato será adicionado à sua lista

### Editando um Contato

1. Na tela de detalhes do contato, clique no botão **"Editar"**
2. Modifique as informações necessárias no formulário
3. Clique em **"Atualizar"**
4. Se você alterar o número de telefone, uma nova validação será realizada

### Excluindo um Contato

1. Na tela de detalhes do contato, clique no botão **"Excluir"**
2. Confirme a exclusão na caixa de diálogo
3. O contato será removido permanentemente da sua lista

## 🔍 Pesquisando Contatos

1. No painel principal, use a barra de pesquisa no topo da lista
2. Digite o nome, sobrenome ou email
3. A lista será filtrada 1,5 segundos após a digitação

## 📊 Funcionalidades Adicionais

### Exportando Contatos

1. No painel principal, clique no botão **"Exportar"**
2. O arquivo .CSV será gerado e baixado automaticamente

## 👤 Gerenciando Perfil

1. Clique no seu nome de usuário no canto superior direito
2. Selecione **"Meu Perfil"**
3. Nesta tela você pode:
   - Atualizar suas informações pessoais
   - Alterar sua senha
   - Remover todos os seus contatos
   - Apagar sua conta
   - Fazer logout

## ❓ Solução de Problemas

### Erro de Validação de Número

Se um número de telefone não puder ser validado:
1. Confirme se a API NumVerify está configurada corretamente no backend
2. Verifique se tem tokens restantes na dashboard do NumVerify

### Problemas de Conexão com o Backend

Se o aplicativo não conseguir se conectar ao backend:
1. Verifique se o servidor backend está rodando
2. Confirme se a URL da API no arquivo `environment.development.ts` está correta

---

Se você encontrar problemas ou tiver dúvidas adicionais, entre em contato comigo.
