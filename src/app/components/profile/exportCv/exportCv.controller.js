(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.exportCv')
        .controller('ExportCvController', ExportCvController);

        function ExportCvController(ExportCvModel, $routeParams, session, API_URL) {

            var vm = this;
            window.vm = vm;

            vm.API_URL = API_URL;
            vm.activated = false;
            vm.user = {};

            /* SESSION */
            vm.isAllowed = session.isAllowed;
            vm.isSelf = session.isSelf;
            vm.canView = session.canView;

            /* MODAL */

            vm.word = {};
            vm.user = '';

            session.isLoaded()
                .then(activate);

            //////////////

            function activate() {
                ExportCvModel.get({_id: $routeParams.userId})
                    .$promise.then(function(model) {
                        setDoc(model);
                        setUserName(model);
                        vm.activated = true;
                    });
            }

            function setDoc(model) {
                vm.word = model.user.word;
            }
            
            function setUserName(model) {
                vm.user = model.user.name;
            }
        }
})();
