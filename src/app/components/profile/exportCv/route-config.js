(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.exportCv')
        .run(appRun);

    function appRun(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                url: '/profile/exportCv/:userId',
                config: {
                    templateUrl: '/xyz-cv-ui/components/profile/exportCv/exportCv.html',
                    controller: 'ExportCvController',
                    controllerAs: 'vm',
                    title: 'exportCv'
                }
            }
        ];
    }
})();
