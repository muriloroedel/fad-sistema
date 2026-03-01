# FAD — Ficha de Abastecimento Digital

Sistema web para digitalização e controle do processo de abastecimento de viaturas, substituindo fichas físicas por um fluxo totalmente digital com rastreabilidade e geração automática de documento oficial em PDF.

## Objetivo

Reduzir o uso de papel, padronizar o processo de autorização de abastecimento e garantir controle de status e histórico das operações.

## Arquitetura

O sistema é dividido em duas camadas:

### Backend
- Node.js
- Express
- Geração de QR Code
- Geração de PDF institucional (PDFKit)
- API REST para controle de solicitações e fichas

### Frontend
- HTML
- CSS modularizado
- JavaScript (Fetch API)
- Interface por perfil de usuário

## Perfis do Sistema

Motorista  
- Criação de solicitação de abastecimento  
- Acompanhamento de status  

S4  
- Autorização de ficha  
- Correção de solicitação  
- Negação de solicitação  
- Geração de ficha digital com QR Code  

Abastecedor  
- Validação da ficha autorizada  
- Registro do abastecimento  
- Atualização automática do status  

## Fluxo Operacional

1. Motorista registra solicitação  
2. S4 analisa e autoriza  
3. Sistema gera ficha com QR Code  
4. Abastecedor registra o abastecimento  
5. Status é atualizado para ABASTECIDA  

## Estrutura do Projeto


FAD/
├── fad-backend/
│ ├── index.js
│ ├── package.json
│
└── fad-frontend/
├── css/
├── js/
├── views/


## Execução

Backend:


cd fad-backend
npm install
node index.js


Servidor disponível em:


http://localhost:4000


Frontend:

Abrir os arquivos HTML via Live Server ou servidor local.

## Status do Projeto

Versão funcional para fins acadêmicos, com fluxo operacional implementado e geração de documentação em PDF.

## Autor

Murilo Röedel  
Acadêmico de Engenharia de Computação