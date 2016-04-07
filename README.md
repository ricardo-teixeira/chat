# Angular Chat with SignalR API

## Fron-End

- Instalar Bower `npm install -g bower`
- Dentro do diretório bower/, executar `bower install` para baixar os componentes

#### Chat Module

Dependências

- hubs ('//{rootPath}/chat/hubs')
- signalr ('//{rootPath}/Scripts/jquery.signalR-2.2.0.min.js')
- angular
- angular-sanitize
- angular-resource
- jquery
- jquery.cookie
- angular-moment
- moment
- angular-animate
- font-awesome
- gaia-fontawesome

Opcional

- angular-animate (Remover do módulo se não for utilizar)

Objeto padrão para usuário
```json
{
    "id": 69,
    "name": "Pedro Silva",
    "photo": "http://{yourdomain}/users/0797b9b10608d9822feaa4cc9074c7e4.PNG",
    "status": "1",
    "systemType": 4
}
```

Objeto padrão para contatos
```json
{
  "count": 25,
  "data": [
    {
      "roomId": "56eb1964aa780246507e45b2",
      "participant": [
        {
          "id": 69,
          "name": "Pedro Silva",
          "company": "Google Inc",
          "systemType": 4,
          "status": 4,
          "photo": "http://{yourdomain}/users/0797b9b10608d9822feaa4cc9074c7e4.PNG",
          "inactive": false
        }
      ],
      "unreadMessages": 0,
      "lastMessage": "Olá",
      "messageDate": "2016-03-22T19:06:22.566Z"
    }
  ]
}
```

Objeto padrão para listagem de mensagens

```json
{
  "data": [
    {
      "senderId": 69,
      "systemType": 0,
      "message": "teste",
      "messageDate": "2016-03-22T19:11:38.499Z",
      "notification": [
        {
          "receiveId": 84360,
          "systemType": 1
        }
      ]
    }
  ]
}
```