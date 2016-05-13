(function () {

    angular.module('ValueChat', ['ngResource', 'ngSanitize', 'angularMoment', 'ngAnimate', 'emojiApp']);

    // CHAT SIDEBAR
    angular.module('ValueChat')
        .directive('chatSidebar', ['$rootScope', function ($rootScope) {
            var template =
                '<div class="error-log" ng-if="vm.errorLog(1)"><i class="fa fa-chain-broken" aria-hidden="true"></i>{{vm.errorLog(1).message}}</div>' +
                '<div class="chat-sidebar-container" ng-if="!vm.errorLog(1)">' +
                '<div class="chat-sidebar-header">' +
                '<ul class="chat-navbar left">' +
                "{{currentStatus | json}}" +
                '<li ng-class="{active: isActiveTab(\'status\')}">' +
                '<a class="chat-navbar-brand" ng-click="setActiveTab(\'status\')">' +
                '<span chat-status="vm.currentStatus.id"></span> {{vm.currentStatus.name}} <i class="fa fa-angle-down"></i>' +
                '</a>' +
                '</li>' +
                '</ul>' +
                '<ul class="chat-navbar right">' +
                '<li ng-if="!vm.errorLog(2)" ng-class="{active: isActiveTab(\'search\')}"><a href="javascript:;" ng-click="setActiveTab(\'search\')"><i class="fa fa-search"></i></a></li>' +
                '<li ng-class="{active: isActiveTab(\'config\')}"><a href="javascript:;" ng-click="setActiveTab(\'config\')"><i class="fa fa-cog"></i></a></li>' +
                '<li><a class="chat-toggle" href="javascript:;" ng-click="toggleChat()"><i class="fa fa-chevron-right"></i></a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="chat-body slim-scrollbar-dark">' +
                '<div class="tab-content" ng-show="isActiveTab(\'status\')">' +
                '<ul>' +
                '<li ng-repeat="status in vm.statusList"><a href="javascript:;" ng-click="vm.changeStatus(status.id)"><span chat-status="status.id"></span>{{status.name}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<div class="tab-content" ng-show="isActiveTab(\'search\')">' +
                '<input class="search-input" placeholder="Digite o nome do contato" type="text" ng-model="searchBy.text" focus-on="isActiveTab(\'search\')" ng-keyup="vm.searchContact(searchBy.text, contactlist.length)" min-length="3">' +
                '</div>' +
                '<div class="tab-content full" ng-show="isActiveTab(\'config\')">' +
                '<ul>' +
                '<li><a href="javascript:;"><i class="fa fa-music"></i>Som do bate-papo <switch class="pull-right" ng-model="vm.settings.sound"></switch></a></li>' +
                '<li><a href="javascript:;"><i class="fa fa-flag-o"></i>Notificações no navegador <switch class="pull-right" ng-model="vm.settings.notification"></switch></a></li>' +
                '</ul>' +
                '</div>' +
                // Search results
                '<ul class="chat-contact-list search-results">' +
                '<li ng-repeat="search in vm.searchResult | orderBy:\'-unreadMessages\':\'-messageDate\'" ng-class="{\'has-unread\': search.unreadMessages > 0, \'has-popup\': contact.popupActive}" ng-click="openPopup(search)">' +
                '<div class="left">' +
                '<img class="contact-photo" dummy-image="search.participant[0].photo" dummy-text="search.participant[0].name"><span chat-status="search.participant[0].status"></span>' +
                '</div>' +
                '<div class="right">' +
                '<h4 class="contact-name" ng-bind-html="search.participant[0].name | trim:true:35 | highlight:searchBy.text"></h4>' +
                '<div class="contact-last-message" ng-bind-html="search.lastMessage | trim:true:35 | colonToSmiley"></div>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                // Error logs
                '<div class="error-log" ng-if="vm.errorLog(2)"><i class="fa fa-chain-broken" aria-hidden="true"></i>{{vm.errorLog(2).message}}</div>' +
                // Contacts
                '<ul ng-if="!vm.errorLog(2)" class="chat-contact-list" infinite-scroll="vm.getContacts()">' +
                '<li ng-repeat="contact in contactlist = (vm.contacts | filter: searchBy.text | orderBy: \'-messageDate\')" chat-popover popover-items="contact.participant[0]" popover-placement="left" popover-content="vm.popoverContactTpl" class="animate-list" ng-class="{\'has-unread\': contact.unreadMessages > 0, \'has-popup\': contact.popupActive}" ng-click="openPopup(contact)">' +
                '<div class="left">' +
                '<span class="contact-photo"><img dummy-image="contact.participant[0].photo" dummy-text="contact.participant[0].name"></span><span chat-status="contact.participant[0].status"></span>' +
                '</div>' +
                '<div class="right">' +
                '<h4 class="contact-name" ng-bind-html="contact.participant[0].name | trim:true:35 | highlight:searchBy.text"></h4>' +
                '<div class="contact-last-message" ng-bind-html="contact.lastMessage | trim:true:35 | colonToSmiley"></div>' +
                '</div>' +
                '</li>' +
                '<div ng-show="!contactlist.length && vm.doneContacts || !contactlist.length && vm.searchResults.length" class="error-log"><i class="fa fa-users"></i>Nenhum contato encontrado</div>' +
                '<div chat-loader ng-show="vm.gettingContacts || !vm.doneContacts"></div>' +
                '</ul>' +
                '</div>' +
                '<div class="chat-sidebar-footer">' +
                '<ul class="chat-navbar">' +
                '<li class="active"><a href="javascript:;" ng-click="setActiveTab(\'contacts\')"><i class="fa fa-comments"></i></a></li>' +
                //'<li ng-if="!vm.errorLog(2)"><a href="javascript:;"><i class="fa fa-user"></i></a></li>' +
                //'<li><a href="javascript:;"><i class="fa fa-home"></i></a></li>' +
                //'<li><a href="javascript:;"><i class="fa fa-link"></i></a></li>' +
                //'<li><a href="javascript:;"><i class="fa ga-gaia-01"></i></a></li>' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '<div class="chat-popup-container">' +
                // POPUPS
                '<div ng-repeat="popup in vm.popups track by popup.roomId" chat-popup="popup" popup-index="$index"></div>' +
                // POPUPS GROUP
                '<div ng-show="vm.popupsGrouped.length" class="popup-group" popup-group="vm.popupsGrouped" popup-group-unreads="vm.groupedUnreads"></div>' +
                '</div>';

            return {
                restrict: 'EA',
                template: template,
                replace: false,
                scope: {
                    profile: '=chatProfile'
                },
                controller: ['$scope', '$timeout', 'ChatAPI', function ($scope, $timeout, ChatAPI) {

                    var vm = this;

                    vm.isConnected = ChatAPI.isConnected;
                    vm.errors = [];

                    // Sidebar contact popover with more information
                    vm.popoverContactTpl =  '<div class="chat-contact-info">' +
                                            '<div class="popover-media"><span class="contact-photo"><img dummy-image="items.photo" dummy-text="items.name" width="85" height="85"/></span></div>' +
                                            '<div class="contact-info">' +
                                            '<h4 class="contact-name">{{items.name}}</h4>' +
                                            '<span class="contact-company">{{items.company}}</span>' +
                                            // '<span class="contact-email" ng-if="items.email">{{items.email}}</span>' +
                                            '</div>' +
                                            '</div>';

                    // Default audio when receiving messages
                    var audio = new Audio('assets/angular-chat-directive/assets/blob.wav');

                    var playSound = function () {
                        if(audio.canPlayType("audio/wav") === "probably" || audio.canPlayType("audio/wav") === "maybe") {
                            audio.play();
                        } else {
                            console.log("Your browser dont support playing audio files");
                            return false;
                        }
                    }

                    // Shows specific error code
                    vm.errorLog = function (errorCode) {
                        var error = vm.errors.filter(function (error) {
                            return parseInt(error.code) === parseInt(errorCode);
                        });
                        if (error.length)
                            return error[0];
                        else
                            return false;
                    }

                    // Error message when chat connection fails
                    $scope.$watch('vm.isConnected', function(n){
                        if(!n) {
                            vm.errors.push({code: '1', message: 'Erro ao conectar ao chat. Por favor, tente mais tarde.'});
                        }
                    })

                    // request permission on page load
                    document.addEventListener('DOMContentLoaded', function () {
                        if (Notification.permission !== "granted"){
                            Notification.requestPermission();
                        }
                    });

                    // Push Notifications
                    function notifyMe(contact, message) {
                        if (!Notification) {
                            console.log('Desktop notifications not available in your browser.');
                            return;
                        }

                        if (Notification.permission !== "granted") {
                            Notification.requestPermission();
                        } else {
                            var notification = new Notification(contact.name, {
                                icon: contact.photo,
                                body: message,
                                //onclick = function () {}
                            });
                        }
                    }

                    // Check Browser compatibility
                    var browser = {};
                    browser.check = (function (){
                        var N= navigator.appName, ua= navigator.userAgent, tem;
                        var M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);
                        if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) {M[2]=tem[1];}
                        M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];

                        if(M[0] === "MSIE" || M[0] === "Trident" || /Edge/.test(navigator.userAgent)) {
                            if (M[0] === "Trident" && M[1] < 7 || M[0] === "MSIE" && M[1] < 9  ) {
                                vm.errors.push({
                                    code: '1',
                                    message: 'Seu navegador não suporta devidamente as funcionalidades do chat. Por favor, tente utilizar Chrome ou Firefox'
                                });
                                return;
                            }
                            browser.support = false;
                        } else {
                            browser.support = true;
                        }
                        return M;
                    })();

                    vm.browser = browser;

                    // Add watcher to profile id that should only change once indicating tha data is set
                    $scope.$watchCollection('profile.id', function(newVal) {

                        if (newVal !== void 0) {
                            vm.profile = $scope.profile;
                            vm.contacts = [];
                            vm.popups = [];
                            vm.popupsGrouped = [];
                            vm.groupedUnreads = 0;

                            // User profile data
                            var userInfo = {
                                id: vm.profile.id,
                                limit: 20,
                                offset: 0
                            }

                            // Check chat connection
                            if(ChatAPI.isConnected) {
                                // Get number of messages notifications
                                ChatAPI.notify().get({id: userInfo.id}).$promise.then(
                                    function (response) {
                                        return $rootScope.chatNotifications = response.count;
                                    }, function (err) {
                                        $rootScope.chatNotifications = 0;
                                        vm.errors.push({code: "1", message: 'Erro ao conectar ao chat'});
                                    }
                                );
                            }
                            // Settings
                            vm.settings = {
                                userId : userInfo.id,
                                sound: false,
                                notification: false
                            };

                            ChatAPI.loadSettings().get({userId: userInfo.id}).$promise.then(function (response) {                            
                                if (response !== void 0) {
                                    var data = {
                                        sound: response.sound,
                                        notification: response.notification
                                    }
                                    angular.merge(vm.settings, data);
                                }
                            });

                            // Save user's settings
                            $scope.$watch('vm.settings', function(n, o){
                                if(n != o)                               
                                    ChatAPI.saveSettings().post(n);
                            }, true);

                            vm.removePopup = function (id) {
                                vm.popups = vm.popups.filter(function (popup) {
                                    return popup.roomId != id;
                                });
                                $scope.$broadcast('popupremoved');
                            }

                            var blockRequest = false;

                            // Request list of contacts
                            vm.getContacts = function(){
                                if (vm.contactsCount > vm.contacts.length && !blockRequest) {
                                    var options = {
                                        id: vm.profile.id,
                                        limit: vm.contacts.length + 10,
                                        offset: vm.contacts.length
                                    }
                                    blockRequest = vm.gettingContacts = true;
                                    ChatAPI.contact().get(options).$promise.then(function (response) {
                                        response.data.forEach(function(contact){
                                            vm.contacts.push(contact)
                                        });
                                        blockRequest = vm.gettingContacts = false;
                                    }, function (err) {
                                        vm.errors.push({code: "2", message: "Erro ao carregar contatos: " + err.statusText});
                                        console.log('Error: ', err.statusText);
                                    });
                                }
                            }

                            // List of status options
                            vm.statusList = [
                                {id: 1, name: 'Online', active: true},
                                {id: 2, name: 'Ocupado', active: false},
                                {id: 3, name: 'Offline', active: false},
                                {id: 4, name: 'Ausente', active: false}
                            ];

                            // Return status based on id parameter
                            vm.getStatus = function (statusId) {
                                var status = vm.statusList.filter(function(s) {
                                    return s.id == statusId;
                                });

                                if (!status.length) {
                                    // If user don't have status saved, set Online as default
                                    return vm.statusList[0];
                                }

                                return status[0];
                            }

                            vm.currentStatus = {};
                            vm.currentStatus = vm.getStatus(vm.profile.status_id);

                            vm.changeStatus = function (statusId) {
                                vm.currentStatus = vm.getStatus(statusId);
                                vm.profile.status_id = statusId;
                                vm.proxy.server.changeStatus(statusId);
                                $rootScope.$broadcast('changestatus');
                            };

                            try {

                                vm.proxy = ChatAPI.methods();

                                // Check if hubs and signalR are connected
                                if (vm.proxy != void 0) {

                                    ChatAPI.start().done(function () {
                                        return vm.proxy.server.connect(vm.profile.name, vm.profile.id, vm.profile.status_id, vm.profile.systemType);
                                    });

                                    vm.doneContacts = false;
                                    ChatAPI.contact().get(userInfo).$promise.then(function (response) {
                                        vm.contactsCount = response.count;
                                        vm.contacts = response.data;
                                        vm.doneContacts = true;
                                    }, function (err) {
                                        if(err.status == 401)
                                            err.statusText = "Não autorizado";
                                        vm.errors.push({code: "2", message: "Erro ao carregar contatos: " + err.statusText + ". Recarregue a página ou efetue login novamente."});
                                        vm.doneContacts = false;
                                        console.log('Error: ', err.statusText);
                                    });

                                    // Search for contacts
                                    vm.searchContact = function(name, filterSize) {
                                        var options;
                                        vm.searchResult = [];
                                        // Search for contacts inside current list, if is not found, request to server
                                        if (filterSize === 0) {
                                            options = {
                                                id: vm.profile.id,
                                                name: name,
                                                limit: 5,
                                                offset: 0
                                            };
                                            return ChatAPI.getuserbyname().get(options).$promise.then(function(response) {
                                                return vm.searchResult = response.data;
                                            }, function(error) {
                                                return console.log(error.statusText);
                                            });
                                        }
                                    };

                                    // Count the number of messages unread inside contacts grouped tab
                                    vm.getGroupUnreads = function() {
                                        $timeout(function(){
                                            if(vm.popupsGrouped.length){
                                                vm.groupedUnreads = 0;
                                                vm.popupsGrouped.forEach(function (contact) {
                                                    vm.groupedUnreads += contact.unreadMessages;
                                                });
                                                return vm.groupedUnreads;
                                            }
                                        }, 500);
                                    }

                                    // Append new message from contact to popup
                                    vm.proxy.on("receiveMessage", function (roomId, sourceId, message, increment) {
                                        vm.getGroupUnreads();

                                        // Play sound if is enable and message came from contact
                                        if(vm.settings.sound && sourceId != vm.profile.id)
                                            playSound();

                                        var contact = vm.contacts.filter(function (c) {
                                            return c.roomId == roomId;
                                        });

                                        if (contact[0] != void 0 && sourceId !== vm.profile.id) {
                                            $timeout(function(){
                                                $scope.$apply(function () {
                                                    contact[0].lastMessage = message.message;
                                                    contact[0].unreadMessages++;
                                                    $rootScope.chatNotifications++;
                                                });
                                                if(vm.settings.notification)
                                                    notifyMe(contact[0].participant[0], message.message);
                                            }, 0)
                                        }

                                        vm.popups.forEach(function(popup){
                                            if (popup.roomId === roomId) {
                                                popup.messages.splice(0, 0, message);
                                                return true;
                                            }
                                        });

                                    });

                                    // Notify user when contact is typing from the other side
                                    vm.proxy.on("receiveTyping", function (data, roomId, sourceId) {
                                        var contact = vm.contacts.filter(function (c) {
                                            return c.participant[0].id == sourceId;
                                        });

                                        var lastMessage;
                                        if (contact[0] != void 0) {
                                            if (contact[0].roomId === roomId && sourceId !== $scope.profile.id) {
                                                $scope.$apply(function () {
                                                    lastMessage = contact[0].lastMessage;
                                                    contact[0].lastMessage = data + '...';
                                                    $timeout(function () {
                                                        contact[0].lastMessage = lastMessage;
                                                    }, 500);
                                                });
                                            }
                                        }

                                        vm.popups.forEach(function(popup){
                                            if (popup.roomId === roomId && sourceId !== $scope.profile.id) {
                                                popup.typing = data;
                                                $timeout(function () {
                                                    popup.typing = false;
                                                }, 2000);
                                                return true;
                                            }
                                        });
                                    });

                                    // Sets all unread messages as read
                                    vm.proxy.on("updateReadMessage", function (userId, systemType, date) {
                                        vm.popups.forEach(function (popup) {
                                            popup.messages.forEach(function(message){
                                                if (message.senderId != $scope.profile.id) {
                                                    if (message.notification[0].readDate == void 0 || message.notification[0].readDate == null)
                                                        message.notification[0].readDate = date;
                                                }
                                            });
                                        });
                                    });

                                    // Watch for status change
                                    vm.proxy.on("userStatus", function(data) {
                                        return $scope.$apply(function() {
                                            angular.forEach(vm.contacts, function(contact) {
                                                if (contact.participant[0].id === data.id) {
                                                    return contact.participant[0].status = data.chatStatus;
                                                }
                                            });
                                        });
                                    });

                                    // Push new contact to the list
                                    vm.proxy.on("updateContactList", function(contact) {
                                        // Remove logged user from response
                                        contact.participant.splice(0, 1);

                                        return $scope.$apply(function() {
                                            // Append new contact to the list
                                            vm.contacts.splice(0, 0, contact);
                                        });

                                    });
                                }
                            } catch(e){
                                vm.errors.push({code: "1", message: 'Erro ao conectar ao chat'});
                            }

                        }
                    }, true);
                }],
                controllerAs: 'vm',
                link: function(scope, element, attrs, ctrl) {

                    scope.openPopup = function(contact) {

                        if (ctrl.popupsGrouped.length) {
                            var index = ctrl.popupsGrouped.indexOf(contact);
                            if(index > -1){
                                var firstPopup = ctrl.popups[0];
                                ctrl.popupsGrouped.splice(index, 1);
                                ctrl.popups.splice(0, 1);

                                ctrl.popupsGrouped.push(firstPopup);
                                ctrl.popups.push(contact);
                            }
                        }

                        if(ctrl.popups.length > 0)
                            var chatPopupLimit = ($(window).width() - $(element).width()) / ($('.chat-popup').first().width() * (ctrl.popups.length + 1));

                        if (!contact.popupActive) {
                            if (chatPopupLimit != undefined && chatPopupLimit < 1) {
                                // Remove first popup from popups array
                                var firstPopup = ctrl.popups[0];
                                ctrl.popups.splice(0, 1);

                                // Append popup removed to popupsGrouped
                                ctrl.popupsGrouped.push(firstPopup);

                                // Append new popup to popups array
                                ctrl.popups.push(contact);

                            } else {
                                ctrl.popups.push(contact);
                            }
                            contact.popupActive = true;
                        }
                        contact.highlight = true;

                        // Adds flag indicating popover opened
                        $('body').addClass('has-chat-popup-active')
                    }

                    // TABS =======================================

                    scope.tabActive = null;

                    scope.setActiveTab = function(tab) {
                        if(scope.tabActive == tab){
                            // Toggle tab if is already active
                            scope.tabActive = ''
                        } else {
                            scope.tabActive = tab
                        }
                    }

                    ctrl.setActiveTab = scope.setActiveTab;

                    scope.isActiveTab = function(tab) {
                        if(scope.tabActive != null)
                            return (tab == scope.tabActive) ? true : false
                    }

                    scope.toggleChat = function() {
                        element.toggleClass('open closed')
                        if(element.hasClass('open')) {
                            element.addClass('open').removeClass('closed');
                            $('body').addClass('has-chat-sidebar-active');
                        } else {
                            element.addClass('closed').removeClass('open');
                            $('body').removeClass('has-chat-sidebar-active');
                        }
                    }

                    // Add flat class to body elemento if chat started open
                    if(element.hasClass('open'))
                        $('body').addClass('has-chat-sidebar-active')

                    // MOBILE =======================================
                    // Makes sidebar follow navegation menu (passed to chatAttachTo directive)
                    attrs.$observe('chatAttachTo', function(el){
                        if(el) {
                            //Attach sidebar to the element specified
                            var $attached = $(el).first();
                            // Check if element exist
                            if ($attached != void 0) {
                                $(document).ready(function () {
                                    var attachHeight = $attached.height();
                                    $(element).css('top', attachHeight);
                                    $(window).bind('scroll', function () {
                                        if ($(window).scrollTop() > attachHeight) {
                                            $(element).css('top', '0px');
                                        }
                                        else if ($(window).scrollTop() < attachHeight) {
                                            $(element).css('top', attachHeight - $(window).scrollTop());
                                        }
                                    });
                                });
                            }
                        }
                    });

                    // Toggle sidebar
                    attrs.$observe('chatToggle', function(el){
                        if(el) {
                            $(el).on("click", function() {
                                scope.toggleChat();
                            })
                        }
                    });

                    // Shrink sidebar when user click in a popup box
                    // element.on('mouseenter', '.chat-body', function () {
                    //         element.removeClass('narrow-sidebar');
                    //         $('body').removeClass('narrow-sidebar');
                    //     }
                    // );
                }
            }
        }]);

}).call(this);