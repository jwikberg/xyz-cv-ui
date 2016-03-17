(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups')
        .run(appRun);

    function appRun(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                url: '/admin/skillGroups/',
                config: {
                    templateUrl: '/xyz-cv-ui/components/admin/skillGroups/skillGroups.html',
                    controller: 'SkillGroupsController',
                    controllerAs: 'vm',
                    title: 'skillGroups'
                }
            }
        ];
    }
})();
