(function() {
    'use strict';

    angular
        .module('shared.skillGroups')
        .factory('SkillGroups', SkillGroups);

    function SkillGroups(Resource) {
        return new Resource('/skillGroup/:_id', { _id: '@_id' });
    }

})();
