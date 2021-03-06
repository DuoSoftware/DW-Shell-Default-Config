// 'use strict';
var p_boarding_module = angular.module("platformBoardingModule", ["ui.router", "ngAnimate", "uiMicrokernel", "ngMaterial", "ngMessages", "ngImgCrop", "cloudcharge", "payment-tools"]);
//Platform entry view route configuration - Start
p_boarding_module.config(['$stateProvider', '$urlRouterProvider', function ($sp, $urp) {
    $urp.otherwise('/main');
    $sp.state('main', {
        url: '/main',
        templateUrl: 'main-partial.html',
        controller: 'boarding-main-ctrl'
    }).state('createcompany', {
        url: '/createcompany',
        templateUrl: 'createcompany-partial.html',
        controller: 'boarding-createcompany-ctrl'
    }).state('joincompany', {
        url: '/joincompany',
        templateUrl: 'joincompany-partial.html',
        controller: 'boarding-joincompany-ctrl'
    }).state('plans', {
        url: '/plans',
        templateUrl: 'plans-partial.html',
        controller: 'boarding-createcompany-ctrl'
    }).state('shellconfig', {
        url: '/shellcustomization',
        templateUrl: 'shellconfig-partial.html',
        controller: 'boarding-createcompany-ctrl'
    });
}]);
//Platform entry view route configuration - End
p_boarding_module.controller("boarding-parent-ctrl", ["$scope", "$timeout", "$state", "$location", function ($scope, $timeout, $state, $location) {
    $scope.navigateJoinCompanyProcess = function () {
        $state.go('joincompany');
    };
    $scope.navigateCreateCompanyProcess = function () {
        $state.go('createcompany');
    };
    $scope.navigateCustomerBoardingProcess = function () {
        $state.go('main');
    };
}]);
//Platform boarding view main controller - start
p_boarding_module.controller("boarding-main-ctrl", ["$scope", function ($scope) {}]);
//Create company view Controller - Start
p_boarding_module.controller("boarding-createcompany-ctrl", ["$window", "$scope", "$http", "$state", "$location", "$mdDialog", "$charge", "$v6urls", "$auth", "$helpers", "$rootScope", "$uploader", "$apps", "$timeout", "$q", "paymentGateway", function ($window, $scope, $http, $state, $location, $mdDialog, $charge, $v6urls, $auth, $helpers, $rootScope, $uploader, $apps, $timeout, $q, paymentGateway) {
    $scope.createCompanySuccess = false;
    $scope.hostedDomain = "." + $window.location.host;
    $scope.businessType = [];
    $scope.companyLocation = [];
    $scope.createCompanyDetails = {
        "TenantID": "",
        "Name": "", // "Shell": "",
        "Statistic": {
            "DataDown": "1GB",
            "DataUp": "1GB",
            "NumberOfUsers": "1"
        },
        "Private": true,
        "OtherData": {
            "CompanyType": "",
            "CompanyLocation": ""
        },
        "TenantType": "Company"
    };
    $scope.loadBusinessType = function () {
        $http.get('data/business.json').
        success(function (data, status, headers, config) {
            $scope.businessType = data;
        }).
        error(function (data, status, headers, config) {
            console.log('cant load business types !');
        });
    };
    $scope.loadLocations = function () {
        $http.get('data/countries.json').
        success(function (data, status, headers, config) {
            $scope.companyLocation = data;
            var tempArray = $scope.companyLocation.map(function (state) {
                return {
                    value: state.countryName.toLowerCase(),
                    display: state.countryName
                };
            });
            // console.log(tempArray);
            $scope.country.states = tempArray;
        }).error(function (data, status, headers, config) {
            console.log('cant load countries !');
        });
    };
    $scope.loadLocations();

    function getCurrentUserCountry() {
        $http.get('http://ip-api.com/json').
        success(function (data, status, headers, config) {
            //console.log(data);
            $scope.createCompanyDetails.OtherData.CompanyLocation = data.country;
            $scope.country.selectedItem = data.country;
        }).
        error(function (data, status, headers, config) {
            //console.log(data);
            scope.country.selectedItem = null;
        });
    };
    getCurrentUserCountry();
    $scope.country = {};
    $scope.country.searchText = null;
    $scope.country.querySearch = querySearch;

    function querySearch(query) {
        var results = query ? $scope.country.states.filter(createFilterFor(query)) : $scope.country.states;
        var deferred = $q.defer();
        $timeout(function () {
            deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }
    $scope.country.selectedItemChange = function (item) {
        if (item) {
            $scope.createCompanyDetails.OtherData.CompanyLocation = item.value;
        }
    };
    //$scope.tenantAvailabilityMessage = "Tenant Name is a Must"
    $scope.checkTenantAvailability = function (data) {
        console.log("checking availability");
        //$scope.tenantAvailabilityMessage = "Tenant Name Available";
    };

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }
    $scope.country.selectedItemChange = function (item) {
        if (item) {
            $scope.createCompanyDetails.OtherData.CompanyLocation = item.value;
        }
    };
    //$scope.tenantAvailabilityMessage = "Tenant Name is a Must"
    $scope.checkTenantAvailability = function (data) {
        console.log("checking availability");
        //$scope.tenantAvailabilityMessage = "Tenant Name Available";
    };
    $scope.showPlans = function () {
        $rootScope.createCompanyDetails = $scope.createCompanyDetails;
        if ($scope.createCompanyDetails.TenantType == 'Developer') {
            $scope.submitCreateCompanyDetails(function(data) {
                if (data.Success === true) {
                    $rootScope.TenantID = data.Data.TenantID;
                    $state.go('shellconfig');
                    // resetFormPrestine();
                } else {
                    $state.go('createcompany');
                    displaycreateCompanyDetailsSubmissionError('Sorry, ' + data.Message);
                    // resetFormPrestine();
                }
            });
        } else {
            $state.go('plans');
        }
    };
    $scope.$watch("createCompanyDetails.TenantType", function () {
        if ($scope.createCompanyDetails.TenantType === "Developer") {
            $scope.hostedDomain = ".dev." + $scope.hostedDomain;
            $scope.agreement = false;
            console.log("make false");
        } else {
            $scope.hostedDomain = "." + $window.location.host;
            $scope.agreement = true;
            console.log("make true");
        }
    });
    $scope.toggleAgreement = function () {
        $scope.agreement = !$scope.agreement;
    }
    $scope.showDeveloperAgreement = function () {
        window.open('partials/developerAgreement.html')
    }
    $scope.submitCreateCompanyDetails = function (func) {
        displaycreateCompanyDetailsSubmissionProgress('Submitting your tenant details, please wait...');
        createTenant(function(status, response) {
            if(status) {
                $mdDialog.hide(); $state.go('shellconfig');
            }else {
                $mdDialog.hide(); $state.go('createcompany');
                displaycreateCompanyDetailsSubmissionError('Sorry, ' + response);
            }
        });
    };
    $scope.selectPlan = function (package, ev) {//This is the click event for adding a company tenant in add.html
        console.log(package);
        
        if(!package)
            return;
        
        packageprice = parseInt(package.price);
        payconfig = { description: package.name, lable: package.price};

        if(packageprice > 0) { 
            requestCardDetails(ev, payconfig, function(status, token) {
                if(status) {
                    createCompanyTenant({
                        token: token,
                        plan: package
                    });
                }
            });
        }else {
            createCompanyTenant({plan: package});
        }
    }
    var requestCardDetails = function(ev, config, callback) {

        var payconfig = {
            publishKey: 'pk_test_8FepS5OSLnghnaPfVED8Ixkx',
            title: 'Duoworld',
            description: (config.description) ? config.description : "for connected business",
            logo: 'icons/small-logo.png',
            label: (config.lable) ? "Pay $"+config.lable : "Pay" 
        };

        var stripegateway = paymentGateway.setup('stripe').configure(payconfig);
        stripegateway.open(ev, function(token, args) {
            if(token.hasOwnProperty("id")) callback(true, token.id);
            else callback(false)
        });
    }
    var createCompanyTenant = function(p) {
        var params = p;
        
        displaycreateCompanyDetailsSubmissionProgress('Submitting your company details, please wait...');
        createTenant(function(status, tenant) {
            if(status) { // company tenant created successfully
                attachSubscriptionPlan(params.plan, params.token, tenant, function(status, result) { // plan subscription successed.
                    if(status) {
                        $mdDialog.hide(); $state.go('shellconfig');
                    } else {
                        displaycreateCompanyDetailsSubmissionError('Sorry, ' + result);
                    }
                });
            }else {
                $mdDialog.hide(); $state.go('createcompany');
                displaycreateCompanyDetailsSubmissionError('Sorry, ' + tenant);
            }
        });
    }
    var createTenant = function(callback) {
        if(!$rootScope.createCompanyDetails)
            return;

        var payload = $rootScope.createCompanyDetails;

        $http({
            method: 'POST',
            url: '/apis/usertenant/tenant',
            data: payload,
            headers: {
                'Content-type': 'application/json',
                'securityToken': $helpers.getCookie('securityToken')
            }
        }).success(function(data, status, headers, config) {
            if(data.Success) { $rootScope.TenantID = data.Data.TenantID; callback(true, data.Data); }
            else callback(false, data.Message);
        }).error(function(data, status, headers, config) {
            callback(false);
        })
    }
    var attachSubscriptionPlan = function(plan, token, tenant, callback) {
        var subscription = {};
        
        if(token) subscription.token = token; 
        subscription.planCode = plan.id;
        subscription.tenantId = tenant.TenantID;
        subscription.alacarts = [];

        getSession(tenant.TenantID, function(status, session) {
            if(status) {
                $http({
                    method: "POST",
                    url: "/apis/plan/subscribe",
                    data: subscription,
                    headers: {
                        'Content-Type': 'application/json',
                        'securityToken': session.SecurityToken
                    }
                }).success(function(data, status, headers, config) {
                    if(data.success) callback(true, data);
                    else callback(false, data.message);
                }).error(function(data, status, headers, config) {
                    callback(true, data);
                });
            }else {
                callback(false, session);
            }
        })
    }
    var getSession = function(tenantid, callback) {
        var tenantId = (!tenantid) ? "Nil" : tenantid;
        $http({
            method: 'GET',
            url: '/auth/GetSession/' + $helpers.getCookie('securityToken') +'/' + tenantId,
            headers: {
                'Content-type': 'application/json',
            }
        }).success(function(data, status, headers, config) {
            if(data.hasOwnProperty('UserID')) callback(true, data);
            else callback(false, data.Message);
        }).error(function(data, status, headers, config) {
            callback(false);
        })
    }
    var resetFormPrestine = function () {
        $scope.createCompanyDetails = {};
        // $scope.joinCompanyForm.$setPristine();
    };
    var defaultDataInjection = function (data) {
        if (data.TenantType === "Compnay") {
            data.TenantID = data.TenantID + "." + $scope.hostedDomain;
        } else {
            data.TenantID = data.TenantID + ".dev." + $scope.hostedDomain;
        };
        return data;
    };
    var displaycreateCompanyDetailsSubmissionError = function (message) {
        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).clickOutsideToClose(true).title('Failed to create company !').textContent('' + message + '').ariaLabel('Failed to create company.').ok('Got it!'));
    };
    var displaycreateCompanyDetailsSubmissionProgress = function (a) {
        $mdDialog.show({
            template: '<md-dialog ng-cloak>' + '   <md-dialog-content>' + '       <div style="height:auto; width:auto; padding:10px;" class="loadInidcatorContainer" layout="row" layout-align="start center">' + '           <md-progress-circular class="md-primary" md-mode="indeterminate" md-diameter="40"></md-progress-circular>' + '           <span>' + a + '</span>' + '       </div>' + '   </md-dialog-content>' + '</md-dialog>',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        });
    };
    // $scope.switchEntryView = function(stateinchange){
    // 	$state.go(''+stateinchange+'');
    // };
    //shell config start
    $scope.config = {
        "companyConfiguration": {
            "title": "",
            "logo": "images/tennantassets/customizedlogo_white.png",
            "banner": "images/logo.png"
        },
        "shellConfiguration": {
            "userEditable": true,
            "docklayoutconfiguration": {
                "pannelcollection": [
                    {
                        "shellRelationship": "DuoWorld Alpha Shell v 1.0",
                        "panelDescription": "Framework shell applications panel",
                        "panelTitle": "applications",
                        "pannnelDirectiveContentTemplate": "partials/panel-templates/applications-pannel.html",
                        "panelArrangement": 0,
                        "pannelContentCollectionType": "application-component",
                        "row": 0,
                        "col": 0,
                        "panelType": "Applications"
			}
                    , {
                        "shellRelationship": "DuoWorld Alpha Shell v 1.0",
                        "panelDescription": "Framework shell custom panel",
                        "panelTitle": "collection",
                        "pannnelDirectiveContentTemplate": "partials/panel-templates/collections-pannel.html",
                        "panelArrangement": 1,
                        "pannelContentCollectionType": "various-component",
                        "row": 0,
                        "col": 1,
                        "panelType": "Collections"
			}
		],
                "dockoptions": {
                    "transitioneffect": "crossFade",
                    "layoutdirection": "horizontal",
                    "pagination": false,
                    "looppannels": true
                }
            },
            "themeconfiguration": {
                "palettename": "indigo",
                "primarypalette": "#3F51B5",
                "accentpalette": "#E91E63"
            },
            "backgroundconfiguration": [
                {
                    "backgroundtype": "solid",
                    "backgroundtypeactive": false,
                    "backgroundcolor": "#FF4081"
		}
                , {
                    "backgroundtype": "gradient",
                    "backgroundtypeactive": false,
                    "backgroundgradientconfig": {
                        "color1": "#FF4081",
                        "color2": "#3F51B5",
                        "orientation": "diagonalup"
                    }
		}
                , {
                    "backgroundtype": "image",
                    "backgroundtypeactive": true,
                    "backgroundimageconfig": {
                        "imageurl": "images/shellassets/background/blur-background12.jpg",
                        "imageblur": {
                            "status": true,
                            "amount": 10
                        },
                        "textureoverlay": false,
                        "vignetteoverlay": false
                    }
		}
	]
        },
        "defaultAppConfiguration": [],
        "tenantId": ""
    };
    $scope.state = "branding";
    $scope.configIndex = 0;
    $scope.profilePicture = "images/appIcons/contacts.png";
    $scope.device = "desktop";
    $scope.defaultThemes = [
        {
            primarypaletteName: 'red',
            primarypalette: '#F44336',
            accentpalette: '#FFC107'
            }
        , {
            primarypaletteName: 'pink',
            primarypalette: '#E91E63',
            accentpalette: '#CDDC39'
            }
        , {
            primarypaletteName: 'puple',
            primarypalette: '#9C27B0',
            accentpalette: '#00BCD4'
            }
        , {
            primarypaletteName: 'deep-purple',
            primarypalette: '#673AB7',
            accentpalette: '#FF5722'
            }
        , {
            primarypaletteName: 'indigo',
            primarypalette: '#3F51B5',
            accentpalette: '#FF4081'
            }
        , {
            primarypaletteName: 'blue',
            primarypalette: '#2196F3',
            accentpalette: '#607D8B'
            }
        , {
            primarypaletteName: 'light-blue',
            primarypalette: '#03A9F4',
            accentpalette: '#FF5252'
            }
        , {
            primarypaletteName: 'cyan',
            primarypalette: '#00BCD4',
            accentpalette: '#FFC107'
            }
        , {
            primarypaletteName: 'teal',
            primarypalette: '#009688',
            accentpalette: '#FF9800'
            }
        , {
            primarypaletteName: 'green',
            primarypalette: '#4CAF50',
            accentpalette: '#7C4DFF'
            }
        , {
            primarypaletteName: 'light-green',
            primarypalette: '#8BC34A',
            accentpalette: '#607D8B'
            }
        , {
            primarypaletteName: 'lime',
            primarypalette: '#CDDC39',
            accentpalette: '#00BCD4'
            }
        , {
            primarypaletteName: 'yellow',
            primarypalette: '#FFEB3B',
            accentpalette: '#536DFE'
            }
        , {
            primarypaletteName: 'amber',
            primarypalette: '#FFC107',
            accentpalette: '#03A9F4'
            }
        , {
            primarypaletteName: 'orange',
            primarypalette: '#FF9800',
            accentpalette: '#009688'
            }
        , {
            primarypaletteName: 'deep-orange',
            primarypalette: '#FF5722',
            accentpalette: '#CDDC39'
            }
        , {
            primarypaletteName: 'brown',
            primarypalette: '#795548',
            accentpalette: '#CDDC39'
            }
        , {
            primarypaletteName: 'grey',
            primarypalette: '#9E9E9E',
            accentpalette: '#00BCD4'
            }
        , {
            primarypaletteName: 'blue-grey',
            primarypalette: '#607D8B',
            accentpalette: '#FFC107'
            }
		];
    $scope.wallpapers = [
        {
            imgUrl: 'images/shellassets/background/blur-background01.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background01.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background02.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background02.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background03.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background03.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background04.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background04.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background05.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background05.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background06.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background06.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background07.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background07.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background08.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background08.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background09.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background09.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background10.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background10.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background11.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background11.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background12.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background01.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background13.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background13.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background14.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background14.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background15.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background15.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background16.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background16.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background17.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background17.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background18.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background18.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background19.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background19.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background20.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background20.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background21.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background21.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background22.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background22.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background23.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background23.jpg'
            }
        , {
            imgUrl: 'images/shellassets/background/blur-background24.jpg',
            thumb: 'images/shellassets/background/250x250_blur-background24.jpg'
            }
		];
    $scope.companyPricePlans = [
        {
            id: "dw_pkg_personal",
            name: "Personal Space",
            numberOfUsers: "1",
            numberOfApps: "Unlimited",
            storage: "10 GB",
            price: "0",
            per: "/ Mo",
            Description: "desc"
        }
        , {
            id: "dw_pkg_mini_team",
            name: "We Are A Mini Team",
            numberOfUsers: "5",
            numberOfApps: "Unlimited",
            storage: "10 GB",
            price: "2.99",
            per: "/ Mo",
            Description: "desc"
        }
        , {
            id: "dw_pkg_world_team",
            name: "We Are the World",
            numberOfUsers: "Unlimited",
            numberOfApps: "Unlimited",
            storage: "10 GB",
            price: "4.99",
            per: "/ User",
            Description: "desc"
        }];
    //$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //    console.log(toState);
    //    if (toState.name === "shellconfig") {
    //        showShellCustomizationIntro();
    //    }
    //});
    if ($state.current.name === "shellconfig") {
        showShellCustomizationIntro();
    };

    function showShellCustomizationIntro() {
        $mdDialog.show({
            controller: shellCustomizationIntroController,
            templateUrl: 'shellCustomizationIntro.html', // targetEvent: ev
            clickOutsideToClose: true
                //, //fullscreen: useFullScreen
        }).then(function (answer) {
            if (answer.status) {
                $scope.finish(answer.ev);
            };
        }, function () {});
    };

    function shellCustomizationIntroController($scope) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.skipShellCustomization = function (ev) {
            var answer = {
                status: true,
                ev: ev
            }
            $mdDialog.hide(answer);
        };
    };
    $scope.assignTheme = function (b) {
        $scope.config.shellConfiguration.themeconfiguration.palettename = b.primarypaletteName;
        $scope.config.shellConfiguration.themeconfiguration.primarypalette = b.primarypalette;
        $scope.config.shellConfiguration.themeconfiguration.accentpalette = b.accentpalette;
    };
    $scope.setBackground = function (c) {
        $scope.config.shellConfiguration.backgroundconfiguration[2].backgroundimageconfig.imageurl = c;
    };
    $scope.uploadLogo = function () {
        $scope.myImage = '';
        document.getElementById("fileInput").click();
    };
    $scope.selectShellBackground = function () {
        $scope.shellBackground = '';
        document.getElementById("shellBackground").click();
    };

    function getAllApps() {
        $apps.onAppsRetrieved(function (e, data) {
            var appIconHostName = window.location.hostname;
            for (var appIndex in data.apps) {
                var iconUrl = data.apps[appIndex].iconUrl;
                if (iconUrl) {
                    if (iconUrl.indexOf("http") === 0) {
                        data.apps[appIndex].iconUrl = iconUrl;
                    } else {
                        data.apps[appIndex].iconUrl = window.location.protocol + "//" + appIconHostName + iconUrl;
                    }
                } else {
                    data.apps[appIndex].iconUrl = "/devportal/appicons/29fa48d1ffbb1f3792a417cda647df7d.png";
                }
            }
            $scope.apps = data.apps;
            console.log($scope.apps);
        });
        $apps.getAppsForUser();
    };
    //getAllApps();
    $scope.myImage = '';
    $scope.myCroppedImage = "images/tennantassets/customizedlogo_white.png";
    $scope.handleFileSelect = function (evt) {
        console.log(evt);
        var file = evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    //search bar start
    $scope.searchBarRevealed = false;
    $scope.revealSearchBar = function () {
        $scope.searchBarRevealed = !$scope.searchBarRevealed;
        $scope.globalSearchKeyword = "";
    };
    //end of search bar
    /*toggle left menu*/
    $scope.toggleLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
    $scope.uploadCompanyLogo = function () {
        if ($scope.myCroppedImage === "images/tennantassets/customizedlogo_white.png") {
            $scope.configIndex = $scope.configIndex + 1
        } else {
            displaycreateCompanyDetailsSubmissionProgress("Uploading Company Logo, Please wait...");
            var myblob = dataURItoBlob($scope.myCroppedImage);
            var file = blobToFile(myblob, "logo");
            console.log(file);
            //            $uploader.onSuccess(function () {
            //                $mdDialog.hide();
            //                // console.log("logo uploaded successfully");
            //                $scope.configIndex = $scope.configIndex + 1
            //                    //return true;
            //                $scope.config.companyConfiguration.logo = "/apis/media/tenant/companylogo/logo.jpg";
            //            });
            //            $uploader.onError(function () {
            //                $mdDialog.hide();
            //                // console.log("logo upload failed");
            //                var confirm = $mdDialog.confirm()
            //                    .title('Something went wrong!')
            //                    .textContent('couldnt upload the company logo')
            //                    .ariaLabel('Lucky day')
            //                    //.targetEvent(ev)
            //                    .ok('Retry!')
            //                    .cancel('use the default');
            //                $mdDialog.show(confirm).then(function () {
            //                    $scope.uploadLogo();
            //                }, function () {
            //                    $scope.configIndex = $scope.configIndex + 1;
            //                    $scope.myCroppedImage = "images/tennantassets/customizedlogo_white.png";
            //                });
            //                //return false;
            //            });
            //            $uploader.uploadUserMedia("companylogo", file, "logo.jpg");
            //            $uploader.onSuccess(function () {
            //                $mdDialog.hide();
            //                // console.log("logo uploaded successfully");
            //                $scope.configIndex = $scope.configIndex + 1
            //                    //return true;
            //                $scope.config.companyConfiguration.logo = "/apis/media/tenant/companylogo/logo.jpg";
            //            });
            //            $uploader.onError(function () {
            //                $mdDialog.hide();
            //                // console.log("logo upload failed");
            //                var confirm = $mdDialog.confirm()
            //                    .title('Something went wrong!')
            //                    .textContent('couldnt upload the company logo')
            //                    .ariaLabel('Lucky day')
            //                    //.targetEvent(ev)
            //                    .ok('Retry!')
            //                    .cancel('use the default');
            //                $mdDialog.show(confirm).then(function () {
            //                    $scope.uploadLogo();
            //                }, function () {
            //                    $scope.configIndex = $scope.configIndex + 1;
            //                    $scope.myCroppedImage = "images/tennantassets/customizedlogo_white.png";
            //                });
            //                //return false;
            //            });
            //            $uploader.uploadUserMedia("companylogo", file, "logo.jpg");
            var customName = "logo.jpg";
            var namespace = $rootScope.TenantID;
            var cls = "companylogo";
            //var file = $scope.shellBackground;
            var isMedia = true;
            if (!customName) customName = file.name;
            var uUrl;
            //if (isMedia) uUrl = $v6urls.mediaLib + "/" + cls + "/" + customName;
            if (isMedia) uUrl = "http://" + namespace + "/apis/media/tenant/" + cls + "/" + customName;
            else uUrl = $v6urls.objectStore + "/" + namespace + "/" + cls + "/" + customName + "/";
            var fd;
            if (isMedia) fd = file;
            else {
                fd = new FormData();
                fd.append('file', file);
            }
            $http.post(uUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': (isMedia ? "multipart/form-data" : undefined)
                }
            }).success(function (e) {
                $mdDialog.hide();
                // console.log("logo uploaded successfully");
                $scope.configIndex = $scope.configIndex + 1
                    //return true;
                $scope.config.companyConfiguration.logo = "/apis/media/tenant/companylogo/logo.jpg";
            }).error(function (e) {
                $mdDialog.hide();
                // console.log("logo upload failed");
                var confirm = $mdDialog.confirm().title('Something went wrong!').textContent('couldnt upload the company logo').ariaLabel('Lucky day')
                    //.targetEvent(ev)
                    .ok('Retry!').cancel('use the default');
                $mdDialog.show(confirm).then(function () {
                    $scope.uploadLogo();
                }, function () {
                    $scope.configIndex = $scope.configIndex + 1;
                    $scope.myCroppedImage = "images/tennantassets/customizedlogo_white.png";
                });
                //return false;
            });
        };
    };
    $scope.uploadShellBackground = function (ev) {
        $scope.shellBackground = ev.currentTarget.files[0];
        console.log($scope.shellBackground);
        if ($scope.shellBackground === "") {
            $scope.configIndex = $scope.configIndex + 1
        } else {
            displaycreateCompanyDetailsSubmissionProgress("Uploading Shell Background, Please wait...");
            //            $uploader.onSuccess(function () {
            //                $mdDialog.hide();
            //                console.log("background uploaded successfully");
            //                $scope.configIndex = $scope.configIndex + 1
            //                    //return true;
            //                $scope.config.shellConfiguration.backgroundconfiguration[2].backgroundimageconfig.imageurl = "/apis/media/tenant/shellConfigWallpapers/background.jpg";
            //            });
            //            $uploader.onError(function () {
            //                $mdDialog.hide();
            //                console.log("background upload failed");
            //                $mdDialog.show(
            //                    $mdDialog.alert()
            //                    .clickOutsideToClose(true)
            //                    .title('Something went wrong!')
            //                    .textContent('Couldnt upload Background image')
            //                    .ariaLabel('Alert Dialog Demo')
            //                    .ok('Got it!')
            //                    .targetEvent(ev)
            //                );
            //
            //            });
            //            $uploader.uploadUserMedia("shellConfigWallpapers", $scope.shellBackground, "background.jpg");
            var customName = "background.jpg";
            var namespace = $rootScope.TenantID;
            var cls = "shellConfigWallpapers";
            var file = $scope.shellBackground;
            var isMedia = true;
            if (!customName) customName = file.name;
            var uUrl;
            //if (isMedia) uUrl = $v6urls.mediaLib + "/" + cls + "/" + customName;
            if (isMedia) uUrl = "http://" + namespace + "/apis/media/tenant/" + cls + "/" + customName;
            else uUrl = $v6urls.objectStore + "/" + namespace + "/" + cls + "/" + customName + "/";
            var fd;
            if (isMedia) fd = file;
            else {
                fd = new FormData();
                fd.append('file', file);
            }
            $http.post(uUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': (isMedia ? "multipart/form-data" : undefined)
                }
            }).success(function (e) {
                $mdDialog.hide();
                console.log("background uploaded successfully");
                $scope.configIndex = $scope.configIndex + 1
                    //return true;
                $scope.config.shellConfiguration.backgroundconfiguration[2].backgroundimageconfig.imageurl = "/apis/media/tenant/shellConfigWallpapers/background.jpg";
            }).error(function (e) {
                $mdDialog.hide();
                console.log("background upload failed");
                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Something went wrong!').textContent('Couldnt upload Background image').ariaLabel('Alert Dialog Demo').ok('Got it!').targetEvent(ev));
            });
        };
    };

    function blobToFile(theBlob, fileName) {
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return theBlob;
    }

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
        else byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new File([ia], {
            type: 'mimeString'
        });
    }
    $scope.finish = function (ev) {
        //$scope.config.defaultAppConfiguration = $scope.selected;
        displaycreateCompanyDetailsSubmissionProgress("Setting up your Shell, Please wait...");
        $scope.config.tenantId = $rootScope.TenantID;
        console.log($scope.config);
        $http({
            method: 'POST',
            url: '/apis/usertenant/tenant/shell/configurations/' + $rootScope.TenantID,
            headers: {
                'Content-Type': 'application/json'
            },
            data: $scope.config
        }).success(function (data, status, headers, config) {
            $mdDialog.hide();
            console.log(data);
            if (data.Success === true) {
                var confirm = $mdDialog.confirm().title('Your Shell is Ready!').textContent('lets go explore it!').ariaLabel('Lucky day').ok('Lets go!').cancel('');
                $mdDialog.show(confirm).then(function () {
                    window.location.href = "http://" + $rootScope.TenantID + '/shell';
                }, function () {});
                // resetFormPrestine();
            } else {
                displaycreateCompanyDetailsSubmissionError('Sorry, we are having problems creating your company at this moment. Please try again later.');
                // resetFormPrestine();
            }
        }).error(function (data) {
            $mdDialog.hide();
            displaycreateCompanyDetailsSubmissionError('Sorry, we are having problems creating your company at this moment. Please try again later.');
            resetFormPrestine();
        });
    };
    //    $scope.selected = [];
    //    $scope.config.defaultAppConfiguration = $scope.selected;
    //    $scope.toggle = function (item, list) {
    //        var idx = list.indexOf(item);
    //        if (idx > -1) {
    //            list.splice(idx, 1);
    //        } else {
    //            list.push(item);
    //        }
    //    };
    //    $scope.exists = function (item, list) {
    //        return list.indexOf(item) > -1;
    //    };
    //    $scope.isIndeterminate = function () {
    //        return ($scope.selected.length !== 0 &&
    //            $scope.selected.length !== $scope.apps.length);
    //    };
    //    $scope.isChecked = function () {
    //        return $scope.selected.length === $scope.apps.length;
    //    };
    //    $scope.toggleAll = function () {
    //        if ($scope.selected.length === $scope.apps.length) {
    //            $scope.selected = [];
    //        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
    //            $scope.selected = $scope.apps.slice(0);
    //        }
    //        $scope.config.defaultAppConfiguration = $scope.selected;
    //    };
    $scope.showStep = function (a) {
        $state.go('step' + a);
    };
}]);
//Create company view Controller - End
//Join company view Controller - Start
p_boarding_module.controller("boarding-joincompany-ctrl", ["$window", "$scope", "$compile", "$http", "$state", "$location", "$mdDialog", "$mdMedia", function ($window, $scope, $compile, $http, $state, $location, $mdDialog, $mdMedia) {
    $scope.joinCompanySuccess = false;
    $scope.joinCompanyDetails = {};
    $scope.submitJoinCompanyDetails = function (joinCompanyDetails) {
        var payload = angular.toJson(joinCompanyDetails);
        displayjoinRequestSubmissionProgress();
        $http({
            method: 'POST',
            url: 'http://test.12thdoor.com/apis/authorization/userauthorization/userregistration',
            headers: {
                'Content-Type': 'application/json'
            },
            data: payload
        }).success(function (data, status, headers, config) {
            $mdDialog.hide();
            console.log(data);
            if (data.Success === false) {
                displayjoinRequestSubmissionError(data.Message);
                resetFormPrestine();
            } else {
                displayjoinRequestSubmissionError('Sorry, we are having problems processing your request. Please try again later.');
                resetFormPrestine();
            }
        }).error(function (data) {
            $mdDialog.hide();
            displayjoinRequestSubmissionError('Sorry, we are having problems processing your request. Please try again later.');
            resetFormPrestine();
        });
    };
    var resetFormPrestine = function () {
        $scope.joinCompanyDetails = {};
        console.log($scope.joinCompanyDetails);
        // $scope.joinCompanyForm.$setPristine();
    };
    var displayjoinRequestSubmissionError = function (message) {
        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).clickOutsideToClose(true).title('Failed to process your request !').textContent('' + message + '').ariaLabel('Request process error.').ok('Got it!'));
    };
    var displayjoinRequestSubmissionProgress = function () {
        $mdDialog.show({
            template: '<md-dialog ng-cloak>' + '	<md-dialog-content>' + '		<div style="height:auto; width:auto; padding:10px;" class="loadInidcatorContainer" layout="row" layout-align="start center">' + '			<md-progress-circular class="md-primary" md-mode="indeterminate" md-diameter="40"></md-progress-circular>' + '			<span>Submitting your request for an invite, please wait...</span>' + '		</div>' + '	</md-dialog-content>' + '</md-dialog>',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        });
    };
}]);
//Join company view Controller - End
p_boarding_module.directive('availability', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            elem.bind('blur', function () {
                console.log(ngModel.$viewValue);
                var value = ngModel.$viewValue;
                var tenantType = attr.availability;
                value += tenantType;
                checkAvailability(value);
            });

            function checkAvailability(value) {
                $http.get('/apis/usertenant/tenant/' + value).
                success(function (data, status, headers, config) {
                    console.log(data);
                    if (data.TenantID === "") {
                        ngModel.$setValidity('availability', true);
                    } else {
                        ngModel.$setValidity('availability', false);
                    }
                }).
                error(function (data, status, headers, config) {
                    console.log(data);
                    ngModel.$setValidity('availability', true);
                });
            };
        }
    };
});
