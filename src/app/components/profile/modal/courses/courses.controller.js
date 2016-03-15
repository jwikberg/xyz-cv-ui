(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile.modal')
        .controller('CoursesController', CoursesController);

    function CoursesController(CoursesModal, Users, Courses, UserToCourse, block, user, callback, $q) {
        var vm = this;
        window.vm2 = vm;

        vm.user = {};
        vm.connectors = [];
        vm.connectorsPage = [];
        vm.courses = [];
        vm.isValidConnector = isValidConnector;
        vm.hideModal = CoursesModal.deactivate;
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
                connectors: UserToCourse.query({userId: user._id}).$promise,
                courses: Courses.query().$promise
            };

            $q.all(promises)
                .then(function(values) {
                    vm.user = values.user;
                    vm.connectors = values.connectors;
                    setCourses(values.courses);
                    setHashes(values.courses, values.connectors);

                    vm.setPage(0);
                });
        }

        function isValidConnector(connector) {
            return connector.name && connector.name.length && connector.dateFrom && connector.dateTo;
        }

        function isEditMode() {
            return connectorExists(vm.currentConnector);
        }

        // ADD
        //==================================================================

        function addConnector(connector) {
            if (connector && connector.name && !vm.connectorHash[connector.name]) {
                createCourseIfNotExists(connector)
                    .then(createConnector)
                    .then(function(connector) {
                        vm.connectorsToSave[connector.name] = angular.copy(connector);
                        vm.currentConnector = angular.copy(connector);
                        updateConnectorList();

                        vm.setPage(vm.getPageCount() - 1);
                    });
            }
        }

        function createCourseIfNotExists(connector) {
            return $q(function(resolve) {
                if (vm.courseHash[connector.name]) {
                    return resolve(connector);
                } else {
                    var course = new Courses({name: connector.name});
                    course.$save()
                        .then(function(course) {
                            vm.courseHash[course.name] = angular.copy(course);
                            updateCourseList();
                            return resolve(connector);
                        });
                }
            });
        }

        function createConnector(connector) {
            return $q(function(resolve) {
                var course = vm.courseHash[connector.name];
                connector.userId = vm.user._id;
                connector.courseId = course._id;
                connector = new UserToCourse(connector);
                vm.connectorHash[course.name] = angular.copy(connector);
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
            return saveCourses()
                .then(removeCourses)
                .then(vm.hideModal)
                .then(callback);
        }

        function setCourses(courses) {
            vm.courses = courses;
        }

        function setHashes(courses, connectors) {
            var connectorHash = Object.create(null);
            var courseHash = Object.create(null);
            var idHash = Object.create(null);
            connectors.forEach(function(connector) {
                idHash[connector.courseId] = connector;
            });
            courses.forEach(function(course) {
                if (idHash[course._id]) {
                    connectorHash[course.name] = new UserToCourse(angular.extend(course, idHash[course._id]));
                }
                courseHash[course.name] = course;
            });
            vm.connectorHash = connectorHash;
            vm.courseHash = courseHash;
            updateConnectorList();
        }

        function saveCourses() {
            return $q(function(resolve) {
                var promises = [];
                Object.keys(vm.connectorsToSave).map(function(key) {
                    promises.push(vm.connectorsToSave[key].$save());
                });
                return $q.all(promises)
                    .then(resolve);
            });
        }

        function removeCourses() {
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

        function updateCourseList() {
            vm.courses = Object.keys(vm.courseHash).map(function(key) {return vm.courseHash[key];});
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
