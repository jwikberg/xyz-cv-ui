(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin')
        .controller('AdminController', AdminController);

    function AdminController(AdminModel, API_URL, session, SkillCategoriesModal) {
        var vm = this;
        window.vm = vm;

        vm.API_URL = API_URL;

        vm.activated = false;

        /* SESSION */
        vm.isAllowed = session.isAllowed;
        vm.isSelf = session.isSelf;
        vm.canView = session.canView;

        /* MODAL */
        vm.skillCategoriesModal = {};
        vm.showModal = showModal;
            
        /* SKILLS */
        vm.skills = [];

        /* SKILLGROUPS */
        vm.skillGroups = [];

        session.isLoaded()
            .then(activate);

        //////////////

        function activate() {
            AdminModel.get().$promise
                .then(function(model) {
                    setSkills(model);
                    setSkillGroups(model);
                    setSkillCategoriesModal();
                    vm.activated = true;
                });
        }

        function setSkills(model) {
            vm.skills = model.admin.skills;
        }

        function setSkillGroups(model) {
            vm.skillGroups = model.admin.skillGroups;
        }
        
        /* MODAL */

        function showModal(modal, block) {
            vm.currentModal = modal;
            var locals = {
                block: angular.copy(block),
                callback: activate
            };
            vm.currentModal.activate(locals);
        }
        
        function setSkillCategoriesModal() {
            vm.skillCategoriesModal = SkillCategoriesModal;
        }
    }
})();
