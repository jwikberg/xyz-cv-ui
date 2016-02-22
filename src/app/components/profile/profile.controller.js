(function() {
    'use strict';

    angular
        .module('xyz-cv-ui.profile')
        .controller('ProfileController', ProfileController);

        function ProfileController(ProfileModel, $routeParams, session, API_URL, GeneralInfoModal, ImageModal, PrivateInfoModal, SummaryModal, SkillsModal, AssignmentsModal) {
            var vm = this;
            window.vm = vm;

            vm.API_URL = API_URL;
            vm.activated = false;
            vm.user = {};

            /* SESSION */
            vm.isAllowed = session.isAllowed;
            vm.isSelf = session.isSelf;
            vm.canView = session.canView;

            /* MODAL */
            vm.generalInfoModal = {};
            vm.summaryModal = {};
            vm.skillsModal = {};
            vm.assignmentsModal = {};
            vm.showModal = showModal;

            /* GENERAL INFO */
            vm.generalInfo = {
                profileImage: '',
                name: '',
                email: '',
                role: {},
                office: {},
                phoneNumber: '',
                employeeNumber: '',
                position: '',
                country: '',
                closestSuperior: '',
                sex: '',
                description: '',
                personalInterests: '',
                contactInfo: ''
            };

            /* PRIVATE INFO */
            vm.privateInfo = {
                personalIdNumber: '',
                address: '',
                city: '',
                ZIP: '',
                ICEName: '',
                ICEPhone: '',
                startDateOfEmployment: '',
                endDateOfEmployment: '',
                shirtSize: '',
                foodPreferences: '',
                addressInfo: '',
                ICEInfo: '',
            };

            /* SUMMARY */
            vm.summary = {
                summary: ''
            };

            /* SKILLS */
            vm.skills = [];

            /* SKILLGROUPS */
            vm.skillGroups = [];

            /* CERTIFICATES */
            vm.certificates = [];

            /* ASSIGNMENTS */
            vm.assignments = [];

            /* CUSTOM HEADERS */
            vm.customHeaders= [];

            /* SOCIAL MEDIA */
            vm.socialMedia = {
                linkedin: '',
                facebook: '',
                twitter: ''
            };

            /* CLOUD */
            vm.cloud = {
                words: [],
                maxWeight: 1
            };

            session.isLoaded()
                .then(activate);

            //////////////

            function activate() {
                ProfileModel.get({_id: $routeParams.userId})
                    .$promise.then(function(model) {
                        setGeneralInfo(model);
                        setPrivateInfo(model);
                        setSummary(model);
                        setSkills(model);
                        setSkillGroups(model);
                        setCertificates(model);
                        setAssignments(model);
                        setCloud(model);
                        setUser(model);
                        setGeneralInfoModal();
                        setImageModal();
                        setPrivateInfoModal();
                        setSummaryModal();
                        setSkillsModal();
                        setAssignmentsModal();
                        vm.activated = true;
                    });
            }

            function setGeneralInfo(model) {
                vm.generalInfo = {
                    profileImage: model.user.profileImage,
                    name: model.user.name,
                    email: model.user.email,
                    role: model.user.role,
                    office: model.user.office,
                    phoneNumber: model.user.phoneNumber,
                    employeeNumber: model.user.employeeNumber,
                    position: model.user.position,
                    country: model.user.country,
                    closestSuperior: model.user.closestSuperior,
                    sex: model.user.sex,
                    description: model.user.description,
                    personalInterests: model.user.personalInterests.join(', ')
                };
            }

            function setPrivateInfo(model) {
                vm.privateInfo = {
                    personalIdNumber: model.user.personalIdNumber,
                    address: model.user.address,
                    city: model.user.city,
                    ZIP: model.user.ZIP,
                    ICEName: model.user.ICEName,
                    ICEPhone: model.user.ICEPhone,
                    startDateOfEmployment: model.user.startDateOfEmployment,
                    endDateOfEmployment: model.user.endDateOfEmployment,
                    foodPreferences: model.user.foodPreferences,
                    shirtSize: model.user.shirtSize,
                    addressInfo: getAddressInfo(model),
                    ICEInfo: getICEInfo(model),
                };
            }

            function setSummary(model) {
                vm.summary = {
                    summary: model.user.summary
                };
            }

            function setSkills(model) {
                vm.skills = model.user.skills;
            }

            function setSkillGroups(model) {
                vm.skillGroups = model.user.skillGroups;
            }

            function setCertificates(model) {
                vm.certificates = model.user.certificates;
            }

            function setAssignments(model) {
                vm.assignments = model.user.assignments;
            }

            function setCloud(model) {
                vm.cloud = model.cloud;
            }

            function setUser(model) {
                vm.user = model.user;
            }

            function getAddressInfo(model) {
                var items = [];
                if (model.user.address) {
                    items.push(model.user.address);
                }
                if (model.user.ZIP) {
                    items.push(model.user.ZIP);
                }
                if (model.user.city) {
                    items.push(model.user.city);
                }
                return items.join(' | ');
            }

            function getICEInfo(model) {
                var items = [];
                if (model.user.ICEName) {
                    items.push(model.user.ICEName);
                }
                if (model.user.ICEPhone) {
                    items.push(model.user.ICEPhone);
                }
                return items.join(' | ');
            }

            function getUser() {
                return vm.user;
            }

            /* MODAL */

            function showModal(modal, block) {
                vm.currentModal = modal;
                var locals = {
                    block: angular.copy(block),
                    user: getUser(),
                    callback: activate
                };
                vm.currentModal.activate(locals);
            }

            function setGeneralInfoModal() {
                vm.generalInfoModal = GeneralInfoModal;
            }

            function setPrivateInfoModal() {
                vm.privateInfoModal = PrivateInfoModal;
            }

            function setSummaryModal() {
                vm.summaryModal = SummaryModal;
            }

            function setImageModal() {
                vm.imageModal = ImageModal;
            }

            function setSkillsModal() {
                vm.skillsModal = SkillsModal;
            }

            function setAssignmentsModal() {
                vm.assignmentsModal = AssignmentsModal;
            }
        }
})();
