(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups.modal')
        .controller('EditSkillGroupsController', EditSkillGroupsController);

    function EditSkillGroupsController(EditSkillGroupsModal, Skills, SkillGroups, $q, callback) {
        var vm = this;

        vm.skills = [];
        vm.skillGroups = [];
        vm.setSkillGroupForEditing = setSkillGroupForEditing;
        vm.skillGroupsToSave = {};
        vm.skillGroupsToRemove = {};
        vm.skillsToSave = {};
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
        vm.orderUp = orderUp;
        vm.orderDown = orderDown;

        activate();

        //////////////

        function activate() {
            var promises = {
                skills: Skills.query().$promise,
                skillGroups: SkillGroups.query().$promise
            };

            $q.all(promises)
                .then(function(values) {
                    vm.skills = values.skills;
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
                skillGroup.order = (vm.skillGroups.length + 1);
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
            vm.skillGroups.forEach(function(x) {
                if (x.order > skillGroup.order) {
                    x.order--;
                    vm.skillGroupsToSave[x.name] = angular.copy(x);
                }
            });

            vm.skills.forEach(function(skill) {
                if (skill.skillGroupId === skillGroup._id) {
                    skill.skillGroupId = null;
                    vm.skillsToSave[skill.name] = angular.copy(skill);
                }
            });

            delete vm.skillGroupHash[skillGroup.name];
            delete vm.skillGroupsToSave[skillGroup.name];
            updateSkillGroupList();
        }

        function skillGroupExists(skillGroup) {
            if (vm.skillGroupHash[skillGroup.name]) {
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
                .then(saveSkills())
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

        function saveSkills() {
            return $q(function(resolve) {
                var promises = [];
                Object.keys(vm.skillsToSave).map(function(key) {
                    promises.push(vm.skillsToSave[key].$save());
                });
                return $q.all(promises)
                    .then(resolve);
            });
        }

        function updateSkillGroupList() {
            vm.skillGroups = Object.keys(vm.skillGroupHash).map(function(key) {return vm.skillGroupHash[key];});
        }

        function orderUp(skillGroup) {
            if (skillGroup.order) {
                var above = {};
                vm.skillGroups.forEach(function(x) {
                    if (x.order === (skillGroup.order - 1)) {
                        above = x;
                    }
                });

                skillGroup.order--;
                above.order++;

                vm.skillGroupsToSave[above.name] = angular.copy(above);
                vm.skillGroupsToSave[skillGroup.name] = angular.copy(skillGroup);

                updateSkillGroupList();
            }
        }

        function orderDown(skillGroup) {
            var below = {};
            vm.skillGroups.forEach(function(x) {
                if (x.order === (skillGroup.order + 1)) {
                    below = x;
                }
            });

            below.order--;
            skillGroup.order++;

            vm.skillGroupsToSave[below.name] = angular.copy(below);
            vm.skillGroupsToSave[skillGroup.name] = angular.copy(skillGroup);

            updateSkillGroupList();
        }
    }
})();
