# WeFord — Sprint 3, etapa 2

Esta etapa conecta **veículos e histórico VIN Share às contas locais**. O login e a persistência da etapa 1 foram mantidos. Ainda não é o APK final.

## Executar e atualizar

Abra a pasta com `package.json` no VS Code:

```bash
npm install
npm test
npx expo start -c
```

O `package.json` começa somente com `{`, e os arquivos JSON foram validados. Esta etapa não adiciona dependências às da etapa 1. O pacote não inclui `node_modules` nem um lock desatualizado. Em uma pasta nova, `npm install` gera o `package-lock.json`.

**Para atualizar a pasta já testada:** pare o Expo, copie as pastas `app`, `src`, `tests`, `docs` e o `README.md` desta entrega para o projeto, substituindo os arquivos correspondentes. Mantenha o `package-lock.json` e as dependências já instaladas. Reinicie com `npx expo start -c`. As chaves de autenticação, nome e slug não mudaram.

A persistência é local. Outra origem web, navegador ou identidade de instalação pode acessar um armazenamento diferente. Esta etapa não apaga contas nem sessões.

## Implementado

| Parte | Comportamento |
|---|---|
| Cadastro manual | Modelo, ano, VIN e quilometragem opcional |
| Validação | Ano entre 1900 e o próximo ano, VIN com 17 caracteres sem I/O/Q, quilometragem inteira e VIN duplicado bloqueado por conta |
| Exemplos | Escolha de um veículo do recorte VIN Share |
| Principal | Seleção persistente, compartilhada pela Home e pelo Perfil |
| Histórico | Tela protegida, datas, KM, concessionária por código e ordem de serviço; registros mais recentes primeiro |
| Remoção | Confirmação; se era o principal, o primeiro restante assume esse papel |
| Contas | Listas isoladas e sessão conferida antes da leitura e antes da gravação |
| Interação | Estados de espera, erro, nova tentativa, sucesso e lista vazia |

Cada conta pode ter vários veículos manuais e um exemplo por vez. Você pode remover o exemplo para escolher outro. Nenhuma operação desta etapa gera pontos.

O VIN manual é validado somente quanto ao formato. Não existe consulta à Ford, comprovação de propriedade ou correspondência com o hash. Veículos manuais ficam sem histórico automático.

## Base de exemplos

| Exemplo | Veículo | Manutenções |
|---|---|---:|
| DEMO-001 | Ka 2021 | 3 |
| DEMO-002 | EcoSport 2021 | 4 |
| DEMO-003 | Ranger 2023 | 5 |
| DEMO-004 | Bronco Sport 2021 | 7 |
| DEMO-005 | F-150 2023 | 10 |

Os 29 registros vêm de `vin_share_Desafio_02.xlsx`, aba `vin_share`. Os históricos dos veículos selecionados são completos dentro da fonte e não apresentam repetição nas chaves verificadas. A seleção e as linhas de origem estão documentadas em `docs/vin-share-audit.json` e `src/data/demoVehicles.json`.

A associação à conta é fictícia. O hash original fica como referência técnica na fonte, sem ser exibido como VIN. A base não informa propriedade, atualização em tempo real ou nome/endereço das concessionárias.

A quilometragem histórica é mostrada com sua data, sem ser tratada como a quilometragem atual. O início registrado da garantia não é usado para presumir seu vencimento.

## Ajustes na Home

O veículo fixo foi substituído pelo principal da conta. A previsão fixa de próxima revisão foi substituída pela última manutenção disponível.

A cotação FIPE de URL fixa e o percentual de 2,4% foram retirados da Home para não associar valores a um veículo diferente. O arquivo `fipe.js` foi preservado, mas a Home não o chama nesta etapa. A seleção correta de versão e ano será implementada depois.

Os pontos e níveis anteriores permanecem identificados como ilustrativos. O cálculo baseado no histórico, o extrato e os resgates entram na etapa de fidelidade. Os atalhos de ofertas da Home agora abrem a tela de Ofertas.

## Teste manual

1. Entre e confira a Home sem veículos.
2. Em **Veículos → Escolher veículo de exemplo**, adicione a Ranger 2023.
3. Abra seu histórico: devem existir cinco manutenções, da mais recente para a mais antiga.
4. Confira o mesmo veículo na Home e no Perfil.
5. Cadastre um veículo manual. VIN fictício para testar o formato: `3FTTW8S98RRA12345`. Torne-o principal e confira a atualização nas outras telas. Seu histórico deve estar vazio.
6. Feche e reabra o app. Confira sessão, lista e principal preservados.
7. Saia e entre com outra conta. Ela deve ter sua própria lista. Volte à primeira e confira os dados.
8. Teste VIN duplicado, ano inválido e KM fracionária. Deve aparecer uma mensagem, sem salvar.
9. Remova veículos com confirmação e confira o comportamento do principal e da lista vazia.
10. Saia e tente voltar ao histórico por link ou pelo botão Voltar: a rota deve exigir login.

## Arquitetura

- `vehicleCore.js`: validação, fila de operações, autorização local e armazenamento por conta.
- `vehicles.js`: adaptador AsyncStorage/Expo Crypto e catálogo dos exemplos.
- `VehicleContext.js`: dados compartilhados; recriado ao mudar o ID da conta, impedindo exibir a coleção anterior.
- `VehicleUI.js`: componentes reutilizáveis, áreas seguras e formatação.
- `vehicle-history.js`: rota protegida fora das abas.

No armazenamento da conta, cada exemplo é uma referência ao catálogo, sem duplicar todo o histórico. As datas normalizadas `YYYY-MM-DD` são formatadas sem conversão de fuso. Se uma gravação falhar, o estado visível não é confirmado como salvo.

A autenticação continua local e acadêmica; verificações no cliente não substituem um backend. Detalhes em [Contas e sessão](docs/etapa1-contas.md).

## Verificação

27 testes de lógica passaram: 14 de autenticação e 13 de veículos. Um teste adicional de senha depende de `@noble/hashes` instalado e foi ignorado no ambiente de preparação. Após `npm install`, ele deve executar no computador do usuário.

Os testes cobrem validação, restauração, duplicidade concorrente, os cinco históricos, seleção/remoção, isolamento entre contas, logout, troca de sessão durante operação, falhas de armazenamento e dados corrompidos. Os 23 arquivos JavaScript passaram pela análise de sintaxe e referências; os JSONs foram lidos por um parser.

A etapa 1 foi validada pelo usuário no Expo. A nova interface e a integração nativa desta etapa ainda precisam do teste no dispositivo. Não foi gerado APK.

## Próxima etapa

Carteira de pontos, níveis, extrato e resgates persistentes. A remoção ou troca de veículo não poderá apagar débitos nem renovar créditos já concedidos: a carteira terá seu próprio registro de eventos por conta.

Depois: FIPE por versão, acabamento visual, APK testado, prints e vídeo. Os créditos e prints históricos estão em [README anterior](docs/README-sprint-anterior.md).
