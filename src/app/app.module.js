(function() {
    'use strict';

    angular.module('xyz-cv-ui', [
        /*
         * Order is not important. Angular makes a
         * pass to register all of the modules listed
         * and then when app.dashboard tries to use app.data,
         * it's components are available.
         */

        /*
         * Everybody has access to these.
         * We could place these under every feature area,
         * but this is easier to maintain.
         */
        'xyz-cv-ui.core',
        'xyz-cv-ui.config',

        //'app.widgets',

        /*
         * Feature areas
         */
        'xyz-cv-ui.dashboard',
        'xyz-cv-ui.export',
        'xyz-cv-ui.profile',
        'xyz-cv-ui.profile.exportCv',
        'xyz-cv-ui.access',
        'xyz-cv-ui.menu',
        'xyz-cv-ui.office',
        'xyz-cv-ui.feed',
        'xyz-cv-ui.advancedSearch',
        'xyz-cv-ui.updatedList',
        'xyz-cv-ui.admin',
        'xyz-cv-ui.admin.skillGroups'
    ]);

})();
