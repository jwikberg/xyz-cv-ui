(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.modal')
        .controller('OthersController', OthersController);

    function OthersController(OthersModal, Users, Others, UserToOther, block, user, callback, $q) {
            var vm = this;
            window.vm2 = vm;

            vm.user = {};
            vm.connectors = [];
            vm.connectorsPage = [];
            vm.others = [];
            vm.isValidConnector = isValidConnector;
            vm.hideModal = OthersModal.deactivate;
            vm.save = save;
            vm.addConnector = addConnector;
            vm.saveConnector = saveConnector;
            vm.removeConnector = removeConnector;
            vm.setConnectorForEditing = setConnectorForEditing;
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
                    connectors: UserToOther.query({userId: user._id}).$promise,
                    others: Others.query().$promise
                };

                $q.all(promises)
                    .then(function(values) {
                        vm.user = values.user;
                        vm.connectors = values.connectors;
                        setOthers(values.others);
                        setHashes(values.others, values.connectors);

                        vm.setPage(0);
                    });
            }

            function isValidConnector(connector) {
                return connector.name && connector.name.length;
            }

            function isEditMode() {
                return connectorExists(vm.currentConnector);
            }

            // ADD
            //==================================================================

            function addConnector(connector) {
                if (connector && connector.name && !vm.connectorHash[connector.name]) {
                    createOtherIfNotExists(connector)
                        .then(createConnector)
                        .then(function(connector) {
                            vm.connectorsToSave[connector.name] = angular.copy(connector);
                            vm.currentConnector = angular.copy(connector);
                            updateConnectorList();

                            vm.setPage(vm.getPageCount() - 1);
                        });
                }
            }

            function createOtherIfNotExists(connector) {
                return $q(function(resolve) {
                    if (vm.otherHash[connector.name]) {
                        return resolve(connector);
                    } else {
                        var other = new Others({name: connector.name});
                        other.$save()
                            .then(function(other) {
                                vm.otherHash[other.name] = angular.copy(other);
                                updateOtherList();
                                return resolve(connector);
                            });
                    }
                });
            }

            function createConnector(connector) {
                return $q(function(resolve) {
                    var other = vm.otherHash[connector.name];
                    connector.userId = vm.user._id;
                    connector.otherId = other._id;
                    connector = new UserToOther(connector);
                    vm.connectorHash[other.name] = angular.copy(connector);
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
                return saveOthers()
                    .then(removeOthers)
                    .then(vm.hideModal)
                    .then(callback);
            }

            function setOthers(others) {
                vm.others = others;
            }

            function setHashes(others, connectors) {
                var connectorHash = Object.create(null);
                var otherHash = Object.create(null);
                var idHash = Object.create(null);
                connectors.forEach(function(connector) {
                    idHash[connector.otherId] = connector;
                });
                others.forEach(function(other) {
                    if (idHash[other._id]) {
                        connectorHash[other.name] = new UserToOther(angular.extend(other, idHash[other._id]));
                    }
                    otherHash[other.name] = other;
                });
                vm.connectorHash = connectorHash;
                vm.otherHash = otherHash;
                updateConnectorList();
            }

            function saveOthers() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.connectorsToSave).map(function(key) {
                        promises.push(vm.connectorsToSave[key].$save());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function removeOthers() {
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

            function updateOtherList() {
                vm.others = Object.keys(vm.otherHash).map(function(key) {return vm.otherHash[key];});
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
