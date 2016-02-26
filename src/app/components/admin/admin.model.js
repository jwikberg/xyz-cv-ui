(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin')
        .factory('AdminModel', AdminModel);

    function AdminModel(Model) {
        return new Model('/admin/');
    }

})();
