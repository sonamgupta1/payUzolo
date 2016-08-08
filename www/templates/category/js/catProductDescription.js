appControllers.controller('catProductDescriptionCtrl', function ($scope,productService,bookingService, $ionicHistory,$filter,
                                                              $state,$stateParams,addWishList, $mdToast,$ionicScrollDelegate,
                                                              $ionicModal, OrderReviewService,$mdBottomSheet,$sce,profileService,
                                                              SellerProfileService,$timeout,$ionicSlideBoxDelegate,
                                                                 removeWishListService,$ionicPopup,$rootScope) {
    $scope.des_value = true;
    $scope.pec_value = false;
    $scope.term_n_cond = false;
    $scope.booking_add_ons = false;
    $scope.booking_add_ons_list = false;
    $scope.booking_package = true;
    $scope.default_quantity_add_ons = 1;
    $scope.default_quantity = 1;
    $scope.selectedaddons=[];
    $scope.seller_info = [];
    $scope.book={
        quantity:1
    };
    $scope.book_new={
        quantity_new:1
    };

    $scope.quantities = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    $scope.new_quantities = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

    $scope.nextSlide = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.prevSlide = function() {
        $ionicSlideBoxDelegate.previous();
    };
    
    $scope.slideIndex = 0;
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };
    window.localStorage['cat_id']=$stateParams.cat_id;
    window.localStorage['sub_cat_id']=$stateParams.sub_cat_id;


    $scope.back_to_cat_package = function() {
        $state.go('app.cat_package_list', {'cat_id': $stateParams.cat_id,'sub_cat_id':$stateParams.sub_cat_id});
    };
    var booking_info = {};

    /////////////////// new addon view  start ////////////////

    $ionicModal.fromTemplateUrl('templates/category/html/addon_c.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.Addonmodal = modal;
    });
    $scope.open_addon = function () {
        $scope.Addonmodal.show();
    };
    $scope.closeAddon = function () {
        $scope.Addonmodal.hide();
    };

    /////////////////// new addon view  end ////////////////
    
    

    $ionicModal.fromTemplateUrl('templates/category/html/review.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openReviewModel = function () {
        $scope.modal.show();
    };
    $scope.closeReviewModel = function () {
        $scope.modal.hide();
    };
    
    $scope.back_to_pdp = function(){
        $scope.modal.hide();
    };

    $scope.setIndex=function(index,checked){
        console.log("checked",checked)
        if(checked==true){
            $timeout(function(){
                $scope.currentIndex=index;
                calcAmount($scope.currentIndex,false);
            },1000);
        }else{
            $timeout(function(){
                $scope.currentIndex=index;
                calcAmount($scope.currentIndex,true);
            },1000);
        }
    };
    var calcAmount=function(index,deleteit){
        var flag=0;
        if(deleteit==true){
            flag=1;
        }
        var amount=0;
        //index is used, just to get the amount of the addons and nothing else
        if(index!=-1){
            if(typeof ($scope.selectedaddons[index])!='undefined') {
                $scope.selectedaddons[index].amount = $scope.paddons[index].amount;
            }
        }
        //calculate the price of the addons to add to the basew amount of the package
        angular.forEach($scope.selectedaddons,function(addon){
            if(typeof addon.quantity == 'undefined'){
                addon.quantity=1;
            }
            if(typeof addon.id != 'undefined'){
                if(flag==1){
                    if(addon.id.length!=0)
                        amount=amount+parseInt(addon.quantity)*parseInt(addon.amount);
                }else
                {
                    amount=amount+parseInt(addon.quantity)*parseInt(addon.amount);
                }
            }
        });
        $scope.amount_to_show=amount+$scope.package.deal_price*($scope.book.quantity);
    };

    $scope.add_wish_list = function(id_user,p_id){
        var data ={
            user_id:id_user,
            package_id:p_id
        }
        if((window.localStorage['access_token']) && (window.localStorage['access_token']) != 'undefined') {
            addWishList.add_to_wish_list(data).then(function (data) {
                if (data.data.message == 'success') {
                    $scope.wish_value = true;
                    $mdToast.show({
                        controller: 'toastController',
                        templateUrl: 'toast.html',
                        hideDelay: 800,
                        position: 'top',
                        locals: {
                            displayOption: {
                                title: 'Package added to wish list successfully!'
                            }
                        }
                    });
                    $rootScope.$broadcast('wishListChanged', {message: 'Change in address list'});
                }
            });
        }
        else{
            $mdToast.show({
                controller: 'toastController',
                templateUrl: 'toast.html',
                hideDelay: 800,
                position: 'top',
                locals: {
                    displayOption: {
                        title: 'Please login'
                    }
                }
            });
            $state.go('app.optional_cat',{'cat_id':$stateParams.cat_id,'sub_cat_id': $stateParams.sub_cat_id,product_id:$stateParams.product_id});

        }
    };

    $scope.remove_wishList = function (p_id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure ?',
            template: 'You want to remove from wish list.'
        });
        confirmPopup.then(function(res) {
            if(res) {
                removeWishListService.remove_wish_list(p_id,(window.localStorage['access_token'])).then(function(data){
                    if(data.data.message == 'success'){

                        $scope.wish_value = false;
                        $mdToast.show({
                            controller: 'toastController',
                            templateUrl: 'toast.html',
                            hideDelay: 800,
                            position: 'top',
                            locals: {
                                displayOption: {
                                    title: 'Package removed successfully.'
                                }
                            }
                        });
                    }
                    $rootScope.$broadcast('wishListChanged', { message: 'Change in address list' });

                });
            } else {
                console.log('You are not sure');
            }
        });
    };



    $scope.get_pdp_info = function(){
        $scope.$on('logged_in', function (event, args) {
            if((window.localStorage['access_token']) && (window.localStorage['access_token']) != 'undefined'){
                profileService.get_profile((window.localStorage['access_token'])).then(function(data){
                    var profile = data.data.data.user_id;
                    if(profile){
                        productService.getProductDescription($stateParams.product_id,profile).then(function(data){
                            $scope.package = data.data.data;
                            $scope.wish_value = data.data.meta.wishlist_status;
                            var content = $filter('limitTo')($scope.package.description, 250)

                            $scope.description = $sce.trustAsHtml(content);

                            $scope.paddons =  $scope.package.Addons.data;
                            $scope.amount_to_show = $scope.package.deal_price;
                            booking_info = {
                                quantity:$scope.book.quantity,
                                package_id:$scope.package.id,
                                addons:[]
                            };
                            if($scope.package.seller_profile.user_id){
                                SellerProfileService.getSellerInfo($scope.package.seller_profile.user_id).then(function (data) {
                                    $scope.p_info = data.data.data;
                                    angular.forEach($scope.p_info, function(value, key){
                                        if((value.isCompleted == "1") ||(value.isCompleted == "true") ||(value.isCompleted == true)){
                                            $scope.seller_info.push(value);
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });

        if((window.localStorage['access_token']) && (window.localStorage['access_token'])!= 'undefined') {
            profileService.get_profile(window.localStorage['access_token']).then(function (data) {
                var profile = data.data.data.user_id;
                if(profile){
                    productService.getProductDescription($stateParams.product_id,profile).then(function(data){
                        $scope.package = data.data.data;
                        $scope.wish_value = data.data.meta.wishlist_status;
                        
                        var content = $filter('limitTo')($scope.package.description, 250)

                        $scope.description = $sce.trustAsHtml(content);

                        $scope.paddons =  $scope.package.Addons.data;
                        $scope.amount_to_show = $scope.package.deal_price;
                        booking_info = {
                            quantity:$scope.book.quantity,
                            package_id:$scope.package.id,
                            addons:[]
                        };
                        if($scope.package.seller_profile.user_id){
                            SellerProfileService.getSellerInfo($scope.package.seller_profile.user_id).then(function (data) {
                                $scope.p_info = data.data.data;
                                angular.forEach($scope.p_info, function(value, key){
                                    if((value.isCompleted == "1") ||(value.isCompleted == "true") ||(value.isCompleted == true)){
                                        $scope.seller_info.push(value);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
        else{
            productService.getProductDescription($stateParams.product_id).then(function(data){
                $scope.package = data.data.data;
                $scope.wish_value = data.data.meta.wishlist_status;

                var content = $filter('limitTo')($scope.package.description, 250)

                $scope.description = $sce.trustAsHtml(content);

                $scope.paddons =  $scope.package.Addons.data;
                $scope.amount_to_show = $scope.package.deal_price;
                booking_info = {
                    quantity:$scope.book.quantity,
                    package_id:$scope.package.id,
                    addons:[]
                };
                if($scope.package.seller_profile.user_id){
                    SellerProfileService.getSellerInfo($scope.package.seller_profile.user_id).then(function (data) {
                        $scope.p_info = data.data.data;
                        angular.forEach($scope.p_info, function(value, key){
                            if((value.isCompleted == "1") ||(value.isCompleted == "true") ||(value.isCompleted == true)){
                                $scope.seller_info.push(value);
                            }
                        });
                    });
                }
            });

        }

    };

    $scope.get_pdp_info();


    $scope.active_tab = 'description';

    $scope.description_value = function () {
        $scope.active_tab = 'description';
        $scope.des_value = true;
        $scope.pec_value = false;
        $scope.term_n_cond = false;
    };

    $scope.term_n_condition = function () {
        $scope.active_tab = 'term';
        $scope.des_value = false;
        $scope.pec_value = false;
        $scope.term_n_cond = true;
    };

    $scope.package_summary = function(){
        $scope.active_tab = 'p_summery';
        $scope.des_value = false;
        $scope.pec_value = true;
        $scope.term_n_cond = false;
    };
  
    $scope.book_now = function () {
        $scope.booking_add_ons = true;
        $ionicScrollDelegate.scrollBottom(true);
    };

    $scope.book_now_confirm = function(){
        booking_info.quantity = $scope.book.quantity;
        angular.forEach($scope.selectedaddons,function(obj){
            var ff={
                id:obj.id[0],
                quantity:obj.quantity
            }
            booking_info.addons.push(ff);
        });
        if((window.localStorage['access_token']) && (window.localStorage['access_token'] != 'undefined')){
            bookingService.OrpInfo(booking_info).then(function(data) {
                var info = data.data.data;
                window.localStorage['id'] = info.id;
                window.localStorage['booking_id'] = info.booking_id;
                window.localStorage['sub_cat_id'] = $stateParams.sub_cat_id;

                $state.go('app.orp_cat',{'cat_id':$stateParams.cat_id,'sub_cat_id': $stateParams.sub_cat_id,product_id:$stateParams.product_id,'booking_id':info.booking_id,'t_id':info.id});
            });
            $scope.Addonmodal.hide();

        }
        else{
            $state.go('app.optional_cat',{'cat_id':$stateParams.cat_id,'sub_cat_id': $stateParams.sub_cat_id,product_id:$stateParams.product_id});
            $scope.Addonmodal.hide();
        }
    };
    $scope.shareProduct = function ($event,name,image,slug_url) {
        $mdBottomSheet.show({
            templateUrl: 'shared.html',
            controller: 'catSharedCtrl',
            targetEvent: $event,
            locals: {
                slug_url: slug_url,
                image:image,
                name:name
            }
        });
    };

    $scope.seller_Profile = function(id){
        $state.go('app.cat_seller_profile',{'cat_id':$stateParams.cat_id,'sub_cat_id': $stateParams.sub_cat_id,product_id:id});
    };

    $scope.full_desc = function(id){
        $state.go('app.cat_full_description',{'cat_id':$stateParams.cat_id,'sub_cat_id': $stateParams.sub_cat_id,product_id:id});
    };

    $scope.getPdpForCat = function(parent_id,sub_cat_id,p_id){
        $state.go('app.cat_product_desc',{'cat_id':parent_id,'sub_cat_id':sub_cat_id,'product_id':p_id});
    };

});
