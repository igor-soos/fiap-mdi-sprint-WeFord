# WeFord — Sprint 3

Carteira de pontos, níveis, extrato e resgates conectados ao histórico VIN Share. Contas e veículos da etapa anterior são preservados. Ainda não é o APK final.

## Atualizar a versão já instalada




## O que está funcionando no código

- Créditos automáticos das manutenções elegíveis dos exemplos associados à conta.
- Saldo e nível compartilhados entre Home, Prêmios, Ofertas e Perfil.
- Extrato com créditos e débitos persistentes.
- Confirmação do custo antes do resgate, validação de saldo e atualização após salvar.
- Uma utilização de cada oferta por conta, com comprovante fictício persistido.
- Proteção das telas de extrato e comprovantes pelo login.
- Estados de carregamento, erro, nova tentativa, saldo insuficiente e ausência de movimentações.


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

Crie um login novo:

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

