(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.modal')
        .factory('SkillCategoriesModal', SkillCategoriesModal);

    function SkillCategoriesModal(btfModal) {
        return btfModal({
            templateUrl: '/xyz-cv-ui/components/admin/modal/skillCategories/skillCategories.view.html',
            controller: 'SkillCategoriesController',
            controllerAs: 'vm'
        });
    }

})();
