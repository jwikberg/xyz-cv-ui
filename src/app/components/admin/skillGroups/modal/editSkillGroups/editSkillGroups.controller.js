(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups.modal')
        .controller('EditSkillGroupsController', EditSkillGroupsController);

        function EditSkillGroupsController(EditSkillGroupsModal, SkillGroups, $q, callback) {
            var vm = this;

            vm.skillGroups = [];
            vm.setSkillGroupForEditing = setSkillGroupForEditing;
            vm.skillGroupsToSave = {};
            vm.skillGroupsToRemove = {};
            vm.save = save;
            vm.currentSkillGroup = {};
            vm.saveSkillGroup = saveSkillGroup;
            vm.addSkillGroup = addSkillGroup;
            vm.removeSkillGroup = removeSkillGroup;
            vm.skillGroupHash = {};
            vm.skillGroupIdHash = {};
            vm.isValidSkillGroup = isValidSkillGroup;
            vm.hideModal = EditSkillGroupsModal.deactivate;
            vm.isEditMode = isEditMode;

            activate();

            //////////////

            function activate() {
                var promises = {
                    skillGroups: SkillGroups.query().$promise
                };

                $q.all(promises)
                    .then(function(values) {
                        vm.skillGroups = values.skillGroups;
                        setHashes(vm.skillGroups);
                    });
            }

            function isValidSkillGroup(skillGroup) {
                return skillGroup.newName && skillGroup.newName.length && !vm.skillGroupHash[skillGroup.newName];
            }

            function isEditMode() {
                return skillGroupExists(vm.currentSkillGroup);
            }

            // ADD
            //==================================================================

            function addSkillGroup(skillGroup) {
                if (skillGroup && skillGroup.newName && !vm.skillGroupHash[skillGroup.newName]) {
                    skillGroup.name = skillGroup.newName;
                    skillGroup = new SkillGroups(skillGroup);
                    vm.skillGroupHash[skillGroup.name] = angular.copy(skillGroup);
                    vm.skillGroupsToSave[skillGroup.name] = angular.copy(skillGroup);
                    delete vm.currentSkillGroup.name;
                    delete vm.currentSkillGroup.newName;
                    updateSkillGroupList();
                }
            }

            // EDIT
            //==================================================================

            function saveSkillGroup(skillGroup) {
                if (skillGroup && skillGroup.name && vm.skillGroupHash[skillGroup.name] && skillGroup.name !== skillGroup.newName) {
                    editSkillGroup(skillGroup)
                        .then(function(skillGroup) {
                            vm.skillGroupsToSave[skillGroup.name] = angular.copy(skillGroup);
                            delete vm.currentSkillGroup._id;
                            delete vm.currentSkillGroup.name;
                            delete vm.currentSkillGroup.newName;
                            updateSkillGroupList();
                        });
                }
            }

            function editSkillGroup(skillGroup) {
                return $q(function(resolve) {
                    delete vm.skillGroupHash[skillGroup.name];
                    skillGroup.name = skillGroup.newName;
                    vm.skillGroupHash[skillGroup.name] = angular.copy(skillGroup);
                    return resolve(skillGroup);
                });
            }

            function removeSkillGroup(skillGroup) {
                vm.skillGroupsToRemove[skillGroup.name] = angular.copy(skillGroup);
                delete vm.skillGroupHash[skillGroup.name];
                updateSkillGroupList();
            }

            function skillGroupExists(skillGroup) {
                if(vm.skillGroupHash[skillGroup.name]) {
                    return true;
                } else {
                    return false;
                }
            }

            function setSkillGroupForEditing(skillGroup) {
                vm.currentSkillGroup = angular.copy(skillGroup);
                vm.currentSkillGroup.newName = skillGroup.name;
            }

            function save() {
                return saveSkillGroups()
                    .then(removeSkillGroups())
                    .then(vm.hideModal)
                    .then(callback);
            }

            function setHashes(skillGroups) {
                var skillGroupHash = Object.create(null);
                var skillGroupIdHash = Object.create(null);

                skillGroups.forEach(function(skillGroup) {
                    skillGroupHash[skillGroup.name] = skillGroup;
                    skillGroupIdHash[skillGroup._id] = skillGroup;
                });

                vm.skillGroupHash = skillGroupHash;
                vm.skillGroupIdHash = skillGroupIdHash;

                updateSkillGroupList();
            }

            function saveSkillGroups() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.skillGroupsToSave).map(function(key) {
                        promises.push(vm.skillGroupsToSave[key].$save());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function removeSkillGroups() {
                return $q(function(resolve) {
                    var promises = [];
                    Object.keys(vm.skillGroupsToRemove).map(function(key) {
                        promises.push(vm.skillGroupsToRemove[key].$delete());
                    });
                    return $q.all(promises)
                        .then(resolve);
                });
            }

            function updateSkillGroupList() {
                vm.skillGroups = Object.keys(vm.skillGroupHash).map(function(key){return vm.skillGroupHash[key];});
            }
        }
})();
