# Contact Manager no Minikube

Entrega do projeto do Mensal 1 adaptado para Kubernetes. Este repositório contém o código do [backend](backend/) e do [frontend](frontend/), os Dockerfiles de ambos e os manifestos em [k8s](k8s/). Os repositórios originais continuam independentes; esta é uma cópia de entrega.

As cópias partiram de [`contact-manager-back`](https://github.com/conradocmatheus/contact-manager-back) no commit `3768df6952bd2eed03f810c4a1dfc96d0f4db7fb` e de [`contact-manager-front`](https://github.com/conradocmatheus/contact-manager-front) no commit `c309692d063348aeaa943691d163f9b368b38224`. A única alteração funcional no código da aplicação nesta entrega é o cabeçalho `X-Pod-Name` de `/health`, usado para demonstrar o balanceamento.

## Arquitetura

```text
Navegador -> localhost:8081 -> port-forward -> Service frontend -> Caddy/Angular
                                                          |
                                                          +-- /api/* -> Service api -> 2 Pods Express
                                                                                      |
                                                                                      +-> Service postgres -> PostgreSQL + PVC
```

O frontend usa `/api` no mesmo domínio. O Caddy remove esse prefixo e encaminha a chamada ao Service `api`, por exemplo `/api/contacts` vira `/contacts` na API. O PostgreSQL persiste os dados no PVC `postgres-data`. Um Job executa as migrações Prisma **uma vez antes** de subir as duas réplicas da API. Configurações públicas ficam em ConfigMap; senha do banco, URL de conexão e segredo JWT ficam em Secret. Nenhum componente da aplicação roda diretamente no host.

## Pré-requisitos

- Windows com PowerShell, Docker Desktop em execução no modo Linux containers, `kubectl` e Minikube.
- Docker Desktop com pelo menos 4 GiB disponíveis para o cluster.
- Opcional: chave NumVerify para validar telefones. Sem ela, o restante da aplicação funciona, mas o endpoint de validação de telefone retorna 503.

Se faltar o Minikube, instale-o com `winget install -e --id Kubernetes.minikube` e abra um novo PowerShell. Execute os comandos abaixo na raiz deste repositório.

## Implantação

1. Inicie o cluster e confirme o contexto:

   ```powershell
   minikube start --driver=docker --cpus=2 --memory=4096
   kubectl config current-context
   ```

   O contexto esperado é `minikube`. Não aplique estes manifestos em outro cluster.

2. Construa as duas imagens **dentro do Minikube**:

   ```powershell
   minikube image build -t contact-manager-back:minikube .\backend
   minikube image build -t contact-manager-front:minikube .\frontend
   minikube image ls
   ```

3. Crie o arquivo local de segredos:

   ```powershell
   Copy-Item .env.k8s.example .env.k8s
   notepad .env.k8s
   ```

   Troque `ALTERE_ESTA_SENHA` nas duas linhas pelo **mesmo valor** e defina um `JWT_SECRET` longo e aleatório. Se a senha tiver caracteres especiais, codifique-a como parte de URL na `DATABASE_URL`. O arquivo `.env.k8s` é ignorado pelo Git. A chave NumVerify pode permanecer vazia.

4. Crie namespace, ConfigMap, Secret e banco:

   ```powershell
   kubectl apply -f .\k8s\00-namespace.yaml
   kubectl apply -f .\k8s\01-configmap.yaml
   kubectl create secret generic contact-manager-secrets -n contact-manager --from-env-file=.env.k8s
   kubectl apply -f .\k8s\02-postgres.yaml
   kubectl wait -n contact-manager --for=condition=available deployment/postgres --timeout=180s
   ```

5. Rode as migrações e suba API e frontend:

   ```powershell
   kubectl apply -f .\k8s\03-migration.yaml
   kubectl wait -n contact-manager --for=condition=complete job/migrate-db --timeout=180s
   kubectl apply -f .\k8s\04-api.yaml
   kubectl apply -f .\k8s\05-frontend.yaml
   kubectl wait -n contact-manager --for=condition=available deployment/api --timeout=180s
   kubectl wait -n contact-manager --for=condition=available deployment/frontend --timeout=180s
   ```

6. Em outro terminal, exponha o frontend para o navegador:

   ```powershell
   kubectl port-forward -n contact-manager service/frontend 8081:80
   ```

   Acesse <http://localhost:8081>. O cadastro de usuário, login e gerenciamento de contatos devem funcionar. A API pode ser verificada com `curl.exe -i http://localhost:8081/api/health`. A porta local `8081` evita conflito com serviços que já usam `8080`; se ela também estiver ocupada, escolha outra porta livre à esquerda de `:80`.

## Demonstração exigida

```powershell
kubectl get pods -n contact-manager -o wide
kubectl get services -n contact-manager
kubectl get deployments -n contact-manager
kubectl get pvc -n contact-manager
```

O Deployment `api` deve mostrar `2/2` réplicas. Para observar o balanceamento do Service `api`, faça requisições **em conexões separadas a partir do Pod do frontend** e compare o cabeçalho `X-Pod-Name` (a distribuição não precisa alternar a cada chamada):

```powershell
kubectl exec -n contact-manager deployment/frontend -- sh -c 'for i in $(seq 1 30); do wget -qS -O /dev/null http://api:3000/health 2>&1 | grep -i X-Pod-Name; done'
```

O Caddy pode reutilizar a mesma conexão de upstream; por isso, várias chamadas feitas **pelo navegador** podem atingir sempre o mesmo Pod, sem significar que o Service deixou de balancear.

Para demonstrar a autorrecuperação, apague um Pod da API e veja o Deployment criar outro:

```powershell
$apiPod = kubectl get pod -n contact-manager -l app=api -o jsonpath='{.items[0].metadata.name}'
kubectl delete pod -n contact-manager $apiPod
kubectl get pods -n contact-manager -l app=api -w
```

Interrompa o acompanhamento com `Ctrl+C` quando houver novamente dois Pods `Running`. Salve em [evidencias](evidencias/) capturas dos quatro comandos de inspeção, do acesso à aplicação no navegador, dos dois nomes diferentes em `X-Pod-Name` e da recriação do Pod.

## Diagnóstico e atualização

```powershell
kubectl describe pod -n contact-manager -l app=api
kubectl logs -n contact-manager job/migrate-db
kubectl logs -n contact-manager deployment/api --all-pods=true
kubectl logs -n contact-manager deployment/frontend
```

Após alterar código, refaça a imagem correspondente com `minikube image build`, depois `kubectl rollout restart -n contact-manager deployment/api` ou `deployment/frontend`. Se adicionar nova migração, primeiro reconstrua a imagem do backend, exclua **somente** o Job `migrate-db` já concluído com `kubectl delete job -n contact-manager migrate-db`, reaplique seu YAML e aguarde a conclusão antes do restart da API. Não apague o PVC se quiser conservar os contatos.

Os testes automatizados do backend podem ser executados com `npm ci` dentro de `backend` e, depois, `$env:JWT_SECRET = 'segredo-local-de-teste'; npm test`. A variável é necessária para o teste de cadastro que assina JWTs.

## Limites desta configuração

Esta configuração é para avaliação local no Minikube, não para produção. O PostgreSQL tem uma réplica e um PVC local. O Service `frontend` é acessado por `port-forward`; essa ferramenta de acesso no host é permitida pelo enunciado. O Secret não é criptografia de dados em repouso por si só, então não use credenciais reais na demonstração.
