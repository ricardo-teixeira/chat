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
(function() {
    // CHAT POPUP
    angular.module('ValueChat')
        .directive('chatPopup', ['ChatAPI', '$rootScope', '$timeout', '$filter', '$sanitize', function(ChatAPI, $rootScope, $timeout, $filter, $sanitize) {

            var template =
                "<div class='popup-box chat-popup slim-scrollbar' ng-class=\"{'popup-on': popup.unreadMessages > 0, 'popup-closed': !popup.toggle}\">"+
                "<div class='popup-head'>"+
                "<ul class='popup-head-left chat-navbar left'>"+
                "<li><a class='chat-navbar-brand' href='javascript:;' title='{{popup.participant[0].name}}'><span chat-status='popup.participant[0].status'></span> {{popup.participant[0].name | trim:true:21}}<div loading-dots ng-if='popup.typing'></div></a></li>"+
                "</ul>"+
                "<div class='popup-head-right'>"+
                "<ul class='chat-navbar popup-head-buttons right'>"+
                //"<li ng-class=\"{active: isActiveTab('popup-config')}\">"+
                //"<a href='javascript:;' ng-click=\"setActiveTab('popup-config')\"><i class='fa fa-cog'></i></a>"+
                //"</li>"+
                "<li class='chat-popup-toggle' ng-click='togglePopup()'>"+
                "<a href='javascript:;'><i class='fa fa-angle-down'></i></a>"+
                "</li>"+
                "<li class='chat-popup-close'>" +
                "<a href='javascript:;' ng-click='removePopup(popup.roomId)'><i class='fa fa-times'></i></a>"+
                "</li>"+
                "</ul>"+
                "</div>"+
                "</div>"+
                "<div class='tab-content' ng-show=\"isActiveTab('popup-config')\">"+
                "<ul>"+
                "<li><a href='javascript:;'><i class='fa fa-ban'></i> Bloquear usuário <switch class='pull-right' ng-model='config.block'></switch></a></li>"+
                "</ul>"+
                "</div>"+
                "<div class='popup-messages'>"+
                    "<div chat-loader ng-if='!popup.messages.length && !doneMessages || gettingMoreMessages'></div>"+
                    "<div class='direct-chat-messages' auto-scroll='popup.messages' auto-scroll-trigger='popup.typing' infinite-scroll='loadMoreMessages()' scroll-inverse='true'>"+
                        "<div ng-repeat=\"message in popup.messages | orderBy:'messageDate' track by message.messageDate\" class='direct-chat-msg animate-chat animated' ng-class=\"isMyMessage(message.senderId) ? 'me' : 'user'\">"+
                            "<img alt='message user image' class='direct-chat-img' dummy-image='isMyMessage(message.senderId) ? profile.photo : popup.participant[0].photo' dummy-text='isMyMessage(message.senderId) ? profile.name : popup.participant[0].name'>"+
                            "<div class='direct-chat-text' ng-bind-html='message.message | colonToSmiley'></div>"+
                            "<div ng-if='isMyMessage(message.senderId)' class='direct-chat-info clearfix'>"+
                                "<span class='direct-chat-timestamp'>"+
                                    "<i class='fa fa-check' ng-show='message.notification[0].readDate'></i>"+
                                    "<span ng-bind='message.messageDate | amCalendar'></span>"+
                                "</span>"+
                            "</div>"+
                        "</div>"+
                        "<div class='direct-chat-msg direct-typing-message user' ng-show='popup.typing'>"+
                            "<img alt='message user image' class='direct-chat-img' dummy-image='popup.participant[0].photo' dummy-text='popup.participant[0].name'>"+
                            "<div class='direct-chat-text'>"+
                                "<div loading-dots></div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                    "<div ng-show='errorLog(3)' class='error-log'>{{errorLog(3).message}}</div>"+
                "</div>"+
                "<div class='popup-messages-footer'>"+
                    // Browsers that support emoji
                    '<div ng-if="isSupported" class="popup-text-box" emoji-form emoji-message="emojiMessage" ng-click="setReadMessages()" ng-keypress="isTyping($event)" ng-disabled="errorLog(3)">'+
                        '<button id="emojibtn" class="button">'+
                            '<i class="fa fa-smile-o" aria-hidden="true"></i>'+
                        '</button>'+
                        '<textarea id="messageInput" ng-model="emojiMessage.messagetext" placeholder="Enviar uma mensagem"></textarea>'+
                        '<button id="sendbtn" class="button" ng-click="sendMessage()">'+
                            '<i class="fa fa-send" aria-hidden="true"></i>'+
                        '</button>'+
                    '</div>'+
                    // Browsers that does't support emoji correctly
                    '<div ng-if="!isSupported" class="popup-text-box">' +
                        '<textarea class="popup-textarea" cols="40" name="message" placeholder="Enviar uma mensagem" rows="10" ng-model="emojiMessage.messagetext" ng-keypress="isTyping($event)" ng-click="setReadMessages()" ng-disabled="errorLog(3)"></textarea>' +
                        '<button id="sendbtn" class="button" ng-click="sendMessage()">' +
                            '<i class="fa fa-send" aria-hidden="true"></i>' +
                        '</button>' +
                    '</div>' +
                "</div>"+
                "</div>";

            return {
                restrict: 'EA',
                require: '^chatSidebar',
                template: template,
                scope: {
                    popup: '=chatPopup',
                    index: '=popupIndex'
                },
                replace: true,
                tranclude: true,
                controller: ['$scope', '$filter', 'ChatAPI', function($scope, $filter, ChatAPI){

                    var optionsMsg = {
                        roomId: $scope.popup.roomId,
                        limit: 10,
                        offset: 0
                    }

                    $scope.doneMessages = false;
                    ChatAPI.message().get(optionsMsg).$promise.then(function(response) {
                        $scope.popup.messages = response.data;
                        $scope.doneMessages = true;
                    }, function(err) {
                        $scope.doneMessages = true;
                        console.log('Error: ', err.statusText);
                    });

                }],
                link: function(scope, element, attrs, ctrl) {

                    scope.profile = ctrl.profile;
                    scope.isSupported = ctrl.browser.support;

                    scope.errors = [];
                    scope.errorLog = function (errorCode) {
                        var error = scope.errors.filter(function (error) {
                            return error.code == errorCode;
                        });
                        return error[0];
                    }

                    scope.emojiMessage = {};
                    scope.emojiMessage.replyToUser = function(){
                        var len = scope.emojiMessage.messagetext.length;
                        if(len > 0)
                            scope.sendMessage();
                    };

                    var hasMoreMessages = true;
                    scope.gettingMoreMessages = false;
                    scope.loadMoreMessages = function () {
                        if (hasMoreMessages && !scope.gettingMoreMessages) {
                            var options = {
                                roomId: scope.popup.roomId,
                                limit: scope.popup.messages.length + 20,
                                offset: scope.popup.messages.length
                            };
                            scope.doneMessages = false;
                            // Stop other request until first is finished
                            scope.gettingMoreMessages = true;
                            ChatAPI.message().get(options).$promise.then(function (response) {
                                // Finish request flag
                                scope.gettingMoreMessages = false;
                                if (response.data.length == 0) {
                                    hasMoreMessages = false;
                                    return false;
                                }
                                angular.forEach(response.data, function (message) {
                                    scope.popup.messages.push(message);
                                });
                                scope.doneMessages = true;
                            }, function (err) {
                                scope.doneMessages = true;
                                console.log('Error: ', err.statusText);
                            });
                        }
                    };

                    // Remove and restroy current popup scope
                    scope.removePopup = function (id) {
                        scope.popup.popupActive = false;
                        ctrl.removePopup(id);
                        scope.$destroy();

                        // Remove flag when there's no more popover opened
                        if(ctrl.popups.length < 1)
                            $('body').removeClass('has-chat-popup-active')
                    }

                    scope.sendMessage = function () {
                        try {
                            var message = $filter('stripHTML')($sanitize(scope.emojiMessage.messagetext));
                            // var message = $filter('stripHTML')(scope.emojiMessage.messagetext);
                            var roomId = scope.popup.roomId;
                            if (message.length) {
                                ctrl.proxy.server.sendMessage(roomId, message).done(function () {
                                    scope.$apply(function () {
                                        scope.emojiMessage.messagetext = "";
                                    });
                                }).fail(function (err) {
                                    scope.errors.push({
                                        code: "3",
                                        message: "Erro ao enviar mensagem. Atualize a página e tente novamente."
                                    });
                                    console.log("Error: ", err);
                                });
                            }
                        } catch (err) {
                            scope.errors.push({
                                code: "3",
                                message: "Erro ao enviar mensagem. Atualize a página e tente novamente."
                            });
                            console.log("Error: ", err);
                        }
                    };

                    scope.setReadMessages = function () {
                        if (scope.popup.unreadMessages > 0) {
                            var options;
                            options = {
                                roomId: scope.popup.roomId,
                                userId: scope.profile.id
                            };
                            ChatAPI.updateallmessages().put(options).$promise.then(function () {
                                    ctrl.proxy.server.userReadMessage(options.roomId, options.userId, scope.profile.systemType).done(function () {
                                        $timeout(function () {
                                            // Reset unread messages counter of current room
                                            scope.popup.unreadMessages = 0;
                                            // Recalculate all unread messages
                                            var counter = 0;
                                            ctrl.contacts.forEach(function (contact) {
                                                if (contact.unreadMessages != void 0) {
                                                    return counter += contact.unreadMessages;
                                                }
                                            });
                                            // Save unread messages total into notifications counter
                                            $rootScope.chatNotifications = counter;

                                        }, 500);
                                    }).fail(function (e) {
                                        console.log("Error: ", e.statusText);
                                    });
                                },
                                function (error) {
                                }
                            );
                        }
                    };

                    var typingTimeout;
                    typingTimeout = void 0;

                    scope.isTyping = function (event) {
                        var roomId;
                        if (event.keyCode !== 13) {
                            roomId = scope.popup.roomId;
                            if (typingTimeout !== void 0) {
                                clearTimeout(typingTimeout);
                            }
                            typingTimeout = setTimeout(function () {
                                ctrl.proxy.server.userIsTyping(roomId, $rootScope.user.status_id);
                            }, 200);
                        } else {
                            if (!scope.isSupported) {
                                var len = scope.emojiMessage.messagetext.length;
                                if (len > 0) {
                                    scope.sendMessage();
                                }
                            }
                        }
                    };

                    // Remove element from DOM after scope is destroyed
                    scope.$on('$destroy', function () {
                        if ($(window).width() < 768) {
                            element.removeClass('chatSlideInLeft').addClass('chatSlideOutLeft');
                            $timeout(function() {
                                element.remove();
                            }, 1000);
                        } else {
                            element.remove();
                        }
                    });

                    // Starts popup open
                    scope.popup.toggle = true;

                    scope.isMyMessage = function (senderId) {
                        return senderId != scope.popup.participant[0].id;
                    }

                    // Highlight popup when user clicks contact already open
                    scope.$watch('popup.highlight', function (n) {
                        if (n) {
                            element.addClass('highlight');
                            setTimeout(function () {
                                element.removeClass('highlight');
                                scope.popup.highlight = false;
                                scope.$apply();
                            }, 1000)
                        }
                    });

                    // Close/Open current popup
                    scope.togglePopup = function () {
                        scope.popup.toggle = !scope.popup.toggle;
                    }

                    // Recalculate popover position after removing element from array
                    scope.$watch('index', function () {
                        calcPosition();
                    });

                    // Alternate popup animation on mobile devices
                    if($(window).width() < 768)
                        $(element).addClass('chatSlideInLeft');
                    else
                        $(element).addClass('chatSlideInUp');

                    // Narrow sidebar when focusing popup box
                    // element.on('click', function(){
                    //     $('.chat-sidebar, body').addClass('narrow-sidebar');
                    // });

                    // Highlight send button (mobile screens)
                    scope.$watch('emojiMessage.messagetext', function(message){
                        if(angular.isDefined(message)) {
                            if (message.length > 0)
                                angular.element('#sendbtn').addClass('active');
                            else
                                angular.element('#sendbtn').removeClass('active');
                        }
                    });

                    /**
                     * Recalculate popover position after removing element from array
                     * @function
                     */
                    function calcPosition() {
                        var index = scope.index;
                        var width = $(element).width();
                        var gutter = index * 15;
                        var firstOffset = 15;
                        var leftPosition = (width * index) + (gutter + firstOffset);

                        if (index == 0)
                            leftPosition = firstOffset;

                        $(element).css({
                            'left': leftPosition
                        });
                    }
                }
            }
        }])

        // SWITCH
        // Reference: https://github.com/xpepermint/angular-ui-switch
        .directive('switch', function(){
            return {
                restrict: 'AE',
                replace: true,
                transclude: true,
                require: '?ngModel',
                //scope: {},
                template: function(element, attrs) {
                    var html = '';
                    html += '<span';
                    html +=   ' class="switch' + (attrs.class ? ' ' + attrs.class : '') + '"';
                    html +=   attrs.ngModel ? ' ng-click="' + attrs.disabled + ' ? ' + attrs.ngModel + ' : ' + attrs.ngModel + '=!' + attrs.ngModel + (attrs.ngChange ? '; ' + attrs.ngChange + '()"' : '"') : '';
                    html +=   ' ng-class="{ checked:' + attrs.ngModel + ', disabled:' + attrs.disabled + ' }"';
                    html +=   '>';
                    html +=   '<small></small>';
                    html +=   '<input type="checkbox"';
                    html +=     attrs.id ? ' id="' + attrs.id + '"' : '';
                    html +=     attrs.name ? ' name="' + attrs.name + '"' : '';
                    html +=     attrs.ngModel ? ' ng-model="' + attrs.ngModel + '"' : '';
                    html +=     ' style="display:none" />';
                    html +=     '<span class="switch-text">'; /*adding new container for switch text*/
                    html +=     attrs.on ? '<span class="on">'+attrs.on+'</span>' : ''; /*switch text on value set by user in directive html markup*/
                    html +=     attrs.off ? '<span class="off">'+attrs.off + '</span>' : ' ';  /*switch text off value set by user in directive html markup*/
                    html += '</span>';
                    return html;
                }
            }
        })

        .directive("dummyImage", function () {
            return {
                restrict: "A",
                scope: {
                    width: "@?",
                    height: "@?",
                    dummyImage: "=?",
                    dummyText: "=",
                    bgcolor: "@?",
                    color: "@?",
                    randomColor: "@?"
                },
                link: function(scope, elem) {
                    var bgcolor, color, getDummy, getRandomColor, height, imgDummy, length, width;
                    getRandomColor = function() {
                        var hex, i, letters;
                        letters = '0123456789ABCDEF'.split('');
                        hex = '';
                        i = 0;
                        while (i < 6) {
                            hex += letters[Math.floor(Math.random() * 16)];
                            i++;
                        }
                        return hex;
                    };

                    bgcolor = scope.bgcolor || "EEEEEE";
                    color = scope.color || "AAAAAA";
                    if (scope.randomColor === 'true') {
                        bgcolor = getRandomColor();
                        color = "FFFFFF";
                    }

                    width = scope.width || 40;
                    height = scope.height || 40;
                    length = scope.length || 2;

                    if (scope.dummyImage === "" || scope.dummyImage === void 0) {
                        imgDummy = "assets/angular-chat-directive/assets/loader.gif";
                        elem.attr('src', imgDummy);
                    }

                    getDummy = function() {
                        if (scope.dummyImage === "" || scope.dummyImage === void 0) {
                            if (scope.dummyText != null) {
                                var str = scope.dummyText.substr(0, length);
                                var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
                                var to   = "aaaaaeeeeeiiiiooooouuuunc------";
                                for (var i=0, l=from.length ; i<l ; i++) {
                                    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                                }
                                imgDummy = "http://api-valuegaia.gaiacore.com.br/dummy/" + width + "x" + height + "/" + bgcolor + "/" + color + "/" + str;

                                elem.attr('src', imgDummy);
                                elem[0].onerror = function () {
                                    // place your error.png image instead
                                    this.src = 'assets/angular-chat-directive/assets/user_thumb.png';
                                };
                            }
                        } else {
                            return elem.attr('src', scope.dummyImage);
                        }
                    };

                    scope.$watchCollection('[dummyImage, dummyText]', function() {
                        return getDummy();
                    });
                }
            };
        })
        .directive("chatStatus", function() {
            return {
                restrict: 'EA',
                scope: {
                    status: '=chatStatus'
                },
                link: function(scope, element){

                    function getStatus(status) {
                        switch (status) {
                            case 1:
                                return "online";
                            case 2:
                                return "busy";
                            case 3:
                                return "offline";
                            case 4:
                                return "away";
                        }
                    };

                    scope.$watch('status', function(n, o){
                        var oldStatus = getStatus(o);
                        var newStatus = getStatus(n);
                        $(element)
                            .removeClass(oldStatus)
                            .addClass(newStatus);

                        if(!element.hasClass('chat-status-indicator'))
                            element.addClass('chat-status-indicator');
                    });
                }
            }
        })

        .directive('autoScroll', function() {
            return {
                restrict: 'EA',
                scope: {
                    list: '=autoScroll',
                    typing: '=autoScrollTrigger'
                },
                link: function(scope, element, attrs) {
                    attrs.stopScroll = attrs.stopScroll || false;

                    scope.$watch('typing', function(n){
                        if(n != void 0 && n != null){ scrollBottom(); }
                    });

                    scope.$watchCollection('list', function() {
                        if (!attrs.stopScroll)
                            scrollBottom();
                        attrs.stopScroll = false;
                    });

                    function scrollBottom(){
                        var scrollHeight;
                        scrollHeight = element.prop('scrollHeight');
                        $(element).animate({
                            scrollTop: scrollHeight
                        }, 100);
                    }
                }
            };
        })

        .directive('chatLoader', function() {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div class="chat-loader"><svg class="chat-loader-container first" width="35px" height="35px" viewBox="0 0 52 52"><circle class="chat-loader-path" /></svg><svg class="chat-loader-container second" width="35px" height="35px" viewBox="0 0 52 52"><circle class="chat-loader-path" /></svg></div>'
            };
        })

        .directive('focusOn', ['$timeout', function($timeout) {
            return function(scope, element, attrs) {
                scope.$watch(attrs.focusOn, function(n) {
                    if(n) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            };
        }])

        .directive('loadingDots', function() {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div class="loading-dots"><span></span><span></span><span></span></div>'
            };
        })

        .directive('infiniteScroll', [
            '$timeout', function($timeout) {
                return function(scope, elm, attr) {
                    var raw = elm[0];
                    elm.bind('scroll', function() {
                        if(attr.scrollInverse == 'true'){
                            if (raw.scrollTop == 0) {
                                scope.$apply(attr.infiniteScroll);
                                $timeout(function() {
                                    raw.scrollTop = 10;
                                }, 100);
                            }
                        } else {
                            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
                                scope.$apply(attr.infiniteScroll);
                        }
                    });
                };
            }
        ])

        .directive('chatPopover', ['$compile', function ($compile) {
            return {
                restrict: "EA",
                transclude: true,
                template: "<span ng-transclude></span>",
                scope: {
                    items: '=?popoverItems',
                    title: '@?',
                    content: '=?popoverContent'
                },
                link: function (scope, element, attrs) {

                    if(attrs.popoverItems) {
                        scope.$watch('items', function (newValue) {
                            if (newValue != undefined) {
                                RenderPopover();
                            }
                        });
                    } else {
                        RenderPopover();
                    }

                    function RenderPopover() {
                        var popoverTrigger = attrs.popoverTrigger || 'hover';
                        var popoverPlacement = attrs.popoverPlacement || 'bottom';

                        var popoverTemplate = $('<div class="chat-popover popover"><div class="arrow"></div><div class="popover-content"></div></div>');
                        if (attrs.title != undefined && attrs.title != '')
                            $(popoverTemplate).find('.popover-content').before('<h3 class="popover-title"></h3>');

                        var options = {
                            template: popoverTemplate,
                            content: $compile(scope.content)(scope),
                            placement: popoverPlacement,
                            trigger: popoverTrigger,
                            html: true,
                            title: scope.title
                        };

                        if (scope.items && scope.content) {
                            options.content = $compile(scope.content)(scope);
                        }
                        $(element).popover(options);
                    }
                }
            };
        }])

        .directive('popupGroup', ['$timeout', function ($timeout) {
            var template =  '<div class="popup-head" ng-class="{\'popup-on\': unreads > 0}"><i class="fa fa-comments"></i><span class="popup-group-count">{{contacts.length}}</span></div>'+
                            '<div class="chat-popover popover fade top in" style="width: 300px; left: -100px;">'+
                            '    <div class="arrow"></div>'+
                            '    <div class="popover-content">'+
                            '    <ul class="chat-contact-list ng-scope">'+
                            '    <li ng-repeat="contact in contacts track by $index" class="animate-list ng-scope" ng-class="{\'has-unread\': contact.unreadMessages > 0}" ng-click="openGroupedPopup(contact)">'+
                            '    <div class="left"><span class="contact-photo"><img dummy-image="contact.participant[0].photo" dummy-text="contact.participant[0].name"></span>'+
                            '    <span chat-status="contact.participant[0].status" class="ng-isolate-scope offline chat-status-indicator"></span>'+
                            '    </div>'+
                            '    <div class="right">'+
                            '    <h4 class="contact-name ng-binding" ng-bind-html="contact.participant[0].name | trim:true:28">Rose Mary da Rocha Oliveira</h4>'+
                            '    <div class="contact-last-message ng-binding" ng-bind-html="contact.lastMessage | trim:true:35 | colonToSmiley">dfgfd</div>'+
                            '    </div><i class="fa fa-times chat-popup-close" ng-click="removeFromGroup(contact)"></i></li>'+
                            '</ul>'+
                            '</div>'+
                            '</div>';

            return {
                require: '^chatSidebar',
                restrict: "EA",
                template: template,
                replace: false,
                transclude: true,
                scope: {
                    contacts: '=popupGroup',
                    unreads: '=?popupGroupUnreads'
                },
                link: function (scope, element, attrs, ctrl) {

                    scope.$watch('popupGroupUnreads', function(n){
                        if(n){
                            console.log("n", n)
                            scope.unreads = n;
                        }
                    });

                    element.on({
                        'click': function() {
                            element.find('.chat-popover').toggle();
                        }
                    });

                    // Don't close popover when clicking on items
                    element.find('.chat-popover').on({
                        'click': function() {
                            return false;
                        }
                    });

                    scope.$watch('contacts', function(n, o) {
                        if(n != undefined) {

                            function HorizontallyBound(parentDiv, childDiv) {
                                var parentRect = parentDiv.getBoundingClientRect();
                                var childRect = childDiv.getBoundingClientRect();

                                return parentRect.left <= childRect.left && parentRect.right >= childRect.right;
                            }

                            $(window).on('resize', function() {

                                if($(window).width() < 768)
                                    element.find('.chat-popover').hide();

                                if (ctrl.popups.length) {
                                    // Check if popup is outside window then group it
                                    var bound = HorizontallyBound($("body")[0], $(".chat-popup").get($(".chat-popup").length - 1));

                                    if (!bound) {
                                        var firstPopup = ctrl.popups[0];
                                        ctrl.popups.splice(0, 1);
                                        ctrl.popupsGrouped.push(firstPopup);
                                        scope.$apply();
                                    }
                                }

                                // Group popups if don't fit on screen
                                if (ctrl.popupsGrouped.length) {
                                    var chatPopupLimit;
                                    if (ctrl.popups.length)
                                        chatPopupLimit = ($(window).width() - $('.chat-sidebar').width()) / ($('.chat-popup').first().width() * (ctrl.popups.length + 1));
                                    else
                                        chatPopupLimit = ($(window).width() - $('.chat-sidebar').width()) / 275;

                                    chatPopupLimit = parseInt(chatPopupLimit);

                                    if (chatPopupLimit != undefined && chatPopupLimit > 0) {
                                        var firstPopup = ctrl.popupsGrouped[0];
                                        ctrl.popups.push(firstPopup);
                                        ctrl.popupsGrouped.splice(0, 1);
                                        scope.$apply();
                                    }
                                }
                            });

                            scope.$on('popupremoved', function() {

                                var chatPopupLimit = ($(window).width() - $('.chat-sidebar').width()) / ($('.chat-popup').first().width() * (ctrl.popups.length + 1));

                                if (chatPopupLimit != undefined && chatPopupLimit > 1) {
                                    if (ctrl.popupsGrouped.length) {
                                        var firstPopup = ctrl.popupsGrouped[0];
                                        ctrl.popupsGrouped.splice(0, 1);
                                        ctrl.popups.push(firstPopup);
                                        ctrl.getGroupUnreads();
                                    }
                                }
                            });

                            scope.openGroupedPopup = function(contact) {

                                var chatPopupLimit = ($(window).width() - $('.chat-sidebar').width()) / ($('.chat-popup').first().width() * (ctrl.popups.length + 1));
                                // If there's not space in screen, remove first popup e replace for the current
                                if (chatPopupLimit != undefined && chatPopupLimit < 1) {
                                    var firstPopup = ctrl.popups[0];
                                    ctrl.popups.splice(0, 1);
                                    ctrl.popupsGrouped.push(firstPopup);
                                    ctrl.getGroupUnreads();
                                }
                                // Set current popup grouped as active and append to popups array
                                contact.popupActive = true;
                                scope.contacts = scope.contacts.filter(function(c) {
                                    return c.roomId != contact.roomId;
                                });
                                ctrl.popups.push(contact);
                            }

                            scope.removeFromGroup = function(contact) {
                                // Set contact as inactive
                                contact.popupActive = false;
                                // Remove contact from array of grouped
                                scope.contacts = scope.contacts.filter(function(c) {
                                    return c.roomId != contact.roomId;
                                });
                                ctrl.getGroupUnreads();
                            }
                        }
                    });

                    scope.$watch('contacts.length', function(n, o) {
                        // Repositioning of grouped contacts popover
                        if(n != o){
                            var posTop = -(scope.contacts.length * 65);
                            element.find('.chat-popover').css('top', posTop - 10);
                            element.find('.popover-content').css('height', posTop * -1);
                            if(ctrl.popupsGrouped.length) {
                                $timeout(function(){
                                    var offset = $('.chat-popup').eq(ctrl.popups.length - 1).offset().left + 275 + 20;
                                    element.animate({'left': offset}, 200);
                                }, 100);
                                ctrl.getGroupUnreads();
                            }
                        }
                    })
                }
            };
        }])

        // FILTERS =============================
        .filter('trim', function () {
            return function (value, wordwise, max, tail) {
                if (!value) return '';

                max = parseInt(max, 10);
                if (!max) return value;
                if (value.length <= max) return value;

                value = value.substr(0, max);
                if (wordwise) {
                    var lastspace = value.lastIndexOf(' ');
                    if (lastspace != -1) {
                        value = value.substr(0, lastspace);
                    }
                }
                return value + (tail || '…');
            };
        })

        // HIGHLIGHT TEXT IN SEARCH FILTER
        .filter('highlight', ['$sce', function($sce) {
            return function(text, phrase) {
                if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
                    '<span class="highlighted">$1</span>')
                return $sce.trustAsHtml(text)
            }
        }])

        .filter('html', ['$sce', function($sce){
            return function(input){
                return $sce.trustAsHtml(input);
            }
        }])

        .filter('stripHTML', function(){
            return function(text){
                var regex = /(<([^>]+)>)/ig;
                return text.replace(regex, "");
            }
        })

}).call(this);
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
