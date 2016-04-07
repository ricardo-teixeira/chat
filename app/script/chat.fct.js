(function(){
    angular.module('ValueChat')
        .factory('ChatAPI', ['$resource', function($resource) {

            var signalr_url, webapi_token;
            signalr_url = $.cookie('gaiainc_signalr_url');
            webapi_token = $.cookie('gaiainc_webapi_token');

            if ((($.connection != null) && $.connection !== 0) && signalr_url !== void 0 && webapi_token !== void 0) {
                return {
                    methods: function() {
                        $.connection.hub.url = "" + signalr_url + "/chat";
                        return $.connection.valuechat;
                    },
                    message: function() {
                        return $resource("" + signalr_url + "/chatapi/message/:roomId", {}, {
                            get: {
                                method: 'GET',
                                params: {
                                    roomId: '@roomId',
                                    limit: '@limit',
                                    offset: '@offset'
                                },
                                headers: {
                                    'Authorization': "Bearer " + webapi_token
                                }
                            }
                        });
                    },
                    contact: function() {
                        return $resource("" + signalr_url + "/chatapi/contact/:id", {}, {
                            get: {
                                method: 'GET',
                                params: {
                                    id: '@id',
                                    limit: '@limit',
                                    offset: '@offset'
                                },
                                isArray: false,
                                headers: {
                                    'Authorization': "Bearer " + webapi_token
                                }
                            }
                        });
                    },
                    getuserbyname: function() {
                        return $resource("" + signalr_url + "/chatapi/contact/getuserbyname/:id", {}, {
                            get: {
                                method: 'GET',
                                params: {
                                    id: '@id',
                                    name: '@name',
                                    limit: '@limit',
                                    offset: '@offset'
                                },
                                headers: {
                                    'Authorization': "Bearer " + webapi_token
                                }
                            }
                        });
                    },
                    updateallmessages: function() {
                        return $resource("" + signalr_url + "/chatapi/message/updateallmessages/:roomId", {}, {
                            put: {
                                method: 'PUT',
                                params: {
                                    roomId: '@roomId',
                                    userId: '@userId'
                                },
                                isArray: true,
                                headers: {
                                    'Authorization': "Bearer " + webapi_token
                                }
                            }
                        });
                    },
                    notify: function() {
                        return $resource("" + signalr_url + "/chatapi/notify/:id", {}, {
                            get: {
                                method: 'GET',
                                params: {
                                    id: '@id'
                                },
                                isArray: false,
                                headers: {
                                    'Authorization': "Bearer " + webapi_token
                                }
                            }
                        });
                    },
                    start: function(options) {
                        this.methods().client.onConnected = function() {
                            return console.log("onConnected");
                        };
                        this.methods().client.notifyUser = function() {
                            //return
                        };
                        return $.connection.hub.start(options);
                    },
                    reconnect: function() {
                        console.log("reconnecting");
                        return $resource("" + signalr_url, {
                            method: 'ReAuthenticateWebApi'
                        });
                    }
                };
            } else {
                console.log("Erro ao connectar com o chat");
                return false;
            }
        }
        ]);
}).call(this);