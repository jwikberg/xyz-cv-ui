(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.exportCv')
        .factory('ExportCvModel', ExportCvModel);

    function ExportCvModel(Model) {
        return new Model('/profile/exportCv/:_id', {_id: '@_id'});
    }

})();
