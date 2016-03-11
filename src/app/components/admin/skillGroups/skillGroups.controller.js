(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups')
        .controller('SkillGroupsController', SkillGroupsController);

    function SkillGroupsController(SkillGroupsModel, API_URL, session, SkillGroupModal, EditSkillGroupsModal) {
        var vm = this;
        window.vm = vm;

        vm.API_URL = API_URL;

        vm.activated = false;

        /* SESSION */
        vm.isAllowed = session.isAllowed;
        vm.isSelf = session.isSelf;
        vm.canView = session.canView;

        /* MODAL */
        vm.skillGroupModal = {};
        vm.editSkillGroupsModal = {};
        vm.showModal = showModal;

        /* SKILLS */
        vm.skills = [];

        /* SKILLGROUPS */
        vm.skillGroups = [];

        session.isLoaded()
            .then(activate);

        //////////////

        function activate() {
            SkillGroupsModel.get().$promise
                .then(function(model) {
                    setSkills(model);
                    setSkillGroups(model);
                    setSkillGroupModal();
                    setEditSkillGroupsModal();
                    vm.activated = true;
                });
        }

        function setSkills(model) {
            vm.skills = model.skills;
        }

        function setSkillGroups(model) {
            vm.skillGroups = model.skillGroups;
        }

        /* MODAL */

        function showModal(modal, block, editSkillGroup) {
            vm.currentModal = modal;
            var locals = {
                block: angular.copy(block),
                editSkillGroup: angular.copy(editSkillGroup),
                callback: activate
            };
            vm.currentModal.activate(locals);
        }

        function setSkillGroupModal() {
            vm.skillGroupModal = SkillGroupModal;
        }

        function setEditSkillGroupsModal() {
            vm.editSkillGroupsModal = EditSkillGroupsModal;
        }
    }
})();
