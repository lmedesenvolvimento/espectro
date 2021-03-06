(function() {
  'use strict';

  angular
    .module('hqReader')
    .component('hqViewer', {
      controller: hqViewerCtrl,
      templateUrl: "app/components/hqViewer/hqViewer.html",
      bindings: {
        placeholder: "@",
        manifest: "@"
      }
    });

  /** @ngInject */
  function hqViewerCtrl($scope, $element, $http, $log, hotkeys){
    var self = {
      slideIndex: 0,
      lastScene: undefined
    };

    self.magazineImages = [];

    self.position = undefined

    self.$onInit = function(){
      $http.get(self.manifest).then(function(response){
        self.magazineImages = response.data;
      })
    }

    self.toScene = function(scene){
      if(angular.isDefined(scene)){
        $element.find('#slide-'+self.slideIndex).attr(
          'style', 'transform: translate3d('+ scene.translateX +'%, '+ scene.translateY +'%, '+ scene.translateZ +'px);'
        )
      } else {
        self.toOverview()
      }

      self.scene = scene

      return false;
    }

    self.nextScene = function(){
      if(angular.isDefined(self.lastScene)){
        self.position = self.lastScene
        self.lastScene = undefined
        // Navigate to Scene
        return self.toScene(self.magazineImages[self.slideIndex].scenes[self.position]);
      }
      if(angular.isDefined(self.position)){
        if( self.position < (self.magazineImages[self.slideIndex].scenes.length - 1)){
          self.position++;
        } else{
          if(self.slideIndex < self.magazineImages.length){
            self.toOverview(); 
            self.slideIndex++;
          } 
          else{
            self.toOverview();
          }
        }
      } else{
        self.position = 0;
      }
      // Navigate to Scene
      self.toScene(self.magazineImages[self.slideIndex].scenes[self.position]);
    };

    self.backScene = function(){
      if(angular.isDefined(self.position)){
        if( self.position > 0){
          self.position--
        } else{
          return self.toOverview()
        }
      } else{
        self.slideIndex > 0 ? self.slideIndex-- : false
        return self.toOverview()
      }
      // Navigate to Scene
      self.toScene( self.magazineImages[self.slideIndex].scenes[self.position] );
    };

    self.toOverview = function(slideIndex){
      var index = slideIndex || self.slideIndex
      // set last scene for cache possition
      if(angular.isUndefined(self.lastScene)){
        self.lastScene = self.position
      }
      // reset variables
      self.position = undefined;
      self.scene = undefined;
      // Return to overview
      $element.find('#slide-'+ index).attr(
        'style', 'transform: translate3d(0px,0px,0px);'
      );
    };

    // Observers

    // Every time slide change
    $scope.$watch("$ctrl.slideIndex", function(){
      self.lastScene = undefined
      self.position = undefined      
    })

    // Events
    $element.find('.inner img').on("mousemove", function(event){
      var parentOffset = angular.element(this).parent().offset();
      //or angular.element(this).offset(); if you really just want the current element's offset
      var relX = event.pageX - parentOffset.left;
      var relY = event.pageY - parentOffset.top;
      
      // var elementOffset = angular.element(this).offset();
      // var centerX = elementOffset.left + angular.element(this).width() / 2;
      // var centerY = elementOffset.top + angular.element(this).height() / 2;

      self.pageX = parseInt(relX)
      self.pageY = parseInt(relY)

      $scope.$apply()
    })

    // Hotkeys

    hotkeys.bindTo($scope)
      .add({
        combo: 'right',
        description: 'To next scene',
        callback: function() {
          self.nextScene(self.slideIndex)
        }
      })
      .add({
        combo: 'left',
        description: 'To next scene',
        callback: function() {
          self.backScene(self.slideIndex)
        }
      });

    return self;
  }

})();
