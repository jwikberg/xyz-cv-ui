(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.admin.modal')
        .controller('SkillCategoriesController', SkillCategoriesController);

        function SkillCategoriesController(SkillCategoriesModal, Skills, SkillGroups, $q, callback) {
            var vm = this;
            
            vm.skills = [];
            vm.skillGroups = [];
            vm.selectedSkillGroup = {};
            vm.setSkillForEditing = setSkillForEditing;
            vm.skillsToSave = {};
            vm.save = save;
            vm.selectedSkills = [];
            vm.saveSkill = saveSkill;
            vm.skillHash = {};
            vm.skillIdHash = {};
            vm.skillGroupHash = {};
            vm.skillGroupIdHash = {};
            vm.isValidSkill = isValidSkill;
            vm.hideModal = SkillCategoriesModal.deactivate;

            vm.skillsPage = [];
            vm.currentPage = 0;
            vm.nextPage = nextPage;
            vm.previousPage = previousPage;
            vm.setPage = setPage;
            vm.getPageCount = getPageCount;
            
            
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
                        //vm.setPage(0);
                    });
            }

            function isValidSkill() {
                return vm.selectedSkillGroup.skillGroupId && vm.selectedSkills.length > 0;
            }

            // EDIT
            //==================================================================

            function saveSkill(skills) {
                if (skills.length > 0 && vm.selectedSkillGroup) {
                    editSkill(skills)
                        .then(function(skills) {
                            skills.forEach(function(skill) {
                                vm.skillsToSave[skill.name] = angular.copy(skill);
                                delete skill._id;
                            });
                            updateSkillList();
                        });
                }
            }

            function editSkill(skills) {
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

            function setSkillForEditing(skill) {
                vm.currentSkill = angular.copy(skill);
                vm.currentSkill = convertToSkillGroupName(vm.currentSkill);
            }

            function save() {
                return saveSkills()
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
                vm.skills = Object.keys(vm.skillHash).map(function(key){return vm.skillHash[key];});
                vm.setPage(vm.currentPage);
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
                var lastIndex = Math.min(pageNumber * 7 + 7, vm.skills.length);
                var indices = lastIndex - firstIndex;
                vm.skillsPage = vm.skills.slice(firstIndex, lastIndex);
            }

            function getPageCount() {
                return Math.ceil(vm.skills.length / 7);
            }

        }

})();
