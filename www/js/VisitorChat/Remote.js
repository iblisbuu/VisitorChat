var VisitorChat_Chat = VisitorChat_ChatBase.extend({
  start: function()
  {
    //Remove an old one if it is there.
    WDN.jQuery('#visitorChat_container').remove();
  
    //set up a container.
    WDN.jQuery("body").append("<div id='visitorChat'>" +
                     "<div id='visitorChat_header'>Chat" +
                        //"Chat <span id='visitorChat_availability'></span>" +
                           //Turn this div into an unordered list
                           "<ul class='visitorChat_options'>" +
                                "<li><a id='visitorChat_close' href='" + this.serverURL + "logout'>close</a></li>" +
                                "<li><a id='visitorChat_collapse' href='#'>collapse</a></li>" +
                           "</ul>" +
                           "<div id='visitorChat_sound_container'>" +
                               "<audio id='visitorChat_sound' src='"+ this.serverURL + "audio/message.wav'></audio></div>" +
                         "</div>" +
                       "<div id='visitorChat_container'><div class='chat_notify visitorChat_loading'>Initializing, please wait.</div></div>" +
                   "</div>");
    
    this.displaySiteAvailability();
    
    this._super();
  },
  
  confirmClose: function(id) {
      var link = document.getElementById(id);
      
      if (confirm("Logout?")) {
        return true;
      }
      
      return false;
  },
  
  initWatchers: function() {
    /* This method is called several times thoughout 
     * executation.  Thus in order to stop the stacking
     * of watch functions, we should always unbind previous 
     * watch functions before applying the new ones.
     */
    WDN.jQuery('#visitorChat_launchButton,' +
            '#visitorChat_close,' +
            '#visitorChat_container,' +
            'visitorChat_email_fallback,' +
            '#visitorChat_collapse').unbind();
    
    //Validator
    WDN.jQuery('#visitorchat_clientLogin').validation();
    
    //Call the parent.
    this._super();
    
    WDN.jQuery('#visitorChat_launcher, #visitorChat_close').click(WDN.jQuery.proxy(function(){
      if (VisitorChat.chatOpened) {
        if ((this.chatStatus == 'CHATTING'
            || this.chatStatus == 'OPERATOR_PENDING_APPROVAL') && !this.confirmClose()) {
          return false;
        }
        VisitorChat.stop();
      } else {
        VisitorChat.start();
      }
      
      return false;
    }, this));
    
    //Field watermarks
    WDN.jQuery("#visitorChat_name").watermark("Name (Optional)");
    WDN.jQuery("#visitorChat_email").watermark("Email (Required)");
    WDN.jQuery("#visitorChat_messageBox").watermark("Question or comment?");
    
    //if email_fallback is checked, make sure that the email is required.
    WDN.jQuery("#visitorChat_email_fallback").click(function(){
      if(WDN.jQuery(this).is(":checked")) {
        WDN.jQuery("#visitorChat_email").watermark("Email (Required)");
        WDN.jQuery('#visitorChat_email').addClass('required-entry');
      } else {
        WDN.jQuery("#visitorChat_email").watermark("Email (Optional)");
        WDN.jQuery('#visitorChat_email').removeClass('required-entry');
      }
    });
    
    WDN.jQuery("#visitorChat_container").ready(function(){
      //Are there no operators available?  If not, make email_fallback checked by default.
      if (!this.operatorsAvailable) {
        WDN.jQuery('#visitorChat_email_fallback').prop("checked", true);
        
        WDN.jQuery('#visitorChat_email').addClass('required-entry');
      }
    });
    
    //This will slide down the Name and Email fields, plus the Ask button
    WDN.jQuery("#visitorChat_messageBox").keyup(function(){
        WDN.jQuery(".visitorChat_info, #visitorChat_login_sumbit").slideDown("fast");
    });
    
    //This is where the collapse button happens
    WDN.jQuery("#visitorChat_collapse").click(function(){
        WDN.jQuery("#visitorChat_container").slideToggle("fast", function() {
            if (WDN.jQuery('#visitorChat_container').css('display') === 'none') {
                WDN.jQuery("#visitorChat_collapse").css({'background-image' : "url('<?php echo \UNL\VisitorChat\Controller::$url;?>images/coll_up.png')"})
            } else {
                WDN.jQuery("#visitorChat_collapse").css({'background-image' : "url('<?php echo \UNL\VisitorChat\Controller::$url;?>images/coll_down.png')"})
            }
        });
    });
    
  },
  
  handleUserDataResponse: function(data) {
    this.conversationID  = data['conversationID'];
    var previousPHPSESSID = this.phpsessid;
    
    //Call the parent logic.
    this._super(data);
    
    //set the cookie.
    WDN.jQuery.cookies.set('UNL_Visitorchat_Session', this.phpsessid, {domain: '.unl.edu'});
    
    //Handle the rest of the data.
    if (data['conversationID']) {
      this.start(data);
    }
    
    this.displaySiteAvailability();
  },
  
  loadStyles: function() {
    //load styling.
    if (document.createStyleSheet){
      document.createStyleSheet(this.serverURL + "css/remote.php");
    } else {
      WDN.jQuery("head").append(WDN.jQuery("<link rel='stylesheet' href='" + this.serverURL + "css/remote.php' type='text/css' media='screen' />"));
    }
    
    this._super();
  },
  
  init: function() {
    //Handle cookies. (IE session handling);
    var phpsessid = WDN.jQuery.cookies.get('UNL_Visitorchat_Session');
    if (phpsessid != null) {
      this.phpsessid = phpsessid;
    }
    
    this._super();
  },

  stop: function() {
    this._super();
    
    //Delete the current cookie.
    WDN.jQuery.cookies.del('UNL_Visitorchat_Session');
  },
  
  displaySiteAvailability: function() {
    if (this.operatorsAvailable) {
      WDN.jQuery("#visitorChat_launcher").html("Chat");
      WDN.jQuery("#visitorChat_launcher, #visitorChat_header").addClass('visitorChat_online');
      WDN.jQuery("#visitorChat_launcher, #visitorChat_header").removeClass('visitorChat_offline');
    } else {
      WDN.jQuery("#visitorChat_launcher, #visitorChat_header").addClass('visitorChat_offline');
      WDN.jQuery("#visitorChat_launcher, #visitorChat_header").removeClass('visitorChat_online');
      WDN.jQuery("#visitorChat_launcher").html("Email");
    }
  }
});

WDN.jQuery(function(){
  WDN.loadJS('/wdn/templates_3.1/scripts/plugins/validator/jquery.validator.js', function() {
    VisitorChat = new VisitorChat_Chat();
  });
});
