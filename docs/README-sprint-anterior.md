# WeFord - Sprint1

## Nomes, RM´s e Contribuições Descritas do Grupo

| Nome | RM | Contribuições |
|------|----|----------------|
| Igor Soos | 556010 | Construção da base do projeto, implementação do react native, expo router e AsyncStorage|
| Yuri Pessoa | 557475 | Formatação do design e adição de ícones e animações|
| Henrique Maldonado | 557270 | Integração com API e correção de erros gerais|
| Matheus Taylor | 556211 | Aprimoramento da página de login, cadastro e página inicial|

## Sobre o Projeto

**Nome do App:** WeFord 

**Desafio2:** Fomos desafiados a criar um projeto que possa reter clientes com serviço pós venda e, utilizando o VIN Share, conseguir que clientes usem mais a rede oficial para serviços de manutenção 

**Função do App:** O WeFord Rewards foi idealizado como um aplicativo de fidelidade automotiva, onde clientes Ford acumulam benefícios conforme interagem com a marca através de:

- revisões
- compras
- serviços

### O aplicativo possui funcionalidades como:

- cadastro/login de usuário
- armazenamento local de sessão
- cadastro do VIN do veículo
- exibição de pontuação
- ofertas exclusivas
- notificações de revisão
- sistema de recompensas
- integração com API FIPE
- interface moderna com identidade visual inspirada na Ford
- Animação de transição entre telas

## Funcionalidades implementadas

### Login
- Primeira tela, envia o usuário para o início ou para o cadastro

<img width="309" height="622" alt="image" src="https://github.com/user-attachments/assets/d2880665-e486-4d8a-bb85-45796e026bd5" />

### Cadastro
- O usuário cria a conta dele ao inserir suas informações
- É enviado para a página inicial após criar a conta
- Alternativamente pode voltar para o login se já tiver cadastro

<img width="314" height="623" alt="image" src="https://github.com/user-attachments/assets/7f6aeb69-b304-4433-8d9f-509130ec3e3f" />

### Tela Inicial
- Apresentação de informações gerais
- Pontuação atual e nível da conta, quanto falta para o próximo nível
- Informações do valor do veículo principal baseado no FIPE e possível valorização ou desvalorização
- "Ofertas rápidas" que mostram ofertas para o usuário antes de precisar ir para a tela de ofertas

<img width="307" height="627" alt="image" src="https://github.com/user-attachments/assets/6c828bcf-9aa8-4e1d-bd3a-acd6d1f48d13" />
<img width="306" height="625" alt="image" src="https://github.com/user-attachments/assets/c8592a8d-19b6-45af-a029-8e35d46fac2c" />

### Veículos 
- Cadastro de veículos
- Lista de veículos cadastrados com VIN e garantia de cada

<img width="307" height="626" alt="image" src="https://github.com/user-attachments/assets/9a34bcd6-ee2c-4b7e-9326-849f56ec059f" />

### Prêmios
- Pontuação e nivel da conta
- Barra de progresso para o próximo nível
- Benefícios desbloqueados com o nível atual

<img width="310" height="620" alt="image" src="https://github.com/user-attachments/assets/1853f576-45b2-469b-b4e1-711d7676130a" />

### Ofertas
- Ofertas resgatáveis de acordo com o nível da sua conta, podem mudar com certa frequência

<img width="307" height="629" alt="image" src="https://github.com/user-attachments/assets/487e89b7-fc33-483d-b092-f3f301873641" />
<img width="308" height="620" alt="image" src="https://github.com/user-attachments/assets/b5258463-205d-4042-93ee-d0932767395c" />

### Perfil
- Informações do cliente
- Notificações de promoções e lembretes de revisões
- Botão de logout que leva o usuário de volta ao login

<img width="311" height="618" alt="image" src="https://github.com/user-attachments/assets/075925c3-e40d-4213-b4b6-7ddd483ce663" />


## Demonstração:
https://youtube.com/https://youtube.com/shorts/lBms_NgyUFU?feature=share


## Decisões Técnicas

### Stack utilizada

- Front-end
- React Native
- Expo Router
- Expo

O React Native foi escolhido por permitir desenvolvimento mobile multiplataforma utilizando JavaScript, facilitando manutenção e velocidade de desenvolvimento.

O Expo foi utilizado por:

- simplificar configuração inicial
- acelerar testes
- facilitar execução em dispositivos móveis
- reduzir complexidade nativa

O Expo Router foi escolhido para:

- organização moderna das rotas
- estrutura baseada em pastas
- navegação simplificada

### Armazenamento local
- AsyncStorage

Justificativa:

- persistência de login
- armazenamento dos dados do usuário
- simulação de autenticação local

### API externa
- API FIPE (Parallelum)

Justificativa:

- demonstrar consumo de API REST
- adicionar dados automotivos reais
- enriquecer a experiência do usuário

A funcionalidade exibe:

- valor FIPE do veículo
- comparativo de valorização

### Navegação baseada em pastas

A utilização do Expo Router permitiu:

- simplificar rotas
- organização automática
- melhor leitura do projeto
- Centralização de estilos

As cores e estilos globais foram centralizados para:

- padronização visual
- manutenção facilitada
- consistência entre telas
- Persistência local em vez de backend

Como o objetivo inicial era prototipagem para simular a experiência do usuário, foi escolhida persistência local utilizando AsyncStorage.

Isso permitiu:

- reduzir complexidade
- focar na experiência do usuário
- acelerar desenvolvimento

A arquitetura foi preparada para futura integração com backend Node.js e Oracle SQL.

## Como Rodar o Projeto

### Pré‑requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Aplicativo **Expo Go** no celular (Android/iOS) ou emulador Android/iOS configurado

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/igor-soos/fiap-mdi-sprint-WeFord.git
cd fiap-mdi-sprint-WeFord
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor Expo
```bash
npx expo start
```

4. Execute no dispositivo/emulador
      Escaneie o QR Code com o Expo Go (Android/iOS) ou pressione "a" para emulador Android / "i" para iOS.

OBS: Certifique-se de que o celular e o computador estejam na mesma rede Wi-Fi.


## Estrutura do projeto

```text
MobileDevSprintApp/
│
├── app/
│   ├── _layout.js
│   ├── index.js
│   ├── register.js
│   │
│   └── (tabs)/
│       ├── _layout.js
│       ├── home.js
│       ├── offers.js
│       ├── rewards.js
│       ├── vehicles.js
│       └── profile.js
│
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── fonts/
│       └── Fordscript.ttf
│
├── src/
│   ├── services/
│   │   ├── storage.js
│   │   └── fipe.js
│   │
│   └── styles/
│       ├── colors.js
│       └── globalStyles.js
│
│
├── app.json
├── package-lock.json
└── package.json
```

## Próximos Passos (Melhorias Futuras)

Para o futuro, planejamos as seguintes implementações:

- **Backend real** - Integração com banco de dados Vin Share (em hash) disponibilizado pela Ford
- **Adição de carros** - Poder ter múltiplos carros cadastrados na mesma conta (com o hash do vin share no banco de dados, simulando o banco real da Ford)
- **Melhoria de API** - Tornar funcional a apresentação do cálculo de valorização ou desvalorização dos veículos
- **API de localização** – Detectar as concessionárias Ford mais próximas do usuário
- **Notificações push** – Implementação de notificações reais
- **Perfil mais customizável** - Poder mudar a foto de perfil, por exemplo

## Licença

Este projeto foi desenvolvido para fins acadêmicos – FIAP – Mobile Development & IOT (Challenge - Sprint 2).
