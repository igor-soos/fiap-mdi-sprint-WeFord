# WeFord — Sprint 3, etapa 3

Carteira de pontos, níveis, extrato e resgates conectados ao histórico VIN Share. Contas e veículos da etapa anterior são preservados. Ainda não é o APK final.

## Atualizar a versão já instalada

Pare o Expo e copie as pastas `app`, `src`, `tests`, `docs` e o `README.md` desta entrega para a pasta do projeto, substituindo os arquivos correspondentes. Mantenha seu `package-lock.json` e as dependências instaladas: não há dependências novas nesta etapa.

```bash
npm test
npx expo start -c
```

Se extrair em uma pasta nova, execute `npm install` primeiro. O `package.json` e os demais JSONs foram validados e começam com `{`. A migração pressupõe o mesmo armazenamento local, navegador/origem ou instalação. O nome, slug e as chaves anteriores não mudaram.

## O que está funcionando no código

- Créditos automáticos das manutenções elegíveis dos exemplos associados à conta.
- Saldo e nível compartilhados entre Home, Prêmios, Ofertas e Perfil.
- Extrato com créditos e débitos persistentes.
- Confirmação do custo antes do resgate, validação de saldo e atualização após salvar.
- Uma utilização de cada oferta por conta, com comprovante fictício persistido.
- Proteção das telas de extrato e comprovantes pelo login.
- Estados de carregamento, erro, nova tentativa, saldo insuficiente e ausência de movimentações.

O saldo fixo de 12.450 foi removido. As contas recebem somente os pontos elegíveis da nova carteira. O crédito inicial é calculado a partir do exemplo atualmente associado, inclusive se ele foi cadastrado na etapa anterior.

## Regras de fidelidade do projeto

| Regra | Definição |
|---|---|
| Crédito | 1.000 pontos por manutenção elegível, uma única vez por conta |
| Bronze | Menos de 3.000 pontos ganhos |
| Silver | De 3.000 a 4.999 pontos ganhos |
| Gold | De 5.000 a 9.999 pontos ganhos |
| Platinum | 10.000 pontos ganhos ou mais |
| Saldo disponível | Total de créditos menos resgates |
| Nível | Usa todos os pontos ganhos; resgates não reduzem o nível |
| Resgate | Uma vez por oferta na conta e somente com saldo suficiente |

Ofertas: Revisão Premium (1.000 pontos, cupom fictício de 20%); Brindes Ford (2.000 pontos, um brinde fictício); Troca de pneus (3.000 pontos, cupom fictício de 10%). Garantia estendida foi retirada das ofertas ativas por não ter condições e fluxo definidos.

Essas regras são acadêmicas e não pertencem a um programa oficial da Ford. Os cupons não têm validade em concessionárias. Não há agendamento, compra ou entrega de brinde real.

VIN cadastrado manualmente não gera pontos. A conta pode explorar outro exemplo, cujas manutenções ainda não creditadas geram novos pontos; voltar a um exemplo já utilizado não renova seus créditos. O limite de um exemplo por vez, da etapa 2, permanece.

## Persistência e prevenção de duplicidade

A carteira possui uma chave própria por conta e não é recriada a partir do veículo a cada acesso. Cada crédito registra seu identificador de manutenção e a combinação veículo/concessionária/ordem de serviço. Repetições dessas chaves não geram novos pontos.

Remover ou trocar o veículo preserva os créditos e os débitos anteriores. O resgate usa um identificador de requisição para permitir repetição segura de uma tentativa. A regra de uma oferta por conta também bloqueia toques repetidos com identificadores diferentes.

As operações leem a carteira mais recente e são serializadas na mesma instância do app. Créditos novos e débito são gravados em um documento único durante o resgate. Se a gravação falhar, a interface não confirma o benefício. A sessão é conferida antes do acesso e antes de salvar.

O app continua local: essas proteções não substituem transações e autorização em servidor, nem oferecem sincronização entre dispositivos ou coordenação entre abas independentes do navegador. A persistência em AsyncStorage pode ser alterada por quem controla o dispositivo.

## Teste recomendado no Expo

Use uma conta sem carteira anterior:

1. Selecione a Ranger 2023 em Veículos. Em Home/Prêmios, confira **5.000 pontos e Gold**.
2. Abra o extrato: devem existir cinco créditos de 1.000 pontos. A data de manutenção vem da fonte; a data de crédito é a data da importação para a carteira.
3. Em Ofertas, confirme Revisão Premium por 1.000 pontos. O saldo deve cair para **4.000**, mantendo Gold.
4. Abra Meus resgates e confira o comprovante com código `DEMO-...`.
5. Volte à oferta: deve aparecer como resgatada. Feche/reabra o app e confira o mesmo saldo e comprovante.
6. Remova e adicione novamente a Ranger. O saldo deve continuar **4.000**, sem novo crédito.
7. Resgate Brindes por 2.000: ficam 2.000. A oferta de pneus deve indicar que falta 1.000 ponto.
8. Saia e entre em outra conta: seu saldo e comprovantes devem ser independentes.
9. Com uma conta que tenha somente veículo manual, confira saldo zero e extrato vazio.
10. Saia e tente voltar às telas de extrato/comprovantes pelo histórico de navegação: elas devem exigir login.

## Estrutura adicionada

- `src/services/loyaltyCore.js`: regras, leitura, sincronização de créditos e resgate.
- `src/services/loyalty.js`: adaptadores de armazenamento, sessão, veículos e geração de ID.
- `src/context/LoyaltyContext.js`: estado compartilhado e sincronização ao mudar o exemplo.
- `src/components/LoyaltyUI.js`: saldo, progresso e estados de carregamento/erro.
- `app/points-history.js`: extrato.
- `app/my-redemptions.js`: comprovantes.
- `tests/loyalty.test.mjs`: testes das regras e das falhas.

## Verificação realizada

43 testes passaram: 14 de autenticação, 13 de veículos e 16 de fidelidade. Um teste adicional do adaptador de senha ficou ignorado porque a dependência não está instalada no ambiente de preparação; deve executar após a instalação no computador do usuário.

Foram verificados créditos únicos, saldos, níveis, concorrência de resgates, repetição da requisição, saldo insuficiente, troca/reinclusão do exemplo, contas separadas, sessão, falhas de gravação e dados corrompidos. Os 29 arquivos JavaScript passaram pela análise de sintaxe e referências locais. Os JSONs foram lidos por parser.

Os testes usam adaptadores locais em memória. As etapas anteriores foram testadas pelo usuário no Expo, mas esta nova interface ainda precisa do teste no aparelho. Não foi gerado APK nesta entrega.

## Documentação e próximos passos

- [Etapa 1: contas](docs/etapa1-contas.md)
- [Etapa 2: veículos e VIN Share](docs/etapa2-veiculos.md)
- [Créditos e prints históricos](docs/README-sprint-anterior.md)

Depois da validação: consulta FIPE por versão/ano, acabamento visual, geração e teste do APK, prints finais e vídeo de até dois minutos. Preferências ainda não enviam notificações. O README final deverá incluir os links e evidências reais da versão entregue.
