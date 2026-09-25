# WeFord Rewards

**Challenge Ford × FIAP · Mobile Development & IoT · Sprint 3**

Aplicativo de fidelidade automotiva que conecta históricos de manutenção a pontos, níveis e benefícios demonstrativos. Desenvolvido em **JavaScript, React Native e Expo**, com persistência local e distribuição Android em APK.

## Desafio Ford escolhido

O projeto atende ao **Desafio 2 — VIN Share**, voltado à retenção de clientes no pós-venda e ao incentivo ao uso da rede oficial Ford para serviços de manutenção.

A proposta do WeFord é tornar esse relacionamento visível para o cliente: consultar os atendimentos do veículo, acompanhar os pontos recebidos por manutenção e utilizar o saldo para resgatar benefícios. O histórico passa a fazer parte de uma experiência de fidelidade com extrato e comprovantes.

A base fornecida contém identificadores `VIN_Hash`, sem correspondência disponível com o chassi informado pelo usuário. Por isso, o aplicativo utiliza veículos de exemplo com históricos extraídos do dataset. A associação desses exemplos às contas, as regras de pontos e os benefícios são fictícios e destinados à demonstração acadêmica.

| Extras | Link |
|---|---|
| APK Android | https://expo.dev/accounts/igorsrr/projects/wefordapp/builds/18b5e2be-94f6-42c4-85ea-6e848e76f7a9 |
| Vídeo de demonstração | https://youtube.com/shorts/st02r5UkQ04?is=Pgw9U4PVtJZKa9ud |

### Como instalar

1. Acesse o link do APK acima pelo dispositivo Android.
2. Baixe e abra o arquivo `.apk`.
3. Se solicitado pelo Android, permita a instalação por esse navegador ou gerenciador de arquivos.
4. Abra o WeFord e crie uma conta para explorar a demonstração.

Os dados são locais: uma conta criada no navegador ou em outro aparelho não é transferida automaticamente para o APK.

## Funcionalidades implementadas

| Funcionalidade | Comportamento |
|---|---|
| Cadastro | Validação dos campos, confirmação de senha e bloqueio de e-mail duplicado. |
| Login e sessão | Autenticação local, restauração da sessão e proteção das telas internas. |
| Logout | Encerra a sessão e preserva o cadastro para um novo acesso. |
| Veículos | Cadastro manual, escolha de veículo de exemplo, seleção do principal e remoção com confirmação. |
| Histórico de manutenção | Consulta de datas, quilometragem registrada, códigos de concessionárias e ordens de serviço dos exemplos. |
| Carteira de pontos | Crédito por manutenção elegível, saldo persistente e prevenção de créditos duplicados. |
| Níveis de fidelidade | Bronze, Silver, Gold e Platinum, com progresso baseado no total de pontos ganhos. |
| Ofertas | Resgate com confirmação, validação de saldo e bloqueio de repetição da mesma oferta por conta. |
| Extrato | Registro dos pontos recebidos e gastos. |
| Meus resgates | Comprovantes fictícios persistentes com códigos `DEMO-...`. |
| Perfil | Dados da conta, veículo principal, preferências salvas e saída da sessão. |
| Experiência de uso | Componentes compartilhados, transições de navegação e estados de carregamento, erro e ausência de dados. |

### Fluxo principal

**Criar conta → selecionar veículo de exemplo → consultar manutenções → acompanhar pontos → resgatar uma oferta → conferir extrato e comprovante.**

Para demonstrar com uma conta nova, selecione a **Ranger 2023**: suas cinco manutenções elegíveis geram **5.000 pontos**, correspondentes ao nível **Gold**. O resgate de Revisão Premium custa **1.000 pontos**, deixando **4.000 pontos disponíveis**, sem reduzir o nível.

## Regras de fidelidade

- Cada manutenção elegível do catálogo gera **1.000 pontos**, uma única vez por conta.
- O saldo disponível corresponde aos créditos menos os pontos usados em resgates.
- O nível considera o total de pontos ganhos; gastar pontos não reduz o nível.
- Cada oferta pode ser resgatada uma vez por conta, desde que exista saldo suficiente.
- Remover e adicionar novamente um veículo de exemplo não renova seus créditos nem apaga os resgates.
- Uma conta pode ter vários veículos manuais e um exemplo por vez. Ao trocar de exemplo, somente as manutenções ainda não creditadas geram novos pontos.
- Veículos manuais não recebem histórico nem pontos automaticamente.

| Nível | Total de pontos ganhos |
|---|---:|
| Bronze | 0 a 2.999 |
| Silver | 3.000 a 4.999 |
| Gold | 5.000 a 9.999 |
| Platinum | 10.000 ou mais |

| Oferta | Custo | Benefício fictício |
|---|---:|---|
| Revisão Premium | 1.000 pontos | Cupom de 20% de desconto |
| Brindes Ford | 2.000 pontos | Um brinde |
| Troca de pneus | 3.000 pontos | Cupom de 10% de desconto |

Os cupons não têm validade comercial. O aplicativo não realiza agendamentos, compras ou entrega de brindes reais.

## Telas do aplicativo

> Espaços reservados para capturas da versão instalada. Salve os arquivos em `docs/screenshots/` e remova os comentários HTML que envolvem cada imagem para exibi-las no GitHub. Os nomes sugeridos abaixo podem ser alterados, desde que o caminho da imagem também seja atualizado.

### 1. Login

<img src="IMAGENSAPP/Login.jpg" alt="Tela de login do WeFord" width="300" />

### 2. Cadastro

<img src="IMAGENSAPP/Cadastro.jpg" alt="Cadastro de conta" width="300" />

### 3. Home

<img src="IMAGENSAPP/Home.jpg" alt="Tela inicial do WeFord" width="300" />

### 4. Veículos

<img src="IMAGENSAPP/Veiculos1.jpg" alt="Veículos" width="300" />
<img src="IMAGENSAPP/Veiculos2.jpg" alt="Veículos" width="300" />
<img src="IMAGENSAPP/Veiculos3.jpg" alt="Veículos" width="300" />

### 5. Prêmios

<img src="IMAGENSAPP/Premios.jpg" alt="Saldo e nível de fidelidade" width="300" />

### 6. Ofertas

<img src="IMAGENSAPP/Ofertas.jpg" alt="Ofertas disponíveis" width="300" />

### 7. Perfil

<img src="IMAGENSAPP/Perfil.jpg" alt="Perfil do usuário" width="300" />
## Stack e justificativas

| Tecnologia | Aplicação no projeto |
|---|---|
| JavaScript | Linguagem utilizada em todo o desenvolvimento do aplicativo. |
| React Native | Construção da interface mobile com componentes reutilizáveis. |
| Expo | Ferramentas de desenvolvimento, módulos nativos e preparação do aplicativo Android. |
| Expo Router | Navegação baseada em arquivos, abas e controle de acesso às rotas. |
| React Context | Compartilhamento dos estados de autenticação, veículos e fidelidade entre telas. |
| AsyncStorage | Persistência local de contas, sessão, veículos, preferências e carteira. |
| Expo Crypto e `@noble/hashes` | Geração de valores aleatórios e derivação de senhas com PBKDF2-SHA256 e salt. |
| Ionicons e Expo Font | Ícones e tipografia personalizada, incluindo a fonte FordScript. |
| Node.js test runner | Testes automatizados das regras de negócio e de persistência. |
| Expo EAS Build | Geração e assinatura do APK Android em nuvem. |

A combinação de React Native e Expo permitiu concentrar o desenvolvimento nos fluxos do aplicativo e gerar uma instalação Android. A navegação do Expo Router e os componentes compartilhados ajudam a manter consistência entre as telas. As transições utilizam os recursos da navegação, sem acrescentar uma biblioteca exclusiva de animações.

## Estrutura do projeto

| Diretório ou arquivo | Responsabilidade |
|---|---|
| `app/` | Rotas de login, cadastro, históricos, extrato e resgates. |
| `app/(tabs)/` | Home, Veículos, Prêmios, Ofertas, Perfil e configuração das abas. |
| `src/components/` | Elementos reutilizáveis de formulários, veículos e fidelidade. |
| `src/context/` | Estado compartilhado de autenticação, veículos e carteira. |
| `src/services/` | Regras de negócio, validações e adaptadores de armazenamento. |
| `src/data/demoVehicles.json` | Catálogo de veículos e manutenções de demonstração. |
| `src/styles/` | Paleta e estilos comuns. |
| `assets/` | Imagens e fontes. |
| `tests/` | Testes de contas, senhas, veículos e fidelidade. |
| `docs/` | Documentação das etapas, auditoria dos dados e capturas de tela. |
| `app.json` | Identidade e configuração do aplicativo. |
| `eas.json` | Perfil de build para distribuição em APK. |
| `package.json` e `package-lock.json` | Dependências e comandos do projeto. |

## Integrações e decisões técnicas

### Dados VIN Share

O dataset foi utilizado para preparar um recorte estático de **cinco veículos e 29 manutenções**:

| Veículo | Manutenções |
|---|---:|
| Ka 2021 | 3 |
| EcoSport 2021 | 4 |
| Ranger 2023 | 5 |
| Bronco Sport 2021 | 7 |
| F-150 2023 | 10 |

Os dados ficam disponíveis no catálogo JSON do aplicativo. O arquivo `docs/vin-share-audit.json` documenta a seleção. Não há consulta online à Ford, decodificação do hash ou verificação de propriedade. O VIN manual é validado quanto ao formato e não é usado para buscar automaticamente registros na base.

### Persistência por conta

Sessão e cadastro são tratados separadamente: sair da conta encerra o acesso, mas preserva os dados. Veículos e carteira são associados ao identificador da conta, permitindo demonstrar diferentes usuários no mesmo dispositivo.

A persistência local foi escolhida para manter a demonstração independente de um backend. Ela não sincroniza aparelhos e pode ser perdida ao limpar os dados ou desinstalar o aplicativo.

### Regras separadas da interface

Os serviços `authCore.js`, `vehicleCore.js` e `loyaltyCore.js` concentram as regras; os adaptadores conectam essas regras ao AsyncStorage e aos recursos do Expo. Essa separação permite testar o comportamento sem abrir as telas.

### Carteira e prevenção de duplicidade

A carteira possui registro próprio de créditos e débitos. Não é reconstruída apenas com base no veículo atual, evitando que remover um veículo apague gastos ou permita receber os mesmos pontos novamente. Identificadores de manutenção e de ordem de serviço controlam os créditos; validações de saldo e repetição controlam os resgates.

As operações são serializadas na mesma instância do app. O benefício é confirmado na interface após a gravação bem-sucedida. Isso atende ao escopo local, sem substituir transações e autorização em servidor.

### Autenticação local

As senhas são derivadas com PBKDF2-SHA256 e salt. Ainda assim, a autenticação é acadêmica e executada no cliente: a solução não deve ser tratada como um sistema comercial de contas ou benefícios reais.

### Identidade visual

A interface utiliza tons de azul inspirados na Ford, fonte personalizada, ícones e estilos centralizados. Formulários e componentes de veículos e fidelidade são reutilizados para manter padrões de interação e apresentação.

### FIPE e notificações

A consulta FIPE foi explorada nas sprints anteriores. Nesta versão, o serviço `fipe.js` permanece no projeto, mas não está ativo nas telas: a cotação fixa e o percentual ilustrativo foram retirados para evitar apresentar valores de um veículo diferente do selecionado.

As preferências do perfil são persistidas, mas não enviam notificações push nem agendam lembretes reais. Possível melhoria futura.

## Como executar o código

### Pré-requisitos

- Node.js compatível com o Expo SDK 54; utilizar **20.19.4 ou superior**, em uma versão suportada pelo SDK.
- npm.
- VS Code ou outro editor.
- Navegador para a execução web ou ambiente Android para testes mobile.

### Instalação e execução

```bash
git clone https://github.com/igor-soos/fiap-mdi-sprint-WeFord.git
cd fiap-mdi-sprint-WeFord
npm ci
npx expo start
```

Pressione `w` para abrir no navegador. Para desenvolvimento pelo Expo Go, utilize uma versão compatível com o SDK do projeto. Para apenas utilizar a versão entregue, instale o APK, sem executar esses comandos.

O `npm ci` utiliza as versões registradas no `package-lock.json`. As dependências `expo-crypto` e `@noble/hashes` já devem estar registradas nos arquivos de dependências da versão final.

### Gerar uma nova build Android

Com uma conta Expo e o projeto configurado no EAS:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

O perfil `preview` deve definir `android.buildType` como `apk`. Em uma configuração inicial, executar `npx eas-cli@latest build:configure` antes do build. Preservar o identificador Android, o vínculo EAS e a assinatura ao gerar atualizações do mesmo aplicativo.

## Roteiro de demonstração

1. Entrar com uma conta de demonstração.
2. Selecionar a Ranger 2023 e mostrar suas cinco manutenções.
3. Apresentar os 5.000 pontos e o nível Gold.
4. Resgatar Revisão Premium e conferir o saldo de 4.000 pontos.
5. Abrir o extrato e o comprovante em Meus resgates.
6. Mostrar rapidamente as demais abas e a persistência ao reabrir o app.

O vídeo de entrega deve ter até dois minutos e mostrar o aplicativo instalado em dispositivo ou emulador.

## Possíveis melhorias futuras

As propostas abaixo são evoluções além do escopo entregue:

| Melhoria | Motivo |
|---|---|
| Backend com autenticação e banco de dados | Sincronizar contas e histórico entre dispositivos e validar operações no servidor. |
| Vínculo verificado entre cliente e veículo | Associar o veículo à conta com um processo autorizado, caso uma integração adequada seja disponibilizada. |
| Integração com serviços de manutenção | Receber novos atendimentos e conceder pontos com validação na origem. |
| Consulta FIPE por versão e ano | Apresentar uma cotação coerente com o veículo selecionado. |
| Lembretes e notificações | Permitir lembretes definidos pelo usuário e avisos de benefícios, mediante consentimento. |
| Concessionárias próximas | Ajudar a localizar a rede de atendimento com mapa e informações de contato. |
| Acessibilidade e testes em mais aparelhos | Melhorar leitura, navegação assistiva e compatibilidade com diferentes telas. |

## Equipe

| Integrante | RM |
|---|---|
| Igor Soos | 556010 |
| Yuri Pessoa | 557475 |
| Henrique Maldonado | 557270 |
| Matheus Taylor | 556211 |

---

Projeto desenvolvido para fins acadêmicos no Challenge Ford × FIAP. Os pontos e benefícios são demonstrativos e não representam um programa oficial de recompensas da Ford.
