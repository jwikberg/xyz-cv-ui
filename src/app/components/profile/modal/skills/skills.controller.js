(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.modal')
        .controller('SkillsController', SkillsController);

    function SkillsController(SkillsModal, Users, Skills, UserToSkill, block, user, callback, $q) {
            var vm = this;
            window.vm2 = vm;

            vm.user = {};
            vm.connectors = [];
            vm.connectorsPage = [];
            vm.skills = [];
            vm.isValidConnector = isValidConnector;
            vm.hideModal = SkillsModal.deactivate;
            vm.save = save;
            vm.addConnector = addConnector;
            vm.saveConnector = saveConnector;
            vm.removeConnector = removeConnector;
            vm.setConnectorForEditing = setConnectorForEditing;
            vm.levels = [];
            vm.futureLevels = [];
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

            //////////////

            function activate() {
                var promises = {
                    user: Users.get({_id: user._id}).$promise,
                    connectors: UserToSkill.query({userId: user._id}).$promise,
                    skills: Skills.query().$promise
                };

                $q.all(promises)
                    .then(function(values) {
                        vm.user = values.user;
                        vm.connectors = values.connectors;
                        setLevels();
                        setFutureLevels();
                        setSkills(values.skills);
                        setHashes(values.skills, values.connectors);

                        vm.setPage(0);
                    });
            }

            function isValidConnector(connector) {
                return connector.name && connector.name.length && connector.years && connector.level;
            }

            function isEditMode() {
                return connectorExists(vm.currentConnector);
            }

            // ADD
            //==================================================================

            function addConnector(connector) {
                if (connector && connector.name && !vm.connectorHash[connector.name]) {
                    createSkillIfNotExists(connector)
                        .then(createConnector)
                        .then(function(connector) {
                            vm.connectorsToSave[connector.name] = angular.copy(connector);
                            vm.currentConnector = angular.copy(connector);
                            updateConnectorList();

                            vm.setPage(vm.getPageCount() - 1);
                        });
                }
            }

            function createSkillIfNotExists(connector) {
                return $q(function(resolve) {
                    if (vm.skillHash[connector.name]) {
                        return resolve(connector);
                    } else {
                        var skill = new Skills({name: connector.name});
                        skill.$save()
                            .then(function(skill) {
                                vm.skillHash[skill.name] = angular.copy(skill);
                                updateSkillList();
                                return resolve(connector);
                            });
                    }
                });
            }

            function createConnector(connector) {
                return $q(function(resolve) {
                    var skill = vm.skillHash[connector.name];
                    connector.userId = vm.user._id;
                    connector.skillId = skill._id;
                    connector = new UserToSkill(connector);
                    vm.connectorHash[skill.name] = angular.copy(connector);
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
                if (vm.connectorHash[connector.name]) {
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
                return saveSkills()
                    .then(removeSkills)
                    .then(vm.user.$save())
                    .then(vm.hideModal)
                    .then(callback);
            }

            function setLevels() {
                vm.levels = [
                {
                    value: 1,
                    label: 'Level 1'
                },
                {
                    value: 2,
                    label: 'Level 2'
                },
                {
                    value: 3,
                    label: 'Level 3'
                },
                {
                    value: 4,
                    label: 'Level 4'
                },
                {
                    value: 5,
                    label: 'Level 5'
                }];
            }

            function setFutureLevels() {
                vm.futureLevels = [
                {
                    value: 0,
                    label: 'Level 0'
                },
                {
                    value: 1,
                    label: 'Level 1'
                },
                {
                    value: 2,
                    label: 'Level 2'
                },
                {
                    value: 3,
                    label: 'Level 3'
                },
                {
                    value: 4,
                    label: 'Level 4'
                },
                {
                    value: 5,
                    label: 'Level 5'
                }];
            }

            function setSkills(skills) {
                vm.skills = skills;
            }

            function setHashes(skills, connectors) {
                var connectorHash = Object.create(null);
                var skillHash = Object.create(null);
                var idHash = Object.create(null);
                connectors.forEach(function(connector) {
                    idHash[connector.skillId] = connector;
                });
                skills.forEach(function(skill) {
                    if (idHash[skill._id]) {
                        connectorHash[skill.name] = new UserToSkill(angular.extend(skill, idHash[skill._id]));
                    }
                    skillHash[skill.name] = skill;
                });
                vm.connectorHash = connectorHash;
                vm.skillHash = skillHash;
                updateConnectorList();
            }

            function saveSkills() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.connectorsToSave).map(function(key) {
                        promises.push(vm.connectorsToSave[key].$save());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function removeSkills() {
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
                vm.connectors = Object.keys(vm.connectorHash).map(function(key) {return vm.connectorHash[key];});
                vm.setPage(vm.currentPage);
            }

            function updateSkillList() {
                vm.skills = Object.keys(vm.skillHash).map(function(key) {return vm.skillHash[key];});
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
                var lastIndex = Math.min(pageNumber * 7 + 7, vm.connectors.length);
                vm.connectorsPage = vm.connectors.slice(firstIndex, lastIndex);
            }

            function getPageCount() {
                return Math.ceil(vm.connectors.length / 7);
            }

        }

})();
