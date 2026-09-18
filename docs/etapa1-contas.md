# WeFord — Sprint 3, etapa 1

Aplicativo acadêmico do desafio 2 Ford × FIAP: incentivar a retenção de clientes e o uso da rede de pós-venda por meio de fidelidade e histórico de manutenção.

Esta entrega implementa **contas locais e sessão** sobre o projeto enviado. Ainda não é o APK final da sprint 3. Os dados VIN Share e o módulo de fidelidade preparados anteriormente serão integrados na próxima etapa.

## Como executar

Use Node.js 20.19.4 ou superior compatível com o Expo SDK 54. Extraia este ZIP em uma pasta própria e abra a pasta que contém `package.json` no VS Code.

```bash
npm install
npm test
npx expo start -c
```

No terminal do Expo, pressione `w` para testar no navegador ou abra pelo Expo Go compatível com o SDK do projeto. Não é necessário instalar o antigo pacote global `expo-cli`.

As duas dependências novas já estão declaradas no `package.json`: `expo-crypto` e `@noble/hashes`. O ambiente de preparação não conseguiu baixar dependências do npm. Por isso, esta entrega não contém `node_modules` nem um `package-lock.json` desatualizado. O primeiro `npm install` gera o lock; mantenha-o no repositório após a instalação bem-sucedida. Use `npm install`, não `npm ci`, nessa primeira execução.

O arquivo `app.json` foi organizado no formato Expo com nome, slug, ícone, plugins e ajuste do teclado Android. A geração do APK continua para a etapa de build.

## O que mudou

| Parte | Comportamento implementado |
|---|---|
| Cadastro | Validação de nome/e-mail, telefone opcional com DDD, senha mínima de oito caracteres e confirmação |
| Contas | Mais de uma conta local; e-mail normalizado e duplicidade bloqueada |
| Senha | Salt aleatório por conta e PBKDF2-SHA256; senha não é salva em texto no novo formato |
| Login | Erro visível, indicador de espera e sessão salva após gravação bem-sucedida |
| Sessão | Restauração ao abrir o app e proteção das telas internas |
| Logout | Limpa a sessão, preserva as contas e remove acesso às abas |
| Home e Perfil | Dados da conta autenticada, sem leitura da antiga chave global `user` |
| Preferências | Ofertas/revisões persistidas por conta; ainda não enviam notificações |
| Formulários | Componentes compartilhados, mostrar/ocultar senha, rolagem, teclado e área segura |
| Falhas | Erros de armazenamento propagados; a interface não anuncia sucesso antes da gravação |

O CPF foi retirado do formulário porque não participava de nenhuma regra ou integração. A validação de telefone é de formato, sem consulta de titularidade. O cadastro do veículo permanece na área Veículos, a ser implementada na etapa seguinte.

## Teste manual desta etapa

1. Tente cadastrar campos vazios, e-mail inválido e senhas diferentes. Deve aparecer uma mensagem e a tela deve permanecer no cadastro.
2. Crie a conta A com uma senha de pelo menos oito caracteres. Confira o nome na Home e os dados no Perfil.
3. Altere uma preferência e feche completamente o app. Ao reabrir, a sessão e a preferência devem permanecer.
4. Saia. Use o botão Voltar do Android e tente acessar uma rota interna diretamente: as abas devem permanecer bloqueadas.
5. Tente entrar com senha incorreta e depois com a senha correta.
6. Saia e crie a conta B, com outro e-mail. As duas contas devem continuar disponíveis, com preferências independentes.
7. Tente cadastrar o e-mail da conta A com maiúsculas ou espaços nas extremidades. Deve ser considerado duplicado.
8. Teste os formulários com o teclado aberto em um aparelho pequeno.

## Migração do cadastro antigo

Se o app conseguir acessar a mesma área de armazenamento usada pela versão anterior, a conta existente na chave `user` será convertida automaticamente. Ela não será considerada uma sessão ativa: faça login uma vez após a migração.

Senhas antigas válidas, mesmo com menos de oito caracteres, são preservadas para não impedir acesso. A regra mínima de oito caracteres aplica-se aos novos cadastros. A chave antiga só é removida depois que o novo cadastro foi salvo. Se a gravação ou limpeza falhar, uma mensagem permite tentar novamente; não há exclusão automática de dados corrompidos.

Um novo APK, outra origem web, outro navegador ou outra identidade de projeto no Expo Go pode ter um armazenamento diferente. Nesse caso, crie uma conta nesse ambiente; os cadastros não são sincronizados entre instalações.

## Decisões técnicas

Mantidos JavaScript, React Native 0.81.5, Expo SDK 54, Expo Router 6 e AsyncStorage.

- `AuthContext` mantém a conta ativa e o estado das operações. Login, cadastro e logout alteram a sessão; a navegação reage a ela.
- `Stack.Protected` protege o grupo `(tabs)` e impede que o histórico de navegação reabra uma tela interna após sair. Referência: [Expo Router — Protected routes](https://docs.expo.dev/router/advanced/protected/).
- Contas e sessão são gravadas em um único documento local, evitando cadastro salvo com uma sessão parcialmente gravada. Uma fila serializa operações dentro da instância do app.
- `authCore.js` recebe armazenamento e derivação de senha como dependências, permitindo testar falhas sem precisar de emulador.
- `passwordCore.js` usa PBKDF2-SHA256, 600.000 iterações, salt de 16 bytes e saída de 32 bytes. A derivação assíncrona vem de `@noble/hashes` 1.8.0. O salt e os IDs usam `expo-crypto`. Referências: [Expo Crypto SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/crypto/) e [noble-hashes](https://github.com/paulmillr/noble-hashes).
- Os componentes recebem somente o perfil público, sem credenciais. O estado local continua editável por quem controla o dispositivo: autenticação e autorização de produção requerem backend. Não há recuperação de senha ou sincronização entre aparelhos nesta etapa.

A derivação pode levar alguns segundos em celulares mais lentos; os botões ficam indisponíveis enquanto a operação ocorre. No navegador, a geração aleatória depende de um contexto seguro, como localhost ou HTTPS.

## Verificação realizada

- 14 testes de lógica aprovados: cadastro, duas contas, login/logout, restauração, preferências, duplicidade concorrente, falhas de gravação, migração, dados inválidos e derivação de senha.
- Análise sintática e de referências dos 18 arquivos JavaScript do app/serviços, sem erros encontrados na verificação.
- Um teste adicional compara a implementação `@noble/hashes` com o PBKDF2 nativo do Node após `npm install`. Ele é marcado como ignorado quando a dependência não está instalada.

Os testes executados aqui usam memória para simular o armazenamento e o PBKDF2 nativo do Node como adaptador. **Não foram executados o Expo, a integração com AsyncStorage/Expo Crypto, o teste visual nem a instalação Android**, pois as dependências não puderam ser baixadas. O checklist manual acima é necessário antes de considerar a etapa validada no dispositivo.

## Estrutura adicionada

- `src/context/AuthContext.js`: sessão compartilhada.
- `src/components/AuthForm.js`: campos, mensagens, botão e tela dos formulários.
- `src/services/auth.js`: integração com AsyncStorage e criptografia.
- `src/services/authCore.js`: regras de conta, sessão e migração.
- `src/services/passwordCore.js`: formato e verificação da derivação de senha.
- `tests/`: testes executáveis com Node.

## O que ainda vem depois

Home, Veículos, Ofertas e Prêmios ainda contêm os dados demonstrativos da versão anterior. Pontos, resgates, histórico VIN Share, cadastro de veículos e FIPE por versão não são anunciados como concluídos nesta entrega.

A próxima etapa conecta os veículos de exemplo e seus históricos às contas. Depois entram carteira, extrato, resgates, acabamento visual e APK. Não há link de APK nesta etapa porque nenhum APK foi gerado.

Os prints e créditos do trabalho anterior foram preservados em [README da sprint anterior](docs/README-sprint-anterior.md). São registros históricos; serão substituídos pelos prints da versão final antes da entrega.
