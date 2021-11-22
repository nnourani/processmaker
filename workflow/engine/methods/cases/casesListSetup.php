<?php
use Eusebiu\JavaScript\Facades\ScriptVariables;
use Illuminate\Support\Facades\View;
use ProcessMaker\Core\System;
use ProcessMaker\Model\User;

global $translation;
global $RBAC;

$conf = new Configurations();

if ($RBAC->userCanAccess("PM_SETUP") != 1 || $RBAC->userCanAccess("PM_SETUP_ADVANCE") != 1) {
    G::SendTemporalMessage("ID_USER_HAVENT_RIGHTS_PAGE", "error", "labels");
    exit(0);
}

$availableFields = array();

$oHeadPublisher = headPublisher::getSingleton();

$oHeadPublisher->addExtJsScript('cases/casesListSetup', false); //adding a javascript file .js
$oHeadPublisher->addContent('cases/casesListSetup'); //adding a html file  .html.
$oHeadPublisher->assignNumber("pageSize", 20); //sending the page size
$oHeadPublisher->assignNumber("availableFields", G::json_encode($availableFields));

$userCanAccess = 1;

$pmDynaform = new PmDynaform();
ScriptVariables::add('SYS_CREDENTIALS', $pmDynaform->getCredentials());
ScriptVariables::add('SYS_SERVER_API', System::getHttpServerHostnameRequestsFrontEnd());
ScriptVariables::add('SYS_SERVER_AJAX', System::getServerProtocolHost());
ScriptVariables::add('SYS_WORKSPACE', config("system.workspace"));
ScriptVariables::add('SYS_URI', SYS_URI);
ScriptVariables::add('SYS_LANG', SYS_LANG);
ScriptVariables::add('TRANSLATIONS', $translation);
ScriptVariables::add('FORMATS', $conf->getFormats());
ScriptVariables::add('userId', User::getId($_SESSION['USER_LOGGED']));
echo View::make('Views::admin.settings.customCasesList', compact("userCanAccess"))->render();