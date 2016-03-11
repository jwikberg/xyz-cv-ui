(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups.modal')
        .factory('EditSkillGroupsModal', EditSkillGroupsModal);

    function EditSkillGroupsModal(btfModal) {
        return btfModal({
            templateUrl: '/xyz-cv-ui/components/admin/skillGroups/modal/editSkillGroups/editSkillGroups.view.html',
            controller: 'EditSkillGroupsController',
            controllerAs: 'vm'
        });
    }

})();
