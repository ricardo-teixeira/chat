(function() {
    // CHAT POPUP
    angular.module('ValueChat')
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
        .directive('focusOn', function($timeout) {
            return function(scope, element, attrs) {
                scope.$watch(attrs.focusOn, function(n) {
                    if(n) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
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
        .directive('chatPopover', function ($compile) {
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
        })
        // HIGHLIGHT TEXT IN SEARCH FILTER
        .filter('highlight', function($sce) {
            return function(text, phrase) {
                if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
                    '<span class="highlighted">$1</span>')
                return $sce.trustAsHtml(text)
            }
        })
        .filter('html',function($sce){
            return function(input){
                return $sce.trustAsHtml(input);
            }
        })

        .filter('stripHTML',function(){
            return function(text){
                var regex = /(<([^>]+)>)/ig;
                return text.replace(regex, "");
            }
        })
}).call(this);