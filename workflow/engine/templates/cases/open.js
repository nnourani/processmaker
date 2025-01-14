var Actions = {},
    hideCaseNavigatorPanel,
    informationMenu,
    caseMenuOpen = false,
    menuSelectedTitle = [],
    _ENV_CURRENT_DATE,
    winTree,
    buttonCancel,
    buttonClaimCase,
    navPanelBottom,
    navPanel;

historyGridListChangeLogGlobal = {};
historyGridListChangeLogGlobal.idHistory = '';
historyGridListChangeLogGlobal.tasTitle = '';

historyGridListChangeLogGlobal.viewIdDin = '';
historyGridListChangeLogGlobal.viewIdHistory = '';
historyGridListChangeLogGlobal.viewDynaformName = '';
historyGridListChangeLogGlobal.dynDate = '';

ActionTabFrameGlobal = {};
ActionTabFrameGlobal.tabName = '';
ActionTabFrameGlobal.tabTitle = '';
ActionTabFrameGlobal.tabData = '';

function formatAMPM(date, initVal) {
  var hours = date.getHours();
  var minutes = (initVal === true)? ((date.getMinutes()<15)? 0: ((date.getMinutes()<30)? 15: ((date.getMinutes()<45)? 30: 45))): date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};

/**
 * Verify if the browser is Internet Explorer
 * @return {boolean}
 */
function isBrowserIE() {
    var browserAgent = navigator.userAgent.toLowerCase();
    return (browserAgent.indexOf("msie") !== -1) || (browserAgent.indexOf("trident") !== -1);
}

Ext.onReady(function(){
  openToRevisePanel = function() {
    var treeToRevise = new Ext.tree.TreePanel({
      title: treeToReviseTitle,
      width: 250,
      height: 250,
      userArrows: true,
      animate: true,
      autoScroll: true,
      rootVisible: false,
      dataUrl: casesPanelUrl,
      root: {
        nodeType: 'async',
        text    : 'To Revise',
        id      : 'node-root'
      },
      listeners: {
        render: function() {
          this.expandAll();
        }
      }
    });

    if (typeof(winTree) == 'undefined') {
      winTree = new Ext.Window({
        id          : 'toReviseWindow',
        width       : 220,
        height      : 300,
        el          : 'toReviseTree',
        collapsible : true,
        plain       : true,
        x           : 100,
        y           : 100,
        constrain   : true,
        items       : [treeToRevise],
        closeAction : 'hide'
      });
    }
  };

  Ext.QuickTips.init();
  showCaseNavigatorPanel = function(app_status) {
    if (typeof(treeToReviseTitle) != 'undefined') {
      openToRevisePanel();
    }

    if (caseMenuOpen) {
      return false;
    }
    else {
      caseMenuOpen = true;
    }

    //get the menu
    Ext.Ajax.request({
      url : 'ajaxListener',
      params : {action : 'getCaseMenu', app_status:app_status},
      success: function ( result, request ) {
        var data = Ext.util.JSON.decode(result.responseText);
        for(i=0; i<data.length; i++) {
          switch(data[i].id) {
            case 'STEPS':
              if (typeof(treeToReviseTitle) == 'undefined') {
                Ext.getCmp('casesStepTree').root.reload();
              }
              Ext.getCmp('stepsMenu').enable();
              break;
            case 'NOTES':
              Ext.getCmp('caseNotes').show();
              break;

            case 'INFO':
              //filling information menu
              var informationMenu = Ext.getCmp('informationMenu');
              informationMenu.menu.removeAll();
              for(j=0; j<data[i].options.length; j++) {
                informationMenu.menu.add({
                  text: data[i].options[j].text,
                  handler: data[i].options[j].fn != '' ? Actions[data[i].options[j].fn] : function(){}
                });
                menuSelectedTitle[data[i].options[j].fn] = data[i].options[j].text;
              }
              informationMenu.show();
              break;

            case 'ACTIONS':
              var actionMenu = Ext.getCmp('actionMenu');
              actionMenu.menu.removeAll();
              for(j=0; j<data[i].options.length; j++) {
            	 if(!data[i].options[j].hide){
                  actionMenu.menu.add({
                    text: data[i].options[j].text,
                    handler: data[i].options[j].fn != '' ? Actions[data[i].options[j].fn] : function(){}
                  });
                  menuSelectedTitle[data[i].options[j].fn] = data[i].options[j].text;
                }
              }
              actionMenu.show();
              break;
            case 'RETURN_ADVANCED_SEARCH':
                Ext.getCmp('returnButton').show();
              break;
            // custom menus from plugins or others
            default:
              var navPanel = Ext.getCmp('navPanel');
              var tb = navPanel.getTopToolbar();

              var menu = new Ext.Action({
                id: data[i].id,
                text: data[i].label,
                handler: function(){
                  eval(this._action);
                },
                _action: data[i].action.replace('javascript:', '').replace(';', '')
              });

              tb.add(menu);
          }
        }

        var olink = document.location.href;
        if(olink.search("gmail") != -1){
      	  Ext.getCmp('stepsMenu').hide();
      	  Ext.getCmp('informationMenu').hide();
      	  Ext.getCmp('actionMenu').hide();
      	  Ext.getCmp('caseNotes').hide();
        }

        if (Ext.getCmp('stepsMenu').disabled === true) {
          Ext.getCmp('stepsMenu').hide();
        }
      },
      failure: function ( result, request) {
        Ext.MessageBox.alert('Failed', result.responseText);
      }
    });
  }

  hideCaseNavigatorPanel = function(){
    Ext.getCmp('stepsMenu').pressed = false;
    caseMenuOpen = false;

    Ext.getCmp('navPanelWest').hide();
    Ext.getCmp('navPanelWest').ownerCt.doLayout();

  }

  function togglePreview(btn, pressed){
    if (typeof(treeToReviseTitle) == 'undefined') {
      var preview = Ext.getCmp('navPanelWest');
      preview[pressed ? 'show' : 'hide']();
      Ext.getCmp('navPanel').ownerCt.doLayout();
    }
    else {
      if (winTree.isVisible()) {
        winTree.hide();
      }
      else  {
        winTree.show();
      }
    }
  }

  if (typeof(treeToReviseTitle) == 'undefined') {
    var loadMaskStep = new Ext.LoadMask(Ext.getBody(), {msg: _("ID_LOADING_GRID")});

    var casesStepTree = new Ext.tree.TreePanel({
      id: 'casesStepTree',
      autoWidth: true,
      userArrows: true,
      animate: true,
      autoScroll: true,
      dataUrl: 'ajaxListener?action=steps',
      rootVisible: false,
      containerScroll: true,
      border: false,
      root: {
        nodeType: 'async'
      },

      listeners: {
        render: function() {
          this.getRootNode().expand();
        },
        click: function (node, evt)
        {
            var nodeCurrentSelected = this.getSelectionModel().getSelectedNode();
            var swNodeCurrentSelect = 0;

            if (node.attributes.url) {
                //Set load event
                if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1 || navigator.userAgent.toLowerCase().indexOf("trident") !== -1) {
                    document.getElementById("openCaseFrame").onreadystatechange = function ()
                    {
                        if (document.getElementById("openCaseFrame").readyState == "complete") {
                            loadMaskStep.hide();
                        }
                    };
                } else {
                    document.getElementById("openCaseFrame").onload = function ()
                    {
                        loadMaskStep.hide();
                    };
                }

                //Check step current
                var swForm = 1;

                if (nodeCurrentSelected.attributes.id == "-1") {
                    swForm = 0;
                }

                if (nodeCurrentSelected.attributes.type != "DYNAFORM") {
                    swForm = 0;
                }

                if (swForm == 1) {
                    var requiredField = "";
                    var swRequiredField = 1;
                    var dynaformChange ="";
                    var swDynaformChange = 0;

                    var iframeDynaForm = (typeof(window.frames["openCaseFrame"].document) != "undefined")? window.frames["openCaseFrame"].document : ((typeof(window.frames["openCaseFrame"].contentDocument) != "undefined")? window.frames["openCaseFrame"].contentDocument : window.frames["openCaseFrame"].contentWindow.document);

                    if (iframeDynaForm.getElementsByTagName("form")) {
                        dynaformChange = iframeDynaForm.getElementsByTagName("form").item(0);

                        if (typeof(window.frames["openCaseFrame"].dynaFormChanged) == "function" && dynaformChange) {
                            swDynaformChange = (window.frames["openCaseFrame"].dynaFormChanged(dynaformChange))? 1 : 0;
                        }
                    }

                    if (iframeDynaForm.getElementById("DynaformRequiredFields")) {
                        requiredField = iframeDynaForm.getElementById("DynaformRequiredFields").value;

                        if (requiredField != "") {
                            swRequiredField = (window.frames["openCaseFrame"].validateForm(requiredField))? 1 : 0;
                        }
                    }

                      if (swRequiredField == 1){
                          if (swDynaformChange) {
	                        Ext.MessageBox.show({
	                            title: _("ID_CONFIRM"),
	                            msg: _("ID_DYNAFORM_SAVE_CHANGES"),
	                            icon:  Ext.MessageBox.QUESTION,
	                            buttons: {ok: _("ID_ACCEPT"), cancel: _("ID_CANCEL")},
	                            fn: function (btn)
	                            {
	                                loadMaskStep.show();

	                                if (btn == "ok") {
	                                    var frm = iframeDynaForm.getElementsByTagName("form");

	                                    if (frm.length > 0) {
	                                        var result = window.frames["openCaseFrame"].ajax_post(
	                                            frm[0].action.replace("cases_SaveData", "saveForm"),
	                                            frm[0],
	                                            "POST",
	                                            function (responseText)
	                                            {
	                                                //Set URL and redirect
	                                                document.getElementById("openCaseFrame").src = node.attributes.url;
	                                            },
	                                            true
	                                        );
	                                    } else {
	                                        //Set URL and redirect
	                                        document.getElementById("openCaseFrame").src = node.attributes.url;
	                                    }
	                                } else {
	                                    //Set URL and redirect
	                                    document.getElementById("openCaseFrame").src = node.attributes.url;
	                                }
	                            }
	                        });
                          } else {
                            loadMaskStep.show();
                            document.getElementById("openCaseFrame").src = node.attributes.url;
                          }
                      } else {
	                    	swNodeCurrentSelect = 1;
	                }
                } else {
                    loadMaskStep.show();

                    //Set URL and redirect
                    document.getElementById("openCaseFrame").src = node.attributes.url;
                }
            } else {
                swNodeCurrentSelect = 1;
            }

            if (swNodeCurrentSelect == 1) {
                setTimeout(function () { setNode(nodeCurrentSelected.attributes.id); }, 1);
            }
        }
      }
    })

    var loader = casesStepTree.getLoader();
    loader.on("load", setNodeini);
  }
  else {
    var casesStepTree = {};
  }

  function setNodeini()
  {
    setNode(idfirstform);
  }

    var navPanelWest = {
        id: 'navPanelWest',
        region: 'west',
        xtype:'panel',
        width: 250,
        height: 500,
        maxSize: 400,
        split: true,
        collapsible: false,
        margins: '0 0 0 0',
        items:[casesStepTree]
    }

    var fnChangeStatus  =function(){
        alert('loaded');
    }

    var screenWidth = (PMExt.getBrowser().screen.width-140).toString() + 'px';

    var navPanelCenter = {
        id: 'navPanelCenter',
        region: 'center', layout:'fit',forceLayout: true,
        xtype:'panel',
        items:[{
            xtype:"tabpanel",
            id: 'caseTabPanel',
            deferredRender:false,
            defaults:{autoScroll: true},
            defaultType:"iframepanel",
            activeTab: 0,
            enableTabScroll: true,
            //defaults: Ext.apply({}, Ext.isGecko? {style:{position:'absolute'},hideMode:'visibility'}:false),

            items:[{
              id: 'casesTab',
              title: _('ID_CASE') +' ' + _APP_NUM,
              frameConfig:{name:'openCaseFrame', id:'openCaseFrame'},
              defaultSrc : uri,
              loadMask:{msg: _('ID_LOADING_GRID') },
              bodyStyle:{height: (PMExt.getBrowser().screen.height-60) + 'px', overflow:'hidden'},
              width:screenWidth

              }
            ],
            listeners: {
              tabchange: function(panel){
                panel.ownerCt.doLayout();
              },
              render : function(panel){
                Ext.each([this.el, this[this.collapseEl]] ,
                function( elm ) {
                  elm.setVisibilityMode(Ext.Element.VISIBILITY).originalDisplay ='visible';
                });
              }
            }
        }]
    };

    buttonCancel = new Ext.Button({
        buttonAlign: 'center',
        text: _("ID_CANCEL"),
        handler: redirectHistory,
        cls: 'cancelSummary',
        width: '100px',
        flex: 1,
        style: "height:36px"
    });

    buttonClaimCase = new Ext.Button({
        buttonAlign: 'center',
        ui: 'round',
        text: _("ID_CLAIM_THIS_CASE"),
        handler: claimCase,
        cls: 'claimCaseSummary',
        width: '120px',
        flex: 1,
        style: "height:36px"
    });

    navPanelBottom = {
        id: 'navPanelBottom',
        name: 'navPanelBottom',
        cls: 'navPanelBottom',
        region: 'south',
        layout: 'column',
        dock: 'bottom',
        border: false,
        margin: '0 0 0 0',
        split: false,
        collapsible: false,
        hidden: false,
        buttonAlign: 'center',
        buttonHeight: 200,
        buttons: [buttonCancel, buttonClaimCase]
    };

    /**
     * Claim the case.
     */
    function claimCase() {
        Ext.Ajax.request({
            url: 'cases_CatchExecute?hideMessage=true',
            success: function (response, opts) {
                Ext.Ajax.request({
                    url: 'ajaxListener',
                    params: {action : 'steps'},
                    success: function (response, opts) {
                        Ext.getCmp('navPanelBottom').hide();
                        Ext.getCmp('navPanel').doLayout();
                        //Reload frame pmDynaform
                        if (isBrowserIE()) {
                            document.getElementById('openCaseFrame').contentWindow.location.reload(true);
                        } else {
                            Ext.getCmp('navPanelCenter').getUpdater().getEl().update();
                        }
                    }
                });
            }
        });
    }

    /**
     * Redirect to unassigned inbox.
     */
    function redirectHistory() {
        if (isBrowserIE()) {
            if (top.opener) {
                //Is open the claim case in another tab
                top.opener.location.reload();
                top.close();
            } else {
                //When isIE with ux skin is not open another tab
                javascript:history.back();
            }
        } else {
            javascript:history.back();
        }
    }

    navPanel = {
        id: 'navPanel',
        region: 'center',
        layout: 'border',
        items: [navPanelWest, navPanelCenter],
        tbar: [
        {
            id: 'returnButton',
            pressed: false,
            enableToggle: true,
            text: _('ID_RETURN_ADVANCED_SEARCH'),
            iconCls: 'button_menu_ext ICON_RETURN',
            tooltip: {
                title:_('ID_RETURN_ADVANCED_SEARCH'),
                text: _('ID_SHOW_RETURN_ADVANCED_SEARCH')
            },
            toggleHandler: function (btn, pressed) {
                //Force to redirect to advanced search list from any side
                location.href = 'casesListExtJs?action=search';
            }
        },
        {
            id: 'stepsMenu',
            text: '&nbsp;&nbsp;' + _('ID_STEPS'),
            pressed: false,
            enableToggle: true,
            tooltip: {
                title: _('ID_CASES_STEPS'),
                text: _('ID_SHOW_HIDE_CASES_STEPS')
            },
            iconCls: 'ICON_STEPS',
            toggleHandler: togglePreview,
            disabled: true
        }, {
            id: 'informationMenu',
            text: _('ID_INFORMATION'),
            menu: []
        }, {
            id: 'actionMenu',
            text: _('ID_ACTIONS'),
            menu: []
        }, {
            id: 'caseNotes',
            pressed: false,
            enableToggle: true,
            text: '&nbsp;&nbsp;' + _('ID_CASES_NOTES'),
            iconCls: 'button_menu_ext ICON_CASES_NOTES',
            tooltip: {
                title: _('ID_CASES_NOTES'),
                text: _('ID_SHOW_CASES_NOTES')
            },
            toggleHandler: function (btn, pressed) {
                if (pressed) {
                    openCaseNotesWindow();
                } else {
                    closeCaseNotesWindow();
                }
            }
        }
      ]
    };

    /**
     * Get Parameters from URL
     * @returns {*}
     */
    function getParameterURL() {
        var item,
            key = false,
            result = {},
            url = location.search.substring(1),
            regExp = /([^&=]+)=([^&]*)/g;
        if (arguments.length > 0 && arguments[0].length > 1) {
            key = arguments[0];
        }
        while (item = regExp.exec(url)) {
            if (key !== false && decodeURIComponent(item[1]) === key) {
                return decodeURIComponent(item[2]);
            }
            else if (key === false) {
                result[decodeURIComponent(item[1])] = decodeURIComponent(item[2]);
            }
        }
        return key === false ? result : null;
    }

    var urlAction = getParameterURL('action');
    if (this.showCustomForm && this.showCustomForm === true && (urlAction === 'unassigned' || this.canClaimCase === true)) {
        navPanel.items[navPanel.items.length] = navPanelBottom;
    }

  var viewport = new Ext.Viewport({
      layout: 'border',
      items: [navPanel]
  });


  // Ext.getCmp('stepsMenu').hide();
  Ext.getCmp('caseNotes').hide();
  Ext.getCmp('informationMenu').hide();
  Ext.getCmp('actionMenu').hide();
  Ext.getCmp('returnButton').hide();

  // Hacky Code for update the debugger in new UI
  document.getElementById("openCaseFrame").onload = function ()
  {
      if(window.parent){
        window.parent.postMessage("update=debugger","*");
      }
  };
  
  hideCaseNavigatorPanel();
  if(typeof appStatus !== "undefined") {
      showCaseNavigatorPanel(appStatus);
  }

  // Actions methods

  Actions.processMap = function()
  {
		Ext.Ajax.request({
            url : 'ajaxListener' ,
            params : {action : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                      try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
                 Actions.tabFrame('processMap');
              }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
            }
       });
  }

  Actions.processInformation = function()
  {
		Ext.Ajax.request({
	          url : 'ajaxListener' ,
	          params : {action : 'getProcessInformation'},
	          success: function ( result, request ) {
	          var data = Ext.util.JSON.decode(result.responseText);
	          if( data.lostSession ) {
	              Ext.Msg.show({
	                  title: _('ID_ERROR'),
	                  msg: data.message,
	                  animEl: 'elId',
	                  icon: Ext.MessageBox.ERROR,
	                  buttons: Ext.MessageBox.OK,
	                  fn : function(btn) {
	                   try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
	                  }
	              });
	          } else {
	              fieldset = {
	                  xtype : 'fieldset',
	                  autoHeight : true,
	                  defaults : {
	                      width : 170,
	                      xtype:'label',
	                      labelStyle : 'padding: 0px;',
	                      style: 'font-weight: bold'
	                  },
	                  items : [
	                      {fieldLabel: _('ID_TITLE'), text: data.PRO_TITLE},
	                      {fieldLabel: _('ID_DESCRIPTION'), text: data.PRO_DESCRIPTION},
	                      {fieldLabel: _('ID_CATEGORY'), text: data.PRO_CATEGORY_LABEL},
	                      {fieldLabel: _('ID_AUTHOR'), text: data.PRO_AUTHOR},
	                      {fieldLabel: _('ID_CREATE_DATE'), text: data.PRO_CREATE_DATE}
	                 ]
	             }

	          var frm = new Ext.FormPanel( {
	              labelAlign : 'right',
	              bodyStyle : 'padding:5px 5px 0',
	              width : 400,
	              autoScroll:true,
	              items : [fieldset],
	              buttons : [{
	                  text : 'OK',
	                  handler : function() {
	                      win.close();
	                  }
	              }]
	          });

	          var win = new Ext.Window({
	              title: '',
	              width: 450,
	              height: 280,
	              layout:'fit',
	              autoScroll:true,
	              modal: true,
	              maximizable: false,
	              items: [frm]
	          });
	          win.show();
	      }},
	      failure: function ( result, request) {
	          Ext.MessageBox.alert('Failed', result.responseText);
	      }
	    });
  }

  Actions.taskInformation = function()
  {
	  Ext.Ajax.request({
	      url : 'ajaxListener' ,
	      params : {action : 'getTaskInformation'},
	      success: function ( result, request ) {
	        var data = Ext.util.JSON.decode(result.responseText);
	        if( data.lostSession ) {
	              Ext.Msg.show({
	                  title: _('ID_ERROR'),
	                  msg: data.message,
	                  animEl: 'elId',
	                  icon: Ext.MessageBox.ERROR,
	                  buttons: Ext.MessageBox.OK,
	                  fn : function(btn) {
	                   try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
	                  }
	              });
	          } else {
				fieldset = {
				xtype : 'fieldset',
				autoHeight : true,
				defaults : {
				width : 170,
				xtype:'label',
				labelStyle : 'padding: 0px;',
				style: 'font-weight: bold'
				},
				items : [
				{fieldLabel: _('ID_TITLE'), text: data.TAS_TITLE},
				{fieldLabel: _('ID_DESCRIPTION'), text: data.TAS_DESCRIPTION},
				{fieldLabel: _('ID_INIT_DATE'), text: data.INIT_DATE_LABEL},
				{fieldLabel: _('ID_DUE_DATE'), text: data.DUE_DATE_LABEL},
				{fieldLabel: _('ID_FINISH_DATE'), text: data.FINISH},
				{fieldLabel: _('ID_TASK_DURATION'), text: data.DURATION}
				]
				}

				var frm = new Ext.FormPanel( {
				labelAlign : 'right',
				bodyStyle : 'padding:5px 5px 0',
				width : 400,
				autoScroll:true,
				items : [fieldset],
				buttons : [{
				text : 'OK',
				handler : function() {
				win.close();
				}
				}]
				});

				var win = new Ext.Window({
				title: '',
				width: 450,
				height: 280,
				layout:'fit',
				autoScroll:true,
				modal: true,
				maximizable: false,
				items: [frm]
				});
				win.show();
	      }
	      },
	      failure: function ( result, request) {
	        Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
	      }
	    });
  }

  Actions.caseHistory = function()
  {
		Ext.Ajax.request({
            url : 'ajaxListener' ,
            params : {action : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                      try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
                  Actions.tabFrame('caseHistory');
              }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
            }
       });
  }

  Actions.messageHistory = function()
  {
		Ext.Ajax.request({
            url : 'ajaxListener' ,
            params : {action : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                        try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
                  Actions.tabFrame('messageHistory');
              }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
            }
       });
  }

  Actions.dynaformHistory = function()
  {
	  Ext.Ajax.request({
          url : 'ajaxListener' ,
          params : {action : 'verifySession'},
          success: function ( result, request ) {
            var data = Ext.util.JSON.decode(result.responseText);
            if( data.lostSession ) {
             Ext.Msg.show({
                    title: _('ID_ERROR'),
                    msg: data.message,
                    animEl: 'elId',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK,
                    fn : function(btn) {
                    try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                    }
                  });
            } else {
                Actions.tabFrame('dynaformHistory');
            }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
          }
     });
  }

    Actions.changeLogHistory = function ()
    {
        Ext.Ajax.request({
            url: 'ajaxListener',
            params: {action: 'verifySession'},
            success: function (result, request) {
                var data = Ext.util.JSON.decode(result.responseText);
                if (data.lostSession) {
                    Ext.Msg.show({
                        title: _('ID_ERROR'),
                        msg: data.message,
                        animEl: 'elId',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.MessageBox.OK,
                        fn: function (btn) {
                            try
                            {
                                prnt = parent.parent;
                                top.location = top.location;
                            } catch (err)
                            {
                                parent.location = parent.location;
                            }
                        }
                    });
                } else {
                    Actions.tabFrame('changeLogHistory');
                }
            },
            failure: function (result, request) {
                if (typeof (result.responseText) != 'undefined') {
                    Ext.MessageBox.alert(_('ID_FAILED'), result.responseText);
                }
            }
        });
    }

  Actions.uploadedDocuments = function()
  {
		Ext.Ajax.request({
            url : 'ajaxListener' ,
            params : {action : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                      try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
                  Actions.tabFrame('uploadedDocuments');
              }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
            }
       });
  }

  Actions.generatedDocuments = function()
  {
		Ext.Ajax.request({
            url : 'ajaxListener' ,
            params : {action : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                        try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
                  Actions.tabFrame('generatedDocuments');
              }
			},
			failure: function ( result, request) {
			if (typeof(result.responseText) != 'undefined') {
			    Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
			}
            }
       });
  }

  Actions.cancelCase = function () {
      var msgCancel = new Ext.Window({
          width: 500,
          plain: true,
          modal: true,
          resizable: false,
          title: _('ID_CONFIRM'),
          items: [
              new Ext.FormPanel({
                  labelAlign: 'top',
                  labelWidth: 75,
                  border: false,
                  frame: true,
                  items: [{
                          html: '<div align="center" style="font: 14px tahoma,arial,helvetica,sans-serif">' + _('ID_CONFIRM_CANCEL_CASE') + '</div> <br/>'
                      },
                      {
                          xtype: 'textarea',
                          id: 'noteReason',
                          fieldLabel: _('ID_CASE_CANCEL_REASON'),
                          name: 'noteReason',
                          width: 450,
                          height: 50
                      },
                      {
                          id: 'notifyReason',
                          xtype: 'checkbox',
                          name: 'notifyReason',
                          hideLabel: true,
                          boxLabel: _('ID_NOTIFY_USERS_CASE')
                  }],
                  buttonAlign: 'center',
                  buttons: [{
                      text: 'Ok',
                      handler: function () {
                          if (Ext.getCmp('noteReason').getValue() != '') {
                              var noteReasonTxt = _('ID_CASE_CANCEL_LABEL_NOTE') + ' ' + Ext.getCmp('noteReason').getValue();
                          } else {
                              var noteReasonTxt = '';
                          }
                          var notifyReasonVal = Ext.getCmp('notifyReason').getValue() == true ? 1 : 0;
                          Ext.MessageBox.show({msg: _('ID_PROCESSING'), wait: true, waitConfig: {interval: 200}});
                          Ext.Ajax.request({
                              url: 'ajaxListener',
                              params: {
                                  action: 'cancelCase',
                                  NOTE_REASON: noteReasonTxt,
                                  NOTIFY_CANCEL: notifyReasonVal
                              },
                              success: function (result, request) {
                                  try {
                                      var data = Ext.util.JSON.decode(result.responseText);
                                      if (data.status == true) {
                                          if (!isBrowserIE()) {
                                            if (typeof parent.notify !== "undefined") { 
                                              // The case was cancelled
                                              parent.notify('', _("ID_CASE_CANCELLED", stringReplace("\\: ", "", _APP_NUM)));
                                            }
                                            if (typeof parent.updateCasesTree !== "undefined") { 
                                              parent.updateCasesTree();
                                            }
                                            if (typeof parent.highlightCasesTree !== "undefined") { 
                                              parent.highlightCasesTree();
                                            }
                                          }
                                      } else {
                                          if (!isBrowserIE()) {
                                              if (typeof parent.notify !== "undefined") {
                                                  // The case wasn't cancel
                                                  parent.notify('', data.msg);
                                              }
                                          }
                                      }
                                  } catch (e) {
                                      if (isBrowserIE()) {
                                          Ext.MessageBox.alert(_('ID_FAILED'), _('ID_SOMETHING_WRONG'));
                                      } else {
                                          if (typeof parent.notify !== "undefined") {
                                              parent.notify('', _('ID_SOMETHING_WRONG'));
                                          }
                                      }
                                  }
                                  if (typeof parent.postMessage !== "undefined") {
                                    parent.postMessage("redirect=todo","*");
                                  } else {
                                    location.href = 'casesListExtJs';
                                  }
                              },
                              failure: function (result, request) {
                                  Ext.MessageBox.alert(_('ID_FAILED'), result.responseText);
                              }
                          });
                      }
                  }, {
                      text: _('ID_CANCEL'),
                      handler: function () {
                          msgCancel.close();
                      }
                  }]
              })
          ]
      });
      msgCancel.show(this);
  }

  Actions.getUsersToReassign = function()
  {
    var loadMaskUsersToReassign = new Ext.LoadMask(Ext.getBody(), {msg: _("ID_LOADING_GRID")});

    //Variables
    var pageSizeUsersToReassign = 10;

    //Stores
    var storeUsersToReassign = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: "ajaxListener",
            method: "POST"
        }),

        reader: new Ext.data.JsonReader({
            root: "resultRoot",
            totalProperty: "resultTotal",
            fields: [
                {name : "USR_UID"},
                {name : "USR_USERNAME"},
                {name : "USR_FIRSTNAME"},
                {name : "USR_LASTNAME"}
            ]
        }),

        remoteSort: true,

        listeners: {
            beforeload: function (store)
            {
                winReassignInCasesList.setDisabled(true);

                loadMaskUsersToReassign.show();

                this.baseParams = {
                    action: "getUsersToReassign",
                    search: Ext.getCmp("txtSearchUsersToReassign").getValue(),
                    pageSize: pageSizeUsersToReassign
                };
            },
            load: function (store, record, opt)
            {
                winReassignInCasesList.setDisabled(false);

                loadMaskUsersToReassign.hide();
            }
        }
    });

    //Components
    var pagingUsersToReassign = new Ext.PagingToolbar({
        id: "pagingUsersToReassign",

        pageSize: pageSizeUsersToReassign,
        store: storeUsersToReassign,
        displayInfo: true,
        displayMsg: _("ID_DISPLAY_ITEMS"),
        emptyMsg: _("ID_NO_RECORDS_FOUND")
    });

    var cmodelUsersToReassign = new Ext.grid.ColumnModel({
        defaults: {
            width: 200,
            sortable: true
        },
        columns: [
            {id: "USR_UID",       dataIndex: "USR_UID", hidden: true, hideable: false},
            {id: "USR_FIRSTNAME", dataIndex: "USR_FIRSTNAME", header: _("ID_FIRSTNAME"), width: 300},
            {id: "USR_LASTNAME",  dataIndex: "USR_LASTNAME", header: _("ID_LASTNAME"), width: 300}
        ]
    });

    var smodelUsersToReassign = new Ext.grid.RowSelectionModel({
        singleSelect: true
    });

    var grdpnlUsersToReassign = new Ext.grid.GridPanel({
        id: "grdpnlUsersToReassign",
        store: storeUsersToReassign,
        colModel: cmodelUsersToReassign,
        selModel: smodelUsersToReassign,
        height: 200,
        columnLines: true,
        viewConfig: {forceFit: true},
        enableColumnResize: true,
        enableHdMenu: true,
        tbar: [
            {
                text: _("ID_REASSIGN"),
                iconCls: "ICON_CASES_TO_REASSIGN",

                handler: Actions.reassignCase
            },
            "->",
            {
                xtype: "textfield",
                id: "txtSearchUsersToReassign",

                emptyText: _("ID_EMPTY_SEARCH"),
                width: 150,
                allowBlank: true,

                listeners: {
                    specialkey: function (f, e)
                    {
                        if (e.getKey() == e.ENTER) {
                            pagingUsersToReassign.moveFirst();
                        }
                    }
                }
            },
            {
                text: "X",
                ctCls: "pm_search_x_button",

                handler: function ()
                {
                    Ext.getCmp("txtSearchUsersToReassign").reset();
                }
            },
            {
                text: _("ID_SEARCH"),

                handler: function ()
                {
                    pagingUsersToReassign.moveFirst();
                }
            }
        ],
        bbar: pagingUsersToReassign,

        title: "",
        listeners: {
            click: function () {
                textareaReason.enable();
                checkboxReason.enable();
            }
        }
    });

    var textareaReason = new Ext.form.TextArea({
        id: 'idTextareaReason',
        disabled: true,
        fieldLabel : _('ID_REASON_REASSIGN'),
        emptyText: _('ID_REASON_REASSIGN') + '...',
        enableKeyEvents: true,
        width: 200
    });

    var checkboxReason = new Ext.form.Checkbox({
        id: 'idCheckboxReason',
        disabled: true,
        fieldLabel : _('ID_NOTIFY_USERS_CASE'),
        labelSeparator: '',
        labelStyle: 'margin-left:150px;position:absolute;'
    });

    var winReassignInCasesList = new Ext.Window({
        title: _('ID_REASSIGN_CASE'),
        width: 450,
        height: 350,
        layout: 'auto',
        autoScroll: true,
        modal: true,
        resizable: false,
        maximizable: false,
        items: [{
                xtype: 'fieldset',
                labelWidth: 130,
                border: false,
                items: [
                    textareaReason,
                    checkboxReason
                ]
            },
            grdpnlUsersToReassign
        ]
    });

    Ext.Ajax.request({
        url : 'ajaxListener' ,
        params : {action : 'verifySession'},
        success: function ( result, request ) {
          var data = Ext.util.JSON.decode(result.responseText);
          if( data.lostSession ) {
           Ext.Msg.show({
                  title: _('ID_ERROR'),
                  msg: data.message,
                  animEl: 'elId',
                  icon: Ext.MessageBox.ERROR,
                  buttons: Ext.MessageBox.OK,
                  fn : function(btn) {
                    try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                  }
                });
          } else if(!data.reassigncase) {
                Ext.Msg.show({
                  title: _('ID_WARNING'),
                  msg: data.message,
                  animEl: 'elId',
                  icon: Ext.MessageBox.WARNING,
                  buttons: Ext.MessageBox.OK,
                  fn : function(btn) {
                  }
                });
          } else {
                winReassignInCasesList.show();
                grdpnlUsersToReassign.store.load();
          }
        },
        failure: function ( result, request) {
          if (typeof(result.responseText) != 'undefined') {
                Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
          }
        }
   });
  }

  Actions.reassignCase = function()
  {
    var rowSelected = Ext.getCmp("grdpnlUsersToReassign").getSelectionModel().getSelected();

    if( rowSelected ) {
        if (Ext.getCmp('idTextareaReason').getValue() === '') {
            Ext.Msg.alert(_('ID_ALERT'), _('ID_THE_REASON_REASSIGN_USER_EMPTY'));
            return;
        }
      PMExt.confirm(_('ID_CONFIRM'), _('ID_REASSIGN_CONFIRM'), function(){
        Ext.Ajax.request({
          url : 'ajaxListener' ,
          params : {action : 'reassignCase', USR_UID: rowSelected.data.USR_UID, NOTE_REASON: Ext.getCmp('idTextareaReason').getValue(), NOTIFY_REASSIGN: Ext.getCmp('idCheckboxReason').getValue()},
          success: function ( result, request ) {
            var data = Ext.util.JSON.decode(result.responseText);
            if( data.status == 0 ) {
              try {
                  if (typeof parent.notify !== "undefined") {
                      parent.notify('', data.msg);
                  }
                  if (typeof parent.updateCasesTree !== "undefined") {
                      parent.updateCasesTree();
                  }
                  if (typeof parent.highlightCasesTree !== "undefined") {
                      parent.highlightCasesTree();
                  }
            } catch (e) {
            }
              if (typeof parent.postMessage !== "undefined") {
                parent.postMessage("redirect=todo", "*");
              } else {
                location.href = 'casesListExtJs';
              }
            } else {
              alert(data.msg);
            }
          },
          failure: function ( result, request) {
            Ext.MessageBox.alert( _('ID_FAILED') , result.responseText);
          }
        });
      });
    }
  }

  Actions.setUnpauseCaseDate = function()
  {
    curDate = _ENV_CURRENT_DATE_NO_FORMAT.split('-');
    filterDate = curDate[0]+'-'+curDate[1]+'-';
    nDay = '' + (parseInt(curDate[2])+1);
    nDay = nDay.length == 1 ? '0' + nDay : nDay;
    filterDate += nDay;
    filterTime = ('0' + curDate[3]).slice(-2) + ':' + ('0' + curDate[4]).slice(-2) + ' ' + curDate[5];

    var fieldset = {
      xtype : 'fieldset',
      labelWidth: 150,
      width:380,
      //autoHeight  : true,
      defaults    : {
        width : 170,
        xtype:'label',
        labelStyle : 'padding: 0px;',
        style: 'font-weight: bold'
      },
      items : [
        {fieldLabel: _("ID_CASE"), text: stringReplace("\\: ", "", _APP_NUM)},
        {fieldLabel: _("ID_PAUSE_DATE"), text: _ENV_CURRENT_DATE},
        new Ext.form.DateField({
          id:   'unpauseDate',
          format: 'Y-m-d',
          fieldLabel: _('ID_UNPAUSE_DATE'),
          name: 'unpauseDate',
          allowBlank: false,
          value: filterDate,
          minValue: filterDate
        }),
        new Ext.form.TimeField({
          id: 'unpauseTime',
          fieldLabel: _('ID_UNPAUSE_TIME'),
          name: 'unpauseTime',
          value: filterTime,
          minValue: formatAMPM(new Date(), true),
          format: 'h:i A'
        }),
        {
          xtype: 'textarea',
          id: 'noteReason',
          fieldLabel: _('ID_CASE_PAUSE_REASON'),
          name: 'noteReason',
          width: 170,
          height: 50
        },
        {
          id: 'notifyReason',
          xtype:'checkbox',
          name: 'notifyReason',
          fieldLabel: _('ID_NOTIFY_USERS_CASE')
        }
      ],
      buttons : [
        {
          id: 'submitPauseCase',
          text : _('ID_PAUSE_CASE'),
          handler : Actions.pauseCase,
          disabled:false
        },{
          text : _('ID_CANCEL'),
          handler : function() {
            win.close();
          }
        }
      ]
    }

    var frm = new Ext.FormPanel( {
      id: 'unpauseFrm',
      labelAlign : 'right',
      //bodyStyle : 'padding:5px 5px 0',
      width : 260,
      items : [fieldset]
    });


    var win = new Ext.Window({
      title: _('ID_PAUSE_CASE'),
      width: 380,
      height: 260,
      layout:'fit',
      autoScroll:true,
      modal: true,
      maximizable: false,
      resizable: false,
      draggable: false,
      items: [frm]
    });
	Ext.Ajax.request({
        url : 'ajaxListener' ,
        params : {action : 'verifySession'},
        success: function ( result, request ) {
          var data = Ext.util.JSON.decode(result.responseText);
          if( data.lostSession ) {
           Ext.Msg.show({
                  title: _('ID_ERROR'),
                  msg: data.message,
                  animEl: 'elId',
                  icon: Ext.MessageBox.ERROR,
                  buttons: Ext.MessageBox.OK,
                  fn : function(btn) {
                    try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                  }
                });
          } else {
              win.show();
          }
        },
        failure: function ( result, request) {
         if (typeof(result.responseText) != 'undefined') {
                 Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
             }
        }
   });
  }

  Actions.pauseCase = function()
  {
	  Ext.getCmp('submitPauseCase').setDisabled(true);
	  Ext.Ajax.request({
        url : 'ajaxListener' ,
        params : {action : 'verifySession'},
        success: function ( result, request ) {
            var data = Ext.util.JSON.decode(result.responseText);
            if( data.lostSession ) {
              Ext.Msg.show({
                title: _('ID_ERROR'),
                msg: data.message,
                animEl: 'elId',
                icon: Ext.MessageBox.ERROR,
                buttons: Ext.MessageBox.OK,
                fn : function(btn) {
                  try{
                    prnt = parent.parent;
                    top.location = top.location;
                  } catch (err){
                    parent.location = parent.location;
                  }
                }
              });
            } else {
              if (Ext.getCmp('noteReason').getValue() != '') {
                var noteReasonTxt = _('ID_CASE_PAUSE_LABEL_NOTE') + ' ' + Ext.getCmp('noteReason').getValue();
              } else {
                var noteReasonTxt = '';
              }
              var notifyReasonVal = Ext.getCmp('notifyReason').getValue() == true ? 1 : 0;
              var paramsNote = '&NOTE_REASON=' + noteReasonTxt + '&NOTIFY_PAUSE=' + notifyReasonVal;
              var unpauseDate = Ext.getCmp('unpauseDate').getValue();
              if( unpauseDate == '') {
                Ext.getCmp('submitPauseCase').setDisabled(false);
                return;
              } else {
                unpauseDate = unpauseDate.format('Y-m-d');
              }

              Ext.getCmp('unpauseFrm').getForm().submit({
                waitTitle : "&nbsp;",
                url:'ajaxListener',
                method : 'post',
                params : {
                  action: 'pauseCase',
                  unpauseDate:unpauseDate,
                  NOTE_REASON: noteReasonTxt,
                  NOTIFY_PAUSE: notifyReasonVal
                },
                waitMsg:'Pausing Case '+stringReplace("\\: ", "", _APP_NUM)+'...',
                timeout : 36000,
                success : function(res, req) {
                  if(req.result.success) {
                    try {
                      if (typeof parent.notify !== "undefined") {
                        parent.notify('PAUSE CASE', req.result.msg);
                      }
                      if (typeof parent.updateCasesTree !== "undefined") {
                        parent.updateCasesTree();
                      }
                      if (typeof parent.highlightCasesTree !== "undefined") {
                          parent.highlightCasesTree();
                      }
                    } catch (e) {
                    }
                    if (typeof parent.postMessage !== "undefined") {
                      parent.postMessage("redirect=todo", "*");
                    } else {
                      location.href = urlToRedirectAfterPause;
                    }
                  } else {
                    PMExt.error(_('ID_ERROR'), req.result.msg);
                  }
                },
                failure: function ( res, req) {
                  PMExt.error(_('ID_ERROR'), req.result.msg);
                  Ext.getCmp('submitPauseCase').setDisabled(false);
                }
              });
            }
          },
        failure: function ( result, request) {
            if (typeof(result.responseText) != 'undefined') {
              Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
            }
            Ext.getCmp('submitPauseCase').setDisabled(false);
        }
    });
  }

  Actions.unpauseCase = function()
  {
    PMExt.confirm(_('ID_CONFIRM'), _('ID_CONFIRM_UNPAUSE_CASE'), function(){
      var loadMask = new Ext.LoadMask(document.body, {msg: _('ID_UNPAUSING_CASE') });
      loadMask.show();

      Ext.Ajax.request({
        url : 'ajaxListener' ,
        params : {action : 'unpauseCase'},
        success: function ( result, request ) {
          loadMask.hide();
          var data = Ext.util.JSON.decode(result.responseText);
          if( data.success ) {
            try {
              parent.PMExt.notify(_('ID_UNPAUSE_ACTION'), data.msg);
              parent.updateCasesTree();
              parent.highlightCasesTree();
            }
            catch (e) {
            }
            location.href = 'casesListExtJs';
          } else {
            PMExt.error(_('ID_ERROR'), data.msg);
          }
        },
        failure: function ( result, request) {
          Ext.MessageBox.alert( _('ID_FAILED') , result.responseText);
        }
      });
    });
  }

  Actions.deleteCase = function()
  {
		Ext.Ajax.request({
            url : 'casesList_Ajax' ,
            params : {actionAjax : 'verifySession'},
            success: function ( result, request ) {
              var data = Ext.util.JSON.decode(result.responseText);
              if( data.lostSession ) {
               Ext.Msg.show({
                      title: _('ID_ERROR'),
                      msg: data.message,
                      animEl: 'elId',
                      icon: Ext.MessageBox.ERROR,
                      buttons: Ext.MessageBox.OK,
                      fn : function(btn) {
                        try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
                      }
                    });
              } else {
				PMExt.confirm(_('ID_CONFIRM'), _('ID_CONFIRM_DELETE_CASE'), function(){
				var loadMask = new Ext.LoadMask(document.body, {msg:'Deleting case...'});
				loadMask.show();
				Ext.Ajax.request({
				url : '../adhocUserProxy/deleteCase',
				success: function ( result, request ) {
				loadMask.hide();
				var data = Ext.util.JSON.decode(result.responseText);
				if( data.success ) {
                      try {
                          if (typeof parent.PMExt.updateCasesTree !== "undefined") {
                              parent.PMExt.notify(_('ID_DELETE_ACTION'), data.msg);
                          }
                          if (typeof parent.updateCasesTree !== "undefined") {
                              parent.updateCasesTree();
                          }
                          if (typeof parent.highlightCasesTree !== "undefined") {
                            parent.highlightCasesTree();
                          }
					  } catch (e) {
					  }
                      if (typeof parent.postMessage !== "undefined") {
                        parent.postMessage("redirect=todo", "*");
                      } else {
                          location.href = 'casesListExtJs';
                      }
				} else {
				    PMExt.error(_('ID_ERROR'), data.msg);
				}
				},
				failure: function ( result, request) {
				Ext.MessageBox.alert('Failed', result.responseText);
				}
				});
				});
              }
             }
     });
  }

  Actions.reactivateCase = function()
  {
    PMExt.confirm(_('ID_CONFIRM'), _('ID_CONFIRM_REACTIVATE_CASE'), function(){
      var loadMask = new Ext.LoadMask(document.body, {msg: _('ID_REACTIVATING_CASE') });
      loadMask.show();
      Ext.Ajax.request({
        url : 'ajaxListener' ,
        params : {action : 'reactivateCase'},
        success: function ( result, request ) {
          loadMask.hide();
          var data = Ext.util.JSON.decode(result.responseText);
          if( data.success ) {
            try {
              parent.PMExt.notify(_('ID_REACTIVATE_ACTION'), data.msg);
            }
            catch (e) {
            }
            location.href = 'casesListExtJs';
          } else {
            PMExt.error(_('ID_ERROR'), data.msg);
          }
        },
        failure: function ( result, request) {
          Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
        }
      });
    });
  }

  //
  Actions.tabFrame = function(name)
  {
		Ext.Ajax.request({
	          url : 'casesList_Ajax' ,
	          params : {action : 'verifySession'},
	          success: function ( result, request ) {
	            var data = Ext.util.JSON.decode(result.responseText);
	            if( data.lostSession ) {
	             Ext.Msg.show({
	                    title: _('ID_ERROR'),
	                    msg: data.message,
	                    animEl: 'elId',
	                    icon: Ext.MessageBox.ERROR,
	                    buttons: Ext.MessageBox.OK,
	                    fn : function(btn) {
	                      try
                                  {
                                    prnt = parent.parent;
                                    top.location = top.location;
                                  }
                                catch (err)
                                  {
                                    parent.location = parent.location;
                                  }
	                    }
	                  });
	            } else {
	             tabId = name + 'MenuOption';
	                var uri = 'ajaxListener?action=' + name;
	                var TabPanel = Ext.getCmp('caseTabPanel');
	                var tab = TabPanel.getItem(tabId);
	                //!dataInput
	                var tabName = ActionTabFrameGlobal.tabName;
	                var tabTitle = ActionTabFrameGlobal.tabTitle;

	                //!dataSystem
	                var loadMaskMsg = _('ID_LOADING_GRID');

	                if (name == "dynaformViewFromHistory") {
	                  var responseObject = Ext.util.JSON.decode(historyGridListChangeLogGlobal.viewDynaformName);
	                  var dynTitle = responseObject.dynTitle;
	                  var md5Hash = responseObject.md5Hash;
	                  name = "dynaformViewFromHistory"+md5Hash;
	                }

	                var caseHistoryIframeRest = name!="caseHistory"?0:-20;
	                tabId = name + 'MenuOption';
	                var uri = 'ajaxListener?action=' + name;

	                if (name.indexOf("changeLogTab") != -1) {
	                  var uri = 'ajaxListener?action=' + 'changeLogTab';
	                  //!historyGridListChangeLogGlobal
	                  historyGridListChangeLogGlobal.idHistory = historyGridListChangeLogGlobal.idHistory;
	                  historyGridListChangeLogGlobal.tasTitle = historyGridListChangeLogGlobal.tasTitle;
	                  //dataSystem
	                  idHistory = historyGridListChangeLogGlobal.idHistory;
	                  var tasTitle = historyGridListChangeLogGlobal.tasTitle;
	                  menuSelectedTitle[name] = tasTitle;
	                  Actions[name];
	                  uri += "&idHistory="+idHistory;
	                }

	                if (name.indexOf("dynaformViewFromHistory") != -1) {
	                  var uri = 'ajaxListener?action=' + 'dynaformViewFromHistory';
	                  uri += '&DYN_UID='+historyGridListChangeLogGlobal.viewIdDin+'&HISTORY_ID='+historyGridListChangeLogGlobal.viewIdHistory;
	                  menuSelectedTitle[name] = 'View('+dynTitle+' '+historyGridListChangeLogGlobal.dynDate+')';
	                }

	                if (name.indexOf("previewMessage") != -1) {
	                  var uri = 'caseMessageHistory_Ajax?actionAjax=' + 'showHistoryMessage';
	                  var tabNameArray = tabName.split('_');
	                  var APP_UID = tabNameArray[1];
	                  var APP_MSG_UID = tabNameArray[2];
	                  uri += '&APP_UID='+APP_UID+'&APP_MSG_UID='+APP_MSG_UID;
	                  menuSelectedTitle[tabName] = tabTitle;
	                }

	                if (name.indexOf("previewMessage") != -1) {
	                  var uri = 'caseMessageHistory_Ajax?actionAjax=' + 'showHistoryMessage';
	                  var tabNameArray = tabName.split('_');
	                  var APP_UID = tabNameArray[1];
	                  var APP_MSG_UID = tabNameArray[2];
	                  uri += '&APP_UID='+APP_UID+'&APP_MSG_UID='+APP_MSG_UID;
	                  menuSelectedTitle[tabName] = tabTitle;
	                }

	                if (name.indexOf("sendMailMessage") != -1) {
	                  var uri = 'caseMessageHistory_Ajax?actionAjax=' + 'sendMailMessage_JXP';
	                  var tabNameArray = tabName.split('_');
	                  var APP_UID = tabNameArray[1];
	                  var APP_MSG_UID = tabNameArray[2];
	                  uri += '&APP_UID='+APP_UID+'&APP_MSG_UID='+APP_MSG_UID;
	                  menuSelectedTitle[tabName] = tabTitle;
	                }

	                if (name=="dynaformHistory") {
	                  var uri = 'casesHistoryDynaformPage_Ajax?actionAjax=historyDynaformPage';
	                }

	                if (name.indexOf("historyDynaformGridHistory") != -1) {
	                  var historyDynaformGridHistoryGlobal = Ext.util.JSON.decode(ActionTabFrameGlobal.tabData);
	                  var tabTitle = ActionTabFrameGlobal.tabTitle;
	                  var PRO_UID = historyDynaformGridHistoryGlobal.PRO_UID;
	                  var APP_UID = historyDynaformGridHistoryGlobal.APP_UID;
	                  var TAS_UID = historyDynaformGridHistoryGlobal.TAS_UID;
	                  var DYN_UID = historyDynaformGridHistoryGlobal.DYN_UID;
	                  var DYN_TITLE = historyDynaformGridHistoryGlobal.DYN_TITLE;
	                  var uri = 'casesHistoryDynaformPage_Ajax?actionAjax=showDynaformListHistory';
	                  uri += '&PRO_UID='+PRO_UID+'&APP_UID='+APP_UID+'&TAS_UID='+TAS_UID+'&DYN_UID='+DYN_UID;
	                  menuSelectedTitle[name] = tabTitle;
	                }

	                if (name.indexOf("dynaformChangeLogViewHistory") != -1) {
	                  var showDynaformHistoryGlobal = Ext.util.JSON.decode(ActionTabFrameGlobal.tabData);
	                  var tabTitle = ActionTabFrameGlobal.tabTitle;
	                  var dynUID = showDynaformHistoryGlobal.dynUID;
	                  var tablename = showDynaformHistoryGlobal.tablename;
	                  var dynDate = showDynaformHistoryGlobal.dynDate;
	                  var dynTitle = showDynaformHistoryGlobal.dynTitle;
	                  var uri = 'casesHistoryDynaformPage_Ajax?actionAjax=dynaformChangeLogViewHistory';
	                  uri += '&DYN_UID='+dynUID+'&HISTORY_ID='+tablename;
	                  menuSelectedTitle[name] = tabTitle;
	                }

	                if (name.indexOf("historyDynaformGridPreview") != -1) {
	                  var historyDynaformGridPreviewGlobal = Ext.util.JSON.decode(ActionTabFrameGlobal.tabData);
	                  var tabTitle = ActionTabFrameGlobal.tabTitle;
	                  var DYN_UID = historyDynaformGridPreviewGlobal.DYN_UID;
	                  var uri = 'casesHistoryDynaformPage_Ajax?actionAjax=historyDynaformGridPreview';
	                  uri += '&DYN_UID='+DYN_UID;
	                  menuSelectedTitle[name] = tabTitle;
	                }

	                if (name == "uploadDocumentGridDownload") {
	                  var uploadDocumentGridDownloadGlobal = Ext.util.JSON.decode(ActionTabFrameGlobal.tabData);
	                  var APP_DOC_UID = uploadDocumentGridDownloadGlobal.APP_DOC_UID;
	                  var DOWNLOAD_LINK = uploadDocumentGridDownloadGlobal.DOWNLOAD_LINK;
	                  var TITLE = uploadDocumentGridDownloadGlobal.TITLE;
	                  var uri = DOWNLOAD_LINK;
	                  menuSelectedTitle[name] = ActionTabFrameGlobal.tabTitle;
	                }

	                if (name == "generatedDocuments") {
	                  var uri = 'casesGenerateDocumentPage_Ajax.php?actionAjax=casesGenerateDocumentPage';
	                }

	                if (name == "processMap" && _PROJECT_TYPE === 'bpmn') {
	                  var uri = '../designer?prj_uid=' + _PRO_UID + '&prj_readonly=true&app_uid=' + _APP_UID;
	                }

	                if( tab ) {
	                  TabPanel.setActiveTab(tabId);
	                }
	                else {
	                  if(name == "processMap" && isBrowserIE() && _PROJECT_TYPE === 'bpmn'){
	                      var windContainer = window.open(uri,"winContainer");
	                  } else {
	                      TabPanel.add({
	                         id: tabId,
	                         title: menuSelectedTitle[name],
	                         frameConfig:{name: name + 'Frame', id: name + 'Frame'},
	                         defaultSrc : uri,
	                         loadMask:{msg:_('ID_LOADING_GRID')+'...'},
	                         autoWidth: true,
	                         closable:true,
	                         autoScroll: true,
	                         bodyStyle:{height: (PMExt.getBrowser().screen.height-60) + 'px', overflow:'auto'}
	                      }).show();
	                      TabPanel.doLayout();
	                  }
	                }
	            }
	          },
	          failure: function ( result, request) {
	            if (typeof(result.responseText) != 'undefined') {
	              Ext.MessageBox.alert( _('ID_FAILED'), result.responseText);
	            }
	          }
	     });
  }

});

  Actions.adhocAssignmentUsers = function()
  {
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    Ext.QuickTips.init();
    store = new Ext.data.GroupingStore( {
    proxy : new Ext.data.HttpProxy({
      url   : '../adhocUserProxy/adhocAssignUsersk'
     }),
    reader : new Ext.data.JsonReader( {
     root: 'data',
     fields : [
      {name : 'USR_UID'},
      {name : 'USR_FIRSTNAME'},
      {name : 'USR_LASTNAME'}
      ]
    })
    });

    cmk = new Ext.grid.ColumnModel({
     defaults: {
      width: 40,
      sortable: true
      },
     columns: [
      { id:'USR_UID', dataIndex: 'USR_UID', hidden:true, hideable:false},
      { header : _('ID_FIRST_NAME'), dataIndex : 'USR_FIRSTNAME', sortable : true, width: 130, align:'center'},
      { header : _('ID_LAST_NAME'), dataIndex : 'USR_LASTNAME', sortable : true,width: 130, align:'center' }
     ]
    });

    var smodel = new Ext.grid.RowSelectionModel({
        singleSelect: true,
        listeners: {
            rowselect: function (sm)
            {
                Ext.getCmp("btnAssignAdHocUser").setDisabled(false);
            },
            rowdeselect: function (sm)
            {
                Ext.getCmp("btnAssignAdHocUser").setDisabled(true);
            }
        }
    });

    pbark = new Ext.PagingToolbar({
     pageSize: 8,
     store: store,
     displayInfo: true,
     displayMsg: _('ID_GRID_PAGE_DISPLAYING_USERS_MESSAGE'),
     emptyMsg: "",
     items:[]
    });

    var adHocUserGrid = new Ext.grid.GridPanel( {
      region: 'center',
      layout: 'fit',
      id: 'adHocUserGrid',
      height:210,
      //autoWidth : true,
      width:'',
      title : '',
      stateful : true,
      stateId : 'gridAdHocCasesOpen',
      enableColumnResize: true,
      enableHdMenu: true,
      frame:false,
      columnLines: true,
      viewConfig: {
        forceFit:true
      },
      store: store,
      colModel: cmk,
      selModel: smodel,
      tbar:[
        {
          id: "btnAssignAdHocUser",

          text:_('ID_ASSIGN'),
          iconCls: 'silk-add',
          icon: '/images/cases-selfservice.png',
          disabled: true,
          handler: assignAdHocUser
        }
      ],
      bbar: '',
      listeners:{
        rowdblclick: assignAdHocUser
      }
    });

    var w = new Ext.Window({
      title: _('ID_ADHOC_ASSIGNMENT'),
      width: 500,
      height: 240,
      resizable: false,
      items: [ adHocUserGrid ],
      id: 'w'
    });
    adHocUserGrid.store.load();
    w.show();

  function assignAdHocUser()
  {
      var rowSelected = adHocUserGrid.getSelectionModel().getSelected();

      if (typeof(rowSelected) != "undefined") {
          PMExt.confirm(
              _("ID_CONFIRM"),
              _("ID_CONFIRM_ADHOCUSER_CASE"),
              function ()
              {
                  var loadMask = new Ext.LoadMask(document.body, {msg: _("ID_ASSIGNMENT_CASE")});

                  loadMask.show();

                  Ext.Ajax.request({
                      url: "../adhocUserProxy/reassignCase",
                      method: "POST",
                      params: {USR_UID: rowSelected.data.USR_UID, THETYPE: "ADHOC"},
                      success: function (result, request)
                      {
                          loadMask.hide();
                          var data = Ext.util.JSON.decode(result.responseText);

                          if (data.success) {
                              CloseWindow();
                              location.href = "casesListExtJs";
                          } else {
                              PMExt.error(_("ID_ERROR"), data.msg);
                          }
                      },
                      failure: function (result, request)
                      {
                          Ext.MessageBox.alert(_("ID_FAILED"), result.responseText);
                      }
                  });
              }
          );
      }
  }
}

  CloseWindow = function(){
    Ext.getCmp('w').hide();
  };

  setNode =  function(uid){
    var stepsTree = Ext.getCmp('casesStepTree');

    if (!stepsTree) {
      return false;
    }

    var node = stepsTree.getNodeById(uid);

    if (!node) {
      return false;
    }

    node.select();
  }
