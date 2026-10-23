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

Em 23/10/2026, o frontend e a API também responderam HTTP 200 pelo `port-forward` em `http://localhost:8081`.

## Capturas recebidas

- [Aplicação e port-forward em 8081](aplicacao-e-port-forward.png)
- [Pods](pods.png)
- [Deployments](deployments.png)
- [Services](services.png)

Ainda faltam capturas da distribuição entre as duas réplicas da API e da recriação automática de um Pod. Os comandos estão na seção **Demonstração exigida** do README principal.
