# Verificações locais — 21/10/2026

Implantação testada em Minikube 1.39.0, Kubernetes 1.37.0, driver Docker no Windows.

- Build das imagens `contact-manager-back:minikube` e `contact-manager-front:minikube`: concluído.
- Migração Prisma: 1 migração aplicada com sucesso pelo Job `migrate-db`.
- Deployments: `postgres` 1/1, `api` 2/2, `frontend` 1/1.
- Frontend em `http://localhost:8080/`: HTTP 200.
- API em `http://localhost:8080/api/health`: HTTP 200, `{"status":"ok"}`.
- Fluxo HTTP: cadastro, criação e listagem de contato, login e remoção da conta de teste passaram.
- Balanceamento: chamadas ao Service `api` partiram do Pod do frontend e retornaram dois valores distintos em `X-Pod-Name`.
- Autorrecuperação: Pod `api-6f7fc549dd-5l9qf` excluído; novo Pod `api-6f7fc549dd-ndb9h` criado; Deployment voltou a 2/2.
- Testes automatizados do backend: 17 passaram, 0 falharam (com `JWT_SECRET` de teste).

As capturas de tela para a apresentação ainda devem ser adicionadas a esta pasta. Execute os comandos da seção **Demonstração exigida** no README e capture também a aplicação no navegador.
