(function ($, angular) {
    "use strict";
    angular.module('ValueChat')
        .factory('ChatAPI', ['$resource', '$q', function ($resource, $q) {

            function getCookie(cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i<ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1);
                    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
                }
                return "";
            }

            var signalr_url, webapi_token;
            signalr_url = decodeURIComponent(getCookie('gaiainc_signalr_url'));
            webapi_token = getCookie('gaiainc_webapi_token');

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
                loadSettings: function() {
                    return $resource("" + signalr_url + "/chatapi/settings/getusersetting/:userId", {}, {
                        get: {
                            method: 'GET',
                            params: {
                               id: '@userId'
                            },
                            headers: {
                                'Authorization': "Bearer " + webapi_token
                            }
                        }
                    });
                },
                saveSettings: function() {
                    return $resource("" + signalr_url + "/chatapi/settings/createsetting", {}, {
                        post: {
                            method: 'POST',
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
                        return console.log("notifyUser");
                    };
                    return $.connection.hub.start({
                        transport: ['webSockets', 'longPolling']
                    });
                },
                isConnected: true,
                reconnect: function() {
                    console.log("reconnecting");
                    return $resource("" + signalr_url, {
                        method: 'ReAuthenticateWebApi'
                    });
                }
            };
        }
        ]);
})(jQuery, angular);



(function() {
    return;
    angular.module('GaiaApp').factory('Chat', [
        '$resource', '$rootScope', '$q', '$timeout', function($resource, $rootScope, $q, $timeout) {
            var api_ashx, signalr_url, webapi_token;
            signalr_url = $.cookie('signalr_url');
            webapi_token = $.cookie('webapi_token');
            api_ashx = 'json/api/api.ashx?method=ReAuthenticateWebApi';
            return {
                construct: function() {
                    var deferred;
                    deferred = $q.defer();
                    if (!angular.isDefined($.connection)) {
                        $.getScript(signalr_url + "/Scripts/jquery.signalR-2.2.0.min.js").done(function() {
                            $.getScript(signalr_url + "/chat/hubs").done(function() {
                                deferred.resolve(true);
                            }).fail(function() {
                                console.log("Error loading chat hubs");
                                return deferred.reject(false);
                            });
                        }).fail(function() {
                            console.log("Error loading jquery signalR");
                            deferred.reject(false);
                        });
                    } else {
                        deferred.resolve(true);
                    }
                    return $timeout(function() {
                        return deferred.promise;
                    }, 2000);
                },
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
                    return $resource('' + signalr_url + '/chatapi/message/updateallmessages/:roomId', {}, {
                        put: {
                            method: 'PUT',
                            params: {
                                roomId: '@roomId',
                                userId: '@userId'
                            },
                            isArray: true,
                            headers: {
                                'Authorization': 'Bearer ' + webapi_token
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
                start: function() {
                    this.methods().client.onConnected = function() {
                        return console.log("onConnected");
                    };
                    this.methods().client.notifyUser = function() {
                        return console.log("notifyUser");
                    };
                    return $.connection.hub.start({
                        transport: ['webSockets', 'longPolling']
                    });
                },
                reconnect: function() {
                    console.log("reconnecting");
                    return $resource("" + signalr_url, {
                        method: 'ReAuthenticateWebApi'
                    });
                }
            };
        }
    ]);

}).call(this);
