(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin')
        .run(appRun);

    function appRun(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                url: '/admin',
                config: {
                    templateUrl: '/xyz-cv-ui/components/admin/admin.html',
                    controller: 'AdminController',
                    controllerAs: 'vm',
                    title: 'admin'
                }
            }
        ];
    }
})();
