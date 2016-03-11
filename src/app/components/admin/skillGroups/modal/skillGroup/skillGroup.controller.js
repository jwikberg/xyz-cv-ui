(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.skillGroups.modal')
        .controller('SkillGroupController', SkillGroupController);

    function SkillGroupController(SkillGroupModal, Skills, SkillGroups, editSkillGroup, $q, callback) {
        var vm = this;

        vm.editSkillGroup = editSkillGroup;
        vm.skills = [];
        vm.skillGroups = [];
        vm.selectedSkillGroup = {};
        vm.setSkillForEditing = setSkillForEditing;
        vm.skillsToSave = {};
        vm.skillsToRemove = {};
        vm.save = save;
        vm.selectedSkills = [];
        vm.selectedSkill = {};
        vm.addSkill = addSkill;
        vm.saveSkills = saveSkills;
        vm.removeSkillFromGroup = removeSkillFromGroup;
        vm.skillHash = {};
        vm.skillIdHash = {};
        vm.skillGroupHash = {};
        vm.skillGroupIdHash = {};
        vm.isValidSkill = isValidSkill;
        vm.isValidSkills = isValidSkills;
        vm.hideModal = SkillGroupModal.deactivate;

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
                    setHashes(vm.skills, vm.skillGroups);
                });
        }

        function isValidSkill(skill) {
            return vm.skillHash[skill.name];
        }

        function isValidSkills() {
            return vm.selectedSkillGroup.skillGroupId && vm.selectedSkills.length > 0;
        }

        // EDIT
        //==================================================================

        function addSkill(skill) {
            if (skill && skill.name && vm.skillHash[skill.name]) {
                editSkill(skill)
                    .then(function(skill) {
                        vm.skillsToSave[skill.name] = angular.copy(skill);
                        delete vm.selectedSkill.name;
                        updateSkillList();
                    });
            }
        }

        function saveSkills(skills) {
            if (skills.length > 0 && vm.selectedSkillGroup) {
                editSkills(skills)
                    .then(function(skills) {
                        skills.forEach(function(skill) {
                            vm.skillsToSave[skill.name] = angular.copy(skill);
                        });
                        vm.selectedSkills = [];
                        updateSkillList();
                    });
            }
        }

        function editSkill(skill) {
            return $q(function(resolve) {
                var existingSkill = vm.skillHash[skill.name];
                skill.skillGroupId = vm.editSkillGroup.name;
                existingSkill.skillGroupId = skill.skillGroupId;
                existingSkill = convertToSkillGroupId(existingSkill);
                vm.skillHash[skill.name] = angular.copy(existingSkill);
                return resolve(existingSkill);
            });
        }

        function editSkills(skills) {
            return $q(function(resolve) {
                var existingSkills = [];
                skills.forEach(function(skill) {
                    skill.skillGroupId = vm.selectedSkillGroup.skillGroupId;
                    var existingSkill = vm.skillHash[skill.name];
                    existingSkill.skillGroupId = skill.skillGroupId;
                    existingSkill = convertToSkillGroupId(existingSkill);
                    vm.skillHash[skill.name] = angular.copy(existingSkill);
                    existingSkills.push(skill);
                });
                return resolve(existingSkills);
            });
        }

        function removeSkillFromGroup(skill) {
            return $q(function(resolve) {
                var existingSkill = vm.skillHash[skill.name];
                existingSkill.skillGroupId = null;
                vm.skillHash[skill.name] = angular.copy(existingSkill);
                return resolve(existingSkill);
            })
            .then(function(skill) {
                vm.skillsToRemove[skill.name] = angular.copy(skill);
                updateSkillList();
            });
        }

        function setSkillForEditing(skill) {
            vm.selectedSkill = angular.copy(skill);
            vm.selectedSkill = convertToSkillGroupName(vm.selectedSkill);
        }

        function save() {
            return saveEditedSkills()
                .then(removeSkillsFromGroup())
                .then(vm.hideModal)
                .then(callback);
        }

        function setHashes(skills, skillGroups) {
            var skillHash = Object.create(null);
            var skillIdHash = Object.create(null);
            var skillGroupHash = Object.create(null);
            var skillGroupIdHash = Object.create(null);

            skills.forEach(function(skill) {
                skillHash[skill.name] = skill;
                skillIdHash[skill._id] = skill;
            });

            vm.skillHash = skillHash;
            vm.skillIdHash = skillIdHash;

            skillGroups.forEach(function(skillGroup) {
                skillGroupHash[skillGroup.name] = skillGroup;
                skillGroupIdHash[skillGroup._id] = skillGroup;
            });

            vm.skillGroupHash = skillGroupHash;
            vm.skillGroupIdHash = skillGroupIdHash;

            updateSkillList();
        }

        function saveEditedSkills() {
            return $q(function(resolve) {
                var promises = [];
                Object.keys(vm.skillsToSave).map(function(key) {
                    promises.push(vm.skillsToSave[key].$save());
                });
                return $q.all(promises)
                    .then(resolve);
            });
        }

        function removeSkillsFromGroup() {
            return $q(function(resolve) {
                var promises = [];
                Object.keys(vm.skillsToRemove).map(function(key) {
                    promises.push(vm.skillsToRemove[key].$save());
                });
                return $q.all(promises)
                    .then(resolve);
            });
        }

        function convertToSkillGroupId(skill) {
            if (skill.skillGroupId && skill.skillGroupId.length) {
                skill.skillGroupId = vm.skillGroupHash[skill.skillGroupId]._id;
            }
            return skill;
        }

        function convertToSkillGroupName(skill) {
            if (skill.skillGroupId && skill.skillGroupId.length) {
                skill.skillGroupId = vm.skillGroupIdHash[skill.skillGroupId].name;
            }
            return skill;
        }

        function updateSkillList() {
            vm.skills = Object.keys(vm.skillHash).map(function(key) {return vm.skillHash[key];});
        }
    }
})();
