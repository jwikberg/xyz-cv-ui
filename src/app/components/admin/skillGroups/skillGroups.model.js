(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups')
        .factory('SkillGroupsModel', SkillGroupsModel);

    function SkillGroupsModel(Model) {
        return new Model('/admin/skillGroups');
    }

})();
