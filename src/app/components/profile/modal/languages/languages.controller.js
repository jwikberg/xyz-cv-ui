(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.modal')
        .controller('LanguagesController', LanguagesController);

        function LanguagesController(LanguagesModal, Users, Languages, UserToLanguage, block, user, callback, $q) {
            var vm = this;
            window.vm2 = vm;

            vm.user = {};
            vm.connectors = [];
            vm.connectorsPage = [];
            vm.languages = [];
            vm.isValidConnector = isValidConnector;
            vm.hideModal = LanguagesModal.deactivate;
            vm.save = save;
            vm.addConnector = addConnector;
            vm.saveConnector = saveConnector;
            vm.removeConnector = removeConnector;
            vm.setConnectorForEditing = setConnectorForEditing;
            vm.levels = [];
            vm.connectorHash = {};
            vm.connectorsToRemove = {};
            vm.connectorsToSave = {};
            vm.currentConnector = {};
            vm.isEditMode = isEditMode;
            vm.nextPage = nextPage;
            vm.previousPage = previousPage;
            vm.setPage = setPage;
            vm.getPageCount = getPageCount;
            vm.currentPage = 0;

            activate();

            function activate() {
                var promises = {
                    user: Users.get({ _id: user._id }).$promise,
                    connectors: UserToLanguage.query({ userId: user._id }).$promise,
                    languages: Languages.query().$promise
                };

                $q.all(promises)
                    .then(function(values) {
                        vm.user = values.user;
                        vm.connectors = values.connectors;
                        setLevels();
                        setLanguages(values.languages);
                        setHashes(values.languages, values.connectors);

                        vm.setPage(0);
                    });
            }

            function isValidConnector(connector) {
                return connector.name && connector.name.length && connector.level;
            }

            function isEditMode() {
                return connectorExists(vm.currentConnector);
            }

            // ADD
            //==================================================================

            function addConnector(connector) {
                if (connector && connector.name && !vm.connectorHash[connector.name]) {
                    createLanguageIfNotExists(connector)
                        .then(createConnector)
                        .then(function(connector) {
                            vm.connectorsToSave[connector.name] = angular.copy(connector);
                            vm.currentConnector = angular.copy(connector);
                            updateConnectorList();

                            vm.setPage(vm.getPageCount()-1);
                        });
                }
            }

            function createLanguageIfNotExists(connector) {
                return $q(function(resolve) {
                    if (vm.languageHash[connector.name]) {
                        return resolve(connector);
                    } else {
                        var language = new Languages({name: connector.name});
                        language.$save()
                            .then(function(language) {
                                vm.languageHash[language.name] = angular.copy(language);
                                updateLanguageList();
                                return resolve(connector);
                            });
                    }
                });
            }

            function createConnector(connector) {
                return $q(function(resolve) {
                    var language = vm.languageHash[connector.name];
                    connector.userId = vm.user._id;
                    connector.languageId = language._id;
                    connector = new UserToLanguage(connector);
                    vm.connectorHash[language.name] = angular.copy(connector);
                    return resolve(connector);
                });
            }

            // EDIT
            //==================================================================

            function saveConnector(connector) {
                if (connector && connector.name && vm.connectorHash[connector.name]) {
                    editConnector(connector)
                        .then(function(connector) {
                            vm.connectorsToSave[connector.name] = angular.copy(connector);
                            delete connector._id;
                            vm.currentConnector = angular.copy(connector);
                            updateConnectorList();
                        });
                }
            }

            function editConnector(connector) {
                return $q(function(resolve) {
                    var existingConnector = vm.connectorHash[connector.name];
                    connector = angular.extend(existingConnector, connector);
                    vm.connectorHash[connector.name] = angular.copy(connector);
                    return resolve(connector);
                });
            }

            function removeConnector(connector) {
                vm.connectorsToRemove[connector.name] = vm.connectorHash[connector.name];
                delete vm.connectorHash[connector.name];
                updateConnectorList();
            }

            function connectorExists(connector) {
                if(vm.connectorHash[connector.name]) {
                    return true;
                } else {
                    return false;
                }
            }

            function setConnectorForEditing(connector) {
                vm.currentConnector = angular.copy(connector);
                vm.editMode = true;
            }

            function save() {
                return saveLanguages()
                    .then(removeLanguages)
                    .then(vm.hideModal)
                    .then(callback);
            }

            function setLevels() {
                vm.levels = [
                {
                    value: 'Basic Understanding',
                    label: 'Basic Understanding'
                },
                {
                    value: 'Basic Knowledge',
                    label: 'Basic Knowledge'
                },
                {
                    value: 'Intermediate',
                    label: 'Intermediate'
                },
                {
                    value: 'Fluent',
                    label: 'Fluent'
                },
                {
                    value: 'Native',
                    label: 'Native'
                }];
            }

            function setLanguages(languages) {
                vm.languages = languages;
            }

            function setHashes(languages, connectors) {
                var connectorHash = Object.create(null);
                var languageHash = Object.create(null);
                var idHash = Object.create(null);
                connectors.forEach(function(connector) {
                    idHash[connector.languageId] = connector;
                });
                languages.forEach(function(language) {
                    if (idHash[language._id]) {
                        connectorHash[language.name] = new UserToLanguage(angular.extend(language, idHash[language._id]));
                    }
                    languageHash[language.name] = language;
                });
                vm.connectorHash = connectorHash;
                vm.languageHash = languageHash;
                updateConnectorList();
            }

            function saveLanguages() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.connectorsToSave).map(function(key) {
                        promises.push(vm.connectorsToSave[key].$save());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function removeLanguages() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.connectorsToRemove).map(function(key) {
                        promises.push(vm.connectorsToRemove[key].$delete());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function updateConnectorList() {
                vm.connectors = Object.keys(vm.connectorHash).map(function(key){return vm.connectorHash[key];});
                vm.setPage(vm.currentPage);
            }

            function updateLanguageList() {
                vm.languages = Object.keys(vm.languageHash).map(function(key){return vm.languageHash[key];});
            }

            function nextPage() {
                vm.currentPage = vm.currentPage + 1;
                vm.setPage(vm.currentPage);
            }

            function previousPage() {
                vm.currentPage = vm.currentPage - 1;
                vm.setPage(vm.currentPage);
            }

            function setPage(pageNumber) {
                pageNumber = Math.max(pageNumber, 0);
                pageNumber = Math.min(pageNumber, getPageCount() - 1);
                vm.currentPage = pageNumber;

                var firstIndex = pageNumber * 7;
                var lastIndex = Math.min(pageNumber * 10 + 10, vm.connectors.length);
                var indices = lastIndex - firstIndex;
                vm.connectorsPage = vm.connectors.slice(firstIndex, lastIndex);
            }

            function getPageCount() {
                return Math.ceil(vm.connectors.length / 7);
            }

        }
})();
