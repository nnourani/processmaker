 export default {
    AUTHENTICATE_USER: "/oauth2/token",
    USER_DATA: "/light/user/data",
    GET_MAIN_MENU_COUNTERS: "/light/counters",
    GET_NOTES: "/cases/{app_uid}/notes/paged?files={files}",
    GET_PROCESS_MAP: "/light/project/{prj_uid}/case/{app_uid}",
    GET_LIST_UNASSIGNED: "/light/unassigned{suffix}",
    GET_LISTS_PARTICIPATED: "/light/participated{suffix}",
    GET_LISTS_DRAFT: "/light/draft{suffix}",
    GET_LISTS_PAUSED: "/light/paused",
    GET_LISTS_COMPLETED: "/light/completed",
    GET_USERS_PICTURES: "/light/users/data",
    FORMS_ARRAY: "/light/project/{pro_uid}/activity/{act_uid}/steps",
    GET_NEW_CASES: "/case/start-cases?type_view=category",
    GET_HISTORY_CASES: "/light/history/{app_uid}",
    LOGOUT_USER: "/light/logout",
    UPLOAD_LOCATION: "/light/case/{app_uid}/upload/location",
    GET_FORM_ID_TO_UPLOAD: "/light/case/{app_uid}/upload",
    UPLOAD_FILE: "/light/case/{app_uid}/upload/{app_doc_uid}",
    GET_CASE_INFO: "/light/{type}/case/{app_uid}",
    REQUEST_PAUSE_CASE: "/light/cases/{app_uid}/pause",
    UNPAUSE_CASE: "/cases/{app_uid}/unpause",
    CANCEL_CASE: "/cases/{app_uid}/cancel",
    REQUEST_SYS_CONFIG: "/light/config",
    REQUEST_SYS_CONFIG_V2: "/light/config?fileLimit=true",
    ROUTE_CASE: "/light/cases/{app_uid}/route-case",
    CLAIM_CASE: "/case/{app_uid}/claim",
    GET_FILE_VERSIONS: "/cases/{app_uid}/input-document/{app_doc_uid}/versions",
    REGISTER: "https:trial32.processmaker.com/syscolosa/en/neoclassic_pro/9893000714bdb2d52ecc317052629917/Trial_RequestPostMobile.php",
    POST_NOTE: "/case/{app_uid}/note",
    LAST_OPEN_INDEX: "/light/lastopenindex/case/{app_uid}",
    REGISTER_WITH_GOOGLE_FAKE_URL: "fakeurl",
    SIGN_IN_TO_PM_WITH_GOOGLE: "/authentication/gmail",
    GET_CASE_VARIABLES: "/light/{app_uid}/variables?pro_uid={pro_uid}&act_uid={act_uid}&app_index={del_index}",
    REGISTER_DEVICE_TOKEN_FOR_NOTIFICATIONS: "/light/notification",
    UNREGISTER_DEVICE_TOKEN_FOR_NOTIFICATIONS: "/light/notification/{dev_uid}",
    GET_ASSIGMENT_USERS: "/light/task/{act_uid}/case/{app_uid}/{del_index}/assignment",
    GET_CASE_INPUT_FILES: "/cases/{app_uid}/input-documents",
    GET_CASE_OUTPUT_FILES: "/cases/{app_uid}/output-documents",
    DOWNLOAD_IMAGE_BASE64: "/light/case/{app_uid}/download64",
    DOWNLOAD_INPUT_FILE: "/cases/{app_uid}/input-document/{app_doc_uid}/file?v=1",
    DOWNLOAD_OUTPUT_FILE: "/cases/{app_uid}/output-document/{app_doc_uid}/file?v=1",
    VERIFY_CASE_NOT_ROUTED: "/light/case/{app_uid}/{del_index}",
    GET_FORM_DEFINITION: "/light/project/{prj_uid}/dynaform/{dyn_uid}",
    GET_FORM_DEFINITION_PREPROCESSED: "/light/project/{prj_uid}/dynaformprocessed/{dyn_uid}?app_uid={app_uid}&del_index={del_index}",
    START_CASE: "/light/process/{pro_uid}/task/{task_uid}/start-case",
    GET_FORM_DEFINITIONS: "/cases/{app_uid}/input-document/{app_doc_uid}/file?v={version}",
    SAVE_FORM_DATA: "/light/{app_uid}/variable?dyn_uid={dyn_uid}&del_index={del_index}",
    EXECUTE_TRIGGERS_AFTER: "/light/process/{pro_uid}/task/{act_uid}/case/{app_uid}/step/{step_uid}/execute-trigger/after",
    EXECUTE_QUERY: "/project/{prj_uid}/process-variable/{var_name}/execute-query",
    EXECUTE_QUERY_SUGGEST: "/project/{prj_uid}/process-variable/{var_name}/execute-query-suggest",
    CHECK: "/light/{listType}/check",
    GET_NEXT_STEP: "/light/get-next-step/{app_uid}",
    REQUEST_SQLITE_DATABASE_TABLES: "/pmtable?offline=1",
    REQUEST_SQLITE_DATABASE_TABLES_DATA: "/pmtable/offline/data?compress=false",
    MY_CASES: "/home/mycases",
    TODO_LIST: "/home/todo",
    DRAFT_LIST: "/home/draft",
    PAUSED_LIST: "/home/paused",
    UNASSIGNED_LIST: "/home/unassigned",
    MY_FILTERS: "/cases/advanced-search/filters",
    POST_MY_FILTERS: "/cases/advanced-search/filter",
    PUT_MY_FILTERS: "/cases/advanced-search/filter/{id}",
    DELETE_MY_FILTERS: "/cases/advanced-search/filter/",
    SEARCH: "/home/search",
    PROCESSES: "/home/processes",
    USERS: "/home/users",
    TASKS: "/home/tasks",
    CATEGORIES: "/home/categories",
    DEBUG_STATUS: "/home/process-debug-status?processUid={prj_uid}",
    LIST_TOTAL_CASES: "/metrics/list-total-cases",
    TOTAL_CASES_BY_PROCESS:"/metrics/total-cases-by-process",
    TOTAL_CASES_BY_RANGE:"/metrics/process-total-cases",
    CASES_RISK:"/metrics/cases-risk",
    CONFIG: "/home/config",
    GET_CONFIG: "/home/config/{id}/{name}",
    PAUSE_CASE: "/cases/{app_uid}/pause",
    REASSIGN_CASE: "/cases/{app_uid}/reassign-case",
    REASSIGN_USERS: "/light/userstoreassign/{task_uid}",
    INBOX_CUSTOM_LIST: "/home/inbox/{id}",
    DRAFT_CUSTOM_LIST: "/home/draft/{id}",
    PAUSED_CUSTOM_LIST: "/home/paused/{id}",
    UNASSIGNED_CUSTOM_LIST: "/home/unassigned/{id}"
};