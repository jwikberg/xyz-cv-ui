(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups.modal')
        .factory('SkillGroupModal', SkillGroupModal);

    function SkillGroupModal(btfModal) {
        return btfModal({
            templateUrl: '/xyz-cv-ui/components/admin/skillGroups/modal/skillGroup/skillGroup.view.html',
            controller: 'SkillGroupController',
            controllerAs: 'vm'
        });
    }

})();
