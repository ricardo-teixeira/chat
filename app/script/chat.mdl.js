(function(){

    angular.module('ValueChat', ['ngResource', 'ngSanitize', 'angularMoment', 'ngAnimate']);

    // CHAT SIDEBAR
    angular.module('ValueChat')
        .directive('chatSidebar', ['$rootScope', function($rootScope){
            var template =
                "<div class='chat-sidebar-container'>"+
                    "<div class='chat-sidebar-header'>"+
                        "<ul class='chat-navbar left'>"+
                            "{{currentStatus | json}}"+
                            "<li ng-class=\"{active: isActiveTab('status')}\">"+
                                "<a class='chat-navbar-brand' ng-click=\"setActiveTab('status')\">"+
                                    "<span chat-status='vm.currentStatus.id'></span> {{vm.currentStatus.name}} <i class='fa fa-angle-down'></i>"+
                                "</a>"+
                            "</li>"+
                        "</ul>"+
                        "<ul class='chat-navbar right'>"+
                            "<li ng-if='!vm.errorLog(2)' ng-class=\"{active: isActiveTab('search')}\"><a href='#' ng-click=\"setActiveTab('search')\"><i class='fa fa-search'></i></a></li>"+
                            "<li ng-class=\"{active: isActiveTab('config')}\"><a href='#' ng-click=\"setActiveTab('config')\"><i class='fa fa-cog'></i></a></li>"+
                            "<li><a class='chat-toggle' href='#' ng-click='toggleChat()'><i class='fa fa-chevron-right'></i></a></li>"+
                        "</ul>"+
                    "</div>"+
                    "<div class='chat-body slim-scrollbar-dark'>"+
                        "<div class='tab-content' ng-show=\"isActiveTab('status')\">"+
                            "<ul>"+
                                "<li ng-repeat='status in vm.statusList'><a href='#' ng-click='vm.changeStatus(status.id)'><span chat-status='status.id'></span>{{status.name}}</a></li>"+
                            "</ul>"+
                        "</div>"+
                        "<div class='tab-content' ng-show=\"isActiveTab('search')\">"+
                            "<input class='search-input' placeholder='Digite o nome do contato' type='text' ng-model='searchBy.text' focus-on=\"isActiveTab('search')\" ng-keyup='vm.searchContact(searchBy.text, contactlist.length)' min-length='3'>"+
                        "</div>"+
                        "<div class='tab-content full' ng-show=\"isActiveTab('config')\">"+
                            "<ul>"+
                                "<li><a href='#'><i class='fa fa-music'></i>Som do bate-papo <switch class='pull-right' ng-model='vm.chatConfig.sound'></switch></a></li>"+
                                "<li><a href='#'><i class='fa fa-flag-o'></i>Notificações no navegador <switch class='pull-right' ng-model='vm.chatConfig.notifications'></switch></a></li>"+
                            "</ul>"+
                        "</div>"+
                        // Search results
                        "<ul class='chat-contact-list search-results'>"+
                            "<li ng-repeat='search in vm.searchResult | orderBy:\"-unreadMessages\":\"-messageDate\"' ng-class=\"{'has-unread': search.unreadMessages > 0, 'has-popup': contact.popupActive}\" ng-click='openPopup(search)'>"+
                                "<div class='left'>"+
                                    "<img class='contact-photo' dummy-image='search.participant[0].photo' dummy-text='search.participant[0].name'><span chat-status='search.participant[0].status'></span>"+
                                "</div>"+
                                "<div class='right'>"+
                                    "<h4 class='contact-name' ng-bind-html='search.participant[0].name | trim:true:28 | highlight:searchBy.text'></h4>"+
                                    "<div class='contact-last-message' ng-bind-html='search.lastMessage | trim:true:28 | html'></div>"+
                                "</div>"+
                            "</li>"+
                        "</ul>"+
                        // Error logs
                        "<div class='error-log' ng-if='vm.errorLog(2)'>{{vm.errorLog(2).message}}</div>"+
                        // Contacts
                        "<ul ng-if='!vm.errorLog(2)' class='chat-contact-list' infinite-scroll='vm.getContacts()'>"+
                            "<li ng-repeat='contact in contactlist = (vm.contacts | filter: searchBy.text | orderBy: \"-messageDate\")' chat-popover popover-items='contact.participant[0]' popover-placement='left' popover-content='vm.popoverContactTpl' class='animate-list' ng-class=\"{'has-unread': contact.unreadMessages > 0, 'has-popup': contact.popupActive}\" ng-click='openPopup(contact)'>"+
                                "<div class='left'>"+
                                    "<span class='contact-photo'><img dummy-image='contact.participant[0].photo' dummy-text='contact.participant[0].name'></span><span chat-status='contact.participant[0].status'></span>"+
                                "</div>"+
                                "<div class='right'>"+
                                    "<h4 class='contact-name' ng-bind-html='contact.participant[0].name | trim:true:28 | highlight:searchBy.text'></h4>"+
                                    "<div class='contact-last-message' ng-bind-html='contact.lastMessage | trim:true:28 | html'></div>"+
                                "</div>"+
                            "</li>"+
                            "<div ng-show='!contactlist.length && vm.doneContacts && vm.searchResults.length' class='error-log'><i class='fa fa-users'></i>Você ainda não possui contatos</div>"+
                            "<div chat-loader ng-show='vm.gettingContacts || !vm.doneContacts'></div>"+
                        "</ul>"+
                    "</div>"+
                    "<div class='chat-sidebar-footer'>"+
                        "<ul class='chat-navbar'>"+
                            "<li class='active'><a href='#' ng-click=\"setActiveTab('contacts')\"><i class='fa fa-comments'></i></a></li>"+
                            //"<li ng-if='!vm.errorLog(2)'><a href='#'><i class='fa fa-user'></i></a></li>"+
                            //"<li><a href='#'><i class='fa fa-home'></i></a></li>"+
                            //"<li><a href='#'><i class='fa fa-link'></i></a></li>"+
                            //"<li><a href='#'><i class='fa ga-gaia-01'></i></a></li>"+
                        "</ul>"+
                    "</div>"+
                "</div>"+
                "<div class='chat-popup-container' ng-transclude>"+
                    //"<div class='popup-group' title='testet' chat-popover popover-placement='top'><i class='fa fa-comments'></i><span class='popup-group-count'>3 {{vm.contacts[0].participant[0].name}}<span></div>"+
                    "<div ng-show='vm.popupsGrouped.length' class='popup-group' popup-group='vm.popupsGrouped' popup-group-unreads='vm.groupedUnreads'></div>"+
                    "<div ng-repeat='popup in vm.popups track by popup.roomId' chat-popup='popup' popup-index='$index'></div>"+
                "</div>";

            return {
                restrict: 'EA',
                template: template,
                replace: false,
                transclude: true,
                scope: {
                    profile: '=chatProfile'
                },
                controller: ['$scope', '$timeout', 'ChatAPI', function($scope, $timeout, ChatAPI){

                    var vm = this;

                    vm.popoverContactTpl =
                                            "<div class='chat-contact-info'>" +
                                            "<div class='popover-media'><span class='contact-photo'><img dummy-image='items.photo' dummy-text='items.name' width='85' height='85'/></span></div>" +
                                            "<div class='contact-info'>" +
                                            "<h4 class='contact-name'>{{items.name}}</h4>" +
                                            "<span class='contact-company'>{{items.company}}</span>" +
                                            "<span class='contact-email' ng-if='items.email'>{{items.email}}</span>" +
                                            "</div>" +
                                            "</div>";

                    vm.chatConfig = {
                        sound: false,
                        notifications: false
                    }

                    var audio = new Audio('http://www.mscs.mu.edu/~mikes/174/demos/Win98sounds/Utopia%20Critical%20Stop.wav');

                    vm.errors = [];
                    vm.errorLog = function(errorCode) {
                        var error = vm.errors.filter(function(error){
                            return error.code == errorCode;
                        });
                        return error[0];
                    }

                    // request permission on page load
                    document.addEventListener('DOMContentLoaded', function () {
                        if (Notification.permission !== "granted")
                            Notification.requestPermission();
                    });

                    // Push Notifications
                    function notifyMe(contact, message) {
                        if (!Notification) {
                            console.log('Desktop notifications not available in your browser.');
                            return;
                        }

                        if (Notification.permission !== "granted")
                            Notification.requestPermission();
                        else {
                            var notification = new Notification(contact.name, {
                                icon: contact.photo,
                                body: message,
                                //onclick = function () {}
                            });
                        }
                    }



                    $scope.$watchCollection('profile.id', function(newVal) {

                        if (newVal != void 0) {
                            vm.profile = $scope.profile;
                            vm.contacts = [];
                            vm.popups = [];
                            vm.popupsGrouped = [];
                            vm.groupedUnreads = 0;

                            var cantactOptions = {
                                id: vm.profile.id,
                                limit: 10,
                                offset: 0
                            }

                            vm.removePopup = function (id) {
                                vm.popups = vm.popups.filter(function (popup) {
                                    return popup.roomId != id;
                                });
                                $scope.$broadcast('popupremoved');
                            }

                            var blockRequest = false;
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

                            // Status
                            vm.statusList = [
                                {id: 1, name: 'Online', active: true},
                                {id: 2, name: 'Ocupado', active: false},
                                {id: 3, name: 'Offline', active: false},
                                {id: 4, name: 'Ausente', active: false}
                            ];

                            vm.getStatus = function(statusId) {
                                var status = vm.statusList.filter(function(sts) {
                                    return sts.id == statusId;
                                });
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

                                    ChatAPI.start({transport: ['webSockets', 'longPolling']}).done(function () {
                                        return vm.proxy.server.connect(vm.profile.name, vm.profile.id, vm.profile.status_id, vm.profile.systemType);
                                    });

                                    vm.doneContacts = false;
                                    ChatAPI.contact().get(cantactOptions).$promise.then(function (response) {
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

                                    vm.searchContact = function(name, filterSize) {
                                        var options;
                                        vm.searchResult = [];
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

                                    vm.proxy.on("receiveMessage", function (roomId, sourceId, message, increment) {                                                                                
                                        vm.getGroupUnreads();

                                        // Play sound if is enable and message came from contact
                                        if(vm.chatConfig.sound && sourceId != vm.profile.id)
                                            audio.play();

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
                                                if(vm.chatConfig.notifications)
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
                                                    }, 1000);
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

                                    vm.proxy.on("userStatus", function(data) {
                                        return $scope.$apply(function() {
                                            angular.forEach(vm.contacts, function(contact) {
                                                if (contact.participant[0].id === data.id) {
                                                    return contact.participant[0].status = data.chatStatus;
                                                }
                                            });
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

                    scope.isActiveTab = function(tab) {
                        if(scope.tabActive != null)
                            return (tab == scope.tabActive) ? true : false
                    }

                    scope.toggleChat = function() {
                        element.toggleClass('open closed')
                        if(element.hasClass('open'))
                            $('body').addClass('has-chat-sidebar-active')
                        else
                            $('body').removeClass('has-chat-sidebar-active')
                    }

                    // MOBILE =======================================
                    attrs.$observe('chatAttachTo', function(el){
                        if(el) {
                            //Attach sidebar to the element specified
                            var $attached = $(el).first();
                            // Check if element exist
                            if ($attached != void 0) {
                                $(document).ready(function () {
                                    var attachHeight = $attached.height();
                                    $(element).css('top', attachHeight);
                                    $(window).scroll(function () {
                                        if ($(window).scrollTop() > attachHeight) {
                                            $(element).css('top', '0px');
                                        }
                                        else if ($(window).scrollTop() < attachHeight) {
                                            $(element).css('top', attachHeight);
                                        }
                                    });
                                });
                            }
                        }
                    });

                    attrs.$observe('chatToggle', function(el){
                        if(el) {
                            $(el).on("click", function() {
                                scope.toggleChat();
                            })
                        }
                    });
                }
            }
        }]);

}).call(this);