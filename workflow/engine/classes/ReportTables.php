<?php

use App\Jobs\GenerateReportTable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use ProcessMaker\Core\JobsManager;
use ProcessMaker\Model\Application;

/**
 * Report Tables
 */
class ReportTables
{
    private $aDef = array(
        'mysql' => array(
            'number' => 'DOUBLE',
            'char' => 'VARCHAR(255)',
            'text' => 'TEXT',
            'date' => 'DATETIME'
        ),
        'pgsql' => array(
            'number' => 'DOUBLE',
            'char' => 'VARCHAR(255)',
            'text' => 'TEXT',
            'date' => 'DATETIME'
        ),
        'mssql' => array(
            'number' => 'FLOAT',
            'char' => 'NVARCHAR(255)',
            'text' => 'TEXT',
            'date' => 'CHAR(19)'
        ) /* Changed DATETIME CHAR(19) for compatibility issues. */
    );
    private $sPrefix = '';

    /**
     * Function deleteAllReportVars
     * This function delete all reports
     *
     * @access public
     *
     * @param string $$sRepTabUid
     *
     * @return void
     */
    public function deleteAllReportVars($sRepTabUid = '')
    {
        try {
            $oCriteria = new Criteria('workflow');
            $oCriteria->add(ReportVarPeer::REP_TAB_UID, $sRepTabUid);
            ReportVarPeer::doDelete($oCriteria);
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function prepareQuery
     * This function removes the table
     *
     * @access public
     *
     * @param string $sTableName Table name
     * @param string $sConnection Conexion
     *
     * @return void
     */
    public function dropTable($sTableName, $sConnection = 'report')
    {
        $sTableName = $this->sPrefix . $sTableName;
        //we have to do the propel connection
        $PropelDatabase = $this->chooseDB($sConnection);
        $con = Propel::getConnection($PropelDatabase);
        $stmt = $con->createStatement();
        try {
            switch (DB_ADAPTER) {
                case 'mysql':
                    $rs = $stmt->executeQuery('DROP TABLE IF EXISTS `' . $sTableName . '`');
                    break;
                case 'mssql':
                    $rs = $stmt->executeQuery("IF OBJECT_ID (N'" . $sTableName . "', N'U') IS NOT NULL
                        DROP TABLE [" . $sTableName . "]");
                    break;
            }
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function createTable
     * This Function creates the table
     *
     * @access public
     *
     * @param string $sTableName Table name
     * @param string $sConnection Connection name
     * @param string $sType
     * @param array $aFields
     * @param string $bDefaultFields
     *
     * @return void
     */
    public function createTable(
        $sTableName,
        $sConnection = 'report',
        $sType = 'NORMAL',
        $aFields = array(),
        $bDefaultFields = true
    )
    {
        $sTableName = $this->sPrefix . $sTableName;
        //we have to do the propel connection
        $PropelDatabase = $this->chooseDB($sConnection);
        $con = Propel::getConnection($PropelDatabase);
        $stmt = $con->createStatement();
        try {
            switch (DB_ADAPTER) {
                case 'mysql':
                    $sQuery = 'CREATE TABLE IF NOT EXISTS `' . $sTableName . '` (';
                    if ($bDefaultFields) {
                        $sQuery .= "`APP_UID` VARCHAR(32) NOT NULL DEFAULT '',`APP_NUMBER` INT NOT NULL,";
                        if ($sType == 'GRID') {
                            $sQuery .= "`ROW` INT NOT NULL,";
                        }
                    }
                    foreach ($aFields as $aField) {
                        switch ($aField['sType']) {
                            case 'number':
                                $sQuery .= '`' . $aField['sFieldName'] . '` ' . $this->aDef['mysql'][$aField['sType']] . " NOT NULL DEFAULT '0',";
                                break;
                            case 'char':
                                $sQuery .= '`' . $aField['sFieldName'] . '` ' . $this->aDef['mysql'][$aField['sType']] . " NOT NULL DEFAULT '',";
                                break;
                            case 'text':
                                $sQuery .= '`' . $aField['sFieldName'] . '` ' . $this->aDef['mysql'][$aField['sType']] . " ,";
                                break;
                            case 'date':
                                $sQuery .= '`' . $aField['sFieldName'] . '` ' . $this->aDef['mysql'][$aField['sType']] . " NULL,";
                                break;
                        }
                    }
                    if ($bDefaultFields) {
                        $sQuery .= 'PRIMARY KEY (APP_UID' . ($sType === 'GRID' ? ',ROW' : '') . ')) ';
                    }
                    $sQuery .= ' DEFAULT CHARSET=utf8;';
                    $rs = $stmt->executeQuery($sQuery);
                    break;
                case 'mssql':
                    $sQuery = 'CREATE TABLE [' . $sTableName . '] (';
                    if ($bDefaultFields) {
                        $sQuery .= "[APP_UID] VARCHAR(32) NOT NULL DEFAULT '', [APP_NUMBER] INT NOT NULL,";
                        if ($sType == 'GRID') {
                            $sQuery .= "[ROW] INT NOT NULL,";
                        }
                    }
                    foreach ($aFields as $aField) {
                        switch ($aField['sType']) {
                            case 'number':
                                $sQuery .= '[' . $aField['sFieldName'] . '] ' . $this->aDef['mssql'][$aField['sType']] . " NOT NULL DEFAULT '0',";
                                break;
                            case 'char':
                                $sQuery .= '[' . $aField['sFieldName'] . '] ' . $this->aDef['mssql'][$aField['sType']] . " NOT NULL DEFAULT '',";
                                break;
                            case 'text':
                                $sQuery .= '[' . $aField['sFieldName'] . '] ' . $this->aDef['mssql'][$aField['sType']] . " NOT NULL DEFAULT '',";
                                break;
                            case 'date':
                                $sQuery .= '[' . $aField['sFieldName'] . '] ' . $this->aDef['mssql'][$aField['sType']] . " NULL,";
                                break;
                        }
                    }
                    if ($bDefaultFields) {
                        $sQuery .= 'PRIMARY KEY (APP_UID' . ($sType == 'GRID' ? ',ROW' : '') . ')) ';
                    } else {
                        $sQuery .= ' ';
                    }

                    $rs = $stmt->executeQuery($sQuery);
                    break;

            }
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function populateTable
     * This Function fills the table
     *
     * @access public
     * @param string $tableName Table name
     * @param string $connectionShortName Connection name
     * @param string $type
     * @param array $fields
     * @param string $proUid
     * @param string $grid
     * @see ConsolidatedCases->processConsolidated()
     * @see Processes->createReportTables()
     * @see workflow/engine/methods/cases/caseConsolidated.php
     * @see workflow/engine/methods/processes/consolidated.php ajax_con->con_save_properties()
     * @see workflow/engine/methods/reportTables/reportTables_Save.php
     * @link https://wiki.processmaker.com/3.0/Report_Tables
     * @return void
     */
    public function populateTable($tableName, $connectionShortName = 'report', $type = 'NORMAL', $fields = [], $proUid = '', $grid = '')
    {
        $config = System::getSystemConfiguration();
        $reportTableBatchRegeneration = $config['report_table_batch_regeneration'];

        $tableName = $this->sPrefix . $tableName;
        //we have to do the propel connection
        $database = $this->chooseDB($connectionShortName);
        $connection = Propel::getConnection($database);
        if ($type == 'GRID') {
            $aux = explode('-', $grid);
            $grid = $aux[0];
        }
        $case = new Cases();
        try {
            $applicationTableName = (new Application())->getTable();
            $deleteQuery = "TRUNCATE TABLE `{$tableName}` ";
            DB::delete($deleteQuery);

            $applications = Application::getByProUid($proUid);
            $i = 1;
            $queryValues = "";
            $numberRecords = $reportTableBatchRegeneration;
            $n = count($applications);
            foreach ($applications as $application) {
                $appData = $case->unserializeData($application->APP_DATA);
                if ($type == 'NORMAL') {
                    $query = 'INSERT INTO `' . $tableName . '` (';
                    $query .= '`APP_UID`,`APP_NUMBER`';
                    foreach ($fields as $field) {
                        $query .= ',`' . $field['sFieldName'] . '`';
                    }
                    $headQuery = $query . ") VALUES ";
                    $query = "('" . $application->APP_UID . "'," . $application->APP_NUMBER;
                    foreach ($fields as $field) {
                        switch ($field['sType']) {
                            case 'number':
                                $query .= ',' . (isset($appData[$field['sFieldName']]) ? (float) str_replace(',', '', $appData[$field['sFieldName']]) : '0');
                                break;
                            case 'char':
                            case 'text':
                                if (!isset($appData[$field['sFieldName']])) {
                                    $appData[$field['sFieldName']] = '';
                                }
                                $string = $appData[$field['sFieldName']];
                                if (is_array($string)) {
                                    $string = implode(",", $string);
                                }
                                $query .= ",'" . (isset($appData[$field['sFieldName']]) ? mysqli_real_escape_string($connection->getResource(), $string) : '') . "'";
                                break;
                            case 'date':
                                $value = (isset($appData[$field['sFieldName']]) && trim($appData[$field['sFieldName']])) != '' ? "'" . $appData[$field['sFieldName']] . "'" : 'NULL';
                                $query .= "," . $value;
                                break;
                        }
                    }
                    $query .= ')';
                    $queryValues = $queryValues . $query . ",";
                    if ($i % $numberRecords === 0 || $i === $n) {
                        $queryValues = rtrim($queryValues, ",");
                        $query = $headQuery . $queryValues;
                        $queryValues = "";

                        //add to queue
                        $closure = function() use($query) {
                            DB::insert($query);
                        };
                        JobsManager::getSingleton()->dispatch(GenerateReportTable::class, $closure);
                    }
                } else {
                    if (isset($appData[$grid])) {
                        $query = 'INSERT INTO `' . $tableName . '` (';
                        $query .= '`APP_UID`,`APP_NUMBER`,`ROW`';
                        foreach ($fields as $field) {
                            $query .= ',`' . $field['sFieldName'] . '`';
                        }
                        $headQuery = $query . ") VALUES ";
                        foreach ($appData[$grid] as $indexRow => $gridRow) {
                            $query = "('" . $application->APP_UID . "'," . (int) $application->APP_NUMBER . ',' . $indexRow;
                            foreach ($fields as $field) {
                                switch ($field['sType']) {
                                    case 'number':
                                        $query .= ',' . (isset($gridRow[$field['sFieldName']]) ? (float) str_replace(',', '', $gridRow[$field['sFieldName']]) : '0');
                                        break;
                                    case 'char':
                                    case 'text':
                                        if (!isset($gridRow[$field['sFieldName']])) {
                                            $gridRow[$field['sFieldName']] = '';
                                        }
                                        $stringEscape = mysqli_real_escape_string($connection->getResource(), $gridRow[$field['sFieldName']]);
                                        $query .= ",'" . (isset($gridRow[$field['sFieldName']]) ? $stringEscape : '') . "'";
                                        break;
                                    case 'date':
                                        $value = (isset($gridRow[$field['sFieldName']]) && trim($gridRow[$field['sFieldName']])) != '' ? "'" . $gridRow[$field['sFieldName']] . "'" : 'NULL';
                                        $query .= "," . $value;
                                        break;
                                }
                            }
                            $query .= ')';
                            $queryValues = $queryValues . $query . ",";
                        }
                        if ($i % $numberRecords === 0 || $i === $n) {
                            $queryValues = rtrim($queryValues, ",");
                            $query = $headQuery . $queryValues;
                            $queryValues = "";

                            //add to queue
                            $closure = function() use($query) {
                                DB::insert($query);
                            };
                            JobsManager::getSingleton()->dispatch(GenerateReportTable::class, $closure);
                        }
                    }
                }
                $i = $i + 1;
            }
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function getTableVars
     *
     * @access public
     *
     * @param string $sRepTabUid
     * @param boolean $bWhitType
     *
     * @return void
     */
    public function getTableVars($sRepTabUid, $bWhitType = false)
    {
        try {
            $oCriteria = new Criteria('workflow');
            $oCriteria->add(ReportVarPeer::REP_TAB_UID, $sRepTabUid);
            $oDataset = ReportVarPeer::doSelectRS($oCriteria);
            $oDataset->setFetchmode(ResultSet::FETCHMODE_ASSOC);
            $oDataset->next();
            $aVars = array();
            $aImportedVars = array(); //This array will help to control if the variable already exist
            while ($aRow = $oDataset->getRow()) {
                if ($bWhitType) {
                    if (!in_array($aRow['REP_VAR_NAME'], $aImportedVars)) {
                        $aImportedVars[] = $aRow['REP_VAR_NAME'];
                        $aVars[] = array(
                            'sFieldName' => $aRow['REP_VAR_NAME'],
                            'sType' => $aRow['REP_VAR_TYPE']
                        );
                    }
                } else {
                    $aVars[] = $aRow['REP_VAR_NAME'];
                }
                $oDataset->next();
            }
            return $aVars;
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function deleteReportTable
     * This Function deletes report table
     *
     * @access public
     *
     * @param string $sRepTabUid
     *
     * @return void
     */
    public function deleteReportTable($sRepTabUid)
    {
        try {
            $oReportTable = new ReportTable();
            $aFields = $oReportTable->load($sRepTabUid);
            if (!(empty($aFields))) {
                $this->dropTable($aFields['REP_TAB_NAME'], $aFields['REP_TAB_CONNECTION']);
                $oCriteria = new Criteria('workflow');
                $oCriteria->add(ReportVarPeer::REP_TAB_UID, $sRepTabUid);
                $oDataset = ReportVarPeer::doDelete($oCriteria);
                $oReportTable->remove($sRepTabUid);
            }
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function getSplitDate
     * This function gets the split date
     *
     * @access public
     *
     * @param date $date
     * @param string $mask
     *
     * @return array
     */
    public function getSplitDate($date, $mask)
    {
        $sw1 = false;
        for ($i = 0; $i < 3; $i++) {
            $item = substr($mask, $i * 2, 1);
            switch ($item) {
                case 'Y':
                    switch ($i) {
                        case 0:
                            $d1 = substr($date, 0, 4);
                            break;
                        case 1:
                            $d1 = substr($date, 3, 4);
                            break;
                        case 2:
                            $d1 = substr($date, 6, 4);
                            break;
                    }
                    $sw1 = true;
                    break;
                case 'y':
                    switch ($i) {
                        case 0:
                            $d1 = substr($date, 0, 2);
                            break;
                        case 1:
                            $d1 = substr($date, 3, 2);
                            break;
                        case 2:
                            $d1 = substr($date, 6, 2);
                            break;
                    }
                    break;
                case 'm':
                    switch ($i) {
                        case 0:
                            $d2 = substr($date, 0, 2);
                            break;
                        case 1:
                            $d2 = ($sw1) ? substr($date, 5, 2) : substr($date, 3, 2);
                            break;
                        case 2:
                            $d2 = ($sw1) ? substr($date, 8, 2) : substr($date, 5, 2);
                            break;
                    }
                    break;
                case 'd':
                    switch ($i) {
                        case 0:
                            $d3 = substr($date, 0, 2);
                            break;
                        case 1:
                            $d3 = ($sw1) ? substr($date, 5, 2) : substr($date, 3, 2);
                            break;
                        case 2:
                            $d3 = ($sw1) ? substr($date, 8, 2) : substr($date, 5, 2);
                            break;
                    }
                    break;
            }
        }
        return array(
            isset($d1) ? $d1 : '',
            isset($d2) ? $d2 : '',
            isset($d3) ? $d3 : ''
        );
    }

    /**
     * Function getFormatDate
     * This function returns the date formated
     *
     * @access public
     *
     * @param date $sDate
     * @param date $sMask
     *
     * @return date
     */
    public function getFormatDate($sDate, $sMask)
    {
        $dateTime = explode(" ", $sDate); //To accept the Hour part
        $aDate = explode('-', str_replace("/", "-", $dateTime[0]));
        $bResult = true;
        foreach ($aDate as $sDate) {
            if (!is_numeric($sDate)) {
                $bResult = false;
                break;
            }
        }
        if ($sMask != '') {
            $aDate = $this->getSplitDate($dateTime[0], $sMask);
            $aDate[0] = ($aDate[0] == '') ? date('Y') : $aDate[0];
            $aDate[1] = ($aDate[1] == '') ? date('m') : $aDate[1];
            $aDate[2] = ($aDate[2] == '') ? date('d') : $aDate[2];
            if (checkdate($aDate[1], $aDate[2], $aDate[0])) {
            } else {
                return false;
            }
        }
        $sDateC = '';
        for ($i = 0; $i < count($aDate); $i++) {
            $sDateC .= (($i == 0) ? "" : "-") . $aDate[$i];
        }
        return ($sDateC);
    }

    /**
     * Function updateTables
     * This function updated the Report Tables
     *
     * @access public
     *
     * @param string $sProcessUid
     * @param string $sApplicationUid
     * @param string $iApplicationNumber
     * @param string $aFields
     *
     * @return void
     */
    public function updateTables($sProcessUid, $sApplicationUid, $iApplicationNumber, $aFields)
    {
        try {
            $c = new Criteria('workflow');
            $c->addSelectColumn(BpmnProjectPeer::PRJ_UID);
            $c->add(BpmnProjectPeer::PRJ_UID, $sProcessUid, Criteria::EQUAL);
            $ds = ProcessPeer::doSelectRS($c);
            $ds->setFetchmode(ResultSet::FETCHMODE_ASSOC);
            $ds->next();
            $row = $ds->getRow();
            $isBpmn = isset($row['PRJ_UID']);

            if (!class_exists('ReportTablePeer')) {
                require_once 'classes/model/ReportTablePeer.php';
            }
            //get all Active Report Tables
            $oCriteria = new Criteria('workflow');
            $oCriteria->add(ReportTablePeer::PRO_UID, $sProcessUid);
            $oCriteria->add(ReportTablePeer::REP_TAB_STATUS, 'ACTIVE');
            $oDataset = ReportTablePeer::doSelectRS($oCriteria);
            $oDataset->setFetchmode(ResultSet::FETCHMODE_ASSOC);
            $oDataset->next();
            while ($aRow = $oDataset->getRow()) {
                $aRow['REP_TAB_NAME'] = $this->sPrefix . $aRow['REP_TAB_NAME'];
                $PropelDatabase = $this->chooseDB($aRow['REP_TAB_CONNECTION']);
                $con = Propel::getConnection($PropelDatabase);
                $con->getResource();
                $stmt = $con->createStatement();
                $aTableFields = $this->getTableVars($aRow['REP_TAB_UID'], true);
                if ($aRow['REP_TAB_TYPE'] == 'NORMAL') {
                    $sqlExists = "SELECT * FROM `" . $aRow['REP_TAB_NAME'] . "` WHERE APP_UID = '" . $sApplicationUid . "'";
                    $rsExists = $stmt->executeQuery($sqlExists, ResultSet::FETCHMODE_ASSOC);
                    $rsExists->next();
                    $aRow2 = $rsExists->getRow();

                    if (is_array($aRow2)) {
                        $sQuery = 'UPDATE `' . $aRow['REP_TAB_NAME'] . '` SET ';
                        foreach ($aTableFields as $aField) {
                            $sQuery .= '`' . $aField['sFieldName'] . '` = ';

                            if (!$isBpmn && !isset($aFields[$aField['sFieldName']])) {
                                foreach ($aFields as $row) {
                                    if (is_array($row) && isset($row[count($row)])) {
                                        $aFields = $row[count($row)];
                                    }
                                }
                            }

                            switch ($aField['sType']) {
                                case 'number':
                                    $sQuery .= (isset($aFields[$aField['sFieldName']]) ? (float)str_replace(
                                            ',',
                                            '',
                                            $aFields[$aField['sFieldName']]
                                        ) : '0') . ',';
                                    break;
                                case 'char':
                                case 'text':
                                    if (!isset($aFields[$aField['sFieldName']])) {
                                        $aFields[$aField['sFieldName']] = '';
                                    }
                                    if (!isset($aFields[$aField['sFieldName'] . '_label'])) {
                                        $aFields[$aField['sFieldName'] . '_label'] = '';
                                    }
                                    if (is_array($aFields[$aField['sFieldName']])) {
                                        $sQuery .= "'" . (isset($aFields[$aField['sFieldName']]) ? $aFields[$aField['sFieldName']][0] : '') . "',";
                                    } else {
                                        $sQuery .= '\'' . ((isset($aFields[$aField['sFieldName']])) ? mysqli_real_escape_string(
                                                $con->getResource(),
                                                $aFields[$aField['sFieldName']]
                                            ) : '') . '\',';
                                    }
                                    break;
                                case 'date':
                                    $mysqlDate = (isset($aFields[$aField['sFieldName']]) ? $aFields[$aField['sFieldName']] : '');
                                    if ($mysqlDate != '') {
                                        $mysqlDate = str_replace('/', '-', $mysqlDate);
                                        $mysqlDate = date('Y-m-d', strtotime($mysqlDate));
                                    }
                                    $value = trim($mysqlDate) != '' ? "'" . $mysqlDate . "'" : 'NULL';
                                    $sQuery .= $value . ",";
                                    break;
                            }
                        }
                        $sQuery = substr($sQuery, 0, -1);
                        $sQuery .= " WHERE APP_UID = '" . $sApplicationUid . "'";

                        //Only we will to executeQuery if we have additional field
                        if (count($aTableFields) > 0) {
                            try {
                                $rs = $stmt->executeQuery($sQuery);
                            } catch (Exception $e) {
                                $message = 'Sql Execution';
                                $context = [
                                    'sql' => $sQuery, 
                                    'error' => $e->getMessage()
                                ];
                                Log::channel(':sqlExecution')->error($message, Bootstrap::context($context));
                            }
                        }
                    } else {
                        $sQuery = 'INSERT INTO `' . $aRow['REP_TAB_NAME'] . '` (';
                        $sQuery .= '`APP_UID`,`APP_NUMBER`';
                        foreach ($aTableFields as $aField) {
                            $sQuery .= ',`' . $aField['sFieldName'] . '`';
                        }
                        $sQuery .= ") VALUES ('" . $sApplicationUid . "'," . (int)$iApplicationNumber;
                        foreach ($aTableFields as $aField) {
                            switch ($aField['sType']) {
                                case 'number':
                                    $sQuery .= ',' . (isset($aFields[$aField['sFieldName']]) ? (float)str_replace(
                                            ',',
                                            '',
                                            $aFields[$aField['sFieldName']]
                                        ) : '0');
                                    break;
                                case 'char':
                                case 'text':
                                    if (!isset($aFields[$aField['sFieldName']])) {
                                        $aFields[$aField['sFieldName']] = '';
                                    }
                                    $sQuery .= ",'" . (isset($aFields[$aField['sFieldName']]) ? mysqli_real_escape_string(
                                            $con->getResource(),
                                            $aFields[$aField['sFieldName']]
                                        ) : '') . "'";
                                    break;
                                case 'date':
                                    $mysqlDate = (isset($aFields[$aField['sFieldName']]) ? $aFields[$aField['sFieldName']] : '');
                                    if ($mysqlDate != '') {
                                        $mysqlDate = str_replace('/', '-', $mysqlDate);
                                        $mysqlDate = date('Y-m-d', strtotime($mysqlDate));
                                    }
                                    $value = trim($mysqlDate) != '' ? "'" . $mysqlDate . "'" : 'NULL';
                                    $sQuery .= "," . $value;
                                    break;
                            }
                        }
                        $sQuery .= ')';

                        try {
                            $rs = $stmt->executeQuery($sQuery);
                        } catch (Exception $e) {
                            $message = 'Sql Execution';
                            $context = [
                                'sql' => $sQuery,
                                'error' => $e->getMessage()
                            ];
                            Log::channel(':sqlExecution')->error($message, Bootstrap::context($context));
                        }
                    }
                } else {
                    //remove old rows from database
                    $sqlDelete = 'DELETE FROM `' . $aRow['REP_TAB_NAME'] . "` WHERE APP_UID = '" . $sApplicationUid . "'";
                    $rsDelete = $stmt->executeQuery($sqlDelete);

                    $aAux = explode('-', $aRow['REP_TAB_GRID']);
                    if (isset($aFields[$aAux[0]])) {
                        if (is_array($aFields[$aAux[0]])) {
                            foreach ($aFields[$aAux[0]] as $iRow => $aGridRow) {
                                $sQuery = 'INSERT INTO `' . $aRow['REP_TAB_NAME'] . '` (';
                                $sQuery .= '`APP_UID`,`APP_NUMBER`,`ROW`';
                                foreach ($aTableFields as $aField) {
                                    $sQuery .= ',`' . $aField['sFieldName'] . '`';
                                }
                                $sQuery .= ") VALUES ('" . $sApplicationUid . "'," . (int)$iApplicationNumber . ',' . $iRow;
                                foreach ($aTableFields as $aField) {
                                    switch ($aField['sType']) {
                                        case 'number':
                                            $sQuery .= ',' . (isset($aGridRow[$aField['sFieldName']]) ? (float)str_replace(
                                                    ',',
                                                    '',
                                                    $aGridRow[$aField['sFieldName']]
                                                ) : '0');
                                            break;
                                        case 'char':
                                        case 'text':
                                            if (!isset($aGridRow[$aField['sFieldName']])) {
                                                $aGridRow[$aField['sFieldName']] = '';
                                            }
                                            $sQuery .= ",'" . (isset($aGridRow[$aField['sFieldName']]) ? mysqli_real_escape_string(
                                                    $con->getResource(),
                                                    $aGridRow[$aField['sFieldName']]
                                                ) : '') . "'";
                                            break;
                                        case 'date':
                                            $sQuery .= ",'" . (isset($aGridRow[$aField['sFieldName']]) ? $aGridRow[$aField['sFieldName']] : '') . "'";
                                            break;
                                    }
                                }
                                $sQuery .= ')';
                                $rs = $stmt->executeQuery($sQuery);
                            }
                        }
                    }
                }
                $oDataset->next();
            }
        } catch (Exception $oError) {
            throw ($oError);
        }
    }

    /**
     * Function tableExist
     * Check if table exists
     *
     * @access public
     * @return boolean
     */
    public function tableExist()
    {
        $bExists = true;
        $sDataBase = 'database_' . strtolower(DB_ADAPTER);

        $oDataBase = new database();
        $bExists = $oDataBase->reportTableExist();

        return $bExists;
    }

    /**
     * Function chooseDB
     * Choose the database to connect
     *
     * @access public
     *
     * @param string $TabConnectionk
     *
     * @return string
     */
    public function chooseDB($TabConnectionk)
    {
        $repTabConnection = trim(strtoupper($TabConnectionk));
        $PropelDatabase = 'rp';
        if ($repTabConnection == '' || $repTabConnection == 'REPORT') {
            $PropelDatabase = 'rp';
        }
        if ($repTabConnection == 'RBAC') {
            $PropelDatabase = 'rbac';
        }
        if ($repTabConnection == 'WF') {
            $PropelDatabase = 'workflow';
        }
        return ($PropelDatabase);
    }
}
