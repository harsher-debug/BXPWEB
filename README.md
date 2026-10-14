# BXPWEB

Site institucional em português, inspirado na direção visual do [Prism](https://21st.dev/@mohammadshehadeh/templates/prism), com implementação própria em HTML, CSS e JavaScript. Fontes Barlow e Instrument Serif distribuídas com suas licenças OFL em `assets/`.

## Executar

Requer Node.js 22 ou superior.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

Abra `http://127.0.0.1:4173`. O servidor entrega apenas `dist/`. O site também pode ser aberto diretamente por `index.html` para uma prévia simples.

## Conteúdo e comportamento

- Página inicial com seis áreas de atuação, processo, fundadores, perguntas frequentes e contato.
- Canvas de malha digital com pausa, suspensão fora da tela e respeito à preferência de movimento reduzido.
- Menu mobile, navegação por teclado, foco visível e links sem dependência de JavaScript.
- Formulário com campos obrigatórios e aceite de privacidade: prepara uma mensagem para WhatsApp. O visitante confirma o envio lá. Não há envio automático, API de formulário ou banco de dados.
- Dois números de WhatsApp e e-mail fornecidos no briefing.
- Escolha de privacidade persistida por até 180 dias, alterável pelo rodapé. Nenhum cookie de análise ou publicidade, pixel ou fonte remota.
- Página de privacidade descrevendo o comportamento implementado, página 404, metadados e sitemap.
- Os mockups são conceitos ilustrativos, não projetos reais de clientes. Não há depoimentos ou métricas inventadas.

## Publicar no Cloudflare Pages

O repositório de destino é `https://github.com/harsher-debug/BXPWEB`.

1. Em **Workers & Pages**, crie uma aplicação Pages e importe o repositório `harsher-debug/BXPWEB`.
2. Configure branch de produção `main`, preset **None**, comando `npm run build` e diretório de saída `dist`.
3. Após a publicação inicial, em **Custom domains**, adicione `bxpweb.com.br`. Siga a verificação de DNS do painel. Adicione `www.bxpweb.com.br` se também desejar esse endereço.
4. Verifique o certificado HTTPS e o domínio. Preserve registros de e-mail existentes (MX, SPF, DKIM e DMARC).

Não habilite Analytics, Zaraz ou rastreadores sem adaptar o consentimento e a política. A configuração atual declara expressamente que eles não existem.

Documentação oficial: [HTML estático no Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) e [domínios personalizados](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Edição

- Textos e seções: `index.html`.
- Paleta, tipografia e breakpoints: `styles.css` (tokens em `:root`).
- Contato, preferências, menu e animação: `app.js`.
- Privacidade: `privacidade.html`. Ajuste caso as práticas de atendimento ou hospedagem mudem.
- Destino de produção: canonical no HTML, `robots.txt` e `sitemap.xml`.

## Verificação

`npm run check` verifica sintaxe JavaScript, arquivos referenciados, IDs, âncoras internas, campos rotulados e tamanho dos assets. `npm test` exercita o DOM com Happy DOM: aceite obrigatório, montagem e codificação da mensagem, validação, seleção de serviço, menu mobile e persistência/expiração da escolha de privacidade.

Os testes de DOM não substituem uma inspeção visual em navegador. Nesta sessão, nenhum navegador de automação estava disponível, portanto screenshots e renderização real em desktop/mobile não foram verificados.
