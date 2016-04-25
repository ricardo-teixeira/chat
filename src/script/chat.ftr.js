(function() {
    // FILTERS =============================
    angular.module('ValueChat')
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