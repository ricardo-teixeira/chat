(function() {
    // CHAT POPUP
    angular.module('ValueChat')
        .directive('chatPopup', ['ChatAPI', '$rootScope', '$timeout', '$filter', '$window', function(ChatAPI, $rootScope, $timeout, $filter, $window) {

            var template =
                "<div class='popup-box chat-popup slim-scrollbar' ng-class=\"{'popup-on': popup.unreadMessages > 0, 'popup-closed': !popup.toggle}\">"+
                "<div class='popup-head'>"+
                "<ul class='popup-head-left chat-navbar left'>"+
                "<li><a class='chat-navbar-brand' href='javascript:;' title='{{popup.participant[0].name}}'><span chat-status='popup.participant[0].status'></span> {{popup.participant[0].name | trim:true:14}}<div loading-dots ng-if='popup.typing'></div></a></li>"+
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
                    '<div emoji-form emoji-message="emojiMessage" ng-click="setReadMessages()" ng-keypress="isTyping($event)" ng-disabled="errorLog(3)">'+
                        '<button id="emojibtn">'+
                            '<i class="fa fa-smile-o" aria-hidden="true"></i>'+
                        '</button>'+
                        '<textarea id="messageInput" ng-model="emojiMessage.messagetext" placeholder="Enviar uma mensagem"></textarea>'+
                    '</div>'+
                    //"<textarea chat-form chat-form-submit='sendMessage()' cols='40' name='message' placeholder='Enviar uma mensagem' rows='10' ng-model='popup.newMessage' ng-keypress='isTyping($event)' ng-click='setReadMessages()' ng-disabled='errorLog(3)'></textarea>"+
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
                controller: ['$scope', '$filter', '$sanitize', 'ChatAPI', function($scope, $filter, $sanitize, ChatAPI){

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

                    scope.errors = [];
                    scope.errorLog = function (errorCode) {
                        var error = scope.errors.filter(function (error) {
                            return error.code == errorCode;
                        });
                        return error[0];
                    }

                    scope.emojiMessage = {};
                    scope.emojiMessage.replyToUser = function(){
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
                            //var message = $filter('stripHTML')($sanitize($scope.popup.newMessage));
                            var message = $filter('stripHTML')(scope.emojiMessage.messagetext);
                            var roomId = scope.popup.roomId;
                            if (message.length) {
                                ctrl.proxy.server.sendMessage(roomId, message).done(function () {
                                    scope.$apply(function () {
                                        scope.emojiMessage.messagetext = "";
                                    });
                                }).fail(function (e) {
                                    return console.log("Error: ", e);
                                });
                            }
                        } catch (err) {
                            scope.errors.push({
                                code: "3",
                                message: "Erro ao enviar mensagem. Atualize a página e tente novamente."
                            });
                            console.log(err);
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
                                                if (contact.unreadMessages != void 0)
                                                    return counter += contact.unreadMessages;
                                            });
                                            // Save unread messages total into notifications counter
                                            $rootScope.chatNotifications = counter;

                                        }, 500);
                                    }).fail(function (e) {
                                        console.log("Error: ", e.statusText)
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

                    if($(window).width() < 768)
                        $(element).addClass('chatSlideInLeft');
                    else
                        $(element).addClass('chatSlideInUp');

                    element.on('click', function(){
                        $('.chat-sidebar, body').addClass('narrow-sidebar');
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

        .directive("dummyImage", function() {
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
                        imgDummy = "img/datagrid_load.gif";
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
                                return elem.attr('src', imgDummy);
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

        .directive("chatForm", function() {
            return {
                restrict: 'A',
                scope: {
                    action: '&chatFormSubmit'
                },
                link: function(scope, element) {
                    $(element).bind('keydown keypress', function(event) {
                        if (event.which === 13) {
                            if (($(this).val().trim()).length > 0 && !event.shiftKey) {
                                scope.$apply(scope.action);
                                return false;
                            }
                        }
                    });
                }
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